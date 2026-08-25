from django.urls import path
from . import views

urlpatterns = [
    path('cash/', views.cash_list, name='cash_list'),
    path('cash/create/<int:shift_id>/', views.cash_create, name='cash_create'),
    path('vouchers/', views.voucher_list, name='voucher_list'),
    path('vouchers/create/<int:shift_id>/', views.voucher_create, name='voucher_create'),
    path('pos/', views.pos_list, name='pos_list'),
    path('pos/create/<int:shift_id>/', views.pos_create, name='pos_create'),
    path('reconciliation/<int:shift_id>/', views.reconciliation_detail, name='reconciliation_detail'),
    path('expenses/', views.expense_list, name='expense_list'),
    path('expenses/create/', views.expense_create, name='expense_create'),
    path('expenses/<int:pk>/approve/', views.expense_approve, name='expense_approve'),
]
