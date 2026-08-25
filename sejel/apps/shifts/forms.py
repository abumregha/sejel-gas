from django import forms
from .models import Shift, MeterReading


class ShiftForm(forms.ModelForm):
    class Meta:
        model = Shift
        fields = ['station', 'employee', 'island', 'date', 'start_time']


class MeterReadingForm(forms.ModelForm):
    class Meta:
        model = MeterReading
        fields = ['meter', 'start_reading', 'end_reading', 'override_reason', 'photo']
