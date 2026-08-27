from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView, RedirectView

handler403 = 'apps.core.permissions.station_403'

spa_view = TemplateView.as_view(template_name='vue/index.html')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    # Vue SPA (primary frontend)
    path('app/', spa_view, name='app'),
    path('', RedirectView.as_view(url='/app/', permanent=False), name='root-redirect'),
    # Internal routes — used by tests and API, not linked from UI
    path('internal/', include('apps.core.urls')),
    path('internal/shifts/', include('apps.shifts.urls')),
    path('internal/finance/', include('apps.finance.urls')),
    path('internal/employees/', include('apps.employees.urls')),
    path('internal/inventory/', include('apps.inventory.urls')),
    path('internal/reports/', include('apps.reports.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static('/static/vue/', document_root=settings.BASE_DIR / 'staticfiles' / 'vue')

urlpatterns += [
    re_path(r'^app/.*$', spa_view, name='spa-catchall'),
]
