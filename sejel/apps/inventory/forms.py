from decimal import Decimal

from django import forms
from .models import Delivery, DeliveryDocument, ShortageClaim
from apps.core.models import Tank

INPUT_CLASS = 'w-full border border-gray-300 rounded-lg px-4 py-2.5'


class TankForm(forms.ModelForm):
    class Meta:
        model = Tank
        fields = ['station', 'name', 'fuel_type', 'capacity', 'current_level']
        widgets = {
            'station': forms.Select(attrs={'class': INPUT_CLASS}),
            'name': forms.TextInput(attrs={'class': INPUT_CLASS}),
            'fuel_type': forms.Select(attrs={'class': INPUT_CLASS}),
            'capacity': forms.NumberInput(attrs={'class': INPUT_CLASS, 'step': '0.001'}),
            'current_level': forms.NumberInput(attrs={'class': INPUT_CLASS, 'step': '0.001'}),
        }


class DeliveryForm(forms.ModelForm):
    class Meta:
        model = Delivery
        fields = ['station', 'tank', 'fuel_type', 'supplier', 'requested_quantity',
                  'expected_quantity', 'pre_reading', 'post_reading',
                  'order_date', 'arrival_date', 'document_number',
                  'invoiced_amount', 'paid_amount', 'payment_date',
                  'payment_reference', 'payment_status', 'status']
        widgets = {
            'station': forms.Select(attrs={'class': INPUT_CLASS}),
            'tank': forms.Select(attrs={'class': INPUT_CLASS}),
            'fuel_type': forms.Select(attrs={'class': INPUT_CLASS}),
            'supplier': forms.Select(attrs={'class': INPUT_CLASS}),
            'requested_quantity': forms.NumberInput(attrs={'class': INPUT_CLASS, 'step': '0.001'}),
            'expected_quantity': forms.NumberInput(attrs={'class': INPUT_CLASS, 'step': '0.001'}),
            'pre_reading': forms.NumberInput(attrs={'class': INPUT_CLASS, 'step': '0.001'}),
            'post_reading': forms.NumberInput(attrs={'class': INPUT_CLASS, 'step': '0.001'}),
            'order_date': forms.DateTimeInput(attrs={'class': INPUT_CLASS, 'type': 'datetime-local'}),
            'arrival_date': forms.DateTimeInput(attrs={'class': INPUT_CLASS, 'type': 'datetime-local'}),
            'document_number': forms.TextInput(attrs={'class': INPUT_CLASS}),
            'invoiced_amount': forms.NumberInput(attrs={'class': INPUT_CLASS, 'step': '0.001'}),
            'paid_amount': forms.NumberInput(attrs={'class': INPUT_CLASS, 'step': '0.001'}),
            'payment_date': forms.DateTimeInput(attrs={'class': INPUT_CLASS, 'type': 'datetime-local'}),
            'payment_reference': forms.TextInput(attrs={'class': INPUT_CLASS}),
            'payment_status': forms.Select(attrs={'class': INPUT_CLASS}),
            'status': forms.Select(attrs={'class': INPUT_CLASS}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['pre_reading'].required = False
        self.fields['post_reading'].required = False
        self.fields['supplier'].required = False
        self.fields['invoiced_amount'].required = False
        self.fields['paid_amount'].required = False
        self.fields['payment_date'].required = False
        self.fields['payment_reference'].required = False

    def clean(self):
        cleaned = super().clean()
        pre = cleaned.get('pre_reading')
        post = cleaned.get('post_reading')
        expected = cleaned.get('expected_quantity')
        if pre is not None and post is not None and post >= pre:
            cleaned['received_quantity'] = post - pre
            if expected:
                shortage = expected - cleaned['received_quantity']
                cleaned['shortage'] = max(Decimal('0'), shortage)
            else:
                cleaned['shortage'] = Decimal('0')
        elif pre is not None and post is not None and post < pre:
            self.add_error('post_reading', 'القراءة بعد الشحنة لا يمكن أن أقل من القراءة قبلها')
        return cleaned

    def save(self, commit=True):
        obj = super().save(commit=False)
        pre = self.cleaned_data.get('pre_reading')
        post = self.cleaned_data.get('post_reading')
        if pre is not None and post is not None and post >= pre:
            obj.received_quantity = post - pre
            expected = self.cleaned_data.get('expected_quantity') or obj.expected_quantity
            if expected:
                obj.shortage = max(Decimal('0'), expected - obj.received_quantity)
        if commit:
            obj.save()
        return obj


class DeliveryDocumentForm(forms.ModelForm):
    class Meta:
        model = DeliveryDocument
        fields = ['document_type', 'file']
        widgets = {
            'document_type': forms.Select(attrs={'class': INPUT_CLASS}),
            'file': forms.ClearableFileInput(attrs={'class': INPUT_CLASS}),
        }


class ShortageClaimForm(forms.ModelForm):
    class Meta:
        model = ShortageClaim
        fields = ['status', 'notes']
        widgets = {
            'status': forms.Select(attrs={'class': INPUT_CLASS}),
            'notes': forms.Textarea(attrs={'class': INPUT_CLASS, 'rows': 3}),
        }
