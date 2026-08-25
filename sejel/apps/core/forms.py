from django import forms
from .models import Station, FuelType, FuelPrice
from apps.finance.models import VoucherCategory, ExpenseCategory


class StationForm(forms.ModelForm):
    class Meta:
        model = Station
        fields = ['name', 'address', 'status', 'relationship_type', 'marketing_company',
                  'cash_collection_mode', 'target_cash_amount', 'photo_meter_required']
        widgets = {
            'name': forms.TextInput(attrs={'class': 'w-full border border-gray-300 rounded-lg px-4 py-2.5'}),
            'address': forms.Textarea(attrs={'class': 'w-full border border-gray-300 rounded-lg px-4 py-2.5', 'rows': 3}),
            'status': forms.Select(attrs={'class': 'w-full border border-gray-300 rounded-lg px-4 py-2.5'}),
            'relationship_type': forms.Select(attrs={'class': 'w-full border border-gray-300 rounded-lg px-4 py-2.5'}),
            'marketing_company': forms.Select(attrs={'class': 'w-full border border-gray-300 rounded-lg px-4 py-2.5'}),
            'cash_collection_mode': forms.Select(attrs={'class': 'w-full border border-gray-300 rounded-lg px-4 py-2.5'}),
            'target_cash_amount': forms.NumberInput(attrs={'class': 'w-full border border-gray-300 rounded-lg px-4 py-2.5'}),
        }


class FuelTypeForm(forms.ModelForm):
    class Meta:
        model = FuelType
        fields = ['name', 'name_en']
        widgets = {
            'name': forms.TextInput(attrs={'class': 'w-full border border-gray-300 rounded-lg px-4 py-2.5'}),
            'name_en': forms.TextInput(attrs={'class': 'w-full border border-gray-300 rounded-lg px-4 py-2.5'}),
        }


class FuelPriceForm(forms.ModelForm):
    class Meta:
        model = FuelPrice
        fields = ['fuel_type', 'selling_price', 'profit_margin', 'cost_per_liter', 'effective_date', 'is_active']
        widgets = {
            'fuel_type': forms.Select(attrs={'class': 'w-full border border-gray-300 rounded-lg px-4 py-2.5'}),
            'selling_price': forms.NumberInput(attrs={'class': 'w-full border border-gray-300 rounded-lg px-4 py-2.5'}),
            'profit_margin': forms.NumberInput(attrs={'class': 'w-full border border-gray-300 rounded-lg px-4 py-2.5'}),
            'cost_per_liter': forms.NumberInput(attrs={'class': 'w-full border border-gray-300 rounded-lg px-4 py-2.5'}),
            'effective_date': forms.DateInput(attrs={'class': 'w-full border border-gray-300 rounded-lg px-4 py-2.5', 'type': 'date'}),
        }


class VoucherCategoryForm(forms.ModelForm):
    class Meta:
        model = VoucherCategory
        fields = ['name', 'value', 'is_active']
        widgets = {
            'name': forms.TextInput(attrs={'class': 'w-full border border-gray-300 rounded-lg px-4 py-2.5'}),
            'value': forms.NumberInput(attrs={'class': 'w-full border border-gray-300 rounded-lg px-4 py-2.5'}),
        }


class ExpenseCategoryForm(forms.ModelForm):
    class Meta:
        model = ExpenseCategory
        fields = ['name', 'station', 'is_active']
        widgets = {
            'name': forms.TextInput(attrs={'class': 'w-full border border-gray-300 rounded-lg px-4 py-2.5'}),
        }
