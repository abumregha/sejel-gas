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

