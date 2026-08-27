import calendar
from datetime import date
from decimal import Decimal

from django.contrib.auth.decorators import login_required
from django.db.models import Sum
from django.shortcuts import render
from django.utils import timezone

from apps.core.models import Station
from apps.core.permissions import is_owner, user_station
from apps.finance.models import CashCollection, Expense, POSRecord, Voucher
from apps.shifts.models import MeterReading, Shift


def _apply_scope(request, qs):
    if not is_owner(request.user):
        st = user_station(request.user)
        if st:
            qs = qs.filter(station=st)
    return qs


def _station_kwarg(request):
    """Station filter from querystring - owners only; others locked to their own."""
    if not is_owner(request.user):
        st = user_station(request.user)
        return {'station': st} if st else {}
    station_id = request.GET.get('station')
    return {'station_id': station_id} if station_id else {}


def _scoped_shifts(request, base_qs):
    shifts = base_qs
    skw = _station_kwarg(request)
    if 'station' in skw:
        shifts = shifts.filter(station=skw['station'])
    elif 'station_id' in skw:
        shifts = shifts.filter(station_id=skw['station_id'])
    return shifts


def _expenses_for(request, **filters):
    """Approved expenses scoped by role + optional station querystring."""
    if is_owner(request.user):
        qs = Expense.objects.filter(status='approved', **filters)
        sid = request.GET.get('station')
        if sid:
            qs = qs.filter(station_id=sid)
        return qs
    st = user_station(request.user)
    if not st:
        return Expense.objects.none()
    return Expense.objects.filter(status='approved', station=st, **filters)


def _station_label(request):
    sid = request.GET.get('station')
    if is_owner(request.user) and sid:
        st = Station.objects.filter(pk=sid).first()
        return st.name if st else None
    st = user_station(request.user)
    return st.name if (st and not is_owner(request.user)) else None


def _station_breakdown(owner_view, start_date, end_date, month=None, year=None):
    """Per-station aggregates for owners; empty list otherwise."""
    rows = []
    stations = Station.objects.filter(status='active')
    for st in stations:
        shift_filter = {'station': st}
        if month and year:
            shift_filter['date__month'] = month
            shift_filter['date__year'] = year
        else:
            shift_filter['date'] = start_date
        shifts = Shift.objects.filter(**shift_filter)
        readings = MeterReading.objects.filter(shift__in=shifts)
        liters = readings.aggregate(t=Sum('liters_sold'))['t'] or Decimal('0')
        cash = CashCollection.objects.filter(shift__in=shifts, is_cancelled=False).aggregate(t=Sum('amount'))['t'] or Decimal('0')
        vouchers = Voucher.objects.filter(shift__in=shifts, is_cancelled=False).aggregate(t=Sum('total_value'))['t'] or Decimal('0')
        pos = POSRecord.objects.filter(shift__in=shifts, is_cancelled=False).aggregate(t=Sum('total_amount'))['t'] or Decimal('0')
        exp_filters = {'station': st}
        if month and year:
            exp_filters['created_at__month'] = month
            exp_filters['created_at__year'] = year
        else:
            exp_filters['created_at__date'] = start_date
        expenses = Expense.objects.filter(status='approved', **exp_filters).aggregate(t=Sum('amount'))['t'] or Decimal('0')
        collection = cash + vouchers + pos
        rows.append({
            'station': st,
            'shifts_count': shifts.count(),
            'liters': liters,
            'cash': cash,
            'vouchers': vouchers,
            'pos': pos,
            'collection': collection,
            'expenses': expenses,
            'estimated_profit': collection - expenses,
        })
    return rows


@login_required
def report_daily(request):
    report_date = request.GET.get('date', date.today().isoformat())
    if isinstance(report_date, str):
        report_date = date.fromisoformat(report_date)

    shifts = _scoped_shifts(request, Shift.objects.filter(date=report_date))
    readings = MeterReading.objects.filter(shift__date=report_date).filter(shift__in=shifts)

    total_liters = readings.aggregate(total=Sum('liters_sold'))['total'] or Decimal('0')
    total_cash = CashCollection.objects.filter(shift__in=shifts, is_cancelled=False).aggregate(total=Sum('amount'))['total'] or Decimal('0')
    total_vouchers = Voucher.objects.filter(shift__in=shifts, is_cancelled=False).aggregate(total=Sum('total_value'))['total'] or Decimal('0')
    total_pos = POSRecord.objects.filter(shift__in=shifts, is_cancelled=False).aggregate(total=Sum('total_amount'))['total'] or Decimal('0')
    total_collection = total_cash + total_vouchers + total_pos
    expenses_qs = _expenses_for(request, created_at__date=report_date)
    total_expenses = expenses_qs.aggregate(total=Sum('amount'))['total'] or Decimal('0')

    context = {
        'report_date': report_date,
        'total_liters': total_liters,
        'total_cash': total_cash,
        'total_vouchers': total_vouchers,
        'total_pos': total_pos,
        'total_collection': total_collection,
        'total_expenses': total_expenses,
        'net_total': total_collection - total_expenses,
        'shifts': shifts.select_related('employee', 'island', 'station', 'definition'),
        'readings': readings.select_related('shift__station', 'meter', 'attendant',
                                            'shift__employee')[:300],
        'station_label': _station_label(request),
        'page_title': 'التقرير اليومي',
    }
    if is_owner(request.user):
        context['station_breakdown'] = _station_breakdown(True, report_date, report_date)

    if request.GET.get('print'):
        context['now'] = timezone.now()
        return render(request, 'pages/reports/daily_print.html', context)
    return render(request, 'pages/reports/daily.html', context)


@login_required
def report_shift(request):
    shifts = _apply_scope(request, Shift.objects.all()).select_related('employee', 'island', 'station', 'definition')
    if is_owner(request.user) and request.GET.get('station'):
        shifts = shifts.filter(station_id=request.GET.get('station'))
    date_from = request.GET.get('date_from')
    date_to = request.GET.get('date_to')

    if date_from:
        shifts = shifts.filter(date__gte=date_from)
    if date_to:
        shifts = shifts.filter(date__lte=date_to)

    shift_data = []
    for shift in shifts[:200]:
        liters = shift.readings.aggregate(total=Sum('liters_sold'))['total'] or Decimal('0')
        cash = CashCollection.objects.filter(shift=shift, is_cancelled=False).aggregate(total=Sum('amount'))['total'] or Decimal('0')
        vouchers = Voucher.objects.filter(shift=shift, is_cancelled=False).aggregate(total=Sum('total_value'))['total'] or Decimal('0')
        pos = POSRecord.objects.filter(shift=shift, is_cancelled=False).aggregate(total=Sum('total_amount'))['total'] or Decimal('0')
        collection = cash + vouchers + pos

        shift_data.append({
            'shift': shift,
            'liters': liters,
            'cash': cash,
            'vouchers': vouchers,
            'pos': pos,
            'collection': collection,
        })

    context = {
        'shift_data': shift_data,
        'page_title': 'تقرير المناوبات',
    }
    return render(request, 'pages/reports/shift_report.html', context)


@login_required
def report_monthly(request):
    today = date.today()
    month = int(request.GET.get('month', today.month))
    year = int(request.GET.get('year', today.year))

    shifts = _scoped_shifts(request, Shift.objects.filter(date__month=month, date__year=year))

    total_liters = MeterReading.objects.filter(
        shift__in=shifts
    ).aggregate(total=Sum('liters_sold'))['total'] or Decimal('0')

    total_cash = CashCollection.objects.filter(
        shift__in=shifts, is_cancelled=False
    ).aggregate(total=Sum('amount'))['total'] or Decimal('0')

    total_vouchers = Voucher.objects.filter(
        shift__in=shifts, is_cancelled=False
    ).aggregate(total=Sum('total_value'))['total'] or Decimal('0')

    total_pos = POSRecord.objects.filter(
        shift__in=shifts, is_cancelled=False
    ).aggregate(total=Sum('total_amount'))['total'] or Decimal('0')

    total_collection = total_cash + total_vouchers + total_pos

    exp_q = _expenses_for(request, created_at__month=month, created_at__year=year)
    total_expenses = exp_q.aggregate(total=Sum('amount'))['total'] or Decimal('0')

    # per-day breakdown across the month
    days_in_month = calendar.monthrange(year, month)[1]
    daily_rows = []
    for day in range(1, days_in_month + 1):
        d = date(year, month, day)
        d_shifts = shifts.filter(date=d)
        d_readings = MeterReading.objects.filter(shift__in=d_shifts)
        row_liters = d_readings.aggregate(t=Sum('liters_sold'))['t'] or Decimal('0')
        row_cash = CashCollection.objects.filter(shift__in=d_shifts, is_cancelled=False).aggregate(t=Sum('amount'))['t'] or Decimal('0')
        row_vouchers = Voucher.objects.filter(shift__in=d_shifts, is_cancelled=False).aggregate(t=Sum('total_value'))['t'] or Decimal('0')
        row_pos = POSRecord.objects.filter(shift__in=d_shifts, is_cancelled=False).aggregate(t=Sum('total_amount'))['t'] or Decimal('0')
        row_exp = exp_q.filter(created_at__date=d).aggregate(t=Sum('amount'))['t'] or Decimal('0')
        if row_liters or row_cash or row_vouchers or row_pos or row_exp:
            daily_rows.append({
                'day': d,
                'liters': row_liters,
                'cash': row_cash,
                'vouchers': row_vouchers,
                'pos': row_pos,
                'collection': row_cash + row_vouchers + row_pos,
                'expenses': row_exp,
            })

    context = {
        'month': month,
        'year': year,
        'month_name': _arabic_month(month),
        'total_liters': total_liters,
        'total_cash': total_cash,
        'total_vouchers': total_vouchers,
        'total_pos': total_pos,
        'total_collection': total_collection,
        'total_expenses': total_expenses,
        'net_total': total_collection - total_expenses,
        'daily_rows': daily_rows,
        'station_label': _station_label(request),
        'page_title': 'التقرير الشهري',
    }
    if is_owner(request.user):
        context['station_breakdown'] = _station_breakdown(True, None, None, month=month, year=year)

    if request.GET.get('print'):
        context['now'] = timezone.now()
        return render(request, 'pages/reports/monthly_print.html', context)
    return render(request, 'pages/reports/monthly.html', context)


_ARABIC_MONTHS = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
]


def _arabic_month(m):
    return _ARABIC_MONTHS[m - 1]


@login_required
def report_inventory(request):
    """Station-wide inventory dashboard: tank levels, pending deliveries, pending vouchers."""
    from decimal import Decimal
    from apps.core.models import Tank, TankTransfer, Station as StationModel
    from apps.inventory.models import Delivery, DeliveryRequest, ShortageClaim
    from apps.finance.models import Voucher, VoucherSettlement
    
    if is_owner(request.user):
        station_id = request.GET.get('station')
        stations = StationModel.objects.filter(status='active')
        if station_id:
            stations = stations.filter(pk=station_id)
    else:
        st = user_station(request.user)
        stations = StationModel.objects.filter(pk=st.pk) if st else StationModel.objects.none()
    
    station_data = []
    for station in stations:
        tanks = Tank.objects.filter(station=station).select_related('fuel_type')
        tank_summary = []
        total_capacity = Decimal('0')
        total_level = Decimal('0')
        for tank in tanks:
            total_capacity += tank.capacity
            total_level += tank.current_level
            tank_summary.append({
                'tank': tank,
                'level_percent': (tank.current_level / tank.capacity * 100) if tank.capacity > 0 else 0,
                'theoretical': tank.theoretical_level(),
            })
        
        # Pending deliveries
        pending_deliveries = Delivery.objects.filter(
            station=station, status='ordered'
        ).count()
        
        # Pending delivery requests
        pending_requests = DeliveryRequest.objects.filter(
            station=station, status__in=['pending', 'approved']
        ).count()
        
        # Shortage claims
        pending_claims = ShortageClaim.objects.filter(
            delivery__station=station, status__in=['not_claimed', 'claimed']
        ).count()
        
        # Pending voucher settlements
        pending_settlements = VoucherSettlement.objects.filter(
            station=station, status__in=['submitted', 'partial']
        ).count()
        outstanding_vouchers = VoucherSettlement.objects.filter(
            station=station, status__in=['submitted', 'partial']
        ).aggregate(total=Sum('total_value'))['total'] or Decimal('0')
        settled_vouchers = VoucherSettlement.objects.filter(
            station=station, status__in=['submitted', 'partial']
        ).aggregate(total=Sum('paid_amount'))['total'] or Decimal('0')
        
        # Recent transfers
        recent_transfers = TankTransfer.objects.filter(
            station=station, status='completed'
        ).select_related('from_tank', 'to_tank', 'fuel_type')[:5]
        
        station_data.append({
            'station': station,
            'tanks': tank_summary,
            'total_capacity': total_capacity,
            'total_level': total_level,
            'level_percent': (total_level / total_capacity * 100) if total_capacity > 0 else 0,
            'pending_deliveries': pending_deliveries,
            'pending_requests': pending_requests,
            'pending_claims': pending_claims,
            'pending_settlements': pending_settlements,
            'outstanding_vouchers': outstanding_vouchers,
            'settled_vouchers': settled_vouchers,
            'recent_transfers': recent_transfers,
        })
    
    return render(request, 'pages/reports/inventory.html', {
        'station_data': station_data,
        'page_title': 'المخزون والتوريد',
    })
