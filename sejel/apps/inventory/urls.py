from django.urls import path
from . import views

urlpatterns = [
    path('tanks/', views.tank_list, name='tank_list'),
    path('deliveries/', views.delivery_list, name='delivery_list'),
    path('deliveries/create/', views.delivery_create, name='delivery_create'),
    path('deliveries/<int:pk>/', views.delivery_detail, name='delivery_detail'),
]
