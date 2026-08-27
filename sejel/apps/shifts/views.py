from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.utils import timezone
from .models import Shift, ShiftDefinition, MeterReading
from .forms import ShiftForm, MeterReadingEntryForm, ShiftDefinitionForm
from .services import close_shift, generate_occurrences
from apps.core.permissions import (
    require_roles, ensure_station_access, is_owner, user_station,
    safe_delete, describe_blockers, OPS_ROLES,
)
from apps.core.audit import log_change, get_client_ip


def _scope_shifts(request):
    qs = Shift.objects.select_related('employee', 'island', 'station', 'definition').all()
    if not is_owner(request.user):
        st = user_station(request.user)
        if st:
            qs = qs.filter(station=st)
    return qs


@login_required
def shift_list(request):
    shifts = _scope_shifts(request)
    status = request.GET.get('status')
    if status:
        shifts = shifts.filter(status=status)

    if request.method == 'POST' and request.POST.get('action') == 'generate':
        if not request.user.has_module_perms('shifts') and not request.user.is_staff:
            messages.error(request, 'غير مصرح')
        else:
            st = None if is_owner(request.user) else user_station(request.user)
            count = generate_occurrences(timezone.now().date(), station=st)
            messages.success(request, f'تم إنشاء {count} مناوبة مجدولة لليوم' if count else 'لا توجد مناوبات جديدة لليوم')
        return redirect('shift_list')

    return render(request, 'pages/shifts/shift_list.html', {
        'shifts': shifts,
        'page_title': 'المناوبات',
    })


@login_required
@require_roles(OPS_ROLES)
def shift_create(request):
    if request.method == 'POST':
        form = ShiftForm(request.POST, user=request.user)
        if form.is_valid():
            shift = form.save(commit=False)
            shift.created_by = request.user
            shift.status = 'open'
            shift.save()
            messages.success(request,
                f'تم إنشاء المناوبة #{shift.id} بنجاح — قم بإضافة قراءات العدادات من صفحة المناوبة')
            return redirect('shift_detail', pk=shift.pk)
    else:
        form = ShiftForm(user=request.user)
        # default date to today
        form.fields['date'].initial = timezone.now().date()
    return render(request, 'pages/shifts/shift_form.html', {
        'form': form,
        'page_title': 'إنشاء مناوبة يدوية',
        'help_text': 'لإنشاء مناوبات تلقائية، استخدم زر "توليد مناوبات اليوم" من قائمة المناوبات.',
    })


@login_required
def shift_detail(request, pk):
    from apps.finance.models import CashCollection, Voucher, POSRecord
    shift = get_object_or_404(Shift, pk=pk)
    ensure_station_access(request.user, shift)
    readings = shift.readings.select_related('meter', 'attendant', 'meter__fuel_type').all()
    cash_collections = CashCollection.objects.filter(shift=shift, is_cancelled=False)
    vouchers = Voucher.objects.filter(shift=shift, is_cancelled=False).select_related('category')
    pos_records = POSRecord.objects.filter(shift=shift, is_cancelled=False)
    reconciliation = getattr(shift, 'reconciliation', None)
    can_edit = shift.status in ('scheduled', 'open', 'in_progress')
    return render(request, 'pages/shifts/shift_detail.html', {
        'shift': shift,
        'readings': readings,
        'cash_collections': cash_collections,
        'vouchers': vouchers,
        'pos_records': pos_records,
        'reconciliation': reconciliation,
        'can_edit': can_edit,
        'page_title': f'المناوبة #{shift.id}',
    })


@login_required
@require_roles(OPS_ROLES)
def shift_edit(request, pk):
    shift = get_object_or_404(Shift, pk=pk)
    ensure_station_access(request.user, shift)
    if shift.status not in ('scheduled', 'open'):
        messages.error(request, 'لا يمكن تعديل مناوبة مغلقة')
        return redirect('shift_detail', pk=pk)
    if request.method == 'POST':
        form = ShiftForm(request.POST, instance=shift, user=request.user)
        if form.is_valid():
            form.save()
            messages.success(request, f'تم تعديل المناوبة #{shift.id} بنجاح')
            return redirect('shift_detail', pk=pk)
    else:
        form = ShiftForm(instance=shift, user=request.user)
    return render(request, 'pages/shifts/shift_form.html', {
        'form': form,
        'shift': shift,
        'page_title': f'تعديل المناوبة #{shift.id}',
    })


@login_required
@require_roles(OPS_ROLES)
def shift_delete(request, pk):
    shift = get_object_or_404(Shift, pk=pk)
    ensure_station_access(request.user, shift)
    if shift.status == 'closed':
        messages.error(request, 'لا يمكن حذف مناوبة مغلقة - يمكن إعادة فتحها فقط')
        return redirect('shift_detail', pk=pk)
    if request.method == 'POST':
        from apps.finance.models import CashCollection, Voucher, POSRecord
        has_financial = (shift.readings.exists()
                         or CashCollection.objects.filter(shift=shift).exists()
                         or Voucher.objects.filter(shift=shift).exists()
                         or POSRecord.objects.filter(shift=shift).exists())
        if has_financial:
            messages.error(request,
                'لا يمكن حذف مناوبة تحتوي قراءات أو سجلات مالية - '
                'قم بإلغاء السجلات المالية أولاً أو إبقاء المناوبة للأرشفة.')
            return redirect('shift_detail', pk=pk)
        ok, blockers = safe_delete(shift)
        if ok:
            messages.success(request, f'تم حذف المناوبة #{shift.id} بنجاح')
        else:
            messages.error(request, f'لا يمكن الحذف لوجود سجلات مرتبطة ({describe_blockers(blockers)})')
        return redirect('shift_list')
    return render(request, 'pages/shifts/confirm_delete.html', {'object': shift, 'cancel_url': 'shift_list'})


@login_required
@require_roles(OPS_ROLES)
def shift_close(request, pk):
    shift = get_object_or_404(Shift, pk=pk)
    ensure_station_access(request.user, shift)
    if shift.status not in ('open', 'in_progress'):
        messages.error(request, 'لا يمكن إقفال هذه المناوبة في حالتها الحالية')
        return redirect('shift_detail', pk=pk)

    readings = shift.readings.select_related('meter', 'meter__fuel_type').all()

    # Check reading completeness: warn if active meters at this station don't have readings
    from apps.core.models import Meter as MeterModel
    active_meters = MeterModel.objects.filter(
        machine__island__station=shift.station,
        status='active',
    )
    meters_with_readings = set(readings.values_list('meter_id', flat=True))
    missing_meters = active_meters.exclude(pk__in=meters_with_readings)
    if missing_meters.exists() and request.method != 'POST':
        messages.warning(request,
            f'تنبيه: {missing_meters.count()} عدّاد نشط لا يزال بدون قراءة في هذه المناوبة. '
            'تأكد من تسجيل قراءات جميع العدّادات قبل الإقفال.')

    # Attach previous closing readings directly to each reading object
    from .models import MeterReading as MR
    for reading in readings:
        prev = (
            MR.objects
            .filter(meter=reading.meter, end_reading__isnull=False)
            .exclude(shift=shift)
            .order_by('-recorded_at', '-pk')
            .values_list('end_reading', flat=True)
            .first()
        )
        reading._prev_closing = prev

    if request.method == 'POST':
        # Block close if there are missing meters
        if missing_meters.exists():
            messages.error(request,
                f'لا يمكن إقفال المناوبة: {missing_meters.count()} عدّاد نشط بدون قراءة. '
                'أضف قراءات جميع العدّادات أولاً.')
            return redirect('shift_detail', pk=pk)
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


# ---------------- Meter readings ----------------

@login_required
@require_roles(OPS_ROLES)
def reading_add(request, shift_id):
    shift = get_object_or_404(Shift, pk=shift_id)
    ensure_station_access(request.user, shift)
    if shift.status == 'closed':
        messages.error(request, 'المناوبة مقفلة - لا يمكن إضافة قراءات')
        return redirect('shift_detail', pk=shift.pk)
    if request.method == 'POST':
        form = MeterReadingEntryForm(request.POST, request.FILES, shift=shift)
        form.instance.shift = shift
        form.instance.created_by = request.user
        if form.is_valid():
            reading = form.save(commit=False)
            reading.shift = shift
            reading.created_by = request.user
            reading.save()
            log_change(request.user, 'create', reading, ip_address=get_client_ip(request))
            messages.success(request, 'تم تسجيل القراءة بنجاح')
            return redirect('shift_detail', pk=shift.pk)
    else:
        form = MeterReadingEntryForm(shift=shift)
    return render(request, 'pages/shifts/reading_form.html', {
        'form': form,
        'shift': shift,
        'page_title': f'إضافة قراءة عداد - المناوبة #{shift.id}',
    })


@login_required
@require_roles(OPS_ROLES)
def reading_edit(request, pk):
    reading = get_object_or_404(MeterReading.objects.select_related('shift'), pk=pk)
    shift = reading.shift
    ensure_station_access(request.user, shift)
    if shift.status == 'closed':
        messages.error(request, 'المناوبة مقفلة - لا يمكن تعديل القراءات')
        return redirect('shift_detail', pk=shift.pk)
    if request.method == 'POST':
        old_value = {'start_reading': str(reading.start_reading), 'end_reading': str(reading.end_reading) if reading.end_reading else None}
        form = MeterReadingEntryForm(request.POST, request.FILES, instance=reading, shift=shift)
        if form.is_valid():
            form.save()
            new_value = {'start_reading': str(reading.start_reading), 'end_reading': str(reading.end_reading) if reading.end_reading else None}
            log_change(request.user, 'update', reading, old_value=old_value, new_value=new_value,
                       ip_address=get_client_ip(request))
            messages.success(request, 'تم تعديل القراءة بنجاح')
            return redirect('shift_detail', pk=shift.pk)
    else:
        form = MeterReadingEntryForm(instance=reading, shift=shift)
    return render(request, 'pages/shifts/reading_form.html', {
        'form': form,
        'shift': shift,
        'reading': reading,
        'page_title': f'تعديل القراءة - العداد {reading.meter.code}',
    })


@login_required
@require_roles(OPS_ROLES)
def reading_delete(request, pk):
    reading = get_object_or_404(MeterReading.objects.select_related('shift'), pk=pk)
    shift = reading.shift
    ensure_station_access(request.user, shift)
    if shift.status == 'closed':
        messages.error(request, 'المناوبة مقفلة - لا يمكن حذف القراءات')
        return redirect('shift_detail', pk=shift.pk)
    if request.method == 'POST':
        reading.delete()
        messages.success(request, 'تم حذف القراءة بنجاح')
        return redirect('shift_detail', pk=shift.pk)
    return render(request, 'pages/shifts/confirm_delete.html', {'object': reading, 'cancel_url': 'shift_detail', 'cancel_pk': shift.pk})


# ---------------- Meter Gap Report ----------------

@login_required
def meter_gap_report(request):
    """Show unaccounted meter movement between shifts."""
    from .continuity import get_meter_gap_report
    from apps.core.models import Station
    
    if is_owner(request.user):
        station_id = request.GET.get('station')
        stations = Station.objects.filter(status='active')
        if station_id:
            stations = stations.filter(pk=station_id)
    else:
        st = user_station(request.user)
        stations = Station.objects.filter(pk=st.pk) if st else Station.objects.none()
    
    all_gaps = []
    for station in stations:
        gaps = get_meter_gap_report(station)
        for gap in gaps:
            gap['station'] = station
        all_gaps.extend(gaps)
    
    total_gap = sum(g['gap_liters'] for g in all_gaps)
    
    return render(request, 'pages/shifts/meter_gap_report.html', {
        'gaps': all_gaps,
        'total_gap': total_gap,
        'stations': stations,
        'page_title': 'تقرير فجوات العدادات',
    })


# ---------------- Shift definitions (recurring) ----------------

def _limit_definition_form(form, user):
    from apps.employees.models import Employee
    from apps.core.models import Station
    st = user_station(user)
    if is_owner(user) or st is None:
        return
    form.fields['station'].queryset = Station.objects.filter(pk=st.pk)
    form.fields['default_employee'].queryset = Employee.objects.filter(station=st)


@login_required
def definition_list(request):
    defs = ShiftDefinition.objects.select_related('station', 'default_employee').all()
    if not is_owner(request.user):
        st = user_station(request.user)
        if st:
            defs = defs.filter(station=st)
    return render(request, 'pages/settings/shift_definitions/list.html', {
        'definitions': defs,
        'page_title': 'تعريفات المناوبات',
    })


@login_required
@require_roles(OPS_ROLES)
def definition_create(request):
    if request.method == 'POST':
        form = ShiftDefinitionForm(request.POST)
        _limit_definition_form(form, request.user)
        if form.is_valid():
            obj = form.save(commit=False)
            obj.created_by = request.user
            obj.save()
            messages.success(request, 'تم إنشاء تعريف المناوبة بنجاح')
            return redirect('definition_list')
    else:
        form = ShiftDefinitionForm()
        _limit_definition_form(form, request.user)
    return render(request, 'pages/settings/shift_definitions/form.html', {
        'form': form,
        'page_title': 'إنشاء تعريف مناوبة',
    })


@login_required
@require_roles(OPS_ROLES)
def definition_edit(request, pk):
    definition = get_object_or_404(ShiftDefinition, pk=pk)
    ensure_station_access(request.user, definition)
    if request.method == 'POST':
        form = ShiftDefinitionForm(request.POST, instance=definition)
        _limit_definition_form(form, request.user)
        if form.is_valid():
            form.save()
            messages.success(request, 'تم تعديل تعريف المناوبة بنجاح')
            return redirect('definition_list')
    else:
        form = ShiftDefinitionForm(instance=definition)
        _limit_definition_form(form, request.user)
    return render(request, 'pages/settings/shift_definitions/form.html', {
        'form': form,
        'definition': definition,
        'page_title': f'تعديل تعريف: {definition.name}',
    })


@login_required
@require_roles(OPS_ROLES)
def definition_toggle(request, pk):
    """Activate / deactivate a recurring shift definition."""
    definition = get_object_or_404(ShiftDefinition, pk=pk)
    ensure_station_access(request.user, definition)
    if request.method == 'POST':
        definition.is_active = not definition.is_active
        definition.save(update_fields=['is_active'])
        state = 'تنشيط' if definition.is_active else 'تعطيل'
        messages.success(request, f'تم {state} تعريف المناوبة "{definition.name}" - لن تُنشأ مناوبات جديدة منه بعد الآن' if not definition.is_active else f'تم تنشيط تعريف المناوبة "{definition.name}"')
        return redirect('definition_list')
    return redirect('definition_list')


@login_required
@require_roles(OPS_ROLES)
def definition_delete(request, pk):
    definition = get_object_or_404(ShiftDefinition, pk=pk)
    ensure_station_access(request.user, definition)
    if request.method == 'POST':
        ok, blockers = safe_delete(definition)
        if ok:
            messages.success(request, f'تم حذف تعريف "{definition.name}". السجلات السابقة محفوظة.')
        else:
            definition.is_active = False
            definition.save(update_fields=['is_active'])
            messages.error(request, 'لا يمكن الحذف لوجود سجلات مرتبطة - تم تعطيل التعريف بدلاً من ذلك')
        return redirect('definition_list')
    return render(request, 'pages/settings/confirm_delete.html', {'object': definition, 'cancel_url': 'definition_list'})
