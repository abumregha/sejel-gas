from django import forms
from .models import VoucherCategory


class VoucherCategoryForm(forms.ModelForm):
    class Meta:
        model = VoucherCategory
        fields = ['name', 'name_en', 'description']
        widgets = {
            'name': forms.TextInput(attrs={'class': 'w-full border border-gray-300 rounded-lg px-4 py-2.5'}),
            'name_en': forms.TextInput(attrs={'class': 'w-full border border-gray-300 rounded-lg px-4 py-2.5'}),
            'description': forms.Textarea(attrs={'class': 'w-full border border-gray-300 rounded-lg px-4 py-2.5', 'rows': 3}),
        }
