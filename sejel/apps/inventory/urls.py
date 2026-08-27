from django.urls import path
from . import views

urlpatterns = [
    path('tanks/', views.tank_list, name='tank_list'),
    path('tanks/create/', views.tank_create, name='tank_create'),
    path('tanks/<int:pk>/', views.tank_detail, name='tank_detail'),
    path('tanks/<int:pk>/edit/', views.tank_edit, name='tank_edit'),
    path('tanks/<int:pk>/delete/', views.tank_delete, name='tank_delete'),
    path('tanks/json/', views.tank_json, name='tank_json'),
    path('tanks/<int:tank_id>/readings/add/', views.tank_reading_add, name='tank_reading_add'),
    path('deliveries/', views.delivery_list, name='delivery_list'),
    path('deliveries/create/', views.delivery_create, name='delivery_create'),
    path('deliveries/<int:pk>/', views.delivery_detail, name='delivery_detail'),
    path('deliveries/<int:pk>/edit/', views.delivery_edit, name='delivery_edit'),
    path('deliveries/<int:pk>/delete/', views.delivery_delete, name='delivery_delete'),
    path('deliveries/<int:delivery_id>/documents/create/', views.delivery_document_create, name='delivery_document_create'),
    path('documents/<int:pk>/delete/', views.delivery_document_delete, name='delivery_document_delete'),
    path('shortage-claims/', views.shortage_claim_list, name='shortage_claim_list'),
    path('deliveries/<int:delivery_id>/shortage-claim/create/', views.shortage_claim_create, name='shortage_claim_create'),
    path('shortage-claims/<int:pk>/edit/', views.shortage_claim_edit, name='shortage_claim_edit'),
    path('shortage-claims/<int:pk>/delete/', views.shortage_claim_delete, name='shortage_claim_delete'),
    # Delivery Requests
    path('delivery-requests/', views.delivery_request_list, name='delivery_request_list'),
    path('delivery-requests/create/', views.delivery_request_create, name='delivery_request_create'),
    path('delivery-requests/<int:pk>/', views.delivery_request_detail, name='delivery_request_detail'),
    path('delivery-requests/<int:pk>/status/', views.delivery_request_update_status, name='delivery_request_update_status'),
    # Tank Transfers
    path('tank-transfers/', views.tank_transfer_list, name='tank_transfer_list'),
    path('tank-transfers/create/', views.tank_transfer_create, name='tank_transfer_create'),
    path('tank-transfers/<int:pk>/', views.tank_transfer_detail, name='tank_transfer_detail'),
    path('tank-transfers/<int:pk>/delete/', views.tank_transfer_delete, name='tank_transfer_delete'),
    # Fuel Reconciliation
    path('fuel-reconciliations/', views.fuel_reconciliation_list, name='fuel_reconciliation_list'),
    path('tanks/<int:tank_id>/fuel-reconciliation/create/', views.fuel_reconciliation_create, name='fuel_reconciliation_create'),
    path('fuel-reconciliations/<int:pk>/', views.fuel_reconciliation_detail, name='fuel_reconciliation_detail'),
    path('fuel-reconciliations/<int:pk>/confirm/', views.fuel_reconciliation_confirm, name='fuel_reconciliation_confirm'),
    path('fuel-reconciliations/<int:pk>/delete/', views.fuel_reconciliation_delete, name='fuel_reconciliation_delete'),
]
