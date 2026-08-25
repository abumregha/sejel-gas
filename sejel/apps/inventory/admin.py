from django.contrib import admin
from .models import Delivery, DeliveryDocument, ShortageClaim


@admin.register(Delivery)
class DeliveryAdmin(admin.ModelAdmin):
    list_display = ('id', 'station', 'fuel_type', 'expected_quantity', 'received_quantity', 'shortage', 'status')
    list_filter = ('status', 'fuel_type', 'station')


@admin.register(DeliveryDocument)
class DeliveryDocumentAdmin(admin.ModelAdmin):
    list_display = ('delivery', 'document_type', 'uploaded_at')
    list_filter = ('document_type',)


@admin.register(ShortageClaim)
class ShortageClaimAdmin(admin.ModelAdmin):
    list_display = ('delivery', 'shortage_amount', 'status')
    list_filter = ('status',)
