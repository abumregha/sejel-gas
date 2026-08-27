from datetime import date, timedelta
from decimal import Decimal

from django.utils import timezone
from django.db import transaction
from django.db.models import Sum
from .models import Shift, ShiftDefinition
from apps.core.audit import log_change


def definition_runs_on(definition, d: date) -> bool:
    return str(d.weekday()) in [x.strip() for x in definition.days.split(',') if x.strip().isdigit()]


def generate_occurrences(target_date=None, station=None):
    """Create today's shift occurrences from active definitions.

    Idempotent: skips (definition, date) pairs that already have an occurrence.
    Returns the number of occurrences created.
    """
    target = target_date or date.today()
    created = 0
    qs = ShiftDefinition.objects.filter(is_active=True)
    if station:
        qs = qs.filter(station=station)
    for definition in qs:
        if not definition_runs_on(definition, target):
            continue
        # If definition targets a specific island, check it's not already covered
        if definition.island_id:
            if Shift.objects.filter(definition=definition, date=target, island_id=definition.island_id).exists():
                continue
        else:
            if Shift.objects.filter(definition=definition, date=target).exists():
                continue
        Shift.objects.create(
            station=definition.station,
            definition=definition,
            island=definition.island,
            date=target,
            start_time=definition.start_time,
            end_time=definition.end_time,
            employee=definition.default_employee,
            status='scheduled',
            created_by_id=getattr(definition, 'created_by_id', None),
        )
        created += 1
    return created


def close_shift(shift, end_readings_data, closed_by):
    """Record end readings and build the financial reconciliation.

    Calculates per-fuel-type breakdown, freezes the effective unit_price
    at the time of closure, and stores a ShiftFuelSummary row per fuel type.
    Future price changes never alter these historical records.

    Wrapped in transaction.atomic() + select_for_update() to prevent:
    - Partial writes on failure (all-or-nothing)
    - Double-close race conditions from concurrent requests
    """
    from collections import defaultdict
    from apps.core.models import FuelPrice
    from apps.finance.models import CashCollection, Voucher, POSRecord, Reconciliation, ShiftFuelSummary
    from .models import MeterReading

    with transaction.atomic():
        shift = Shift.objects.select_for_update().get(pk=shift.pk)

        # ── Step 1: record end readings ──
        for reading_data in end_readings_data:
            meter_reading = MeterReading.objects.get(
                shift=shift,
                meter_id=reading_data['meter_id']
            )
            meter_reading.end_reading = reading_data['end_reading']
            meter_reading.override_reason = reading_data.get('override_reason', '')

            if meter_reading.end_reading < meter_reading.start_reading and not meter_reading.override_reason:
                raise ValueError(f"End reading less than start for meter {meter_reading.meter.code}")

            meter_reading.liters_sold = meter_reading.end_reading - meter_reading.start_reading
            if not meter_reading.recorded_at:
                meter_reading.recorded_at = timezone.now()
            meter_reading.save()

            meter_reading.meter.current_reading = meter_reading.end_reading
            meter_reading.meter.save()

        # ── Step 2: group readings by fuel type ──
        readings = shift.readings.select_related('meter', 'meter__fuel_type').all()
        fuel_liters = defaultdict(Decimal)  # fuel_type_id -> liters_sold
        for r in readings:
            ft_id = r.meter.fuel_type_id
            fuel_liters[ft_id] += r.liters_sold or Decimal('0')

        # ── Step 3: calculate per-fuel expected sales with frozen prices ──
        fuel_summaries = []
        total_liters = Decimal('0')
        total_expected_sales = Decimal('0')

        for ft_id, liters in fuel_liters.items():
            if liters <= 0:
                continue
            # find the effective price for this fuel type as of the shift date
            price_obj = (
                FuelPrice.objects
                .filter(fuel_type_id=ft_id, effective_date__lte=shift.date, is_active=True)
                .order_by('-effective_date')
                .first()
            )
            # fallback: any active price if no date-effective one found
            if not price_obj:
                price_obj = (
                    FuelPrice.objects
                    .filter(fuel_type_id=ft_id, is_active=True)
                    .order_by('-effective_date')
                    .first()
                )
            unit_price = price_obj.selling_price if price_obj else Decimal('0')
            expected = liters * unit_price

            fuel_summaries.append({
                'fuel_type_id': ft_id,
                'liters_sold': liters,
                'unit_price': unit_price,
                'expected_sales': expected,
            })
            total_liters += liters
            total_expected_sales += expected

        # ── Step 4: collect financial data ──
        total_cash = CashCollection.objects.filter(shift=shift, is_cancelled=False).aggregate(
            total=Sum('amount'))['total'] or Decimal('0')
        total_vouchers = Voucher.objects.filter(shift=shift, is_cancelled=False).aggregate(
            total=Sum('total_value'))['total'] or Decimal('0')
        total_pos = POSRecord.objects.filter(shift=shift, is_cancelled=False).aggregate(
            total=Sum('total_amount'))['total'] or Decimal('0')

        total_collection = total_cash + total_vouchers + total_pos

        # ── Step 4b: compute shift cash expenses (do NOT reduce expected_sales) ──
        from apps.finance.models import Expense
        total_expenses = Expense.objects.filter(
            shift=shift, payment_method='cash',
            status__in=['pending', 'approved']
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0')
        net_cash = total_cash - total_expenses

        difference = total_collection - total_expected_sales

        if difference == 0:
            difference_type = 'matched'
        elif difference > 0:
            difference_type = 'surplus'
        else:
            difference_type = 'shortage'

        # ── Step 5: save reconciliation + frozen fuel summaries ──
        reconciliation, _created = Reconciliation.objects.update_or_create(
            shift=shift,
            defaults={
                'total_liters': total_liters,
                'expected_sales': total_expected_sales,
                'total_cash': total_cash,
                'total_vouchers': total_vouchers,
                'total_pos': total_pos,
                'total_collection': total_collection,
                'total_expenses': total_expenses,
                'net_cash': net_cash,
                'difference': difference,
                'difference_type': difference_type,
            }
        )

        # Replace fuel summaries (re-close is supported)
        reconciliation.fuel_breakdown.all().delete()
        for fs in fuel_summaries:
            ShiftFuelSummary.objects.create(
                reconciliation=reconciliation,
                fuel_type_id=fs['fuel_type_id'],
                liters_sold=fs['liters_sold'],
                unit_price=fs['unit_price'],
                expected_sales=fs['expected_sales'],
            )

        shift.status = 'closed'
        shift.end_time = shift.end_time or timezone.now().time()
        shift.closed_by = closed_by
        shift.closed_at = timezone.now()
        shift.save()

        log_change(
            user=closed_by,
            action='close',
            obj=shift,
            new_value={
                'reconciliation_id': reconciliation.pk,
                'total_liters': str(total_liters),
                'expected_sales': str(total_expected_sales),
                'total_collection': str(total_collection),
                'difference': str(difference),
                'difference_type': difference_type,
                'net_cash': str(net_cash),
            },
        )

    return reconciliation
