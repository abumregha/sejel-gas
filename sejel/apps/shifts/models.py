from django.db import models
from django.contrib.auth.models import User
from apps.core.models import Station, Island, Machine, Meter
from apps.employees.models import Employee


class ShiftDefinition(models.Model):
    """Recurring shift definition (e.g. Morning 06:00-14:00 on selected days).

    Daily occurrences are generated from definitions. Employees are optional:
    the actual attendant is chosen per occurrence / per reading.
    """
    WEEKDAY_CHOICES = [
        (0, 'الاثنين'), (1, 'الثلاثاء'), (2, 'الأربعاء'), (3, 'الخميس'),
        (4, 'الجمعة'), (5, 'السبت'), (6, 'الأحد'),
    ]

    station = models.ForeignKey(Station, on_delete=models.CASCADE, related_name='shift_definitions')
    island = models.ForeignKey(Island, on_delete=models.SET_NULL, null=True, blank=True,
                               help_text='اختياري - إذا حددت جزيرة، تُنشأ مناوبات لهذه الجزيرة فقط')
    name = models.CharField(max_length=100)
    start_time = models.TimeField()
    end_time = models.TimeField(help_text='يمكن أن تعبر منتصف الليل (مثال: 22:00 → 06:00)')
    days = models.CharField(
        max_length=13,
        help_text='أيام الأسبوع مفصولة بفواصل، أرقام 0=الاثنين حتى 6=الأحد',
        default='0,1,2,3,4,5,6',
    )
    default_employee = models.ForeignKey(
        Employee, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='default_shift_definitions',
        help_text='اختياري - الموظف الافتراضي لهذه المناوبة',
    )
    is_active = models.BooleanField(default=True)
    description = models.TextField(blank=True)
    display_order = models.PositiveIntegerField(default=0)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'sejel_shift_definition'
        ordering = ['display_order', 'start_time']

    def __str__(self):
        return f"{self.name} ({self.start_time:%H:%M} - {self.end_time:%H:%M})"

    def day_list(self):
        return [int(d) for d in self.days.split(',') if d.strip().isdigit()]

    def days_display(self):
        names = dict(self.WEEKDAY_CHOICES)
        return '، '.join(names[d] for d in self.day_list() if d in names)


class Shift(models.Model):
    """A single shift occurrence on a concrete date.

    `definition` links it to the recurring template; `employee` is the actual
    attendant of THIS day only (optional). Statuses follow the shift lifecycle.
    """
    STATUS_CHOICES = [
        ('scheduled', 'مجدولة'),
        ('open', 'مفتوحة'),
        ('in_progress', 'جارية'),
        ('submitted', 'مقدمة'),
        ('reconciled', 'تمت المطابقة'),
        ('closed', 'مغلقة'),
        ('cancelled', 'ملغاة'),
        ('under_review', 'تحت المراجعة'),
    ]

    station = models.ForeignKey(Station, on_delete=models.CASCADE, related_name='shifts')
    definition = models.ForeignKey(ShiftDefinition, on_delete=models.SET_NULL, null=True, blank=True, related_name='occurrences')
    employee = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True, blank=True, related_name='shifts')
    island = models.ForeignKey(Island, on_delete=models.CASCADE, null=True, blank=True)
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    closed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    closed_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='shifts_created')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'sejel_shift'
        ordering = ['-date', '-start_time']

    def __str__(self):
        label = self.definition.name if self.definition else f"Shift #{self.id}"
        attendant = f" - {self.employee.name}" if self.employee else ""
        return f"{label} ({self.date}){attendant}"

    @property
    def crosses_midnight(self):
        return self.end_time is not None and self.end_time <= self.start_time


class MeterReading(models.Model):
    EXCEPTION_CHOICES = [
        ('', '—'),
        ('reset', 'تصفير العداد'),
        ('replacement', 'استبدال العداد'),
        ('other', 'استثناء آخر'),
    ]

    shift = models.ForeignKey(Shift, on_delete=models.CASCADE, related_name='readings')
    meter = models.ForeignKey(Meter, on_delete=models.CASCADE)
    attendant = models.ForeignKey(
        Employee, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='meter_readings', help_text='الموظف الفعلي المسجل عن القراءة',
    )
    start_reading = models.DecimalField(max_digits=12, decimal_places=3)
    end_reading = models.DecimalField(max_digits=12, decimal_places=3, null=True, blank=True)
    liters_sold = models.DecimalField(max_digits=12, decimal_places=3, default=0)
    photo = models.ImageField(upload_to='meter_readings/', null=True, blank=True)
    override_reason = models.TextField(blank=True)
    exception_type = models.CharField(max_length=20, choices=EXCEPTION_CHOICES, blank=True,
                                      help_text='نوع الاستثناء إذا كانت القراءة أقل من السابقة')
    exception_authorized_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='authorized_meter_exceptions',
        help_text='المسؤول الذي صرّح بالاستثناء',
    )
    recorded_at = models.DateTimeField(null=True, blank=True, help_text='تاريخ ووقت تسجيل القراءة فعلياً')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='+')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'sejel_meter_reading'

    def __str__(self):
        return f"Meter {self.meter.code} - Shift #{self.shift_id}"
