from django.db import models
from django.contrib.auth.models import User
from apps.core.models import Station, Tank, FuelType


class Delivery(models.Model):
    STATUS_CHOICES = [
        ('ordered', 'تم الطلب'),
        ('received', 'تم الاستلام'),
        ('claimed', 'تم المطالبة'),
        ('settled', 'تمت التسوية'),
        ('closed', 'مغلقة'),
    ]

    station = models.ForeignKey(Station, on_delete=models.CASCADE, related_name='deliveries')
    tank = models.ForeignKey(Tank, on_delete=models.CASCADE)
    fuel_type = models.ForeignKey(FuelType, on_delete=models.PROTECT)
    requested_quantity = models.DecimalField(max_digits=10, decimal_places=3)
    expected_quantity = models.DecimalField(max_digits=10, decimal_places=3)
    received_quantity = models.DecimalField(max_digits=10, decimal_places=3, null=True, blank=True)
    shortage = models.DecimalField(max_digits=10, decimal_places=3, default=0)
    order_date = models.DateTimeField()
    arrival_date = models.DateTimeField(null=True, blank=True)
    pre_reading = models.DecimalField(max_digits=12, decimal_places=3, null=True, blank=True)
    post_reading = models.DecimalField(max_digits=12, decimal_places=3, null=True, blank=True)
    document_number = models.CharField(max_length=100, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ordered')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'sejel_delivery'
        ordering = ['-order_date']

    def __str__(self):
        return f"Delivery {self.id} - {self.fuel_type} ({self.station.name})"


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
