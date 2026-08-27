"""API URL routes."""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from . import viewsets

router = DefaultRouter()

# Auth
router.register(r'users', viewsets.UserViewSet, basename='user')

# Core
router.register(r'marketing-companies', viewsets.MarketingCompanyViewSet, basename='marketingcompany')
router.register(r'fuel-types', viewsets.FuelTypeViewSet, basename='fueltype')
router.register(r'stations', viewsets.StationViewSet, basename='station')
router.register(r'islands', viewsets.IslandViewSet, basename='island')
router.register(r'machines', viewsets.MachineViewSet, basename='machine')
router.register(r'tanks', viewsets.TankViewSet, basename='tank')
router.register(r'tank-readings', viewsets.TankReadingViewSet, basename='tankreading')
router.register(r'meters', viewsets.MeterViewSet, basename='meter')
router.register(r'fuel-prices', viewsets.FuelPriceViewSet, basename='fuelprice')
router.register(r'tank-alerts', viewsets.TankAlertViewSet, basename='tankalert')
router.register(r'tank-transfers', viewsets.TankTransferViewSet, basename='tanktransfer')

# Employees
router.register(r'employees', viewsets.EmployeeViewSet, basename='employee')
router.register(r'shift-assignments', viewsets.ShiftAssignmentViewSet, basename='shiftassignment')

# Shifts
router.register(r'shift-definitions', viewsets.ShiftDefinitionViewSet, basename='shiftdefinition')
router.register(r'meter-readings', viewsets.MeterReadingViewSet, basename='meterreading')
router.register(r'shifts', viewsets.ShiftViewSet, basename='shift')

# Finance
router.register(r'voucher-categories', viewsets.VoucherCategoryViewSet, basename='vouchercategory')
router.register(r'cash-collections', viewsets.CashCollectionViewSet, basename='cashcollection')
router.register(r'vouchers', viewsets.VoucherViewSet, basename='voucher')
router.register(r'pos-records', viewsets.POSRecordViewSet, basename='posrecord')
router.register(r'expense-categories', viewsets.ExpenseCategoryViewSet, basename='expensecategory')
router.register(r'expenses', viewsets.ExpenseViewSet, basename='expense')
router.register(r'voucher-settlements', viewsets.VoucherSettlementViewSet, basename='vouchersettlement')
router.register(r'reconciliations', viewsets.ReconciliationViewSet, basename='reconciliation')

# Inventory
router.register(r'deliveries', viewsets.DeliveryViewSet, basename='delivery')
router.register(r'delivery-documents', viewsets.DeliveryDocumentViewSet, basename='deliverydocument')
router.register(r'shortage-claims', viewsets.ShortageClaimViewSet, basename='shortageclaim')
router.register(r'fuel-reconciliations', viewsets.FuelReconciliationViewSet, basename='fuelreconciliation')
router.register(r'delivery-requests', viewsets.DeliveryRequestViewSet, basename='deliveryrequest')

urlpatterns = [
    path('auth/login/', viewsets.login_view, name='api-login'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='api-token-refresh'),
    path('auth/me/', viewsets.me_view, name='api-me'),
    path('dashboard/', viewsets.dashboard_view, name='api-dashboard'),
    path('reports/daily/', viewsets.report_daily_api, name='api-report-daily'),
    path('reports/monthly/', viewsets.report_monthly_api, name='api-report-monthly'),
    path('', include(router.urls)),
]
