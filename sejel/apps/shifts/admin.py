from django.contrib import admin
from .models import Shift, MeterReading


@admin.register(Shift)
class ShiftAdmin(admin.ModelAdmin):
    list_display = ('id', 'employee', 'station', 'island', 'date', 'start_time', 'status')
    list_filter = ('status', 'station', 'date')


@admin.register(MeterReading)
class MeterReadingAdmin(admin.ModelAdmin):
    list_display = ('meter', 'shift', 'start_reading', 'end_reading', 'liters_sold')
    list_filter = ('shift__station',)
