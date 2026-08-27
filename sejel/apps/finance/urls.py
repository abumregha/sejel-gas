from django.urls import path
from . import views

urlpatterns = [
    path('cash/', views.cash_list, name='cash_list'),
    path('cash/create/<int:shift_id>/', views.cash_create, name='cash_create'),
    path('cash/<int:pk>/edit/', views.cash_edit, name='cash_edit'),
    path('cash/<int:pk>/delete/', views.cash_delete, name='cash_delete'),
    path('vouchers/', views.voucher_list, name='voucher_list'),
    path('vouchers/create/<int:shift_id>/', views.voucher_create, name='voucher_create'),
    path('vouchers/<int:pk>/edit/', views.voucher_edit, name='voucher_edit'),
    path('vouchers/<int:pk>/delete/', views.voucher_delete, name='voucher_delete'),
    path('pos/', views.pos_list, name='pos_list'),
    path('pos/create/<int:shift_id>/', views.pos_create, name='pos_create'),
    path('pos/<int:pk>/edit/', views.pos_edit, name='pos_edit'),
    path('pos/<int:pk>/delete/', views.pos_delete, name='pos_delete'),
    path('reconciliations/', views.reconciliation_list, name='reconciliation_list'),
    path('reconciliation/<int:shift_id>/', views.reconciliation_detail, name='reconciliation_detail'),
    path('expenses/', views.expense_list, name='expense_list'),
    path('expenses/create/', views.expense_create, name='expense_create'),
    path('expenses/<int:pk>/', views.expense_detail, name='expense_detail'),
    path('expenses/<int:pk>/edit/', views.expense_edit, name='expense_edit'),
    path('expenses/<int:pk>/delete/', views.expense_delete, name='expense_delete'),
    path('expenses/<int:pk>/approve/', views.expense_approve, name='expense_approve'),
    path('reconciliation/<int:shift_id>/confirm/', views.reconciliation_confirm, name='reconciliation_confirm'),
    # Voucher Settlements
    path('settlements/', views.settlement_list, name='settlement_list'),
    path('settlements/create/', views.settlement_create, name='settlement_create'),
    path('settlements/<int:pk>/', views.settlement_detail, name='settlement_detail'),
    path('settlements/<int:pk>/payment/', views.settlement_update_payment, name='settlement_update_payment'),
    path('settlements/<int:pk>/delete/', views.settlement_delete, name='settlement_delete'),
]
