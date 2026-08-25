from decimal import Decimal
from django.utils import timezone
from django.db import models
from .models import Shift, MeterReading
from apps.finance.models import CashCollection, Voucher, POSRecord, Reconciliation


def close_shift(shift, end_readings_data, closed_by):
    from apps.core.models import FuelPrice

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
        meter_reading.save()

        meter_reading.meter.current_reading = meter_reading.end_reading
        meter_reading.meter.save()

    total_liters = shift.readings.aggregate(total=models.Sum('liters_sold'))['total'] or Decimal('0')

    first_meter = shift.island.meters.first()
    fuel_type = first_meter.fuel_type if first_meter else None
    price = FuelPrice.objects.filter(fuel_type=fuel_type, is_active=True).order_by('-effective_date').first() if fuel_type else None
    selling_price = price.selling_price if price else Decimal('0')

    expected_sales = total_liters * selling_price

    total_cash = CashCollection.objects.filter(shift=shift).aggregate(
        total=models.Sum('amount'))['total'] or Decimal('0')
    total_vouchers = Voucher.objects.filter(shift=shift).aggregate(
        total=models.Sum('total_value'))['total'] or Decimal('0')
    total_pos = POSRecord.objects.filter(shift=shift).aggregate(
        total=models.Sum('total_amount'))['total'] or Decimal('0')

    total_collection = total_cash + total_vouchers + total_pos
    difference = total_collection - expected_sales

    if difference == 0:
        difference_type = 'matched'
    elif difference > 0:
        difference_type = 'surplus'
    else:
        difference_type = 'shortage'

    reconciliation = Reconciliation.objects.create(
        shift=shift,
        total_liters=total_liters,
        expected_sales=expected_sales,
        total_cash=total_cash,
        total_vouchers=total_vouchers,
        total_pos=total_pos,
        total_collection=total_collection,
        difference=difference,
        difference_type=difference_type,
    )

    shift.status = 'closed'
    shift.end_time = timezone.now().time()
    shift.closed_by = closed_by
    shift.closed_at = timezone.now()
    shift.save()

    return reconciliation
