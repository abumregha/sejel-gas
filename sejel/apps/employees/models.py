from django.db import models
from apps.core.models import Station, Island


class Employee(models.Model):
    SHIFT_CHOICES = [
        ('morning', 'صباحي'),
        ('evening', 'مسائي'),
        ('full_day', 'كامل اليوم'),
    ]
    STATUS_CHOICES = [
        ('active', 'نشط'),
        ('inactive', 'غير نشط'),
    ]

    station = models.ForeignKey(Station, on_delete=models.CASCADE, related_name='employees')
    name = models.CharField(max_length=200)
    phone = models.CharField(max_length=20, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    shift_type = models.CharField(max_length=20, choices=SHIFT_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'sejel_employee'
        ordering = ['name']

    def __str__(self):
        return self.name


class ShiftAssignment(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='assignments')
    island = models.ForeignKey(Island, on_delete=models.CASCADE)
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()

    class Meta:
        db_table = 'sejel_shift_assignment'
        ordering = ['-date', 'start_time']

    def __str__(self):
        return f"{self.employee.name} - {self.island.name} ({self.date})"
