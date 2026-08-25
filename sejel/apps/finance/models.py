from django.db import models
from django.contrib.auth.models import User
from apps.core.models import Station
from apps.shifts.models import Shift


class VoucherCategory(models.Model):
    name = models.CharField(max_length=50)
    value = models.DecimalField(max_digits=10, decimal_places=3, default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'sejel_voucher_category'
        ordering = ['value']

    def __str__(self):
        return f"{self.name} - {self.value}"


class CashCollection(models.Model):
    shift = models.ForeignKey(Shift, on_delete=models.CASCADE, related_name='cash_collections')
    amount = models.DecimalField(max_digits=10, decimal_places=3)
    time = models.DateTimeField()
    received_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    reference = models.CharField(max_length=100, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'sejel_cash_collection'
        ordering = ['-time']

    def __str__(self):
        return f"Cash {self.amount} - Shift #{self.shift_id}"


class Voucher(models.Model):
    shift = models.ForeignKey(Shift, on_delete=models.CASCADE, related_name='vouchers')
    category = models.ForeignKey(VoucherCategory, on_delete=models.PROTECT)
    count = models.PositiveIntegerField()
    total_value = models.DecimalField(max_digits=10, decimal_places=3)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'sejel_voucher'

    def __str__(self):
        return f"Voucher {self.category.name} x{self.count}"


class POSRecord(models.Model):
    shift = models.ForeignKey(Shift, on_delete=models.CASCADE, related_name='pos_records')
    total_amount = models.DecimalField(max_digits=10, decimal_places=3)
    transaction_count = models.PositiveIntegerField(null=True, blank=True)
    notes = models.TextField(blank=True)
    entered_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'sejel_pos_record'

    def __str__(self):
        return f"POS {self.total_amount} - Shift #{self.shift_id}"


class ExpenseCategory(models.Model):
    name = models.CharField(max_length=100)
    station = models.ForeignKey(Station, on_delete=models.CASCADE, null=True, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'sejel_expense_category'

    def __str__(self):
        return self.name


class Expense(models.Model):
    PAYMENT_METHOD_CHOICES = [
        ('cash', 'نقدي'),
        ('voucher', 'كوبون'),
        ('other', 'أخرى'),
    ]
    STATUS_CHOICES = [
        ('pending', 'قيد الاعتماد'),
        ('approved', 'معتمد'),
        ('rejected', 'مرفوض'),
    ]

    station = models.ForeignKey(Station, on_delete=models.CASCADE, related_name='expenses')
    shift = models.ForeignKey(Shift, on_delete=models.SET_NULL, null=True, blank=True)
    category = models.ForeignKey(ExpenseCategory, on_delete=models.PROTECT)
    amount = models.DecimalField(max_digits=10, decimal_places=3)
    description = models.TextField()
    paid_to = models.CharField(max_length=200, blank=True)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES, default='cash')
    attachment = models.ImageField(upload_to='expenses/', null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='expenses_created')
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='expenses_approved')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'sejel_expense'
        ordering = ['-created_at']

    def __str__(self):
        return f"Expense {self.amount} - {self.category.name}"


class Reconciliation(models.Model):
    DIFFERENCE_CHOICES = [
        ('matched', 'مطابق'),
        ('surplus', 'فائض'),
        ('shortage', 'عجز'),
    ]
    STATUS_CHOICES = [
        ('draft', 'مسودة'),
        ('confirmed', 'مؤكد'),
    ]

    shift = models.OneToOneField(Shift, on_delete=models.CASCADE, related_name='reconciliation')
    total_liters = models.DecimalField(max_digits=12, decimal_places=3)
    expected_sales = models.DecimalField(max_digits=12, decimal_places=3)
    total_cash = models.DecimalField(max_digits=12, decimal_places=3, default=0)
    total_vouchers = models.DecimalField(max_digits=12, decimal_places=3, default=0)
    total_pos = models.DecimalField(max_digits=12, decimal_places=3, default=0)
    total_collection = models.DecimalField(max_digits=12, decimal_places=3)
    difference = models.DecimalField(max_digits=12, decimal_places=3)
    difference_type = models.CharField(max_length=20, choices=DIFFERENCE_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    confirmed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    confirmed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'sejel_reconciliation'

    def __str__(self):
        return f"Reconciliation - Shift #{self.shift_id} ({self.get_difference_type_display()})"
