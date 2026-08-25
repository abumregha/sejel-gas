from django.contrib import admin
from .models import (
    VoucherCategory, CashCollection, Voucher, POSRecord,
    ExpenseCategory, Expense, Reconciliation
)


@admin.register(VoucherCategory)
class VoucherCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'value', 'is_active')


@admin.register(CashCollection)
class CashCollectionAdmin(admin.ModelAdmin):
    list_display = ('amount', 'time', 'shift', 'received_by')
    list_filter = ('shift__station',)


@admin.register(Voucher)
class VoucherAdmin(admin.ModelAdmin):
    list_display = ('category', 'count', 'total_value', 'shift')
    list_filter = ('category',)


@admin.register(POSRecord)
class POSRecordAdmin(admin.ModelAdmin):
    list_display = ('total_amount', 'transaction_count', 'shift')
    list_filter = ('shift__station',)


@admin.register(ExpenseCategory)
class ExpenseCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'station', 'is_active')


@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ('amount', 'category', 'station', 'status', 'created_at')
    list_filter = ('status', 'category', 'station')


@admin.register(Reconciliation)
class ReconciliationAdmin(admin.ModelAdmin):
    list_display = ('shift', 'total_liters', 'expected_sales', 'difference', 'difference_type', 'status')
    list_filter = ('difference_type', 'status')
