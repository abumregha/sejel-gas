from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from .models import CashCollection, Voucher, POSRecord, Reconciliation, Expense, ExpenseCategory
from .forms import CashCollectionForm, VoucherForm, POSRecordForm, ExpenseForm


@login_required
def cash_list(request):
    collections = CashCollection.objects.select_related('shift', 'received_by').all()
    return render(request, 'pages/finance/cash_list.html', {
        'collections': collections,
        'page_title': 'التحصيل النقدي',
    })


@login_required
def cash_create(request, shift_id):
    from apps.shifts.models import Shift
    shift = get_object_or_404(Shift, pk=shift_id)
    if request.method == 'POST':
        form = CashCollectionForm(request.POST)
        if form.is_valid():
            cash = form.save(commit=False)
            cash.shift = shift
            cash.received_by = request.user
            cash.save()
            return redirect('shift_detail', pk=shift_id)
    else:
        form = CashCollectionForm()
    return render(request, 'pages/finance/cash_form.html', {
        'form': form,
        'shift': shift,
        'page_title': 'إضافة تحصيل نقدي',
    })


@login_required
def voucher_list(request):
    vouchers = Voucher.objects.select_related('shift', 'category').all()
    return render(request, 'pages/finance/voucher_list.html', {
        'vouchers': vouchers,
        'page_title': 'الكوبونات',
    })


@login_required
def voucher_create(request, shift_id):
    from apps.shifts.models import Shift
    shift = get_object_or_404(Shift, pk=shift_id)
    if request.method == 'POST':
        form = VoucherForm(request.POST)
        if form.is_valid():
            voucher = form.save(commit=False)
            voucher.shift = shift
            voucher.total_value = voucher.category.value * voucher.count
            voucher.save()
            return redirect('shift_detail', pk=shift_id)
    else:
        form = VoucherForm()
    return render(request, 'pages/finance/voucher_form.html', {
        'form': form,
        'shift': shift,
        'page_title': 'إضافة كوبونات',
    })


@login_required
def pos_list(request):
    records = POSRecord.objects.select_related('shift', 'entered_by').all()
    return render(request, 'pages/finance/pos_list.html', {
        'records': records,
        'page_title': 'واصلات POS',
    })


@login_required
def pos_create(request, shift_id):
    from apps.shifts.models import Shift
    shift = get_object_or_404(Shift, pk=shift_id)
    if request.method == 'POST':
        form = POSRecordForm(request.POST)
        if form.is_valid():
            pos = form.save(commit=False)
            pos.shift = shift
            pos.entered_by = request.user
            pos.save()
            return redirect('shift_detail', pk=shift_id)
    else:
        form = POSRecordForm()
    return render(request, 'pages/finance/pos_form.html', {
        'form': form,
        'shift': shift,
        'page_title': 'إضافة POS',
    })


@login_required
def reconciliation_detail(request, shift_id):
    from apps.shifts.models import Shift
    shift = get_object_or_404(Shift, pk=shift_id)
    reconciliation = get_object_or_404(Reconciliation, shift=shift)
    return render(request, 'pages/finance/reconciliation_detail.html', {
        'reconciliation': reconciliation,
        'shift': shift,
        'page_title': f'المطابقة - المناوبة #{shift.id}',
    })


@login_required
def expense_list(request):
    expenses = Expense.objects.select_related('station', 'category', 'created_by').all()
    status = request.GET.get('status')
    if status:
        expenses = expenses.filter(status=status)
    return render(request, 'pages/finance/expense_list.html', {
        'expenses': expenses,
        'page_title': 'المصروفات',
    })


@login_required
def expense_create(request):
    if request.method == 'POST':
        form = ExpenseForm(request.POST, request.FILES)
        if form.is_valid():
            expense = form.save(commit=False)
            expense.created_by = request.user
            if request.user.profile.station:
                expense.station = request.user.profile.station
            expense.save()
            return redirect('expense_list')
    else:
        form = ExpenseForm()
    return render(request, 'pages/finance/expense_form.html', {
        'form': form,
        'page_title': 'إضافة مصروف',
    })


@login_required
def expense_approve(request, pk):
    expense = get_object_or_404(Expense, pk=pk)
    if request.method == 'POST':
        action = request.POST.get('action')
        if action == 'approve':
            expense.status = 'approved'
            expense.approved_by = request.user
        elif action == 'reject':
            expense.status = 'rejected'
            expense.approved_by = request.user
        expense.save()
    return redirect('expense_list')
