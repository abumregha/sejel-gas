from django.contrib import admin
from .models import Employee, ShiftAssignment


@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ('name', 'station', 'phone', 'shift_type', 'status')
    list_filter = ('station', 'status', 'shift_type')


@admin.register(ShiftAssignment)
class ShiftAssignmentAdmin(admin.ModelAdmin):
    list_display = ('employee', 'island', 'date', 'start_time', 'end_time')
    list_filter = ('date', 'employee__station')
