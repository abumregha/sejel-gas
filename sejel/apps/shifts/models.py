from django.db import models
from django.contrib.auth.models import User
from apps.core.models import Station, Island, Meter
from apps.employees.models import Employee


class Shift(models.Model):
    STATUS_CHOICES = [
        ('open', 'مفتوحة'),
        ('closed', 'مغلقة'),
        ('under_review', 'تحت المراجعة'),
    ]

    station = models.ForeignKey(Station, on_delete=models.CASCADE, related_name='shifts')
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='shifts')
    island = models.ForeignKey(Island, on_delete=models.CASCADE)
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    closed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    closed_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'sejel_shift'
        ordering = ['-date', '-start_time']

    def __str__(self):
        return f"Shift #{self.id} - {self.employee.name} ({self.date})"


class MeterReading(models.Model):
    shift = models.ForeignKey(Shift, on_delete=models.CASCADE, related_name='readings')
    meter = models.ForeignKey(Meter, on_delete=models.CASCADE)
    start_reading = models.DecimalField(max_digits=12, decimal_places=3)
    end_reading = models.DecimalField(max_digits=12, decimal_places=3, null=True, blank=True)
    liters_sold = models.DecimalField(max_digits=12, decimal_places=3, default=0)
    photo = models.ImageField(upload_to='meter_readings/', null=True, blank=True)
    override_reason = models.TextField(blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'sejel_meter_reading'

    def __str__(self):
        return f"Meter {self.meter.code} - Shift #{self.shift_id}"
