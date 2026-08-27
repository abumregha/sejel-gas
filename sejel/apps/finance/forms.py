from django import forms
from .models import CashCollection, Voucher, POSRecord, Expense

INPUT_CLASS = 'w-full border border-gray-300 rounded-lg px-4 py-2.5'


class CashCollectionForm(forms.ModelForm):
    class Meta:
        model = CashCollection
        fields = ['amount', 'time', 'reference', 'notes']
        widgets = {
            'amount': forms.NumberInput(attrs={'class': INPUT_CLASS, 'step': '0.001'}),
            'time': forms.DateTimeInput(attrs={'class': INPUT_CLASS, 'type': 'datetime-local'}),
            'reference': forms.TextInput(attrs={'class': INPUT_CLASS}),
            'notes': forms.Textarea(attrs={'class': INPUT_CLASS, 'rows': 2}),
        }


class VoucherForm(forms.ModelForm):
    class Meta:
        model = Voucher
        fields = ['category', 'count']
        widgets = {
            'category': forms.Select(attrs={'class': INPUT_CLASS}),
            'count': forms.NumberInput(attrs={'class': INPUT_CLASS}),
        }


class POSRecordForm(forms.ModelForm):
    class Meta:
        model = POSRecord
        fields = ['total_amount', 'transaction_count', 'notes']
        widgets = {
            'total_amount': forms.NumberInput(attrs={'class': INPUT_CLASS, 'step': '0.001'}),
            'transaction_count': forms.NumberInput(attrs={'class': INPUT_CLASS}),
            'notes': forms.Textarea(attrs={'class': INPUT_CLASS, 'rows': 2}),
        }


class ExpenseForm(forms.ModelForm):
    class Meta:
        model = Expense
        fields = ['station', 'shift', 'category', 'amount', 'description', 'paid_to', 'payment_method', 'attachment']
        widgets = {
            'station': forms.Select(attrs={'class': INPUT_CLASS}),
            'shift': forms.Select(attrs={'class': INPUT_CLASS}),
            'category': forms.Select(attrs={'class': INPUT_CLASS}),
            'amount': forms.NumberInput(attrs={'class': INPUT_CLASS, 'step': '0.001'}),
            'description': forms.Textarea(attrs={'class': INPUT_CLASS, 'rows': 3}),
            'paid_to': forms.TextInput(attrs={'class': INPUT_CLASS}),
            'payment_method': forms.Select(attrs={'class': INPUT_CLASS}),
        }
