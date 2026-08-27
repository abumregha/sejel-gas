from decimal import Decimal

from django.db import models
from django.contrib.auth.models import User


class MarketingCompany(models.Model):
    name = models.CharField(max_length=200)
    name_en = models.CharField(max_length=200, blank=True)

    class Meta:
        db_table = 'sejel_marketing_company'
        ordering = ['name']

    def __str__(self):
        return self.name


class Station(models.Model):
    RELATIONSHIP_CHOICES = [
        ('owned', 'مملوكة للمواطن'),
        ('rented', 'مؤجرة من شركة التسويق'),
        ('agency', 'وكالة/إعادة بيع'),
    ]
    CASH_MODE_CHOICES = [
        ('during_shift', 'أثناء المناوبة'),
        ('end_of_shift', 'عند نهاية المناوبة'),
    ]
    STATUS_CHOICES = [
        ('active', 'نشطة'),
        ('inactive', 'غير نشطة'),
        ('maintenance', 'صيانة'),
    ]

    name = models.CharField(max_length=200)
    address = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    relationship_type = models.CharField(max_length=20, choices=RELATIONSHIP_CHOICES)
    marketing_company = models.ForeignKey(MarketingCompany, on_delete=models.SET_NULL, null=True, blank=True)
    cash_collection_mode = models.CharField(max_length=20, choices=CASH_MODE_CHOICES, default='during_shift')
    target_cash_amount = models.DecimalField(max_digits=10, decimal_places=3, default=500)
    photo_meter_required = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'sejel_station'
        ordering = ['name']

    def __str__(self):
        return self.name


class Island(models.Model):
    station = models.ForeignKey(Station, on_delete=models.CASCADE, related_name='islands')
    name = models.CharField(max_length=50)
    number = models.PositiveIntegerField()
    status = models.CharField(max_length=20, choices=[('active', 'نشطة'), ('inactive', 'غير نشطة')], default='active')

    class Meta:
        db_table = 'sejel_island'
        unique_together = ('station', 'number')
        ordering = ['number']

    def __str__(self):
        return f"{self.station.name} - {self.name}"


class Machine(models.Model):
    island = models.ForeignKey(Island, on_delete=models.CASCADE, related_name='machines')
    name = models.CharField(max_length=50)
    number = models.PositiveIntegerField()

    class Meta:
        db_table = 'sejel_machine'
        unique_together = ('island', 'number')
        ordering = ['number']

    def __str__(self):
        return f"{self.island} - {self.name}"


class FuelType(models.Model):
    name = models.CharField(max_length=50)
    name_en = models.CharField(max_length=50, blank=True)

    class Meta:
        db_table = 'sejel_fuel_type'
        ordering = ['name']

    def __str__(self):
        return self.name


class Tank(models.Model):
    station = models.ForeignKey(Station, on_delete=models.CASCADE, related_name='tanks')
    fuel_type = models.ForeignKey(FuelType, on_delete=models.PROTECT)
    capacity = models.DecimalField(max_digits=10, decimal_places=3)
    current_level = models.DecimalField(max_digits=10, decimal_places=3, default=0)
    last_reading_date = models.DateTimeField(null=True, blank=True)
    name = models.CharField(max_length=50, blank=True)

    class Meta:
        db_table = 'sejel_tank'
        ordering = ['name']

    def __str__(self):
        return self.name or f"Tank {self.id} - {self.fuel_type}"

    @property
    def level_percent(self):
        return (self.current_level / self.capacity * 100) if self.capacity > 0 else 0

    def latest_reading(self):
        """Return the most recent TankReading for this tank."""
        return self.readings.order_by('-recorded_at', '-pk').first()

    def total_sales_liters(self, since=None):
        """Total liters sold through meters connected to this tank since a date."""
        from apps.shifts.models import MeterReading
        qs = MeterReading.objects.filter(
            meter__tank=self, liters_sold__isnull=False, liters_sold__gt=0)
        if since:
            qs = qs.filter(recorded_at__gte=since)
        return qs.aggregate(total=models.Sum('liters_sold'))['total'] or Decimal('0')

    def total_received(self, since=None):
        """Total liters received via deliveries since a date."""
        from django.db.models import Q
        from apps.inventory.models import Delivery
        qs = Delivery.objects.filter(tank=self, received_quantity__isnull=False)
        if since:
            qs = qs.filter(Q(arrival_date__gte=since) | Q(arrival_date__isnull=True, order_date__gte=since))
        return qs.aggregate(total=models.Sum('received_quantity'))['total'] or Decimal('0')

    def theoretical_level(self):
        """Theoretical level based on last reading + deliveries - sales."""
        from decimal import Decimal
        last = self.latest_reading()
        if not last:
            return self.current_level
        base = last.reading_level
        received = self.total_received(since=last.recorded_at)
        sold = self.total_sales_liters(since=last.recorded_at)
        return base + received - sold


class TankReading(models.Model):
    """Historical tank level record. Never mutate — always append."""
    READING_TYPE_CHOICES = [
        ('opening', 'قراءة افتتاحية'),
        ('pre_delivery', 'قبل الشحنة'),
        ('post_delivery', 'بعد الشحنة'),
        ('daily', 'قراءة يومية'),
        ('other', 'قراءة أخرى'),
    ]

    tank = models.ForeignKey(Tank, on_delete=models.CASCADE, related_name='readings')
    reading_level = models.DecimalField(max_digits=10, decimal_places=3)
    reading_type = models.CharField(max_length=20, choices=READING_TYPE_CHOICES)
    recorded_at = models.DateTimeField()
    recorded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'sejel_tank_reading'
        ordering = ['-recorded_at', '-pk']

    def __str__(self):
        return f"{self.tank}: {self.reading_level} ({self.get_reading_type_display()})"


class Meter(models.Model):
    machine = models.ForeignKey(Machine, on_delete=models.CASCADE, related_name='meters')
    code = models.CharField(max_length=50)
    fuel_type = models.ForeignKey(FuelType, on_delete=models.PROTECT)
    tank = models.ForeignKey(Tank, on_delete=models.PROTECT)
    current_reading = models.DecimalField(max_digits=12, decimal_places=3, default=0)
    status = models.CharField(max_length=20, choices=[
        ('active', 'نشطة'),
        ('inactive', 'غير نشطة'),
        ('maintenance', 'صيانة'),
    ], default='active')

    class Meta:
        db_table = 'sejel_meter'
        ordering = ['code']

    def __str__(self):
        return f"Meter {self.code} - {self.fuel_type}"


class FuelPrice(models.Model):
    fuel_type = models.ForeignKey(FuelType, on_delete=models.CASCADE, related_name='prices')
    selling_price = models.DecimalField(max_digits=10, decimal_places=3)
    profit_margin = models.DecimalField(max_digits=10, decimal_places=3)
    cost_per_liter = models.DecimalField(max_digits=10, decimal_places=3, null=True, blank=True)
    effective_date = models.DateField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'sejel_fuel_price'
        ordering = ['-effective_date']

    def __str__(self):
        return f"{self.fuel_type} - {self.selling_price} ({self.effective_date})"


class StationSettings(models.Model):
    station = models.OneToOneField(Station, on_delete=models.CASCADE, related_name='settings')
    islands_count = models.PositiveIntegerField(default=2)
    machines_per_island = models.PositiveIntegerField(default=2)
    meters_per_machine = models.PositiveIntegerField(default=2)
    tanks_count = models.PositiveIntegerField(default=4)
    cash_target_amount = models.DecimalField(max_digits=10, decimal_places=3, default=500)
    photo_meter_required = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'sejel_station_settings'

    def __str__(self):
        return f"Settings - {self.station.name}"


class TankAlert(models.Model):
    """Automated alerts based on tank levels."""
    ALERT_TYPE_CHOICES = [
        ('low', 'رصيد منخفض'),
        ('critical', 'رصيد حرج'),
        ('empty', 'خزان فارغ'),
        ('full', 'خزان ممتلئ'),
    ]
    station = models.ForeignKey(Station, on_delete=models.CASCADE, related_name='tank_alerts')
    tank = models.ForeignKey('Tank', on_delete=models.CASCADE, related_name='alerts')
    alert_type = models.CharField(max_length=20, choices=ALERT_TYPE_CHOICES)
    message = models.TextField()
    is_resolved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'sejel_tank_alert'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.get_alert_type_display()}: {self.tank} ({self.station})"


class TankTransfer(models.Model):
    """Fuel transfer between two tanks of the same fuel type at the same station."""
    STATUS_CHOICES = [
        ('pending', 'قيد الانتظار'),
        ('completed', 'مكتملة'),
        ('cancelled', 'ملغاة'),
    ]

    station = models.ForeignKey(Station, on_delete=models.CASCADE, related_name='tank_transfers')
    from_tank = models.ForeignKey(Tank, on_delete=models.CASCADE, related_name='transfers_out')
    to_tank = models.ForeignKey(Tank, on_delete=models.CASCADE, related_name='transfers_in')
    fuel_type = models.ForeignKey(FuelType, on_delete=models.PROTECT)
    quantity = models.DecimalField(max_digits=10, decimal_places=3,
                                   help_text='الكمية المنقولة باللتر')
    transfer_date = models.DateTimeField(help_text='تاريخ ووقت النقل')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='completed')
    notes = models.TextField(blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='+')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'sejel_tank_transfer'
        ordering = ['-transfer_date', '-pk']

    def __str__(self):
        return f"Transfer {self.quantity}L: {self.from_tank} → {self.to_tank}"

    def clean(self):
        from django.core.exceptions import ValidationError
        if self.from_tank_id and self.to_tank_id:
            if self.from_tank_id == self.to_tank_id:
                raise ValidationError('لا يمكن النقل من خزان إلى نفسه')
            if self.from_tank.fuel_type_id != self.to_tank.fuel_type_id:
                raise ValidationError('لا يمكن النقل بين خزانات بأنواع وقود مختلفة')
            if self.from_tank.station_id != self.to_tank.station_id:
                raise ValidationError('لا يمكن النقل بين خزانات في محطات مختلفة')
            if self.quantity and self.quantity <= 0:
                raise ValidationError('الكمية يجب أن تكون أكبر من صفر')


class UserProfile(models.Model):
    ROLE_CHOICES = [
        ('admin', 'مدير النظام'),
        ('manager', 'مدير المحطة'),
        ('finance', 'المالي'),
        ('supervisor', 'المشرف'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='supervisor')
    station = models.ForeignKey(Station, on_delete=models.SET_NULL, null=True, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'sejel_user_profile'

    def __str__(self):
        return f"{self.user.username} ({self.get_role_display()})"


class AuditLog(models.Model):
    ACTION_CHOICES = [
        ('create', 'إنشاء'),
        ('update', 'تعديل'),
        ('delete', 'حذف'),
        ('close', 'إقفال'),
        ('reopen', 'إعادة فتح'),
        ('cancel', 'إلغاء'),
    ]

    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='+')
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    model_name = models.CharField(max_length=100)
    object_id = models.PositiveIntegerField()
    old_value = models.JSONField(null=True, blank=True)
    new_value = models.JSONField(null=True, blank=True)
    reason = models.TextField(blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'sejel_audit_log'
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['model_name', 'object_id']),
            models.Index(fields=['user', '-timestamp']),
            models.Index(fields=['-timestamp']),
        ]

    def __str__(self):
        return f"{self.get_action_display()} {self.model_name}#{self.object_id} by {self.user}"

