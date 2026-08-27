"""Fuel reconciliation service.

Compares what a tank SHOULD have (theoretical) vs what it ACTUALLY has.

Formula:
    theoretical = last_tank_reading + received - sold
    variance    = actual_level - theoretical
"""
from decimal import Decimal
from django.db import transaction
from django.db.models import Sum
from apps.core.models import Tank, TankReading
from apps.shifts.models import MeterReading
from apps.inventory.models import Delivery, FuelReconciliation


def get_tank_sales_since(tank, since):
    """Total liters sold through meters connected to this tank since a datetime."""
    from django.utils import timezone
    qs = MeterReading.objects.filter(
        meter__tank=tank,
        liters_sold__isnull=False,
        liters_sold__gt=0,
    )
    if since:
        qs = qs.filter(recorded_at__gte=since)
    return qs.aggregate(total=Sum('liters_sold'))['total'] or Decimal('0')


def get_tank_deliveries_since(tank, since):
    """Total liters received via deliveries to this tank since a datetime."""
    from django.db.models import Q
    qs = Delivery.objects.filter(
        tank=tank,
        received_quantity__isnull=False,
    ).filter(
        Q(arrival_date__gte=since) | Q(arrival_date__isnull=True, order_date__gte=since)
    )
    return qs.aggregate(total=Sum('received_quantity'))['total'] or Decimal('0')


def get_tank_transfers_in_since(tank, since):
    """Total liters transferred INTO this tank since a datetime."""
    from apps.core.models import TankTransfer
    qs = TankTransfer.objects.filter(to_tank=tank, status='completed')
    if since:
        qs = qs.filter(transfer_date__gte=since)
    return qs.aggregate(total=Sum('quantity'))['total'] or Decimal('0')


def get_tank_transfers_out_since(tank, since):
    """Total liters transferred OUT of this tank since a datetime."""
    from apps.core.models import TankTransfer
    qs = TankTransfer.objects.filter(from_tank=tank, status='completed')
    if since:
        qs = qs.filter(transfer_date__gte=since)
    return qs.aggregate(total=Sum('quantity'))['total'] or Decimal('0')


def calculate_theoretical_level(tank, closing_reading_datetime=None):
    """Calculate what the tank SHOULD have based on last reading + deliveries - sales + transfers.
    
    Formula: last_reading + deliveries + transfers_in - transfers_out - sales
    """
    last = tank.latest_reading()
    if not last:
        return tank.current_level
    
    base = last.reading_level
    since = last.recorded_at
    
    received = get_tank_deliveries_since(tank, since)
    transferred_in = get_tank_transfers_in_since(tank, since)
    transferred_out = get_tank_transfers_out_since(tank, since)
    sold = get_tank_sales_since(tank, since)
    
    return base + received + transferred_in - transferred_out - sold


def find_discrepant_meters(tank, since=None):
    """Find meters connected to this tank that have sales but no matching delivery context.
    
    Returns list of dicts with meter info and total sales.
    """
    qs = MeterReading.objects.filter(
        meter__tank=tank,
        liters_sold__isnull=False,
        liters_sold__gt=0,
    ).select_related('meter', 'meter__fuel_type', 'meter__machine', 'meter__machine__island')
    
    if since:
        qs = qs.filter(recorded_at__gte=since)
    
    results = []
    for reading in qs:
        results.append({
            'meter': reading.meter,
            'island': reading.meter.machine.island,
            'liters_sold': reading.liters_sold,
            'recorded_at': reading.recorded_at,
            'shift': reading.shift,
        })
    return results


def create_fuel_reconciliation(tank, date, closing_reading_id, notes='', created_by=None):
    """Create a fuel reconciliation for a tank on a given date.
    
    Args:
        tank: Tank instance
        date: reconciliation date
        closing_reading_id: ID of the TankReading representing the actual closing level
        notes: optional notes
        created_by: User who created the reconciliation
    
    Returns:
        FuelReconciliation instance
    
    Raises:
        ValueError: if validation fails
    """
    from django.utils import timezone
    
    with transaction.atomic():
        # Get the closing reading
        closing_reading = TankReading.objects.get(pk=closing_reading_id, tank=tank)
        
        # Get the opening reading (the most recent reading BEFORE the closing one)
        opening_reading = TankReading.objects.filter(
            tank=tank,
            recorded_at__lt=closing_reading.recorded_at,
        ).order_by('-recorded_at', '-pk').first()
        
        if not opening_reading:
            raise ValueError('لا توجد قراءة افتتاحية مسجلة قبل هذه القراءة')
        
        # Calculate received, transferred, and sold since opening reading
        since = opening_reading.recorded_at
        received = get_tank_deliveries_since(tank, since)
        transferred_in = get_tank_transfers_in_since(tank, since)
        transferred_out = get_tank_transfers_out_since(tank, since)
        sold = get_tank_sales_since(tank, since)
        
        # Theoretical level: what the tank SHOULD have
        theoretical = opening_reading.reading_level + received + transferred_in - transferred_out - sold
        
        # Actual level: what the tank ACTUALLY has
        actual = closing_reading.reading_level
        
        # Variance
        variance = actual - theoretical
        
        if variance == 0:
            variance_type = 'matched'
        elif variance > 0:
            variance_type = 'surplus'
        else:
            variance_type = 'shortage'
        
        # Create the reconciliation
        reconciliation = FuelReconciliation.objects.create(
            tank=tank,
            station=tank.station,
            date=date,
            opening_reading=opening_reading,
            closing_reading=closing_reading,
            received_quantity=received,
            transferred_in=transferred_in,
            transferred_out=transferred_out,
            sold_quantity=sold,
            theoretical_level=theoretical,
            actual_level=actual,
            variance=variance,
            variance_type=variance_type,
            notes=notes,
            created_by=created_by,
        )
    
    return reconciliation
