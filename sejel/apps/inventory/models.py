from decimal import Decimal

from django.db import models
from django.contrib.auth.models import User
from apps.core.models import Station, Tank, FuelType


class FuelReconciliation(models.Model):
    """Tank-level fuel reconciliation.

    Compares what the tank SHOULD have (theoretical) vs what it ACTUALLY has.
    
    Formula:
      theoretical = closing_tank_reading - (received - sold)
      or equivalently:
      theoretical = opening_tank_reading + received - sold
      variance    = actual_level - theoretical
    
    If variance > 0 → surplus (more fuel than expected)
    If variance < 0 → shortage (less fuel than expected)
    If variance = 0 → matched
    """
    STATUS_CHOICES = [
        ('draft', 'مسودة'),
        ('confirmed', 'مؤكد'),
    ]
    VARIANCE_TYPE_CHOICES = [
        ('matched', 'مطابق'),
        ('surplus', 'فائض'),
        ('shortage', 'عجز'),
    ]

    tank = models.ForeignKey(Tank, on_delete=models.CASCADE, related_name='fuel_reconciliations')
    station = models.ForeignKey(Station, on_delete=models.CASCADE, related_name='fuel_reconciliations')
    date = models.DateField(help_text='تاريخ المطابقة')
    # Opening/closing tank readings (must be TankReading records)
    opening_reading = models.ForeignKey('core.TankReading', on_delete=models.PROTECT,
                                        related_name='opening_for_reconciliation',
                                        help_text='قراءة الخزان عند بداية الفترة')
    closing_reading = models.ForeignKey('core.TankReading', on_delete=models.PROTECT,
                                        related_name='closing_for_reconciliation',
                                        null=True, blank=True,
                                        help_text='قراءة الخزان عند نهاية الفترة')
    # Calculated quantities
    received_quantity = models.DecimalField(max_digits=12, decimal_places=3, default=0,
                                            help_text='إجمالي الوارد (شحنات مستلمة) خلال الفترة')
    transferred_in = models.DecimalField(max_digits=12, decimal_places=3, default=0,
                                         help_text='إجمالي الوارد من تحويلات بين الخزانات')
    transferred_out = models.DecimalField(max_digits=12, decimal_places=3, default=0,
                                          help_text='إجمالي الصادر من تحويلات بين الخزانات')
    sold_quantity = models.DecimalField(max_digits=12, decimal_places=3, default=0,
                                        help_text='إجمالي المبيعات من العدّادات المرتبطة بالخزان')
    theoretical_level = models.DecimalField(max_digits=12, decimal_places=3, default=0,
                                            help_text='الرصيد النظري = آخر قراءة + وارد + تحويل وارد - تحويل صادر - مبيعات')
    actual_level = models.DecimalField(max_digits=12, decimal_places=3, default=0,
                                       help_text='الرصيد الفعلي من قراءة الخزان')
    variance = models.DecimalField(max_digits=12, decimal_places=3, default=0,
                                   help_text='الفرق = الفعلي - النظري')
    variance_type = models.CharField(max_length=20, choices=VARIANCE_TYPE_CHOICES, default='matched')
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    confirmed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    confirmed_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='+')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'sejel_fuel_reconciliation'
        ordering = ['-date', '-pk']

    def __str__(self):
        return f"Fuel Reconciliation - {self.tank} ({self.date}) [{self.get_variance_type_display()}]"


class DeliveryRequest(models.Model):
    """Fuel delivery request from station to marketing company."""
    STATUS_CHOICES = [
        ('pending', 'قيد الانتظار'),
        ('approved', 'تمت الموافقة'),
        ('dispatched', 'تم الشحن'),
        ('received', 'تم الاستلام'),
        ('cancelled', 'ملغى'),
    ]
    PRIORITY_CHOICES = [
        ('normal', 'عادي'),
        ('urgent', 'عاجل'),
        ('critical', 'حرج'),
    ]

    station = models.ForeignKey(Station, on_delete=models.CASCADE, related_name='delivery_requests')
    tank = models.ForeignKey(Tank, on_delete=models.CASCADE)
    fuel_type = models.ForeignKey(FuelType, on_delete=models.PROTECT)
    requested_quantity = models.DecimalField(max_digits=10, decimal_places=3,
                                             help_text='الكمية المطلوبة باللتر')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='normal')
    current_level = models.DecimalField(max_digits=10, decimal_places=3, null=True, blank=True,
                                         help_text='مستوى الخزان عند الطلب')
    reason = models.TextField(blank=True, help_text='سبب الطلب')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    # Marketing company response
    expected_delivery_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='+')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'sejel_delivery_request'
        ordering = ['-created_at']

    def __str__(self):
        return f"طلب شحنة {self.requested_quantity}L - {self.tank} ({self.get_status_display()})"


class Delivery(models.Model):
    STATUS_CHOICES = [
        ('ordered', 'تم الطلب'),
        ('received', 'تم الاستلام'),
        ('claimed', 'تم المطالبة'),
        ('settled', 'تمت التسوية'),
        ('closed', 'مغلقة'),
    ]
    PAYMENT_STATUS_CHOICES = [
        ('unpaid', 'غير مدفوع'),
        ('partial', 'دفع جزئي'),
        ('paid', 'مدفوع'),
    ]

    station = models.ForeignKey(Station, on_delete=models.CASCADE, related_name='deliveries')
    tank = models.ForeignKey(Tank, on_delete=models.CASCADE)
    fuel_type = models.ForeignKey(FuelType, on_delete=models.PROTECT)
    supplier = models.ForeignKey('core.MarketingCompany', on_delete=models.SET_NULL,
                                null=True, blank=True, related_name='deliveries')
    requested_quantity = models.DecimalField(max_digits=10, decimal_places=3)
    expected_quantity = models.DecimalField(max_digits=10, decimal_places=3)
    received_quantity = models.DecimalField(max_digits=10, decimal_places=3, null=True, blank=True)
    shortage = models.DecimalField(max_digits=10, decimal_places=3, default=0)
    order_date = models.DateTimeField()
    arrival_date = models.DateTimeField(null=True, blank=True)
    pre_reading = models.DecimalField(max_digits=12, decimal_places=3, null=True, blank=True)
    post_reading = models.DecimalField(max_digits=12, decimal_places=3, null=True, blank=True)
    document_number = models.CharField(max_length=100, blank=True)
    # Payment tracking
    invoiced_amount = models.DecimalField(max_digits=12, decimal_places=3, null=True, blank=True,
                                          help_text='قيمة الفاتورة/الشحنة بالدينار')
    paid_amount = models.DecimalField(max_digits=12, decimal_places=3, default=0)
    payment_date = models.DateTimeField(null=True, blank=True)
    payment_reference = models.CharField(max_length=100, blank=True)
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='unpaid')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ordered')
    # Multi-tank allocation tracking
    total_allocated = models.DecimalField(max_digits=10, decimal_places=3, default=0,
                                          help_text='إجمالي الكمية الموزعة على الخزانات')
    remaining_on_truck = models.DecimalField(max_digits=10, decimal_places=3, default=0,
                                             help_text='الكمية المتبقية في الشاحنة')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'sejel_delivery'
        ordering = ['-order_date']

    def __str__(self):
        return f"Delivery {self.id} - {self.fuel_type} ({self.station.name})"

    def calculate_shortage(self):
        """Calculate shortage from pre/post readings and update fields."""
        if self.pre_reading is not None and self.post_reading is not None:
            self.received_quantity = self.post_reading - self.pre_reading
            self.shortage = max(Decimal('0'), self.expected_quantity - self.received_quantity)
            self.save(update_fields=['received_quantity', 'shortage'])
        return self.shortage

    def calculate_available_tanks(self):
        """Return tanks with available capacity for this delivery's fuel type."""
        tanks = Tank.objects.filter(
            station=self.station,
            fuel_type=self.fuel_type,
        ).order_by('name')
        result = []
        for tank in tanks:
            available = tank.capacity - tank.current_level
            if available > 0:
                result.append({
                    'tank': tank,
                    'capacity': tank.capacity,
                    'current_level': tank.current_level,
                    'available': available,
                })
        return result

    def update_allocation_totals(self):
        """Recalculate total_allocated and remaining_on_truck from allocations."""
        total = self.allocations.aggregate(
            total=models.Sum('quantity'))['total'] or Decimal('0')
        self.total_allocated = total
        self.remaining_on_truck = self.expected_quantity - total
        self.save(update_fields=['total_allocated', 'remaining_on_truck'])


class DeliveryAllocation(models.Model):
    """Allocation of a delivery to a specific tank.

    A single delivery of 40,000L can be split across multiple tanks:
    - Tank A: 15,000L
    - Tank B: 18,000L
    - Tank C: 7,000L
    """
    delivery = models.ForeignKey(Delivery, on_delete=models.CASCADE, related_name='allocations')
    tank = models.ForeignKey(Tank, on_delete=models.CASCADE)
    quantity = models.DecimalField(max_digits=10, decimal_places=3,
                                   help_text='الكمية المخصصة لهذا الخزان باللتر')
    pre_reading = models.DecimalField(max_digits=12, decimal_places=3, null=True, blank=True,
                                      help_text='قراءة الخزان قبل التعبئة')
    post_reading = models.DecimalField(max_digits=12, decimal_places=3, null=True, blank=True,
                                       help_text='قراءة الخزان بعد التعبئة')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'sejel_delivery_allocation'
        ordering = ['tank__name']

    def __str__(self):
        return f"{self.quantity}L → {self.tank.name} (Delivery {self.delivery_id})"

    def clean(self):
        from django.core.exceptions import ValidationError
        if self.quantity and self.quantity <= 0:
            raise ValidationError('الكمية يجب أن تكون أكبر من صفر')
        if self.tank and self.delivery:
            if self.tank.station_id != self.delivery.station_id:
                raise ValidationError('الخزان يجب أن يكون في نفس المحطة')
            if self.tank.fuel_type_id != self.delivery.fuel_type_id:
                raise ValidationError('نوع الوقود يجب أن يطابق نوع الشحنة')
            available = self.tank.capacity - self.tank.current_level
            if self.quantity and self.quantity > available:
                raise ValidationError(
                    f'الكمية ({self.quantity}L) تتجاوز السعة المتاحة في الخزان ({available}L)'
                )


class DeliveryDocument(models.Model):
    TYPE_CHOICES = [
        ('receipt', 'إيصال الاستلام'),
        ('proof_of_shortage', 'إثبات النقص'),
        ('other', 'أخرى'),
    ]

    delivery = models.ForeignKey(Delivery, on_delete=models.CASCADE, related_name='documents')
    document_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    file = models.ImageField(upload_to='delivery_documents/')
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'sejel_delivery_document'

    def __str__(self):
        return f"{self.get_document_type_display()} - Delivery {self.delivery_id}"


class ShortageClaim(models.Model):
    STATUS_CHOICES = [
        ('not_claimed', 'غير مطالَب بها'),
        ('claimed', 'مطالَب بها'),
        ('settled', 'تمت التسوية'),
        ('closed', 'مغلقة'),
    ]

    delivery = models.OneToOneField(Delivery, on_delete=models.CASCADE, related_name='shortage_claim')
    shortage_amount = models.DecimalField(max_digits=10, decimal_places=3)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='not_claimed')
    claim_date = models.DateTimeField(null=True, blank=True)
    settlement_date = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'sejel_shortage_claim'

    def __str__(self):
        return f"Shortage Claim - Delivery {self.delivery_id}"
