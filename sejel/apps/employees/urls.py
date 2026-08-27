from django.urls import path
from . import views

urlpatterns = [
    path('', views.employee_list, name='employee_list'),
    path('create/', views.employee_create, name='employee_create'),
    path('<int:pk>/', views.employee_detail, name='employee_detail'),
    path('<int:pk>/edit/', views.employee_edit, name='employee_edit'),
    path('<int:pk>/delete/', views.employee_delete, name='employee_delete'),
    path('assignments/', views.shift_assignment_list, name='shift_assignment_list'),
    path('assignments/create/', views.shift_assignment_create, name='shift_assignment_create'),
    path('assignments/<int:pk>/edit/', views.shift_assignment_edit, name='shift_assignment_edit'),
    path('assignments/<int:pk>/delete/', views.shift_assignment_delete, name='shift_assignment_delete'),
]
