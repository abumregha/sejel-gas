from django import forms
from .models import Employee, ShiftAssignment

INPUT_CLASS = 'w-full border border-gray-300 rounded-lg px-4 py-2.5'


class EmployeeForm(forms.ModelForm):
    class Meta:
        model = Employee
        fields = ['station', 'name', 'phone', 'status', 'shift_type']
        widgets = {
            'station': forms.Select(attrs={'class': INPUT_CLASS}),
            'name': forms.TextInput(attrs={'class': INPUT_CLASS}),
            'phone': forms.TextInput(attrs={'class': INPUT_CLASS}),
            'status': forms.Select(attrs={'class': INPUT_CLASS}),
            'shift_type': forms.Select(attrs={'class': INPUT_CLASS}),
        }


class ShiftAssignmentForm(forms.ModelForm):
    class Meta:
        model = ShiftAssignment
        fields = ['employee', 'island', 'date', 'start_time', 'end_time']
        widgets = {
            'employee': forms.Select(attrs={'class': INPUT_CLASS}),
            'island': forms.Select(attrs={'class': INPUT_CLASS}),
            'date': forms.DateInput(attrs={'class': INPUT_CLASS, 'type': 'date'}),
            'start_time': forms.TimeInput(attrs={'class': INPUT_CLASS, 'type': 'time'}),
            'end_time': forms.TimeInput(attrs={'class': INPUT_CLASS, 'type': 'time'}),
        }
