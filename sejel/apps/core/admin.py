from django.contrib import admin
from .models import (
    MarketingCompany, Station, Island, Machine, FuelType,
    Tank, Meter, FuelPrice, StationSettings, UserProfile
)


@admin.register(MarketingCompany)
class MarketingCompanyAdmin(admin.ModelAdmin):
    list_display = ('name', 'name_en')


@admin.register(Station)
class StationAdmin(admin.ModelAdmin):
    list_display = ('name', 'status', 'relationship_type', 'marketing_company')
    list_filter = ('status', 'relationship_type')


@admin.register(Island)
class IslandAdmin(admin.ModelAdmin):
    list_display = ('name', 'number', 'station', 'status')
    list_filter = ('station', 'status')


@admin.register(Machine)
class MachineAdmin(admin.ModelAdmin):
    list_display = ('name', 'number', 'island')
    list_filter = ('island__station',)


@admin.register(FuelType)
class FuelTypeAdmin(admin.ModelAdmin):
    list_display = ('name', 'name_en')


@admin.register(Tank)
class TankAdmin(admin.ModelAdmin):
    list_display = ('name', 'station', 'fuel_type', 'capacity', 'current_level')
    list_filter = ('station', 'fuel_type')


@admin.register(Meter)
class MeterAdmin(admin.ModelAdmin):
    list_display = ('code', 'fuel_type', 'machine', 'tank', 'current_reading', 'status')
    list_filter = ('status', 'fuel_type', 'machine__island__station')


@admin.register(FuelPrice)
class FuelPriceAdmin(admin.ModelAdmin):
    list_display = ('fuel_type', 'selling_price', 'profit_margin', 'effective_date', 'is_active')
    list_filter = ('fuel_type', 'is_active')


@admin.register(StationSettings)
class StationSettingsAdmin(admin.ModelAdmin):
    list_display = ('station', 'islands_count', 'machines_per_island', 'meters_per_machine')


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'role', 'station')
    list_filter = ('role',)
