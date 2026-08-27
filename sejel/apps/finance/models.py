from decimal import Decimal

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
    is_cancelled = models.BooleanField(default=False)
    cancelled_at = models.DateTimeField(null=True, blank=True)
    cancelled_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='cash_cancelled')
    updated_at = models.DateTimeField(auto_now=True)
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
    is_cancelled = models.BooleanField(default=False)
    cancelled_at = models.DateTimeField(null=True, blank=True)
    cancelled_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='vouchers_cancelled')
    updated_at = models.DateTimeField(auto_now=True)
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
    is_cancelled = models.BooleanField(default=False)
    cancelled_at = models.DateTimeField(null=True, blank=True)
    cancelled_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='pos_cancelled')
    updated_at = models.DateTimeField(auto_now=True)
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
        ('cancelled', 'ملغى'),
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


class VoucherSettlement(models.Model):
    """Batch submission of vouchers to Alrahla for settlement.

    A settlement records the vouchers physically handed over and tracks
    whether Alrahla has paid/credited the station.
    """
    STATUS_CHOICES = [
        ('submitted', 'تم التسليم'),
        ('paid', 'تم الدفع'),
        ('partial', 'دفع جزئي'),
        ('disputed', 'مختلف عليه'),
        ('cancelled', 'ملغى'),
    ]

    station = models.ForeignKey(Station, on_delete=models.CASCADE, related_name='voucher_settlements')
    submission_date = models.DateField(help_text='تاريخ تسليم الكوبونات للرحمة')
    total_value = models.DecimalField(max_digits=12, decimal_places=3, help_text='القيمة الإجمالية للكوبونات')
    total_count = models.PositiveIntegerField(help_text='عدد الكوبونات')
    # Breakdown by category
    denom_5 = models.PositiveIntegerField(default=0, help_text='عدد كوبونات 5 د.ل')
    denom_6 = models.PositiveIntegerField(default=0, help_text='عدد كوبونات 6 د.ل')
    denom_8 = models.PositiveIntegerField(default=0, help_text='عدد كوبونات 8 د.ل')
    # Settlement tracking
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='submitted')
    paid_amount = models.DecimalField(max_digits=12, decimal_places=3, default=0,
                                      help_text='المبلغ المدفوع من الرحمة')
    payment_date = models.DateField(null=True, blank=True, help_text='تاريخ الدفع من الرحمة')
    payment_reference = models.CharField(max_length=100, blank=True, help_text='مرجع الدفع')
    notes = models.TextField(blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='+')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'sejel_voucher_settlement'
        ordering = ['-submission_date', '-pk']

    def __str__(self):
        return f"تسوية كوبونات - {self.station} ({self.submission_date}) - {self.get_status_display()}"

    @property
    def outstanding(self):
        """Amount still owed by Alrahla."""
        return self.total_value - self.paid_amount

    def calculate_totals(self):
        """Recalculate total_value and total_count from denomination fields."""
        self.total_value = (
            self.denom_5 * Decimal('5') +
            self.denom_6 * Decimal('6') +
            self.denom_8 * Decimal('8')
        )
        self.total_count = self.denom_5 + self.denom_6 + self.denom_8
        self.save(update_fields=['total_value', 'total_count'])


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
    total_expenses = models.DecimalField(max_digits=12, decimal_places=3, default=0)
    net_cash = models.DecimalField(max_digits=12, decimal_places=3, default=0,
                                   help_text='النقد المتبقي = التحصيل النقدي - المصروفات')
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

    @property
    def fuel_summaries(self):
        """Ordered per-fuel-type breakdown for this reconciliation."""
        return self.fuel_breakdown.select_related('fuel_type').order_by('fuel_type__name')

    def recalculate_totals(self):
        """Recompute totals from fuel summaries and collection records (for audit)."""
        from django.db.models import Sum
        self.total_liters = self.fuel_breakdown.aggregate(t=Sum('liters_sold'))['t'] or Decimal('0')
        self.expected_sales = self.fuel_breakdown.aggregate(t=Sum('expected_sales'))['t'] or Decimal('0')
        self.total_cash = CashCollection.objects.filter(shift=self.shift, is_cancelled=False).aggregate(
            t=Sum('amount'))['t'] or Decimal('0')
        self.total_vouchers = Voucher.objects.filter(shift=self.shift, is_cancelled=False).aggregate(
            t=Sum('total_value'))['t'] or Decimal('0')
        self.total_pos = POSRecord.objects.filter(shift=self.shift, is_cancelled=False).aggregate(
            t=Sum('total_amount'))['t'] or Decimal('0')
        self.total_collection = self.total_cash + self.total_vouchers + self.total_pos
        # Expenses: only approved cash expenses linked to this shift
        self.total_expenses = Expense.objects.filter(
            shift=self.shift, payment_method='cash',
            status__in=['pending', 'approved']
        ).aggregate(t=Sum('amount'))['t'] or Decimal('0')
        self.net_cash = self.total_cash - self.total_expenses
        self.difference = self.total_collection - self.expected_sales
        self.difference_type = (
            'matched' if self.difference == 0 else
            'surplus' if self.difference > 0 else
            'shortage'
        )
        self.save()

    @property
    def shift_expenses(self):
        """Cash expenses linked to this shift (pending or approved)."""
        return Expense.objects.filter(
            shift=self.shift, payment_method='cash',
            status__in=['pending', 'approved']
        ).order_by('-created_at')


class ShiftFuelSummary(models.Model):
    """Per-fuel-type breakdown within a reconciliation.

    Stores the frozen unit_price at the time the shift was closed, so future
    price changes never alter historical reconciliation results.
    """
    reconciliation = models.ForeignKey(Reconciliation, on_delete=models.CASCADE, related_name='fuel_breakdown')
    fuel_type = models.ForeignKey('core.FuelType', on_delete=models.PROTECT)
    liters_sold = models.DecimalField(max_digits=12, decimal_places=3)
    unit_price = models.DecimalField(max_digits=10, decimal_places=3)
    expected_sales = models.DecimalField(max_digits=12, decimal_places=3)

    class Meta:
        db_table = 'sejel_shift_fuel_summary'
        unique_together = ('reconciliation', 'fuel_type')

    def __str__(self):
        return f"{self.fuel_type}: {self.liters_sold}L @ {self.unit_price} = {self.expected_sales}"
