from django.urls import path
from . import views

urlpatterns = [
    path('', views.shift_list, name='shift_list'),
    path('create/', views.shift_create, name='shift_create'),
    path('<int:pk>/', views.shift_detail, name='shift_detail'),
    path('<int:pk>/edit/', views.shift_edit, name='shift_edit'),
    path('<int:pk>/delete/', views.shift_delete, name='shift_delete'),
    path('<int:pk>/close/', views.shift_close, name='shift_close'),
    path('definitions/', views.definition_list, name='definition_list'),
    path('definitions/create/', views.definition_create, name='definition_create'),
    path('definitions/<int:pk>/edit/', views.definition_edit, name='definition_edit'),
    path('definitions/<int:pk>/toggle/', views.definition_toggle, name='definition_toggle'),
    path('definitions/<int:pk>/delete/', views.definition_delete, name='definition_delete'),
    path('<int:shift_id>/readings/add/', views.reading_add, name='reading_add'),
    path('readings/<int:pk>/edit/', views.reading_edit, name='reading_edit'),
    path('readings/<int:pk>/delete/', views.reading_delete, name='reading_delete'),
    path('meter-gaps/', views.meter_gap_report, name='meter_gap_report'),
]
