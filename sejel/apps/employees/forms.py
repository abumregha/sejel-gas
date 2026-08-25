from django import forms
from .models import Employee, ShiftAssignment


class EmployeeForm(forms.ModelForm):
    class Meta:
        model = Employee
        fields = ['station', 'name', 'phone', 'status', 'shift_type']


class ShiftAssignmentForm(forms.ModelForm):
    class Meta:
        model = ShiftAssignment
        fields = ['employee', 'island', 'date', 'start_time', 'end_time']
