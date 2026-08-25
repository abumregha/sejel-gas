from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('apps.core.urls')),
    path('shifts/', include('apps.shifts.urls')),
    path('finance/', include('apps.finance.urls')),
    path('employees/', include('apps.employees.urls')),
    path('inventory/', include('apps.inventory.urls')),
    path('reports/', include('apps.reports.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
