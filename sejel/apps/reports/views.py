from datetime import date
from decimal import Decimal
from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.db.models import Sum
from apps.shifts.models import Shift, MeterReading
from apps.finance.models import CashCollection, Voucher, POSRecord, Expense


@login_required
def report_daily(request):
    report_date = request.GET.get('date', date.today().isoformat())
    if isinstance(report_date, str):
        report_date = date.fromisoformat(report_date)

    shifts = Shift.objects.filter(date=report_date)
    station_id = request.GET.get('station')
    if station_id:
        shifts = shifts.filter(station_id=station_id)

    readings = MeterReading.objects.filter(shift__date=report_date)
    if station_id:
        readings = readings.filter(shift__station_id=station_id)

    total_liters = readings.aggregate(total=Sum('liters_sold'))['total'] or Decimal('0')
    total_cash = CashCollection.objects.filter(shift__date=report_date).aggregate(total=Sum('amount'))['total'] or Decimal('0')
    total_vouchers = Voucher.objects.filter(shift__date=report_date).aggregate(total=Sum('total_value'))['total'] or Decimal('0')
    total_pos = POSRecord.objects.filter(shift__date=report_date).aggregate(total=Sum('total_amount'))['total'] or Decimal('0')
    total_collection = total_cash + total_vouchers + total_pos
    total_expenses = Expense.objects.filter(
        created_at__date=report_date,
        status='approved'
    ).aggregate(total=Sum('amount'))['total'] or Decimal('0')

    context = {
        'report_date': report_date,
        'total_liters': total_liters,
        'total_cash': total_cash,
        'total_vouchers': total_vouchers,
        'total_pos': total_pos,
        'total_collection': total_collection,
        'total_expenses': total_expenses,
        'shifts': shifts,
        'page_title': 'التقرير اليومي',
    }
    return render(request, 'pages/reports/daily.html', context)


@login_required
def report_shift(request):
    shifts = Shift.objects.select_related('employee', 'island', 'station').all()
    station_id = request.GET.get('station')
    date_from = request.GET.get('date_from')
    date_to = request.GET.get('date_to')

    if station_id:
        shifts = shifts.filter(station_id=station_id)
    if date_from:
        shifts = shifts.filter(date__gte=date_from)
    if date_to:
        shifts = shifts.filter(date__lte=date_to)

    shift_data = []
    for shift in shifts:
        readings = shift.readings.all()
        liters = readings.aggregate(total=Sum('liters_sold'))['total'] or Decimal('0')
        cash = CashCollection.objects.filter(shift=shift).aggregate(total=Sum('amount'))['total'] or Decimal('0')
        vouchers = Voucher.objects.filter(shift=shift).aggregate(total=Sum('total_value'))['total'] or Decimal('0')
        pos = POSRecord.objects.filter(shift=shift).aggregate(total=Sum('total_amount'))['total'] or Decimal('0')
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

    shifts = Shift.objects.filter(date__month=month, date__year=year)
    station_id = request.GET.get('station')
    if station_id:
        shifts = shifts.filter(station_id=station_id)

    total_liters = MeterReading.objects.filter(
        shift__date__month=month, shift__date__year=year
    ).aggregate(total=Sum('liters_sold'))['total'] or Decimal('0')

    total_cash = CashCollection.objects.filter(
        shift__date__month=month, shift__date__year=year
    ).aggregate(total=Sum('amount'))['total'] or Decimal('0')

    total_vouchers = Voucher.objects.filter(
        shift__date__month=month, shift__date__year=year
    ).aggregate(total=Sum('total_value'))['total'] or Decimal('0')

    total_pos = POSRecord.objects.filter(
        shift__date__month=month, shift__date__year=year
    ).aggregate(total=Sum('total_amount'))['total'] or Decimal('0')

    total_collection = total_cash + total_vouchers + total_pos

    total_expenses = Expense.objects.filter(
        created_at__month=month, created_at__year=year, status='approved'
    ).aggregate(total=Sum('amount'))['total'] or Decimal('0')

    context = {
        'month': month,
        'year': year,
        'total_liters': total_liters,
        'total_cash': total_cash,
        'total_vouchers': total_vouchers,
        'total_pos': total_pos,
        'total_collection': total_collection,
        'total_expenses': total_expenses,
        'page_title': 'التقرير الشهري',
    }
    return render(request, 'pages/reports/monthly.html', context)
