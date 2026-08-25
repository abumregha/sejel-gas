from django.urls import path
from django.contrib.auth import views as auth_views
from . import views

urlpatterns = [
    path('', views.dashboard, name='dashboard'),
    path('login/', auth_views.LoginView.as_view(template_name='pages/auth/login.html'), name='login'),
    path('logout/', auth_views.LogoutView.as_view(), name='logout'),
    path('stations/', views.station_list, name='station_list'),
    path('stations/create/', views.station_create, name='station_create'),
    path('stations/<int:pk>/', views.station_detail, name='station_detail'),
    path('stations/<int:pk>/edit/', views.station_edit, name='station_edit'),
    path('settings/fuel-types/', views.fuel_type_list, name='fuel_type_list'),
    path('settings/fuel-types/create/', views.fuel_type_create, name='fuel_type_create'),
    path('settings/fuel-prices/', views.fuel_price_list, name='fuel_price_list'),
    path('settings/fuel-prices/create/', views.fuel_price_create, name='fuel_price_create'),
    path('settings/voucher-categories/', views.voucher_category_list, name='voucher_category_list'),
    path('settings/voucher-categories/create/', views.voucher_category_create, name='voucher_category_create'),
]
