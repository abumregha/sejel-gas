from django import forms
from .models import CashCollection, Voucher, POSRecord, Expense


class CashCollectionForm(forms.ModelForm):
    class Meta:
        model = CashCollection
        fields = ['amount', 'time', 'reference', 'notes']


class VoucherForm(forms.ModelForm):
    class Meta:
        model = Voucher
        fields = ['category', 'count']


class POSRecordForm(forms.ModelForm):
    class Meta:
        model = POSRecord
        fields = ['total_amount', 'transaction_count', 'notes']


class ExpenseForm(forms.ModelForm):
    class Meta:
        model = Expense
        fields = ['station', 'shift', 'category', 'amount', 'description', 'paid_to', 'payment_method', 'attachment']
