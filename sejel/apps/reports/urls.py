from django.urls import path
from . import views

urlpatterns = [
    path('daily/', views.report_daily, name='report_daily'),
    path('shift/', views.report_shift, name='report_shift'),
    path('monthly/', views.report_monthly, name='report_monthly'),
]
