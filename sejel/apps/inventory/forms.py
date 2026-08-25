from django import forms
from .models import Delivery


class DeliveryForm(forms.ModelForm):
    class Meta:
        model = Delivery
        fields = ['station', 'tank', 'fuel_type', 'requested_quantity', 'expected_quantity',
                  'order_date', 'arrival_date', 'document_number', 'status']
