from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .models import Shift, MeterReading
from .forms import ShiftForm, MeterReadingForm
from .services import close_shift
from apps.core.models import Meter


@login_required
def shift_list(request):
    shifts = Shift.objects.select_related('employee', 'island', 'station').all()
    status = request.GET.get('status')
    if status:
        shifts = shifts.filter(status=status)
    return render(request, 'pages/shifts/shift_list.html', {
        'shifts': shifts,
        'page_title': 'المناوبات',
    })


@login_required
def shift_create(request):
    if request.method == 'POST':
        form = ShiftForm(request.POST)
        if form.is_valid():
            shift = form.save()
            meters = Meter.objects.filter(
                machine__island=shift.island,
                status='active'
            )
            for meter in meters:
                MeterReading.objects.create(
                    shift=shift,
                    meter=meter,
                    start_reading=meter.current_reading,
                    created_by=request.user,
                )
            return redirect('shift_detail', pk=shift.pk)
    else:
        form = ShiftForm()
    return render(request, 'pages/shifts/shift_form.html', {
        'form': form,
        'page_title': 'إنشاء مناوبة',
    })


@login_required
def shift_detail(request, pk):
    shift = get_object_or_404(Shift, pk=pk)
    readings = shift.readings.select_related('meter').all()
    from apps.finance.models import CashCollection, Voucher, POSRecord
    cash_collections = CashCollection.objects.filter(shift=shift)
    vouchers = Voucher.objects.filter(shift=shift).select_related('category')
    pos_records = POSRecord.objects.filter(shift=shift)
    reconciliation = getattr(shift, 'reconciliation', None)
    return render(request, 'pages/shifts/shift_detail.html', {
        'shift': shift,
        'readings': readings,
        'cash_collections': cash_collections,
        'vouchers': vouchers,
        'pos_records': pos_records,
        'reconciliation': reconciliation,
        'page_title': f'المناوبة #{shift.id}',
    })


@login_required
def shift_close(request, pk):
    shift = get_object_or_404(Shift, pk=pk)
    if shift.status != 'open':
        messages.error(request, 'هذه المناوبة مغلقة بالفعل')
        return redirect('shift_detail', pk=pk)

    readings = shift.readings.select_related('meter').all()

    if request.method == 'POST':
        end_readings_data = []
        for reading in readings:
            end_reading = request.POST.get(f'end_reading_{reading.id}')
            override_reason = request.POST.get(f'override_reason_{reading.id}', '')
            end_readings_data.append({
                'meter_id': reading.meter_id,
                'end_reading': end_reading,
                'override_reason': override_reason,
            })

        try:
            reconciliation = close_shift(shift, end_readings_data, request.user)
            messages.success(request, f'تم إقفال المناوبة #{shift.id} بنجاح')
            return redirect('shift_detail', pk=pk)
        except ValueError as e:
            messages.error(request, str(e))

    return render(request, 'pages/shifts/shift_close.html', {
        'shift': shift,
        'readings': readings,
        'page_title': f'إقفال المناوبة #{shift.id}',
    })
