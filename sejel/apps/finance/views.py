from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.utils import timezone
from django.contrib import messages
from decimal import Decimal

from .models import CashCollection, Voucher, POSRecord, Reconciliation, Expense, ExpenseCategory, VoucherSettlement
from .forms import CashCollectionForm, VoucherForm, POSRecordForm, ExpenseForm
from apps.core.permissions import (
    require_roles, ensure_station_access, is_owner, user_station,
    FIN_OPS_ROLES,
)
from apps.core.audit import log_change, get_client_ip


def _get_shift_for_user(request, shift_id):
    from apps.shifts.models import Shift
    shift = get_object_or_404(Shift, pk=shift_id)
    ensure_station_access(request.user, shift)
    return shift


def _scope_shift_records(request, qs):
    if not is_owner(request.user):
        st = user_station(request.user)
        if st:
            qs = qs.filter(shift__station=st)
    return qs


# ---------------- Cash collections ----------------

@login_required
def cash_list(request):
    collections = _scope_shift_records(
        request,
        CashCollection.objects.select_related('shift', 'received_by').filter(is_cancelled=False)
    )
    return render(request, 'pages/finance/cash_list.html', {
        'collections': collections,
        'page_title': 'التحصيل النقدي',
    })


@login_required
@require_roles(FIN_OPS_ROLES)
def cash_create(request, shift_id):
    shift = _get_shift_for_user(request, shift_id)
    if request.method == 'POST':
        form = CashCollectionForm(request.POST)
        if form.is_valid():
            cash = form.save(commit=False)
            cash.shift = shift
            cash.received_by = request.user
            cash.save()
            messages.success(request, 'تم إضافة التحصيل النقدي بنجاح')
            return redirect('shift_detail', pk=shift_id)
    else:
        form = CashCollectionForm(initial={'time': timezone.now().strftime('%Y-%m-%dT%H:%M')})
    return render(request, 'pages/finance/cash_form.html', {
        'form': form,
        'shift': shift,
        'page_title': 'إضافة تحصيل نقدي',
    })


@login_required
@require_roles(FIN_OPS_ROLES)
def cash_edit(request, pk):
    cash = get_object_or_404(CashCollection.objects.select_related('shift'), pk=pk)
    ensure_station_access(request.user, cash.shift)
    shift_id = cash.shift_id
    if cash.shift.status == 'closed' and not is_owner(request.user):
        messages.error(request, 'المناوبة مقفلة - لا يمكن التعديل')
        return redirect('shift_detail', pk=shift_id)
    if request.method == 'POST':
        form = CashCollectionForm(request.POST, instance=cash)
        if form.is_valid():
            form.save()
            messages.success(request, 'تم تعديل التحصيل النقدي بنجاح')
            return redirect('shift_detail', pk=shift_id)
    else:
        form = CashCollectionForm(instance=cash)
    return render(request, 'pages/finance/cash_form.html', {
        'form': form,
        'cash': cash,
        'page_title': 'تعديل التحصيل النقدي',
    })


@login_required
@require_roles(FIN_OPS_ROLES)
def cash_delete(request, pk):
    """Soft-cancel: financial records are never silently deleted."""
    cash = get_object_or_404(CashCollection.objects.select_related('shift'), pk=pk)
    ensure_station_access(request.user, cash.shift)
    shift_id = cash.shift_id
    if request.method == 'POST':
        cash.is_cancelled = True
        cash.cancelled_at = timezone.now()
        cash.cancelled_by = request.user
        cash.save()
        messages.success(request, 'تم إلغاء سجل التحصيل (محفوظ في النظام)')
        return redirect('shift_detail', pk=shift_id)
    return render(request, 'pages/finance/confirm_delete.html',
                  {'object': cash, 'cancel_url': 'shift_detail', 'cancel_pk': shift_id})


# ---------------- Vouchers ----------------

@login_required
def voucher_list(request):
    vouchers = _scope_shift_records(
        request,
        Voucher.objects.select_related('shift', 'category').filter(is_cancelled=False)
    )
    return render(request, 'pages/finance/voucher_list.html', {
        'vouchers': vouchers,
        'page_title': 'الكوبونات',
    })


@login_required
@require_roles(FIN_OPS_ROLES)
def voucher_create(request, shift_id):
    shift = _get_shift_for_user(request, shift_id)
    if request.method == 'POST':
        form = VoucherForm(request.POST)
        if form.is_valid():
            voucher = form.save(commit=False)
            voucher.shift = shift
            voucher.total_value = voucher.category.value * voucher.count
            voucher.save()
            messages.success(request, 'تم إضافة الكوبونات بنجاح')
            return redirect('shift_detail', pk=shift_id)
    else:
        form = VoucherForm()
    return render(request, 'pages/finance/voucher_form.html', {
        'form': form,
        'shift': shift,
        'page_title': 'إضافة كوبونات',
    })


@login_required
@require_roles(FIN_OPS_ROLES)
def voucher_edit(request, pk):
    voucher = get_object_or_404(Voucher.objects.select_related('shift'), pk=pk)
    ensure_station_access(request.user, voucher.shift)
    shift_id = voucher.shift_id
    if voucher.shift.status == 'closed' and not is_owner(request.user):
        messages.error(request, 'المناوبة مقفلة - لا يمكن التعديل')
        return redirect('shift_detail', pk=shift_id)
    if request.method == 'POST':
        form = VoucherForm(request.POST, instance=voucher)
        if form.is_valid():
            v = form.save(commit=False)
            v.total_value = v.category.value * v.count
            v.save()
            messages.success(request, 'تم تعديل الكوبونات بنجاح')
            return redirect('shift_detail', pk=shift_id)
    else:
        form = VoucherForm(instance=voucher)
    return render(request, 'pages/finance/voucher_form.html', {
        'form': form,
        'voucher': voucher,
        'page_title': 'تعديل الكوبونات',
    })


@login_required
@require_roles(FIN_OPS_ROLES)
def voucher_delete(request, pk):
    voucher = get_object_or_404(Voucher.objects.select_related('shift'), pk=pk)
    ensure_station_access(request.user, voucher.shift)
    shift_id = voucher.shift_id
    if request.method == 'POST':
        voucher.is_cancelled = True
        voucher.cancelled_at = timezone.now()
        voucher.cancelled_by = request.user
        voucher.save()
        messages.success(request, 'تم إلغاء سجل الكوبونات (محفوظ في النظام)')
        return redirect('shift_detail', pk=shift_id)
    return render(request, 'pages/finance/confirm_delete.html',
                  {'object': voucher, 'cancel_url': 'shift_detail', 'cancel_pk': shift_id})


# ---------------- POS records ----------------

@login_required
def pos_list(request):
    records = _scope_shift_records(
        request,
        POSRecord.objects.select_related('shift', 'entered_by').filter(is_cancelled=False)
    )
    return render(request, 'pages/finance/pos_list.html', {
        'records': records,
        'page_title': 'واصلات POS',
    })


@login_required
@require_roles(FIN_OPS_ROLES)
def pos_create(request, shift_id):
    shift = _get_shift_for_user(request, shift_id)
    if request.method == 'POST':
        form = POSRecordForm(request.POST)
        if form.is_valid():
            pos = form.save(commit=False)
            pos.shift = shift
            pos.entered_by = request.user
            pos.save()
            messages.success(request, 'تم إضافة سجل POS بنجاح')
            return redirect('shift_detail', pk=shift_id)
    else:
        form = POSRecordForm()
    return render(request, 'pages/finance/pos_form.html', {
        'form': form,
        'shift': shift,
        'page_title': 'إضافة POS',
    })


@login_required
@require_roles(FIN_OPS_ROLES)
def pos_edit(request, pk):
    pos = get_object_or_404(POSRecord.objects.select_related('shift'), pk=pk)
    ensure_station_access(request.user, pos.shift)
    shift_id = pos.shift_id
    if pos.shift.status == 'closed' and not is_owner(request.user):
        messages.error(request, 'المناوبة مقفلة - لا يمكن التعديل')
        return redirect('shift_detail', pk=shift_id)
    if request.method == 'POST':
        form = POSRecordForm(request.POST, instance=pos)
        if form.is_valid():
            form.save()
            messages.success(request, 'تم تعديل سجل POS بنجاح')
            return redirect('shift_detail', pk=shift_id)
    else:
        form = POSRecordForm(instance=pos)
    return render(request, 'pages/finance/pos_form.html', {
        'form': form,
        'pos': pos,
        'page_title': 'تعديل POS',
    })


@login_required
@require_roles(FIN_OPS_ROLES)
def pos_delete(request, pk):
    pos = get_object_or_404(POSRecord.objects.select_related('shift'), pk=pk)
    ensure_station_access(request.user, pos.shift)
    shift_id = pos.shift_id
    if request.method == 'POST':
        pos.is_cancelled = True
        pos.cancelled_at = timezone.now()
        pos.cancelled_by = request.user
        pos.save()
        messages.success(request, 'تم إلغاء سجل POS (محفوظ في النظام)')
        return redirect('shift_detail', pk=shift_id)
    return render(request, 'pages/finance/confirm_delete.html',
                  {'object': pos, 'cancel_url': 'shift_detail', 'cancel_pk': shift_id})


# ---------------- Reconciliations ----------------

@login_required
def reconciliation_list(request):
    reconciliations = _scope_shift_records(
        request,
        Reconciliation.objects.select_related('shift', 'shift__employee', 'shift__station', 'shift__definition')
    )
    return render(request, 'pages/finance/reconciliation_list.html', {
        'reconciliations': reconciliations,
        'page_title': 'المطابقات',
    })


@login_required
def reconciliation_detail(request, shift_id):
    from apps.shifts.models import Shift
    shift = get_object_or_404(Shift, pk=shift_id)
    ensure_station_access(request.user, shift)
    reconciliation = get_object_or_404(Reconciliation, shift=shift)
    return render(request, 'pages/finance/reconciliation_detail.html', {
        'reconciliation': reconciliation,
        'shift': shift,
        'page_title': f'المطابقة - المناوبة #{shift.id}',
    })


@login_required
@require_roles(FIN_OPS_ROLES)
def reconciliation_confirm(request, shift_id):
    """Finance approves the settlement -> shift becomes reconciled."""
    from apps.shifts.models import Shift
    shift = get_object_or_404(Shift, pk=shift_id)
    ensure_station_access(request.user, shift)
    if request.method == 'POST':
        reconciliation = get_object_or_404(Reconciliation, shift=shift)
        reconciliation.status = 'confirmed'
        reconciliation.confirmed_by = request.user
        reconciliation.confirmed_at = timezone.now()
        reconciliation.save(update_fields=['status', 'confirmed_by', 'confirmed_at'])
        shift.status = 'reconciled'
        shift.save(update_fields=['status'])
        messages.success(request, f'تم اعتماد تسوية المناوبة #{shift.id}')
    return redirect('reconciliation_detail', shift_id=shift.id)


# ---------------- Expenses ----------------

@login_required
def expense_list(request):
    expenses = Expense.objects.select_related('station', 'category', 'created_by').all()
    if not is_owner(request.user):
        st = user_station(request.user)
        if st:
            expenses = expenses.filter(station=st)
    status = request.GET.get('status')
    if status:
        expenses = expenses.filter(status=status)
    return render(request, 'pages/finance/expense_list.html', {
        'expenses': expenses.exclude(status='cancelled'),
        'page_title': 'المصروفات',
    })


@login_required
def expense_detail(request, pk):
    expense = get_object_or_404(Expense, pk=pk)
    ensure_station_access(request.user, expense)
    return render(request, 'pages/finance/expense_detail.html', {
        'expense': expense,
        'page_title': f'مصروف #{expense.id}',
    })


@login_required
@require_roles(FIN_OPS_ROLES)
def expense_create(request):
    if request.method == 'POST':
        form = ExpenseForm(request.POST, request.FILES)
        _limit_expense(form, request.user)
        if form.is_valid():
            expense = form.save(commit=False)
            expense.created_by = request.user
            st = user_station(request.user)
            if st and not is_owner(request.user):
                expense.station = st
            expense.save()
            messages.success(request, 'تم إضافة المصروف بنجاح')
            return redirect('expense_list')
    else:
        form = ExpenseForm()
        _limit_expense(form, request.user)
    return render(request, 'pages/finance/expense_form.html', {
        'form': form,
        'page_title': 'إضافة مصروف',
    })


def _limit_expense(form, user):
    from apps.core.models import Station
    from apps.shifts.models import Shift
    st = user_station(user)
    if is_owner(user) or st is None:
        return
    form.fields['station'].queryset = Station.objects.filter(pk=st.pk)
    form.fields['shift'].queryset = Shift.objects.filter(station=st)


@login_required
@require_roles(FIN_OPS_ROLES)
def expense_edit(request, pk):
    expense = get_object_or_404(Expense, pk=pk)
    ensure_station_access(request.user, expense)
    if request.method == 'POST':
        form = ExpenseForm(request.POST, request.FILES, instance=expense)
        _limit_expense(form, request.user)
        if form.is_valid():
            form.save()
            messages.success(request, 'تم تعديل المصروف بنجاح')
            return redirect('expense_list')
    else:
        form = ExpenseForm(instance=expense)
        _limit_expense(form, request.user)
    return render(request, 'pages/finance/expense_form.html', {
        'form': form,
        'expense': expense,
        'page_title': f'تعديل المصروف #{expense.id}',
    })


@login_required
@require_roles(FIN_OPS_ROLES)
def expense_delete(request, pk):
    expense = get_object_or_404(Expense, pk=pk)
    ensure_station_access(request.user, expense)
    if request.method == 'POST':
        old_status = expense.status
        expense.status = 'cancelled'
        expense.save(update_fields=['status'])
        log_change(
            user=request.user,
            action='cancel',
            obj=expense,
            old_value={'status': old_status},
            new_value={'status': 'cancelled'},
            ip_address=get_client_ip(request),
        )
        messages.success(request, 'تم إلغاء المصروف (محفوظ في النظام)')
        return redirect('expense_list')
    return render(request, 'pages/finance/confirm_delete.html', {'object': expense, 'cancel_url': 'expense_list'})


@login_required
@require_roles(FIN_OPS_ROLES)
def expense_approve(request, pk):
    expense = get_object_or_404(Expense, pk=pk)
    ensure_station_access(request.user, expense)
    if request.method == 'POST':
        action = request.POST.get('action')
        old_status = expense.status
        if action == 'approve':
            expense.status = 'approved'
            expense.approved_by = request.user
            messages.success(request, 'تم اعتماد المصروف')
        elif action == 'reject':
            expense.status = 'rejected'
            expense.approved_by = request.user
            messages.success(request, 'تم رفض المصروف')
        expense.save()
        log_change(
            user=request.user,
            action='update',
            obj=expense,
            old_value={'status': old_status},
            new_value={'status': expense.status, 'approved_by': request.user.pk},
            ip_address=get_client_ip(request),
        )
    return redirect('expense_list')


# ---------------- Voucher Settlements ----------------

@login_required
def settlement_list(request):
    """List all voucher settlements, scoped by station."""
    settlements = VoucherSettlement.objects.select_related(
        'station', 'created_by'
    )
    if not is_owner(request.user):
        st = user_station(request.user)
        if st:
            settlements = settlements.filter(station=st)
    station_id = request.GET.get('station')
    if station_id and is_owner(request.user):
        settlements = settlements.filter(station_id=station_id)
    status = request.GET.get('status')
    if status:
        settlements = settlements.filter(status=status)
    return render(request, 'pages/finance/settlement_list.html', {
        'settlements': settlements,
        'page_title': 'تسويات الكوبونات',
    })


@login_required
@require_roles(FIN_OPS_ROLES)
def settlement_create(request):
    """Create a new voucher settlement batch."""
    if request.method == 'POST':
        station_id = request.POST.get('station')
        submission_date = request.POST.get('submission_date')
        denom_5 = request.POST.get('denom_5', '0') or '0'
        denom_6 = request.POST.get('denom_6', '0') or '0'
        denom_8 = request.POST.get('denom_8', '0') or '0'
        notes = request.POST.get('notes', '')
        
        if not station_id or not submission_date:
            messages.error(request, 'المحطة وتاريخ التسليم مطلوبان')
            return redirect('settlement_create')
        
        from apps.core.models import Station as StationModel
        station = get_object_or_404(StationModel, pk=station_id)
        ensure_station_access(request.user, station)
        
        try:
            d5 = int(denom_5)
            d6 = int(denom_6)
            d8 = int(denom_8)
        except (ValueError, TypeError):
            messages.error(request, 'أعداد الكوبونات يجب أن تكون أرقام صحيحة')
            return redirect('settlement_create')
        
        if d5 < 0 or d6 < 0 or d8 < 0:
            messages.error(request, 'أعداد الكوبونات لا يمكن أن تكون سالبة')
            return redirect('settlement_create')
        
        total_value = d5 * Decimal('5') + d6 * Decimal('6') + d8 * Decimal('8')
        total_count = d5 + d6 + d8
        
        if total_count == 0:
            messages.error(request, 'يجب إدخال كوبونات واحدة على الأقل')
            return redirect('settlement_create')
        
        settlement = VoucherSettlement.objects.create(
            station=station,
            submission_date=submission_date,
            total_value=total_value,
            total_count=total_count,
            denom_5=d5,
            denom_6=d6,
            denom_8=d8,
            notes=notes,
            created_by=request.user,
            status='submitted',
        )
        messages.success(request, f'تم تسجيل تسليم {total_count} كوبون بقيمة {total_value} د.ل')
        return redirect('settlement_detail', pk=settlement.pk)
    
    # GET: prepare form
    from apps.core.models import Station as StationModel
    if is_owner(request.user):
        stations = StationModel.objects.filter(status='active')
    else:
        st = user_station(request.user)
        stations = StationModel.objects.filter(pk=st.pk) if st else StationModel.objects.none()
    
    return render(request, 'pages/finance/settlement_form.html', {
        'stations': stations,
        'page_title': 'تسجيل تسليم كوبونات',
    })


@login_required
def settlement_detail(request, pk):
    """View voucher settlement details."""
    settlement = get_object_or_404(
        VoucherSettlement.objects.select_related('station', 'created_by'),
        pk=pk
    )
    ensure_station_access(request.user, settlement)
    
    # Calculate pending voucher total for this station
    from django.db.models import Sum
    pending_vouchers = Voucher.objects.filter(
        shift__station=settlement.station, is_cancelled=False
    ).aggregate(total=Sum('total_value'))['total'] or Decimal('0')
    
    # Calculate already settled amounts
    settled_total = VoucherSettlement.objects.filter(
        station=settlement.station, status__in=['submitted', 'paid', 'partial']
    ).exclude(pk=settlement.pk).aggregate(total=Sum('total_value'))['total'] or Decimal('0')
    
    return render(request, 'pages/finance/settlement_detail.html', {
        'settlement': settlement,
        'pending_vouchers': pending_vouchers,
        'settled_total': settled_total,
        'denom_5_value': settlement.denom_5 * Decimal('5'),
        'denom_6_value': settlement.denom_6 * Decimal('6'),
        'denom_8_value': settlement.denom_8 * Decimal('8'),
        'page_title': f'تسوية كوبونات #{settlement.pk}',
    })


@login_required
@require_roles(FIN_OPS_ROLES)
def settlement_update_payment(request, pk):
    """Update payment status for a settlement."""
    settlement = get_object_or_404(VoucherSettlement, pk=pk)
    ensure_station_access(request.user, settlement)
    
    if request.method == 'POST':
        action = request.POST.get('action')
        
        if action == 'mark_paid':
            settlement.status = 'paid'
            settlement.paid_amount = settlement.total_value
            settlement.payment_date = request.POST.get('payment_date') or timezone.now().date()
            settlement.payment_reference = request.POST.get('payment_reference', '')
            settlement.save()
            messages.success(request, 'تم تسجيل الدفع الكامل من الرحمة')
        
        elif action == 'mark_partial':
            paid = request.POST.get('paid_amount', '0')
            try:
                settlement.paid_amount = Decimal(paid)
            except (ValueError, TypeError):
                messages.error(request, 'المبلغ غير صحيح')
                return redirect('settlement_detail', pk=pk)
            settlement.status = 'partial'
            settlement.payment_date = request.POST.get('payment_date') or timezone.now().date()
            settlement.payment_reference = request.POST.get('payment_reference', '')
            settlement.save()
            messages.success(request, f'تم تسجيل دفع جزئي: {settlement.paid_amount} د.ل')
        
        elif action == 'mark_disputed':
            settlement.status = 'disputed'
            settlement.notes = request.POST.get('notes', settlement.notes)
            settlement.save()
            messages.warning(request, 'تم تسجيل التسوية كمختلف عليها')
        
        elif action == 'cancel':
            settlement.status = 'cancelled'
            settlement.save()
            messages.success(request, 'تم إلغاء التسوية')
    
    return redirect('settlement_detail', pk=pk)


@login_required
@require_roles(FIN_OPS_ROLES)
def settlement_delete(request, pk):
    """Delete a settlement (only submitted, not yet paid)."""
    settlement = get_object_or_404(VoucherSettlement, pk=pk)
    ensure_station_access(request.user, settlement)
    
    if settlement.status not in ('submitted',):
        messages.error(request, 'لا يمكن حذف تسوية مدفوعة أو مختلف عليها')
        return redirect('settlement_detail', pk=pk)
    
    if request.method == 'POST':
        settlement.delete()
        messages.success(request, 'تم حذف التسوية')
        return redirect('settlement_list')
    
    return render(request, 'pages/finance/confirm_delete.html', {
        'object': settlement,
        'cancel_url': 'settlement_list',
    })
