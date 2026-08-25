from django.urls import path
from . import views

urlpatterns = [
    path('', views.shift_list, name='shift_list'),
    path('create/', views.shift_create, name='shift_create'),
    path('<int:pk>/', views.shift_detail, name='shift_detail'),
    path('<int:pk>/close/', views.shift_close, name='shift_close'),
]
