"""Meter reading continuity validation.

Enforces that cumulative meter readings are non-decreasing between consecutive
shifts. Legitimate exceptions (meter reset, replacement) require documented
authorization.
"""
from decimal import Decimal
from collections import defaultdict

from django.contrib.auth.models import User
from django.db.models import Max

from .models import MeterReading


def get_previous_closing(meter_id):
    """Return the latest valid (non-null) closing reading for a meter.

    Scans all MeterReading records for the given meter, ordered by
    recorded_at (most recent first), and returns the first non-null
    end_reading. Returns None if no previous closing reading exists.
    """
    result = (
        MeterReading.objects
        .filter(meter_id=meter_id, end_reading__isnull=False)
        .order_by('-recorded_at', '-pk')
        .values_list('end_reading', flat=True)
        .first()
    )
    return result


def check_start_reading_continuity(meter_id, new_start_reading, allow_exception=False):
    """Validate that a new opening reading is consistent with the previous closing.

    Returns (is_valid, message, previous_closing).

    Rules:
        - If no previous closing exists: always valid (first reading ever).
        - If new_start == previous_closing: valid (perfect continuity).
        - If new_start > previous_closing: valid (meter advanced, normal).
        - If new_start < previous_closing: BLOCKED unless allow_exception=True.
    """
    previous = get_previous_closing(meter_id)

    if previous is None:
        return True, '', None

    new_start = Decimal(str(new_start_reading))

    if new_start == previous:
        return True, '', previous

    if new_start > previous:
        return True, '', previous

    # new_start < previous — continuity violation
    diff = previous - new_start
    if allow_exception:
        return True, '', previous

    return False, (
        f'القراءة الابتدائية ({new_start}) أقل من آخر قراءة مسجلة ({previous}) '
        f'بفرق {diff}. '
        f'إذا كان هذا بسبب تصفير أو استبدال العداد، يجب تحديد نوع الاستثناء والمسؤول المُصرّح.'
    ), previous


def check_end_reading_continuity(meter_id, opening_reading, new_end_reading, allow_exception=False):
    """Validate closing reading vs opening reading within the same shift.

    Returns (is_valid, message).

    Rules:
        - end >= start: always valid.
        - end < start: BLOCKED unless allow_exception=True.
    """
    opening = Decimal(str(opening_reading))
    end = Decimal(str(new_end_reading))

    if end >= opening:
        return True, ''

    if allow_exception:
        return True, ''

    diff = opening - end
    return False, (
        f'القراءة النهائية ({end}) أقل من القراءة الابتدائية ({opening}) '
        f'بفرق {diff}. '
        f'إذا كان هذا بسبب تصفير أو استبدال العداد، يجب تحديد نوع الاستثناء.'
    )


def detect_gap(meter_id, opening_reading):
    """Detect unaccounted meter movement between previous closing and new opening.

    Returns (gap_liters, previous_closing) or (None, None) if no previous.

    gap > 0 means liters were sold/moved between shifts without being recorded.
    gap == 0 means perfect continuity.
    """
    previous = get_previous_closing(meter_id)
    if previous is None:
        return None, None
    opening = Decimal(str(opening_reading))
    gap = opening - previous
    return gap, previous


def get_meter_gap_report(station):
    """Generate a gap report for all meters at a station.

    Returns a list of dicts with meter info and gap details.
    Only includes meters with gaps > 0.
    """
    from apps.core.models import Meter, Island, Machine
    meters = Meter.objects.filter(
        machine__island__station=station,
        status='active',
    ).select_related('machine', 'machine__island', 'fuel_type', 'tank')
    
    report = []
    for meter in meters:
        previous = get_previous_closing(meter.pk)
        if previous is None:
            continue
        # Find the most recent opening reading for this meter
        latest_opening = (
            MeterReading.objects
            .filter(meter=meter, start_reading__isnull=False)
            .order_by('-recorded_at', '-pk')
            .values_list('start_reading', flat=True)
            .first()
        )
        if latest_opening is None:
            continue
        gap = latest_opening - previous
        if gap > 0:
            report.append({
                'meter': meter,
                'island': meter.machine.island,
                'fuel_type': meter.fuel_type,
                'previous_closing': previous,
                'latest_opening': latest_opening,
                'gap_liters': gap,
            })
    return report
