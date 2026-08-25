# Sejel POC Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a working Django POC for gas station management with Arabic RTL UI, responsive design, and complete shift reconciliation workflow.

**Architecture:** Django 5 server-rendered app with htmx for interactivity, Tailwind CSS for RTL responsive design, PostgreSQL for data. Six Django apps: core, shifts, finance, inventory, employees, reports.

**Tech Stack:** Django 5, PostgreSQL, htmx, Tailwind CSS (CDN), Lucide icons (CDN), Chart.js (CDN), Pillow

## Global Constraints

- Python 3.10+
- Django 5.0+, <6.0
- PostgreSQL (already on VPS)
- All UI text in Arabic (RTL)
- Responsive: desktop (≥1024px), tablet (768-1023px), mobile (<768px)
- Port 8002 for this POC
- Decimal fields use max_digits=12, decimal_places=3 (Libyan Dinar has 3 decimals)
- No comments in code unless asked
- No docstrings unless asked
- Follow Django conventions: lowercase snake_case for Python, kebab-case for templates

---

## File Structure

```
sejel/
├── manage.py
├── requirements.txt
├── .env
├── sejel/
│   ├── __init__.py
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── apps/
│   ├── __init__.py
│   ├── core/
│   │   ├── __init__.py
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── models.py
│   │   ├── urls.py
│   │   ├── views.py
│   │   ├── forms.py
│   │   ├── middleware.py
│   │   ├── templatetags/
│   │   │   ├── __init__.py
│   │   │   └── core_tags.py
│   │   └── migrations/
│   │       └── __init__.py
│   ├── shifts/
│   │   ├── __init__.py
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── models.py
│   │   ├── urls.py
│   │   ├── views.py
│   │   ├── forms.py
│   │   ├── services.py
│   │   └── migrations/
│   │       └── __init__.py
│   ├── finance/
│   │   ├── __init__.py
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── models.py
│   │   ├── urls.py
│   │   ├── views.py
│   │   ├── forms.py
│   │   ├── services.py
│   │   └── migrations/
│   │       └── __init__.py
│   ├── inventory/
│   │   ├── __init__.py
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── models.py
│   │   ├── urls.py
│   │   ├── views.py
│   │   ├── forms.py
│   │   ├── services.py
│   │   └── migrations/
│   │       └── __init__.py
│   ├── employees/
│   │   ├── __init__.py
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── models.py
│   │   ├── urls.py
│   │   ├── views.py
│   │   ├── forms.py
│   │   └── migrations/
│   │       └── __init__.py
│   └── reports/
│       ├── __init__.py
│       ├── apps.py
│       ├── urls.py
│       └── views.py
├── templates/
│   ├── base.html
│   ├── components/
│   │   ├── sidebar.html
│   │   ├── topbar.html
│   │   ├── kpi_card.html
│   │   ├── data_table.html
│   │   ├── modal.html
│   │   └── pagination.html
│   └── pages/
│       ├── auth/
│       │   └── login.html
│       ├── dashboard/
│       │   └── index.html
│       ├── core/
│       │   ├── station_list.html
│       │   ├── station_form.html
│       │   └── station_detail.html
│       ├── shifts/
│       │   ├── shift_list.html
│       │   ├── shift_form.html
│       │   ├── shift_detail.html
│       │   └── shift_close.html
│       ├── finance/
│       │   ├── cash_list.html
│       │   ├── voucher_list.html
│       │   ├── pos_list.html
│       │   └── reconciliation_detail.html
│       ├── employees/
│       │   ├── employee_list.html
│       │   └── employee_form.html
│       ├── inventory/
│       │   ├── tank_list.html
│       │   ├── delivery_list.html
│       │   └── delivery_form.html
│       ├── reports/
│       │   ├── daily.html
│       │   ├── shift_report.html
│       │   ├── meter_report.html
│       │   └── monthly.html
│       └── settings/
│           ├── fuel_types.html
│           ├── fuel_prices.html
│           └── voucher_categories.html
├── static/
│   ├── css/
│   │   └── custom.css
│   └── js/
│       └── app.js
└── media/
    ├── meter_readings/
    ├── expenses/
    └── delivery_documents/
```

---

## Phase 1: Core Foundation

### Task 1: Project Scaffold

**Files:**
- Create: `sejel/requirements.txt`
- Create: `sejel/.env`
- Create: `sejel/manage.py`
- Create: `sejel/sejel/__init__.py`
- Create: `sejel/sejel/settings.py`
- Create: `sejel/sejel/urls.py`
- Create: `sejel/sejel/wsgi.py`
- Create: `sejel/apps/__init__.py`

**Steps:**

- [ ] **Step 1: Create project directory structure**

```bash
mkdir -p /root/projects/Sejel/sejel/{sejel,apps}
mkdir -p /root/projects/Sejel/media/{meter_readings,expenses,delivery_documents}
```

- [ ] **Step 2: Create requirements.txt**

```
Django>=5.0,<6.0
psycopg2-binary>=2.9,<3.0
Pillow>=10.0,<11.0
python-decouple>=3.8,<4.0
gunicorn>=22.0,<23.0
```

- [ ] **Step 3: Create .env**

```
DJANGO_SECRET_KEY=sejel-poc-secret-key-change-in-production
DJANGO_DEBUG=True
DB_NAME=sejel_poc
DB_USER=postgres
DB_PASSWORD=erpnext
DB_HOST=localhost
DB_PORT=5432
```

- [ ] **Step 4: Create manage.py**

```python
#!/usr/bin/env python
import os
import sys


def main():
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sejel.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
```

- [ ] **Step 5: Create sejel/__init__.py**

```python
```

- [ ] **Step 6: Create sejel/settings.py**

```python
import os
from pathlib import Path
from decouple import config

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = config('DJANGO_SECRET_KEY', default='sejel-poc-secret-key-change-in-production')
DEBUG = config('DJANGO_DEBUG', default='True', cast=bool)
ALLOWED_HOSTS = ['*']

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.humanize',
    'apps.core',
    'apps.employees',
    'apps.shifts',
    'apps.finance',
    'apps.inventory',
    'apps.reports',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'apps.core.middleware.ProfileMiddleware',
]

ROOT_URLCONF = 'sejel.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                'apps.core.context_processors.station_context',
            ],
        },
    },
]

WSGI_APPLICATION = 'sejel.wsgi.application'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': config('DB_NAME', default='sejel_poc'),
        'USER': config('DB_USER', default='postgres'),
        'PASSWORD': config('DB_PASSWORD', default='erpnext'),
        'HOST': config('DB_HOST', default='localhost'),
        'PORT': config('DB_PORT', default='5432'),
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'ar'
TIME_ZONE = 'Africa/Tripoli'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

MEDIA_URL = 'media/'
MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

LOGIN_URL = '/login/'
LOGIN_REDIRECT_URL = '/'
LOGOUT_REDIRECT_URL = '/login/'

SESSION_COOKIE_AGE = 86400
SESSION_EXPIRE_AT_BROWSER_CLOSE = True
```

- [ ] **Step 7: Create sejel/urls.py**

```python
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
```

- [ ] **Step 8: Create sejel/wsgi.py**

```python
import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sejel.settings')
application = get_wsgi_application()
```

- [ ] **Step 9: Create virtual environment and install dependencies**

```bash
cd /root/projects/Sejel
python3 -m venv venv
source venv/bin/activate
pip install -r sejel/requirements.txt
```

- [ ] **Step 10: Verify Django starts**

```bash
cd /root/projects/Sejel/sejel
python manage.py check
```

Expected: System check identified no issues (0 silenced).

- [ ] **Step 11: Commit**

```bash
git init
git add .
git commit -m "feat: project scaffold with Django settings"
```

---

### Task 2: Core Models

**Files:**
- Create: `sejel/apps/core/__init__.py`
- Create: `sejel/apps/core/apps.py`
- Create: `sejel/apps/core/models.py`
- Create: `sejel/apps/core/admin.py`
- Create: `sejel/apps/core/migrations/__init__.py`

**Steps:**

- [ ] **Step 1: Create apps/core/__init__.py**

```python
```

- [ ] **Step 2: Create apps/core/apps.py**

```python
from django.apps import AppConfig


class CoreConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.core'
    verbose_name = 'Core'
```

- [ ] **Step 3: Create apps/core/models.py**

```python
from django.db import models
from django.contrib.auth.models import User


class MarketingCompany(models.Model):
    name = models.CharField(max_length=200)
    name_en = models.CharField(max_length=200, blank=True)

    class Meta:
        db_table = 'sejel_marketing_company'
        ordering = ['name']

    def __str__(self):
        return self.name


class Station(models.Model):
    RELATIONSHIP_CHOICES = [
        ('owned', 'مملوكة للمواطن'),
        ('rented', 'مؤجرة من شركة التسويق'),
        ('agency', 'وكالة/إعادة بيع'),
    ]
    CASH_MODE_CHOICES = [
        ('during_shift', 'أثناء المناوبة'),
        ('end_of_shift', 'عند نهاية المناوبة'),
    ]
    STATUS_CHOICES = [
        ('active', 'نشطة'),
        ('inactive', 'غير نشطة'),
        ('maintenance', 'صيانة'),
    ]

    name = models.CharField(max_length=200)
    address = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    relationship_type = models.CharField(max_length=20, choices=RELATIONSHIP_CHOICES)
    marketing_company = models.ForeignKey(MarketingCompany, on_delete=models.SET_NULL, null=True, blank=True)
    cash_collection_mode = models.CharField(max_length=20, choices=CASH_MODE_CHOICES, default='during_shift')
    target_cash_amount = models.DecimalField(max_digits=10, decimal_places=3, default=500)
    photo_meter_required = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'sejel_station'
        ordering = ['name']

    def __str__(self):
        return self.name


class Island(models.Model):
    station = models.ForeignKey(Station, on_delete=models.CASCADE, related_name='islands')
    name = models.CharField(max_length=50)
    number = models.PositiveIntegerField()
    status = models.CharField(max_length=20, choices=[('active', 'نشطة'), ('inactive', 'غير نشطة')], default='active')

    class Meta:
        db_table = 'sejel_island'
        unique_together = ('station', 'number')
        ordering = ['number']

    def __str__(self):
        return f"{self.station.name} - {self.name}"


class Machine(models.Model):
    island = models.ForeignKey(Island, on_delete=models.CASCADE, related_name='machines')
    name = models.CharField(max_length=50)
    number = models.PositiveIntegerField()

    class Meta:
        db_table = 'sejel_machine'
        unique_together = ('island', 'number')
        ordering = ['number']

    def __str__(self):
        return f"{self.island} - {self.name}"


class FuelType(models.Model):
    name = models.CharField(max_length=50)
    name_en = models.CharField(max_length=50, blank=True)

    class Meta:
        db_table = 'sejel_fuel_type'
        ordering = ['name']

    def __str__(self):
        return self.name


class Tank(models.Model):
    station = models.ForeignKey(Station, on_delete=models.CASCADE, related_name='tanks')
    fuel_type = models.ForeignKey(FuelType, on_delete=models.PROTECT)
    capacity = models.DecimalField(max_digits=10, decimal_places=3)
    current_level = models.DecimalField(max_digits=10, decimal_places=3, default=0)
    last_reading_date = models.DateTimeField(null=True, blank=True)
    name = models.CharField(max_length=50, blank=True)

    class Meta:
        db_table = 'sejel_tank'
        ordering = ['name']

    def __str__(self):
        return self.name or f"Tank {self.id} - {self.fuel_type}"


class Meter(models.Model):
    machine = models.ForeignKey(Machine, on_delete=models.CASCADE, related_name='meters')
    code = models.CharField(max_length=50)
    fuel_type = models.ForeignKey(FuelType, on_delete=models.PROTECT)
    tank = models.ForeignKey(Tank, on_delete=models.PROTECT)
    current_reading = models.DecimalField(max_digits=12, decimal_places=3, default=0)
    status = models.CharField(max_length=20, choices=[
        ('active', 'نشطة'),
        ('inactive', 'غير نشطة'),
        ('maintenance', 'صيانة'),
    ], default='active')

    class Meta:
        db_table = 'sejel_meter'
        ordering = ['code']

    def __str__(self):
        return f"Meter {self.code} - {self.fuel_type}"


class FuelPrice(models.Model):
    fuel_type = models.ForeignKey(FuelType, on_delete=models.CASCADE, related_name='prices')
    selling_price = models.DecimalField(max_digits=10, decimal_places=3)
    profit_margin = models.DecimalField(max_digits=10, decimal_places=3)
    cost_per_liter = models.DecimalField(max_digits=10, decimal_places=3, null=True, blank=True)
    effective_date = models.DateField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'sejel_fuel_price'
        ordering = ['-effective_date']

    def __str__(self):
        return f"{self.fuel_type} - {self.selling_price} ({self.effective_date})"


class StationSettings(models.Model):
    station = models.OneToOneField(Station, on_delete=models.CASCADE, related_name='settings')
    islands_count = models.PositiveIntegerField(default=2)
    machines_per_island = models.PositiveIntegerField(default=2)
    meters_per_machine = models.PositiveIntegerField(default=2)
    tanks_count = models.PositiveIntegerField(default=4)
    cash_target_amount = models.DecimalField(max_digits=10, decimal_places=3, default=500)
    photo_meter_required = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'sejel_station_settings'

    def __str__(self):
        return f"Settings - {self.station.name}"


class UserProfile(models.Model):
    ROLE_CHOICES = [
        ('admin', 'مدير النظام'),
        ('manager', 'مدير المحطة'),
        ('finance', 'المالي'),
        ('supervisor', 'المشرف'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='supervisor')
    station = models.ForeignKey(Station, on_delete=models.SET_NULL, null=True, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'sejel_user_profile'

    def __str__(self):
        return f"{self.user.username} ({self.get_role_display()})"
```

- [ ] **Step 4: Create apps/core/admin.py**

```python
from django.contrib import admin
from .models import (
    MarketingCompany, Station, Island, Machine, FuelType,
    Tank, Meter, FuelPrice, StationSettings, UserProfile
)


@admin.register(MarketingCompany)
class MarketingCompanyAdmin(admin.ModelAdmin):
    list_display = ('name', 'name_en')


@admin.register(Station)
class StationAdmin(admin.ModelAdmin):
    list_display = ('name', 'status', 'relationship_type', 'marketing_company')
    list_filter = ('status', 'relationship_type')


@admin.register(Island)
class IslandAdmin(admin.ModelAdmin):
    list_display = ('name', 'number', 'station', 'status')
    list_filter = ('station', 'status')


@admin.register(Machine)
class MachineAdmin(admin.ModelAdmin):
    list_display = ('name', 'number', 'island')
    list_filter = ('island__station',)


@admin.register(FuelType)
class FuelTypeAdmin(admin.ModelAdmin):
    list_display = ('name', 'name_en')


@admin.register(Tank)
class TankAdmin(admin.ModelAdmin):
    list_display = ('name', 'station', 'fuel_type', 'capacity', 'current_level')
    list_filter = ('station', 'fuel_type')


@admin.register(Meter)
class MeterAdmin(admin.ModelAdmin):
    list_display = ('code', 'fuel_type', 'machine', 'tank', 'current_reading', 'status')
    list_filter = ('status', 'fuel_type', 'machine__island__station')


@admin.register(FuelPrice)
class FuelPriceAdmin(admin.ModelAdmin):
    list_display = ('fuel_type', 'selling_price', 'profit_margin', 'effective_date', 'is_active')
    list_filter = ('fuel_type', 'is_active')


@admin.register(StationSettings)
class StationSettingsAdmin(admin.ModelAdmin):
    list_display = ('station', 'islands_count', 'machines_per_island', 'meters_per_machine')


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'role', 'station')
    list_filter = ('role',)
```

- [ ] **Step 5: Create apps/core/migrations/__init__.py**

```python
```

- [ ] **Step 6: Create database and run migrations**

```bash
cd /root/projects/Sejel/sejel
sudo -u postgres createdb sejel_poc 2>/dev/null || true
python manage.py makemigrations core
python manage.py migrate
```

Expected: Operations to apply: create model MarketingCompany, create model Station, etc.

- [ ] **Step 7: Verify models load**

```bash
python manage.py shell -c "from apps.core.models import Station, UserProfile; print('Models OK')"
```

Expected: Models OK

- [ ] **Step 8: Commit**

```bash
git add apps/core/
git commit -m "feat: core models - Station, Island, Machine, Meter, Tank, FuelType"
```

---

### Task 3: Auth, Middleware & Base Template

**Files:**
- Create: `sejel/apps/core/middleware.py`
- Create: `sejel/apps/core/context_processors.py`
- Create: `sejel/apps/core/urls.py`
- Create: `sejel/apps/core/views.py`
- Create: `sejel/templates/base.html`
- Create: `sejel/templates/components/sidebar.html`
- Create: `sejel/templates/components/topbar.html`
- Create: `sejel/templates/pages/auth/login.html`

**Steps:**

- [ ] **Step 1: Create apps/core/middleware.py**

```python
from .models import UserProfile


class ProfileMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.user.is_authenticated:
            if not hasattr(request.user, 'profile'):
                UserProfile.objects.create(user=request.user, role='admin')
        response = self.get_response(request)
        return response
```

- [ ] **Step 2: Create apps/core/context_processors.py**

```python
from .models import Station, UserProfile


def station_context(request):
    context = {}
    if request.user.is_authenticated and hasattr(request.user, 'profile'):
        profile = request.user.profile
        context['user_profile'] = profile
        context['user_role'] = profile.role
        if profile.station:
            context['current_station'] = profile.station
        if profile.role == 'admin':
            context['stations'] = Station.objects.filter(status='active')
    return context
```

- [ ] **Step 3: Create apps/core/urls.py**

```python
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
```

- [ ] **Step 4: Create apps/core/views.py**

```python
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from .models import Station, StationSettings, FuelType, FuelPrice, VoucherCategory
from .forms import (
    StationForm, FuelTypeForm, FuelPriceForm, VoucherCategoryForm
)


@login_required
def dashboard(request):
    profile = request.user.profile
    stations = Station.objects.filter(status='active')
    if profile.role != 'admin' and profile.station:
        stations = stations.filter(id=profile.station.id)
    context = {
        'stations': stations,
        'page_title': 'لوحة التحكم',
    }
    return render(request, 'pages/dashboard/index.html', context)


@login_required
def station_list(request):
    stations = Station.objects.all()
    return render(request, 'pages/core/station_list.html', {'stations': stations, 'page_title': 'المحطات'})


@login_required
def station_create(request):
    if request.method == 'POST':
        form = StationForm(request.POST)
        if form.is_valid():
            station = form.save()
            StationSettings.objects.create(station=station)
            return redirect('station_detail', pk=station.pk)
    else:
        form = StationForm()
    return render(request, 'pages/core/station_form.html', {'form': form, 'page_title': 'إضافة محطة'})


@login_required
def station_detail(request, pk):
    station = get_object_or_404(Station, pk=pk)
    return render(request, 'pages/core/station_detail.html', {'station': station, 'page_title': station.name})


@login_required
def station_edit(request, pk):
    station = get_object_or_404(Station, pk=pk)
    if request.method == 'POST':
        form = StationForm(request.POST, instance=station)
        if form.is_valid():
            form.save()
            return redirect('station_detail', pk=station.pk)
    else:
        form = StationForm(instance=station)
    return render(request, 'pages/core/station_form.html', {'form': form, 'station': station, 'page_title': f'تعديل {station.name}'})


@login_required
def fuel_type_list(request):
    types = FuelType.objects.all()
    return render(request, 'pages/settings/fuel_types.html', {'fuel_types': types, 'page_title': 'أنواع الوقود'})


@login_required
def fuel_type_create(request):
    if request.method == 'POST':
        form = FuelTypeForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('fuel_type_list')
    else:
        form = FuelTypeForm()
    return render(request, 'pages/settings/fuel_type_form.html', {'form': form, 'page_title': 'إضافة نوع وقود'})


@login_required
def fuel_price_list(request):
    prices = FuelPrice.objects.select_related('fuel_type').all()
    return render(request, 'pages/settings/fuel_prices.html', {'prices': prices, 'page_title': 'أسعار الوقود'})


@login_required
def fuel_price_create(request):
    if request.method == 'POST':
        form = FuelPriceForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('fuel_price_list')
    else:
        form = FuelPriceForm()
    return render(request, 'pages/settings/fuel_price_form.html', {'form': form, 'page_title': 'إضافة سعر وقود'})


@login_required
def voucher_category_list(request):
    categories = VoucherCategory.objects.all()
    return render(request, 'pages/settings/voucher_categories.html', {'categories': categories, 'page_title': 'فئات الكوبونات'})


@login_required
def voucher_category_create(request):
    if request.method == 'POST':
        form = VoucherCategoryForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('voucher_category_list')
    else:
        form = VoucherCategoryForm()
    return render(request, 'pages/settings/voucher_category_form.html', {'form': form, 'page_title': 'إضافة فئة كوبون'})
```

- [ ] **Step 5: Create apps/core/forms.py**

```python
from django import forms
from .models import Station, FuelType, FuelPrice, VoucherCategory, ExpenseCategory


class StationForm(forms.ModelForm):
    class Meta:
        model = Station
        fields = ['name', 'address', 'status', 'relationship_type', 'marketing_company',
                  'cash_collection_mode', 'target_cash_amount', 'photo_meter_required']


class FuelTypeForm(forms.ModelForm):
    class Meta:
        model = FuelType
        fields = ['name', 'name_en']


class FuelPriceForm(forms.ModelForm):
    class Meta:
        model = FuelPrice
        fields = ['fuel_type', 'selling_price', 'profit_margin', 'cost_per_liter', 'effective_date', 'is_active']


class VoucherCategoryForm(forms.ModelForm):
    class Meta:
        model = VoucherCategory
        fields = ['name', 'value', 'is_active']


class ExpenseCategoryForm(forms.ModelForm):
    class Meta:
        model = ExpenseCategory
        fields = ['name', 'station', 'is_active']
```

- [ ] **Step 6: Create templates/base.html**

```html
{% load static %}
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{% block title %}سجل{% endblock %} - سجل</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/htmx.org@1.9.10"></script>
    <link rel="stylesheet" href="https://unpkg.com/lucide-static@latest/font/lucide.css">
    <link rel="stylesheet" href="{% static 'css/custom.css' %}">
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        primary: '#1a56db',
                        success: '#059669',
                        warning: '#d97706',
                        danger: '#dc2626',
                        sidebar: '#1e293b',
                    }
                }
            }
        }
    </script>
</head>
<body class="bg-gray-50 font-sans">
    {% if user.is_authenticated %}
    <div class="flex min-h-screen">
        {% include 'components/sidebar.html' %}
        <div class="flex-1 flex flex-col mr-0 lg:mr-64">
            {% include 'components/topbar.html' %}
            <main class="flex-1 p-4 lg:p-6">
                {% block content %}{% endblock %}
            </main>
        </div>
    </div>
    {% else %}
    {% block auth %}{% endblock %}
    {% endif %}

    <script src="{% static 'js/app.js' %}"></script>
    {% block extra_js %}{% endblock %}
</body>
</html>
```

- [ ] **Step 7: Create templates/components/sidebar.html**

```html
<aside class="fixed top-0 right-0 w-64 h-full bg-sidebar text-white z-40 transform transition-transform lg:translate-x-0 -translate-x-full" id="sidebar">
    <div class="p-6">
        <h1 class="text-2xl font-bold text-center">سجل</h1>
        <p class="text-gray-400 text-center text-sm mt-1">نظام إدارة محطات الوقود</p>
    </div>
    <nav class="mt-2">
        <a href="{% url 'dashboard' %}" class="flex items-center px-6 py-3 hover:bg-white/10 transition-colors {% if page_title == 'لوحة التحكم' %}bg-white/10{% endif %}">
            <i data-lucide="layout-dashboard" class="w-5 h-5 ml-3"></i>
            <span>لوحة التحكم</span>
        </a>
        <a href="{% url 'station_list' %}" class="flex items-center px-6 py-3 hover:bg-white/10 transition-colors">
            <i data-lucide="fuel" class="w-5 h-5 ml-3"></i>
            <span>المحطات</span>
        </a>
        <a href="{% url 'shift_list' %}" class="flex items-center px-6 py-3 hover:bg-white/10 transition-colors">
            <i data-lucide="calendar-clock" class="w-5 h-5 ml-3"></i>
            <span>المناوبات</span>
        </a>
        <a href="{% url 'employee_list' %}" class="flex items-center px-6 py-3 hover:bg-white/10 transition-colors">
            <i data-lucide="users" class="w-5 h-5 ml-3"></i>
            <span>الموظفون</span>
        </a>
        <a href="{% url 'cash_list' %}" class="flex items-center px-6 py-3 hover:bg-white/10 transition-colors">
            <i data-lucide="banknote" class="w-5 h-5 ml-3"></i>
            <span>المالية</span>
        </a>
        <a href="{% url 'tank_list' %}" class="flex items-center px-6 py-3 hover:bg-white/10 transition-colors">
            <i data-lucide="droplets" class="w-5 h-5 ml-3"></i>
            <span>الخزانات</span>
        </a>
        <a href="{% url 'expense_list' %}" class="flex items-center px-6 py-3 hover:bg-white/10 transition-colors">
            <i data-lucide="receipt" class="w-5 h-5 ml-3"></i>
            <span>المصروفات</span>
        </a>
        <a href="{% url 'report_daily' %}" class="flex items-center px-6 py-3 hover:bg-white/10 transition-colors">
            <i data-lucide="bar-chart-3" class="w-5 h-5 ml-3"></i>
            <span>التقارير</span>
        </a>
        <div class="border-t border-white/20 my-2"></div>
        <a href="{% url 'fuel_type_list' %}" class="flex items-center px-6 py-3 hover:bg-white/10 transition-colors">
            <i data-lucide="settings" class="w-5 h-5 ml-3"></i>
            <span>الإعدادات</span>
        </a>
    </nav>
</aside>
```

- [ ] **Step 8: Create templates/components/topbar.html**

```html
<header class="bg-white shadow-sm border-b border-gray-200 px-4 lg:px-6 py-3 flex items-center justify-between sticky top-0 z-30">
    <div class="flex items-center gap-4">
        <button onclick="toggleSidebar()" class="lg:hidden p-2 rounded-lg hover:bg-gray-100">
            <i data-lucide="menu" class="w-5 h-5"></i>
        </button>
        <h2 class="text-lg font-semibold text-gray-800">{{ page_title }}</h2>
    </div>
    <div class="flex items-center gap-4">
        {% if stations|length > 1 %}
        <select class="border border-gray-300 rounded-lg px-3 py-1.5 text-sm" onchange="switchStation(this.value)">
            {% for station in stations %}
            <option value="{{ station.id }}" {% if station == current_station %}selected{% endif %}>{{ station.name }}</option>
            {% endfor %}
        </select>
        {% elif current_station %}
        <span class="text-sm text-gray-600">{{ current_station.name }}</span>
        {% endif %}
        <div class="flex items-center gap-2">
            <span class="text-sm text-gray-600">{{ user.get_full_name|default:user.username }}</span>
            <span class="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{{ user_profile.get_role_display }}</span>
        </div>
        <a href="{% url 'logout' %}" class="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
            <i data-lucide="log-out" class="w-5 h-5"></i>
        </a>
    </div>
</header>
```

- [ ] **Step 9: Create templates/pages/auth/login.html**

```html
{% extends 'base.html' %}
{% load static %}

{% block auth %}
<div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-sidebar to-gray-800">
    <div class="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4">
        <div class="text-center mb-8">
            <h1 class="text-3xl font-bold text-gray-800">سجل</h1>
            <p class="text-gray-500 mt-2">نظام إدارة محطات الوقود</p>
        </div>
        <form method="post" class="space-y-4">
            {% csrf_token %}
            {% if form.errors %}
            <div class="bg-danger/10 text-danger p-3 rounded-lg text-sm">
               اسم المستخدم أو كلمة المرور غير صحيحة
            </div>
            {% endif %}
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">اسم المستخدم</label>
                <input type="text" name="username" required class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors" placeholder="أدخل اسم المستخدم">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">كلمة المرور</label>
                <input type="password" name="password" required class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors" placeholder="أدخل كلمة المرور">
            </div>
            <button type="submit" class="w-full bg-primary text-white py-2.5 rounded-lg font-medium hover:bg-primary/90 transition-colors">
                تسجيل الدخول
            </button>
        </form>
    </div>
</div>
{% endblock %}
```

- [ ] **Step 10: Create static files**

```bash
mkdir -p /root/projects/Sejel/sejel/static/{css,js}
```

Create `sejel/static/css/custom.css`:
```css
/* Custom scrollbar */
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: #f1f5f9; }
::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

/* RTL table alignment */
[dir="rtl"] .text-left { text-align: right !important; }
[dir="rtl"] .text-right { text-align: left !important; }

/* Mobile sidebar overlay */
.sidebar-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.5);
    z-index: 30;
}
```

Create `sejel/static/js/app.js`:
```javascript
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    sidebar.classList.toggle('-translate-x-full');
    if (overlay) {
        overlay.remove();
    } else {
        const div = document.createElement('div');
        div.className = 'sidebar-overlay';
        div.onclick = toggleSidebar;
        document.body.appendChild(div);
    }
}

function switchStation(stationId) {
    window.location.href = '/?station=' + stationId;
}

document.addEventListener('DOMContentLoaded', function() {
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
});

document.body.addEventListener('htmx:afterSwap', function() {
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
});
```

- [ ] **Step 11: Verify login works**

```bash
cd /root/projects/Sejel/sejel
python manage.py createsuperuser --noinput --username admin --email admin@sejel.local 2>/dev/null || true
python manage.py shell -c "
from django.contrib.auth.models import User
from apps.core.models import UserProfile
u = User.objects.get(username='admin')
u.set_password('admin')
u.save()
UserProfile.objects.get_or_create(user=u, defaults={'role': 'admin'})
print('Admin user ready')
"
python manage.py runserver 0.0.0.0:8002 &
sleep 2
curl -s http://localhost:8002/login/ | grep -o '<title>.*</title>'
kill %1 2>/dev/null
```

Expected: `<title>تسجيل الدخول - سجل</title>`

- [ ] **Step 12: Commit**

```bash
git add apps/core/ templates/ static/ media/
git commit -m "feat: auth, middleware, base template with RTL sidebar"
```

---

### Task 4: Employee Models & Views

**Files:**
- Create: `sejel/apps/employees/__init__.py`
- Create: `sejel/apps/employees/apps.py`
- Create: `sejel/apps/employees/models.py`
- Create: `sejel/apps/employees/admin.py`
- Create: `sejel/apps/employees/forms.py`
- Create: `sejel/apps/employees/views.py`
- Create: `sejel/apps/employees/urls.py`
- Create: `sejel/apps/employees/migrations/__init__.py`
- Create: `sejel/templates/pages/employees/employee_list.html`
- Create: `sejel/templates/pages/employees/employee_form.html`

**Steps:**

- [ ] **Step 1: Create apps/employees/models.py**

```python
from django.db import models
from apps.core.models import Station, Island


class Employee(models.Model):
    SHIFT_CHOICES = [
        ('morning', 'صباحي'),
        ('evening', 'مسائي'),
        ('full_day', 'كامل اليوم'),
    ]
    STATUS_CHOICES = [
        ('active', 'نشط'),
        ('inactive', 'غير نشط'),
    ]

    station = models.ForeignKey(Station, on_delete=models.CASCADE, related_name='employees')
    name = models.CharField(max_length=200)
    phone = models.CharField(max_length=20, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    shift_type = models.CharField(max_length=20, choices=SHIFT_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'sejel_employee'
        ordering = ['name']

    def __str__(self):
        return self.name


class ShiftAssignment(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='assignments')
    island = models.ForeignKey(Island, on_delete=models.CASCADE)
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()

    class Meta:
        db_table = 'sejel_shift_assignment'
        ordering = ['-date', 'start_time']

    def __str__(self):
        return f"{self.employee.name} - {self.island.name} ({self.date})"
```

- [ ] **Step 2: Create apps/employees/admin.py**

```python
from django.contrib import admin
from .models import Employee, ShiftAssignment


@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ('name', 'station', 'phone', 'shift_type', 'status')
    list_filter = ('station', 'status', 'shift_type')


@admin.register(ShiftAssignment)
class ShiftAssignmentAdmin(admin.ModelAdmin):
    list_display = ('employee', 'island', 'date', 'start_time', 'end_time')
    list_filter = ('date', 'employee__station')
```

- [ ] **Step 3: Create apps/employees/forms.py**

```python
from django import forms
from .models import Employee, ShiftAssignment


class EmployeeForm(forms.ModelForm):
    class Meta:
        model = Employee
        fields = ['station', 'name', 'phone', 'status', 'shift_type']


class ShiftAssignmentForm(forms.ModelForm):
    class Meta:
        model = ShiftAssignment
        fields = ['employee', 'island', 'date', 'start_time', 'end_time']
```

- [ ] **Step 4: Create apps/employees/views.py**

```python
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from .models import Employee
from .forms import EmployeeForm


@login_required
def employee_list(request):
    employees = Employee.objects.select_related('station').all()
    station_id = request.GET.get('station')
    if station_id:
        employees = employees.filter(station_id=station_id)
    return render(request, 'pages/employees/employee_list.html', {
        'employees': employees,
        'page_title': 'الموظفون',
    })


@login_required
def employee_create(request):
    if request.method == 'POST':
        form = EmployeeForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('employee_list')
    else:
        form = EmployeeForm()
    return render(request, 'pages/employees/employee_form.html', {
        'form': form,
        'page_title': 'إضافة موظف',
    })


@login_required
def employee_edit(request, pk):
    employee = get_object_or_404(Employee, pk=pk)
    if request.method == 'POST':
        form = EmployeeForm(request.POST, instance=employee)
        if form.is_valid():
            form.save()
            return redirect('employee_list')
    else:
        form = EmployeeForm(instance=employee)
    return render(request, 'pages/employees/employee_form.html', {
        'form': form,
        'employee': employee,
        'page_title': f'تعديل {employee.name}',
    })
```

- [ ] **Step 5: Create apps/employees/urls.py**

```python
from django.urls import path
from . import views

urlpatterns = [
    path('', views.employee_list, name='employee_list'),
    path('create/', views.employee_create, name='employee_create'),
    path('<int:pk>/edit/', views.employee_edit, name='employee_edit'),
]
```

- [ ] **Step 6: Create templates/pages/employees/employee_list.html**

```html
{% extends 'base.html' %}

{% block content %}
<div class="flex items-center justify-between mb-6">
    <div></div>
    <a href="{% url 'employee_create' %}" class="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2">
        <i data-lucide="plus" class="w-4 h-4"></i>
        إضافة موظف
    </a>
</div>

<div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
    <div class="overflow-x-auto">
        <table class="w-full text-sm">
            <thead class="bg-gray-50 border-b border-gray-200">
                <tr>
                    <th class="px-4 py-3 text-right font-medium text-gray-600">الاسم</th>
                    <th class="px-4 py-3 text-right font-medium text-gray-600">المحطة</th>
                    <th class="px-4 py-3 text-right font-medium text-gray-600">الهاتف</th>
                    <th class="px-4 py-3 text-right font-medium text-gray-600">فترة المناوبة</th>
                    <th class="px-4 py-3 text-right font-medium text-gray-600">الحالة</th>
                    <th class="px-4 py-3 text-right font-medium text-gray-600">إجراءات</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
                {% for employee in employees %}
                <tr class="hover:bg-gray-50 transition-colors">
                    <td class="px-4 py-3 font-medium">{{ employee.name }}</td>
                    <td class="px-4 py-3 text-gray-600">{{ employee.station.name }}</td>
                    <td class="px-4 py-3 text-gray-600" dir="ltr">{{ employee.phone|default:"-" }}</td>
                    <td class="px-4 py-3 text-gray-600">{{ employee.get_shift_type_display }}</td>
                    <td class="px-4 py-3">
                        <span class="px-2 py-1 rounded-full text-xs {% if employee.status == 'active' %}bg-success/10 text-success{% else %}bg-gray-100 text-gray-600{% endif %}">
                            {{ employee.get_status_display }}
                        </span>
                    </td>
                    <td class="px-4 py-3">
                        <a href="{% url 'employee_edit' pk=employee.pk %}" class="text-primary hover:text-primary/80 transition-colors">
                            <i data-lucide="pencil" class="w-4 h-4"></i>
                        </a>
                    </td>
                </tr>
                {% empty %}
                <tr>
                    <td colspan="6" class="px-4 py-8 text-center text-gray-500">لا يوجد موظفون</td>
                </tr>
                {% endfor %}
            </tbody>
        </table>
    </div>
</div>
{% endblock %}
```

- [ ] **Step 7: Create templates/pages/employees/employee_form.html**

```html
{% extends 'base.html' %}

{% block content %}
<div class="max-w-2xl mx-auto">
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-semibold mb-6">{{ page_title }}</h3>
        <form method="post" class="space-y-4">
            {% csrf_token %}
            {% for field in form %}
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ field.label }}</label>
                {{ field }}
                {% if field.errors %}
                <p class="text-danger text-sm mt-1">{{ field.errors.0 }}</p>
                {% endif %}
            </div>
            {% endfor %}
            <div class="flex gap-3 pt-4">
                <button type="submit" class="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors">حفظ</button>
                <a href="{% url 'employee_list' %}" class="px-6 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors">إلغاء</a>
            </div>
        </form>
    </div>
</div>
{% endblock %}
```

- [ ] **Step 8: Run migrations and verify**

```bash
cd /root/projects/Sejel/sejel
python manage.py makemigrations employees
python manage.py migrate
python manage.py shell -c "from apps.employees.models import Employee; print('Employee model OK')"
```

Expected: Employee model OK

- [ ] **Step 9: Commit**

```bash
git add apps/employees/ templates/pages/employees/
git commit -m "feat: employee models, views, and templates"
```

---

### Task 5: Shift Models, Services & Closing Flow

**Files:**
- Create: `sejel/apps/shifts/__init__.py`
- Create: `sejel/apps/shifts/apps.py`
- Create: `sejel/apps/shifts/models.py`
- Create: `sejel/apps/shifts/admin.py`
- Create: `sejel/apps/shifts/forms.py`
- Create: `sejel/apps/shifts/services.py`
- Create: `sejel/apps/shifts/views.py`
- Create: `sejel/apps/shifts/urls.py`
- Create: `sejel/apps/shifts/migrations/__init__.py`
- Create: `sejel/templates/pages/shifts/shift_list.html`
- Create: `sejel/templates/pages/shifts/shift_form.html`
- Create: `sejel/templates/pages/shifts/shift_detail.html`
- Create: `sejel/templates/pages/shifts/shift_close.html`

**Steps:**

- [ ] **Step 1: Create apps/shifts/models.py**

```python
from django.db import models
from django.contrib.auth.models import User
from apps.core.models import Station, Island, Meter
from apps.employees.models import Employee


class Shift(models.Model):
    STATUS_CHOICES = [
        ('open', 'مفتوحة'),
        ('closed', 'مغلقة'),
        ('under_review', 'تحت المراجعة'),
    ]

    station = models.ForeignKey(Station, on_delete=models.CASCADE, related_name='shifts')
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='shifts')
    island = models.ForeignKey(Island, on_delete=models.CASCADE)
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    closed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    closed_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'sejel_shift'
        ordering = ['-date', '-start_time']

    def __str__(self):
        return f"Shift #{self.id} - {self.employee.name} ({self.date})"


class MeterReading(models.Model):
    shift = models.ForeignKey(Shift, on_delete=models.CASCADE, related_name='readings')
    meter = models.ForeignKey(Meter, on_delete=models.CASCADE)
    start_reading = models.DecimalField(max_digits=12, decimal_places=3)
    end_reading = models.DecimalField(max_digits=12, decimal_places=3, null=True, blank=True)
    liters_sold = models.DecimalField(max_digits=12, decimal_places=3, default=0)
    photo = models.ImageField(upload_to='meter_readings/', null=True, blank=True)
    override_reason = models.TextField(blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'sejel_meter_reading'

    def __str__(self):
        return f"Meter {self.meter.code} - Shift #{self.shift_id}"
```

- [ ] **Step 2: Create apps/shifts/services.py**

```python
from decimal import Decimal
from django.utils import timezone
from .models import Shift, MeterReading
from apps.finance.models import CashCollection, Voucher, POSRecord, Reconciliation


def close_shift(shift, end_readings_data, closed_by):
    from apps.core.models import FuelPrice

    for reading_data in end_readings_data:
        meter_reading = MeterReading.objects.get(
            shift=shift,
            meter_id=reading_data['meter_id']
        )
        meter_reading.end_reading = reading_data['end_reading']
        meter_reading.override_reason = reading_data.get('override_reason', '')

        if meter_reading.end_reading < meter_reading.start_reading and not meter_reading.override_reason:
            raise ValueError(f"End reading less than start for meter {meter_reading.meter.code}")

        meter_reading.liters_sold = meter_reading.end_reading - meter_reading.start_reading
        meter_reading.save()

        meter_reading.meter.current_reading = meter_reading.end_reading
        meter_reading.meter.save()

    total_liters = sum(r.liters_sold for r in shift.readings.all())

    fuel_type = shift.island.meters.first().fuel_type
    price = FuelPrice.objects.filter(fuel_type=fuel_type, is_active=True).order_by('-effective_date').first()
    selling_price = price.selling_price if price else Decimal('0')

    expected_sales = total_liters * selling_price

    total_cash = CashCollection.objects.filter(shift=shift).aggregate(
        total=models.Sum('amount'))['total'] or Decimal('0')
    total_vouchers = Voucher.objects.filter(shift=shift).aggregate(
        total=models.Sum('total_value'))['total'] or Decimal('0')
    total_pos = POSRecord.objects.filter(shift=shift).aggregate(
        total=models.Sum('total_amount'))['total'] or Decimal('0')

    total_collection = total_cash + total_vouchers + total_pos
    difference = total_collection - expected_sales

    if difference == 0:
        difference_type = 'matched'
    elif difference > 0:
        difference_type = 'surplus'
    else:
        difference_type = 'shortage'

    reconciliation = Reconciliation.objects.create(
        shift=shift,
        total_liters=total_liters,
        expected_sales=expected_sales,
        total_cash=total_cash,
        total_vouchers=total_vouchers,
        total_pos=total_pos,
        total_collection=total_collection,
        difference=difference,
        difference_type=difference_type,
    )

    shift.status = 'closed'
    shift.end_time = timezone.now().time()
    shift.closed_by = closed_by
    shift.closed_at = timezone.now()
    shift.save()

    return reconciliation
```

- [ ] **Step 3: Create apps/shifts/views.py**

```python
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .models import Shift, MeterReading
from .forms import ShiftForm, MeterReadingForm
from .services import close_shift
from apps.core.models import Meter


@login_required
def shift_list(request):
    shifts = Shift.objects.select_related('employee', 'island', 'station').all()
    status = request.GET.get('status')
    if status:
        shifts = shifts.filter(status=status)
    return render(request, 'pages/shifts/shift_list.html', {
        'shifts': shifts,
        'page_title': 'المناوبات',
    })


@login_required
def shift_create(request):
    if request.method == 'POST':
        form = ShiftForm(request.POST)
        if form.is_valid():
            shift = form.save()
            meters = Meter.objects.filter(
                machine__island=shift.island,
                status='active'
            )
            for meter in meters:
                MeterReading.objects.create(
                    shift=shift,
                    meter=meter,
                    start_reading=meter.current_reading,
                    created_by=request.user,
                )
            return redirect('shift_detail', pk=shift.pk)
    else:
        form = ShiftForm()
    return render(request, 'pages/shifts/shift_form.html', {
        'form': form,
        'page_title': 'إنشاء مناوبة',
    })


@login_required
def shift_detail(request, pk):
    shift = get_object_or_404(Shift, pk=pk)
    readings = shift.readings.select_related('meter').all()
    from apps.finance.models import CashCollection, Voucher, POSRecord
    cash_collections = CashCollection.objects.filter(shift=shift)
    vouchers = Voucher.objects.filter(shift=shift).select_related('category')
    pos_records = POSRecord.objects.filter(shift=shift)
    reconciliation = getattr(shift, 'reconciliation', None)
    return render(request, 'pages/shifts/shift_detail.html', {
        'shift': shift,
        'readings': readings,
        'cash_collections': cash_collections,
        'vouchers': vouchers,
        'pos_records': pos_records,
        'reconciliation': reconciliation,
        'page_title': f'المناوبة #{shift.id}',
    })


@login_required
def shift_close(request, pk):
    shift = get_object_or_404(Shift, pk=pk)
    if shift.status != 'open':
        messages.error(request, 'هذه المناوبة مغلقة بالفعل')
        return redirect('shift_detail', pk=pk)

    readings = shift.readings.select_related('meter').all()

    if request.method == 'POST':
        end_readings_data = []
        for reading in readings:
            end_reading = request.POST.get(f'end_reading_{reading.id}')
            override_reason = request.POST.get(f'override_reason_{reading.id}', '')
            end_readings_data.append({
                'meter_id': reading.meter_id,
                'end_reading': end_reading,
                'override_reason': override_reason,
            })

        try:
            reconciliation = close_shift(shift, end_readings_data, request.user)
            messages.success(request, f'تم إقفال المناوبة #{shift.id} بنجاح')
            return redirect('shift_detail', pk=pk)
        except ValueError as e:
            messages.error(request, str(e))

    return render(request, 'pages/shifts/shift_close.html', {
        'shift': shift,
        'readings': readings,
        'page_title': f'إقفال المناوبة #{shift.id}',
    })
```

- [ ] **Step 4: Create apps/shifts/forms.py**

```python
from django import forms
from .models import Shift, MeterReading


class ShiftForm(forms.ModelForm):
    class Meta:
        model = Shift
        fields = ['station', 'employee', 'island', 'date', 'start_time']


class MeterReadingForm(forms.ModelForm):
    class Meta:
        model = MeterReading
        fields = ['meter', 'start_reading', 'end_reading', 'override_reason', 'photo']
```

- [ ] **Step 5: Create apps/shifts/urls.py**

```python
from django.urls import path
from . import views

urlpatterns = [
    path('', views.shift_list, name='shift_list'),
    path('create/', views.shift_create, name='shift_create'),
    path('<int:pk>/', views.shift_detail, name='shift_detail'),
    path('<int:pk>/close/', views.shift_close, name='shift_close'),
]
```

- [ ] **Step 6: Create templates/pages/shifts/shift_list.html**

```html
{% extends 'base.html' %}

{% block content %}
<div class="flex items-center justify-between mb-6">
    <div class="flex gap-2">
        <a href="?status=open" class="px-3 py-1.5 rounded-lg text-sm {% if request.GET.status == 'open' %}bg-primary text-white{% else %}bg-gray-100 text-gray-700 hover:bg-gray-200{% endif %} transition-colors">مفتوحة</a>
        <a href="?status=closed" class="px-3 py-1.5 rounded-lg text-sm {% if request.GET.status == 'closed' %}bg-primary text-white{% else %}bg-gray-100 text-gray-700 hover:bg-gray-200{% endif %} transition-colors">مغلقة</a>
        <a href="?" class="px-3 py-1.5 rounded-lg text-sm {% if not request.GET.status %}bg-primary text-white{% else %}bg-gray-100 text-gray-700 hover:bg-gray-200{% endif %} transition-colors">الكل</a>
    </div>
    <a href="{% url 'shift_create' %}" class="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2">
        <i data-lucide="plus" class="w-4 h-4"></i>
        إنشاء مناوبة
    </a>
</div>

<div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
    <div class="overflow-x-auto">
        <table class="w-full text-sm">
            <thead class="bg-gray-50 border-b border-gray-200">
                <tr>
                    <th class="px-4 py-3 text-right font-medium text-gray-600">#</th>
                    <th class="px-4 py-3 text-right font-medium text-gray-600">المناوب</th>
                    <th class="px-4 py-3 text-right font-medium text-gray-600">المحطة</th>
                    <th class="px-4 py-3 text-right font-medium text-gray-600">الجزيرة</th>
                    <th class="px-4 py-3 text-right font-medium text-gray-600">التاريخ</th>
                    <th class="px-4 py-3 text-right font-medium text-gray-600">الوقت</th>
                    <th class="px-4 py-3 text-right font-medium text-gray-600">الحالة</th>
                    <th class="px-4 py-3 text-right font-medium text-gray-600">إجراءات</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
                {% for shift in shifts %}
                <tr class="hover:bg-gray-50 transition-colors">
                    <td class="px-4 py-3 font-medium">{{ shift.id }}</td>
                    <td class="px-4 py-3">{{ shift.employee.name }}</td>
                    <td class="px-4 py-3 text-gray-600">{{ shift.station.name }}</td>
                    <td class="px-4 py-3 text-gray-600">{{ shift.island.name }}</td>
                    <td class="px-4 py-3 text-gray-600" dir="ltr">{{ shift.date }}</td>
                    <td class="px-4 py-3 text-gray-600" dir="ltr">{{ shift.start_time|time:"H:i" }}</td>
                    <td class="px-4 py-3">
                        <span class="px-2 py-1 rounded-full text-xs {% if shift.status == 'open' %}bg-success/10 text-success{% elif shift.status == 'closed' %}bg-gray-100 text-gray-600{% else %}bg-warning/10 text-warning{% endif %}">
                            {{ shift.get_status_display }}
                        </span>
                    </td>
                    <td class="px-4 py-3 flex gap-2">
                        <a href="{% url 'shift_detail' pk=shift.pk %}" class="text-primary hover:text-primary/80 transition-colors">
                            <i data-lucide="eye" class="w-4 h-4"></i>
                        </a>
                        {% if shift.status == 'open' %}
                        <a href="{% url 'shift_close' pk=shift.pk %}" class="text-warning hover:text-warning/80 transition-colors">
                            <i data-lucide="lock" class="w-4 h-4"></i>
                        </a>
                        {% endif %}
                    </td>
                </tr>
                {% empty %}
                <tr>
                    <td colspan="8" class="px-4 py-8 text-center text-gray-500">لا توجد مناوبات</td>
                </tr>
                {% endfor %}
            </tbody>
        </table>
    </div>
</div>
{% endblock %}
```

- [ ] **Step 7: Create templates/pages/shifts/shift_close.html**

```html
{% extends 'base.html' %}
{% load humanize %}

{% block content %}
<div class="max-w-4xl mx-auto">
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold">إقفال المناوبة #{{ shift.id }}</h3>
            <a href="{% url 'shift_detail' pk=shift.pk %}" class="text-gray-500 hover:text-gray-700">
                <i data-lucide="x" class="w-5 h-5"></i>
            </a>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
                <span class="text-gray-500">المناوب:</span>
                <span class="font-medium">{{ shift.employee.name }}</span>
            </div>
            <div>
                <span class="text-gray-500">الجزيرة:</span>
                <span class="font-medium">{{ shift.island.name }}</span>
            </div>
            <div>
                <span class="text-gray-500">البداية:</span>
                <span class="font-medium" dir="ltr">{{ shift.start_time|time:"H:i" }}</span>
            </div>
            <div>
                <span class="text-gray-500">التاريخ:</span>
                <span class="font-medium" dir="ltr">{{ shift.date }}</span>
            </div>
        </div>
    </div>

    <form method="post">
        {% csrf_token %}
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h4 class="font-semibold mb-4">قراءات العدادات</h4>
            <div class="space-y-4">
                {% for reading in readings %}
                <div class="border border-gray-200 rounded-lg p-4">
                    <div class="flex items-center justify-between mb-3">
                        <span class="font-medium">عداد {{ reading.meter.code }} — {{ reading.meter.fuel_type }}</span>
                        <span class="text-sm text-gray-500">البداية: {{ reading.start_reading|intcomma }}</span>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label class="block text-sm text-gray-600 mb-1">القراءة النهائية</label>
                            <input type="number" step="0.001" name="end_reading_{{ reading.id }}" required
                                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                oninput="calculateLiters({{ reading.id }}, {{ reading.start_reading }})">
                        </div>
                        <div>
                            <label class="block text-sm text-gray-600 mb-1">اللترات</label>
                            <input type="text" id="liters_{{ reading.id }}" readonly
                                class="w-full border border-gray-200 rounded-lg px-3 py-2 bg-gray-50" value="0">
                        </div>
                        <div>
                            <label class="block text-sm text-gray-600 mb-1">سبب التعديل (إذا كان النهاية < البداية)</label>
                            <input type="text" name="override_reason_{{ reading.id }}"
                                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="اختياري">
                        </div>
                    </div>
                </div>
                {% endfor %}
            </div>
        </div>

        <div class="flex gap-3">
            <button type="submit" class="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors">
                إقفال المناوبة
            </button>
            <a href="{% url 'shift_detail' pk=shift.pk %}" class="px-6 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors">
                إلغاء
            </a>
        </div>
    </form>
</div>

<script>
function calculateLiters(readingId, startReading) {
    const endInput = document.querySelector(`[name="end_reading_${readingId}"]`);
    const litersInput = document.getElementById(`liters_${readingId}`);
    const end = parseFloat(endInput.value) || 0;
    const liters = end - startReading;
    litersInput.value = liters >= 0 ? liters.toFixed(3) : liters.toFixed(3);
    if (liters < 0) {
        litersInput.classList.add('text-danger');
    } else {
        litersInput.classList.remove('text-danger');
    }
}
</script>
{% endblock %}
```

- [ ] **Step 8: Run migrations and verify**

```bash
cd /root/projects/Sejel/sejel
python manage.py makemigrations shifts
python manage.py migrate
python manage.py shell -c "from apps.shifts.models import Shift, MeterReading; print('Shifts models OK')"
```

Expected: Shifts models OK

- [ ] **Step 9: Commit**

```bash
git add apps/shifts/ templates/pages/shifts/
git commit -m "feat: shift models, services, closing flow with meter readings"
```

---

### Task 6: Finance Models (Cash, Vouchers, POS, Reconciliation)

**Files:**
- Create: `sejel/apps/finance/__init__.py`
- Create: `sejel/apps/finance/apps.py`
- Create: `sejel/apps/finance/models.py`
- Create: `sejel/apps/finance/admin.py`
- Create: `sejel/apps/finance/forms.py`
- Create: `sejel/apps/finance/views.py`
- Create: `sejel/apps/finance/urls.py`
- Create: `sejel/apps/finance/migrations/__init__.py`
- Create: `sejel/templates/pages/finance/cash_list.html`
- Create: `sejel/templates/pages/finance/voucher_list.html`
- Create: `sejel/templates/pages/finance/pos_list.html`
- Create: `sejel/templates/pages/finance/reconciliation_detail.html`

**Steps:**

- [ ] **Step 1: Create apps/finance/models.py**

```python
from django.db import models
from django.contrib.auth.models import User
from apps.core.models import Station
from apps.shifts.models import Shift


class VoucherCategory(models.Model):
    name = models.CharField(max_length=50)
    value = models.DecimalField(max_digits=10, decimal_places=3)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'sejel_voucher_category'
        ordering = ['value']

    def __str__(self):
        return f"{self.name} - {self.value}"


class CashCollection(models.Model):
    shift = models.ForeignKey(Shift, on_delete=models.CASCADE, related_name='cash_collections')
    amount = models.DecimalField(max_digits=10, decimal_places=3)
    time = models.DateTimeField()
    received_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    reference = models.CharField(max_length=100, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'sejel_cash_collection'
        ordering = ['-time']

    def __str__(self):
        return f"Cash {self.amount} - Shift #{self.shift_id}"


class Voucher(models.Model):
    shift = models.ForeignKey(Shift, on_delete=models.CASCADE, related_name='vouchers')
    category = models.ForeignKey(VoucherCategory, on_delete=models.PROTECT)
    count = models.PositiveIntegerField()
    total_value = models.DecimalField(max_digits=10, decimal_places=3)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'sejel_voucher'

    def __str__(self):
        return f"Voucher {self.category.name} x{self.count}"


class POSRecord(models.Model):
    shift = models.ForeignKey(Shift, on_delete=models.CASCADE, related_name='pos_records')
    total_amount = models.DecimalField(max_digits=10, decimal_places=3)
    transaction_count = models.PositiveIntegerField(null=True, blank=True)
    notes = models.TextField(blank=True)
    entered_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'sejel_pos_record'

    def __str__(self):
        return f"POS {self.total_amount} - Shift #{self.shift_id}"


class ExpenseCategory(models.Model):
    name = models.CharField(max_length=100)
    station = models.ForeignKey(Station, on_delete=models.CASCADE, null=True, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'sejel_expense_category'

    def __str__(self):
        return self.name


class Expense(models.Model):
    PAYMENT_METHOD_CHOICES = [
        ('cash', 'نقدي'),
        ('voucher', 'كوبون'),
        ('other', 'أخرى'),
    ]
    STATUS_CHOICES = [
        ('pending', 'قيد الاعتماد'),
        ('approved', 'معتمد'),
        ('rejected', 'مرفوض'),
    ]

    station = models.ForeignKey(Station, on_delete=models.CASCADE, related_name='expenses')
    shift = models.ForeignKey(Shift, on_delete=models.SET_NULL, null=True, blank=True)
    category = models.ForeignKey(ExpenseCategory, on_delete=models.PROTECT)
    amount = models.DecimalField(max_digits=10, decimal_places=3)
    description = models.TextField()
    paid_to = models.CharField(max_length=200, blank=True)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES, default='cash')
    attachment = models.ImageField(upload_to='expenses/', null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'sejel_expense'
        ordering = ['-created_at']

    def __str__(self):
        return f"Expense {self.amount} - {self.category.name}"


class Reconciliation(models.Model):
    DIFFERENCE_CHOICES = [
        ('matched', 'مطابق'),
        ('surplus', 'فائض'),
        ('shortage', 'عجز'),
    ]
    STATUS_CHOICES = [
        ('draft', 'مسودة'),
        ('confirmed', 'مؤكد'),
    ]

    shift = models.OneToOneField(Shift, on_delete=models.CASCADE, related_name='reconciliation')
    total_liters = models.DecimalField(max_digits=12, decimal_places=3)
    expected_sales = models.DecimalField(max_digits=12, decimal_places=3)
    total_cash = models.DecimalField(max_digits=12, decimal_places=3, default=0)
    total_vouchers = models.DecimalField(max_digits=12, decimal_places=3, default=0)
    total_pos = models.DecimalField(max_digits=12, decimal_places=3, default=0)
    total_collection = models.DecimalField(max_digits=12, decimal_places=3)
    difference = models.DecimalField(max_digits=12, decimal_places=3)
    difference_type = models.CharField(max_length=20, choices=DIFFERENCE_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    confirmed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    confirmed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'sejel_reconciliation'

    def __str__(self):
        return f"Reconciliation - Shift #{self.shift_id} ({self.get_difference_type_display()})"
```

- [ ] **Step 2: Create apps/finance/admin.py**

```python
from django.contrib import admin
from .models import (
    VoucherCategory, CashCollection, Voucher, POSRecord,
    ExpenseCategory, Expense, Reconciliation
)


@admin.register(VoucherCategory)
class VoucherCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'value', 'is_active')


@admin.register(CashCollection)
class CashCollectionAdmin(admin.ModelAdmin):
    list_display = ('amount', 'time', 'shift', 'received_by')
    list_filter = ('shift__station',)


@admin.register(Voucher)
class VoucherAdmin(admin.ModelAdmin):
    list_display = ('category', 'count', 'total_value', 'shift')
    list_filter = ('category',)


@admin.register(POSRecord)
class POSRecordAdmin(admin.ModelAdmin):
    list_display = ('total_amount', 'transaction_count', 'shift')
    list_filter = ('shift__station',)


@admin.register(ExpenseCategory)
class ExpenseCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'station', 'is_active')


@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ('amount', 'category', 'station', 'status', 'created_at')
    list_filter = ('status', 'category', 'station')


@admin.register(Reconciliation)
class ReconciliationAdmin(admin.ModelAdmin):
    list_display = ('shift', 'total_liters', 'expected_sales', 'difference', 'difference_type', 'status')
    list_filter = ('difference_type', 'status')
```

- [ ] **Step 3: Create apps/finance/views.py**

```python
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from .models import CashCollection, Voucher, POSRecord, Reconciliation, Expense, ExpenseCategory
from .forms import CashCollectionForm, VoucherForm, POSRecordForm, ExpenseForm


@login_required
def cash_list(request):
    collections = CashCollection.objects.select_related('shift', 'received_by').all()
    return render(request, 'pages/finance/cash_list.html', {
        'collections': collections,
        'page_title': 'التحصيل النقدي',
    })


@login_required
def cash_create(request, shift_id):
    from apps.shifts.models import Shift
    shift = get_object_or_404(Shift, pk=shift_id)
    if request.method == 'POST':
        form = CashCollectionForm(request.POST)
        if form.is_valid():
            cash = form.save(commit=False)
            cash.shift = shift
            cash.received_by = request.user
            cash.save()
            return redirect('shift_detail', pk=shift_id)
    else:
        form = CashCollectionForm()
    return render(request, 'pages/finance/cash_form.html', {
        'form': form,
        'shift': shift,
        'page_title': 'إضافة تحصيل نقدي',
    })


@login_required
def voucher_list(request):
    vouchers = Voucher.objects.select_related('shift', 'category').all()
    return render(request, 'pages/finance/voucher_list.html', {
        'vouchers': vouchers,
        'page_title': 'الكوبونات',
    })


@login_required
def voucher_create(request, shift_id):
    from apps.shifts.models import Shift
    shift = get_object_or_404(Shift, pk=shift_id)
    if request.method == 'POST':
        form = VoucherForm(request.POST)
        if form.is_valid():
            voucher = form.save(commit=False)
            voucher.shift = shift
            voucher.total_value = voucher.category.value * voucher.count
            voucher.save()
            return redirect('shift_detail', pk=shift_id)
    else:
        form = VoucherForm()
    return render(request, 'pages/finance/voucher_form.html', {
        'form': form,
        'shift': shift,
        'page_title': 'إضافة كوبونات',
    })


@login_required
def pos_list(request):
    records = POSRecord.objects.select_related('shift', 'entered_by').all()
    return render(request, 'pages/finance/pos_list.html', {
        'records': records,
        'page_title': 'واصلات POS',
    })


@login_required
def pos_create(request, shift_id):
    from apps.shifts.models import Shift
    shift = get_object_or_404(Shift, pk=shift_id)
    if request.method == 'POST':
        form = POSRecordForm(request.POST)
        if form.is_valid():
            pos = form.save(commit=False)
            pos.shift = shift
            pos.entered_by = request.user
            pos.save()
            return redirect('shift_detail', pk=shift_id)
    else:
        form = POSRecordForm()
    return render(request, 'pages/finance/pos_form.html', {
        'form': form,
        'shift': shift,
        'page_title': 'إضافة POS',
    })


@login_required
def reconciliation_detail(request, shift_id):
    from apps.shifts.models import Shift
    shift = get_object_or_404(Shift, pk=shift_id)
    reconciliation = get_object_or_404(Reconciliation, shift=shift)
    return render(request, 'pages/finance/reconciliation_detail.html', {
        'reconciliation': reconciliation,
        'shift': shift,
        'page_title': f'المطابقة - المناوبة #{shift.id}',
    })


@login_required
def expense_list(request):
    expenses = Expense.objects.select_related('station', 'category', 'created_by').all()
    status = request.GET.get('status')
    if status:
        expenses = expenses.filter(status=status)
    return render(request, 'pages/finance/expense_list.html', {
        'expenses': expenses,
        'page_title': 'المصروفات',
    })


@login_required
def expense_create(request):
    if request.method == 'POST':
        form = ExpenseForm(request.POST, request.FILES)
        if form.is_valid():
            expense = form.save(commit=False)
            expense.created_by = request.user
            if request.user.profile.station:
                expense.station = request.user.profile.station
            expense.save()
            return redirect('expense_list')
    else:
        form = ExpenseForm()
    return render(request, 'pages/finance/expense_form.html', {
        'form': form,
        'page_title': 'إضافة مصروف',
    })


@login_required
def expense_approve(request, pk):
    expense = get_object_or_404(Expense, pk=pk)
    if request.method == 'POST':
        action = request.POST.get('action')
        if action == 'approve':
            expense.status = 'approved'
            expense.approved_by = request.user
        elif action == 'reject':
            expense.status = 'rejected'
            expense.approved_by = request.user
        expense.save()
    return redirect('expense_list')
```

- [ ] **Step 4: Create apps/finance/forms.py**

```python
from django import forms
from .models import CashCollection, Voucher, POSRecord, Expense


class CashCollectionForm(forms.ModelForm):
    class Meta:
        model = CashCollection
        fields = ['amount', 'time', 'reference', 'notes']


class VoucherForm(forms.ModelForm):
    class Meta:
        model = Voucher
        fields = ['category', 'count']


class POSRecordForm(forms.ModelForm):
    class Meta:
        model = POSRecord
        fields = ['total_amount', 'transaction_count', 'notes']


class ExpenseForm(forms.ModelForm):
    class Meta:
        model = Expense
        fields = ['station', 'shift', 'category', 'amount', 'description', 'paid_to', 'payment_method', 'attachment']
```

- [ ] **Step 5: Create apps/finance/urls.py**

```python
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
```

- [ ] **Step 6: Create templates/pages/finance/reconciliation_detail.html**

```html
{% extends 'base.html' %}
{% load humanize %}

{% block content %}
<div class="max-w-4xl mx-auto">
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h3 class="text-lg font-semibold mb-4">المطابقة المالية - المناوبة #{{ shift.id }}</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-6">
            <div>
                <span class="text-gray-500">المناوب:</span>
                <span class="font-medium">{{ shift.employee.name }}</span>
            </div>
            <div>
                <span class="text-gray-500">التاريخ:</span>
                <span class="font-medium" dir="ltr">{{ shift.date }}</span>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <h4 class="font-medium text-gray-700 mb-3">المبيعات المتوقعة</h4>
                <div class="space-y-2 text-sm">
                    <div class="flex justify-between">
                        <span class="text-gray-600">إجمالي اللترات:</span>
                        <span class="font-medium">{{ reconciliation.total_liters|intcomma }}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-600">المبيعات المتوقعة:</span>
                        <span class="font-medium">{{ reconciliation.expected_sales|intcomma }} د.ل</span>
                    </div>
                </div>
            </div>

            <div>
                <h4 class="font-medium text-gray-700 mb-3">إجمالي التحصيل</h4>
                <div class="space-y-2 text-sm">
                    <div class="flex justify-between">
                        <span class="text-gray-600">النقد:</span>
                        <span class="font-medium">{{ reconciliation.total_cash|intcomma }} د.ل</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-600">الكوبونات:</span>
                        <span class="font-medium">{{ reconciliation.total_vouchers|intcomma }} د.ل</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-600">POS:</span>
                        <span class="font-medium">{{ reconciliation.total_pos|intcomma }} د.ل</span>
                    </div>
                    <div class="border-t pt-2 flex justify-between font-medium">
                        <span>الإجمالي:</span>
                        <span>{{ reconciliation.total_collection|intcomma }} د.ل</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="mt-6 p-4 rounded-lg {% if reconciliation.difference_type == 'matched' %}bg-success/10{% elif reconciliation.difference_type == 'surplus' %}bg-warning/10{% else %}bg-danger/10{% endif %}">
            <div class="flex items-center justify-between">
                <span class="font-medium {% if reconciliation.difference_type == 'matched' %}text-success{% elif reconciliation.difference_type == 'surplus' %}text-warning{% else %}text-danger{% endif %}">
                    {{ reconciliation.get_difference_type_display }}
                </span>
                <span class="text-lg font-bold {% if reconciliation.difference_type == 'matched' %}text-success{% elif reconciliation.difference_type == 'surplus' %}text-warning{% else %}text-danger{% endif %}">
                    {{ reconciliation.difference|intcomma }} د.ل
                </span>
            </div>
        </div>
    </div>
</div>
{% endblock %}
```

- [ ] **Step 7: Run migrations and verify**

```bash
cd /root/projects/Sejel/sejel
python manage.py makemigrations finance
python manage.py migrate
python manage.py shell -c "from apps.finance.models import Reconciliation, CashCollection; print('Finance models OK')"
```

Expected: Finance models OK

- [ ] **Step 8: Commit**

```bash
git add apps/finance/ templates/pages/finance/
git commit -m "feat: finance models - cash, vouchers, POS, reconciliation, expenses"
```

---

### Task 7: Inventory Models & Views

**Files:**
- Create: `sejel/apps/inventory/__init__.py`
- Create: `sejel/apps/inventory/apps.py`
- Create: `sejel/apps/inventory/models.py`
- Create: `sejel/apps/inventory/admin.py`
- Create: `sejel/apps/inventory/forms.py`
- Create: `sejel/apps/inventory/views.py`
- Create: `sejel/apps/inventory/urls.py`
- Create: `sejel/apps/inventory/migrations/__init__.py`
- Create: `sejel/templates/pages/inventory/tank_list.html`
- Create: `sejel/templates/pages/inventory/delivery_list.html`
- Create: `sejel/templates/pages/inventory/delivery_form.html`

**Steps:**

- [ ] **Step 1: Create apps/inventory/models.py**

```python
from django.db import models
from django.contrib.auth.models import User
from apps.core.models import Station, Tank, FuelType


class Delivery(models.Model):
    STATUS_CHOICES = [
        ('ordered', 'تم الطلب'),
        ('received', 'تم الاستلام'),
        ('claimed', 'تم المطالبة'),
        ('settled', 'تمت التسوية'),
        ('closed', 'مغلقة'),
    ]

    station = models.ForeignKey(Station, on_delete=models.CASCADE, related_name='deliveries')
    tank = models.ForeignKey(Tank, on_delete=models.CASCADE)
    fuel_type = models.ForeignKey(FuelType, on_delete=models.PROTECT)
    requested_quantity = models.DecimalField(max_digits=10, decimal_places=3)
    expected_quantity = models.DecimalField(max_digits=10, decimal_places=3)
    received_quantity = models.DecimalField(max_digits=10, decimal_places=3, null=True, blank=True)
    shortage = models.DecimalField(max_digits=10, decimal_places=3, default=0)
    order_date = models.DateTimeField()
    arrival_date = models.DateTimeField(null=True, blank=True)
    pre_reading = models.DecimalField(max_digits=12, decimal_places=3, null=True, blank=True)
    post_reading = models.DecimalField(max_digits=12, decimal_places=3, null=True, blank=True)
    document_number = models.CharField(max_length=100, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ordered')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'sejel_delivery'
        ordering = ['-order_date']

    def __str__(self):
        return f"Delivery {self.id} - {self.fuel_type} ({self.station.name})"


class DeliveryDocument(models.Model):
    TYPE_CHOICES = [
        ('receipt', 'إيصال الاستلام'),
        ('proof_of_shortage', 'إثبات النقص'),
        ('other', 'أخرى'),
    ]

    delivery = models.ForeignKey(Delivery, on_delete=models.CASCADE, related_name='documents')
    document_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    file = models.ImageField(upload_to='delivery_documents/')
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'sejel_delivery_document'

    def __str__(self):
        return f"{self.get_document_type_display()} - Delivery {self.delivery_id}"


class ShortageClaim(models.Model):
    STATUS_CHOICES = [
        ('not_claimed', 'غير مطالَب بها'),
        ('claimed', 'مطالَب بها'),
        ('settled', 'تمت التسوية'),
        ('closed', 'مغلقة'),
    ]

    delivery = models.OneToOneField(Delivery, on_delete=models.CASCADE, related_name='shortage_claim')
    shortage_amount = models.DecimalField(max_digits=10, decimal_places=3)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='not_claimed')
    claim_date = models.DateTimeField(null=True, blank=True)
    settlement_date = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'sejel_shortage_claim'

    def __str__(self):
        return f"Shortage Claim - Delivery {self.delivery_id}"
```

- [ ] **Step 2: Create apps/inventory/admin.py**

```python
from django.contrib import admin
from .models import Delivery, DeliveryDocument, ShortageClaim


@admin.register(Delivery)
class DeliveryAdmin(admin.ModelAdmin):
    list_display = ('id', 'station', 'fuel_type', 'expected_quantity', 'received_quantity', 'shortage', 'status')
    list_filter = ('status', 'fuel_type', 'station')


@admin.register(DeliveryDocument)
class DeliveryDocumentAdmin(admin.ModelAdmin):
    list_display = ('delivery', 'document_type', 'uploaded_at')
    list_filter = ('document_type',)


@admin.register(ShortageClaim)
class ShortageClaimAdmin(admin.ModelAdmin):
    list_display = ('delivery', 'shortage_amount', 'status')
    list_filter = ('status',)
```

- [ ] **Step 3: Create apps/inventory/views.py**

```python
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from .models import Delivery, Tank
from .forms import DeliveryForm


@login_required
def tank_list(request):
    tanks = Tank.objects.select_related('station', 'fuel_type').all()
    station_id = request.GET.get('station')
    if station_id:
        tanks = tanks.filter(station_id=station_id)
    for tank in tanks:
        tank.level_percent = (tank.current_level / tank.capacity * 100) if tank.capacity > 0 else 0
    return render(request, 'pages/inventory/tank_list.html', {
        'tanks': tanks,
        'page_title': 'الخزانات',
    })


@login_required
def delivery_list(request):
    deliveries = Delivery.objects.select_related('station', 'fuel_type', 'tank').all()
    status = request.GET.get('status')
    if status:
        deliveries = deliveries.filter(status=status)
    return render(request, 'pages/inventory/delivery_list.html', {
        'deliveries': deliveries,
        'page_title': 'الشحنات',
    })


@login_required
def delivery_create(request):
    if request.method == 'POST':
        form = DeliveryForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('delivery_list')
    else:
        form = DeliveryForm()
    return render(request, 'pages/inventory/delivery_form.html', {
        'form': form,
        'page_title': 'إضافة شحنة',
    })


@login_required
def delivery_detail(request, pk):
    delivery = get_object_or_404(Delivery, pk=pk)
    shortage_claim = getattr(delivery, 'shortage_claim', None)
    return render(request, 'pages/inventory/delivery_detail.html', {
        'delivery': delivery,
        'shortage_claim': shortage_claim,
        'page_title': f'شحنة #{delivery.id}',
    })
```

- [ ] **Step 4: Create apps/inventory/urls.py**

```python
from django.urls import path
from . import views

urlpatterns = [
    path('tanks/', views.tank_list, name='tank_list'),
    path('deliveries/', views.delivery_list, name='delivery_list'),
    path('deliveries/create/', views.delivery_create, name='delivery_create'),
    path('deliveries/<int:pk>/', views.delivery_detail, name='delivery_detail'),
]
```

- [ ] **Step 5: Create templates/pages/inventory/tank_list.html**

```html
{% extends 'base.html' %}
{% load humanize %}

{% block content %}
<div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
    <div class="overflow-x-auto">
        <table class="w-full text-sm">
            <thead class="bg-gray-50 border-b border-gray-200">
                <tr>
                    <th class="px-4 py-3 text-right font-medium text-gray-600">الخزان</th>
                    <th class="px-4 py-3 text-right font-medium text-gray-600">المحطة</th>
                    <th class="px-4 py-3 text-right font-medium text-gray-600">الوقود</th>
                    <th class="px-4 py-3 text-right font-medium text-gray-600">المستوى</th>
                    <th class="px-4 py-3 text-right font-medium text-gray-600">السعة</th>
                    <th class="px-4 py-3 text-right font-medium text-gray-600">النسبة</th>
                    <th class="px-4 py-3 text-right font-medium text-gray-600">الحالة</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
                {% for tank in tanks %}
                <tr class="hover:bg-gray-50 transition-colors">
                    <td class="px-4 py-3 font-medium">{{ tank.name|default:tank.id }}</td>
                    <td class="px-4 py-3 text-gray-600">{{ tank.station.name }}</td>
                    <td class="px-4 py-3 text-gray-600">{{ tank.fuel_type }}</td>
                    <td class="px-4 py-3" dir="ltr">{{ tank.current_level|intcomma }}</td>
                    <td class="px-4 py-3 text-gray-600" dir="ltr">{{ tank.capacity|intcomma }}</td>
                    <td class="px-4 py-3">
                        <div class="flex items-center gap-2">
                            <div class="w-20 bg-gray-200 rounded-full h-2">
                                <div class="h-2 rounded-full {% if tank.level_percent > 50 %}bg-success{% elif tank.level_percent > 20 %}bg-warning{% else %}bg-danger{% endif %}" style="width: {{ tank.level_percent }}%"></div>
                            </div>
                            <span class="text-xs text-gray-500">{{ tank.level_percent|floatformat:0 }}%</span>
                        </div>
                    </td>
                    <td class="px-4 py-3">
                        {% if tank.level_percent < 20 %}
                        <span class="px-2 py-1 rounded-full text-xs bg-danger/10 text-danger">يحتاج طلب</span>
                        {% elif tank.level_percent < 50 %}
                        <span class="px-2 py-1 rounded-full text-xs bg-warning/10 text-warning">متوسط</span>
                        {% else %}
                        <span class="px-2 py-1 rounded-full text-xs bg-success/10 text-success">جيد</span>
                        {% endif %}
                    </td>
                </tr>
                {% empty %}
                <tr>
                    <td colspan="7" class="px-4 py-8 text-center text-gray-500">لا توجد خزانات</td>
                </tr>
                {% endfor %}
            </tbody>
        </table>
    </div>
</div>
{% endblock %}
```

- [ ] **Step 6: Run migrations and verify**

```bash
cd /root/projects/Sejel/sejel
python manage.py makemigrations inventory
python manage.py migrate
python manage.py shell -c "from apps.inventory.models import Delivery, ShortageClaim; print('Inventory models OK')"
```

Expected: Inventory models OK

- [ ] **Step 7: Commit**

```bash
git add apps/inventory/ templates/pages/inventory/
git commit -m "feat: inventory models - deliveries, shortages, documents"
```

---

### Task 8: Reports App

**Files:**
- Create: `sejel/apps/reports/__init__.py`
- Create: `sejel/apps/reports/apps.py`
- Create: `sejel/apps/reports/views.py`
- Create: `sejel/apps/reports/urls.py`
- Create: `sejel/templates/pages/reports/daily.html`
- Create: `sejel/templates/pages/reports/shift_report.html`
- Create: `sejel/templates/pages/reports/monthly.html`

**Steps:**

- [ ] **Step 1: Create apps/reports/views.py**

```python
from datetime import date, datetime
from decimal import Decimal
from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.db.models import Sum
from apps.shifts.models import Shift, MeterReading
from apps.finance.models import CashCollection, Voucher, POSRecord, Reconciliation, Expense
from apps.core.models import Station


@login_required
def report_daily(request):
    report_date = request.GET.get('date', date.today().isoformat())
    if isinstance(report_date, str):
        report_date = date.fromisoformat(report_date)

    shifts = Shift.objects.filter(date=report_date)
    station_id = request.GET.get('station')
    if station_id:
        shifts = shifts.filter(station_id=station_id)

    readings = MeterReading.objects.filter(shift__date=report_date)
    if station_id:
        readings = readings.filter(shift__station_id=station_id)

    total_liters = readings.aggregate(total=Sum('liters_sold'))['total'] or Decimal('0')
    total_cash = CashCollection.objects.filter(shift__date=report_date).aggregate(total=Sum('amount'))['total'] or Decimal('0')
    total_vouchers = Voucher.objects.filter(shift__date=report_date).aggregate(total=Sum('total_value'))['total'] or Decimal('0')
    total_pos = POSRecord.objects.filter(shift__date=report_date).aggregate(total=Sum('total_amount'))['total'] or Decimal('0')
    total_collection = total_cash + total_vouchers + total_pos
    total_expenses = Expense.objects.filter(
        created_at__date=report_date,
        status='approved'
    ).aggregate(total=Sum('amount'))['total'] or Decimal('0')

    context = {
        'report_date': report_date,
        'total_liters': total_liters,
        'total_cash': total_cash,
        'total_vouchers': total_vouchers,
        'total_pos': total_pos,
        'total_collection': total_collection,
        'total_expenses': total_expenses,
        'shifts': shifts,
        'page_title': 'التقرير اليومي',
    }
    return render(request, 'pages/reports/daily.html', context)


@login_required
def report_shift(request):
    shifts = Shift.objects.select_related('employee', 'island', 'station').all()
    station_id = request.GET.get('station')
    date_from = request.GET.get('date_from')
    date_to = request.GET.get('date_to')

    if station_id:
        shifts = shifts.filter(station_id=station_id)
    if date_from:
        shifts = shifts.filter(date__gte=date_from)
    if date_to:
        shifts = shifts.filter(date__lte=date_to)

    shift_data = []
    for shift in shifts:
        readings = shift.readings.all()
        liters = readings.aggregate(total=Sum('liters_sold'))['total'] or Decimal('0')
        cash = CashCollection.objects.filter(shift=shift).aggregate(total=Sum('amount'))['total'] or Decimal('0')
        vouchers = Voucher.objects.filter(shift=shift).aggregate(total=Sum('total_value'))['total'] or Decimal('0')
        pos = POSRecord.objects.filter(shift=shift).aggregate(total=Sum('total_amount'))['total'] or Decimal('0')
        collection = cash + vouchers + pos

        shift_data.append({
            'shift': shift,
            'liters': liters,
            'cash': cash,
            'vouchers': vouchers,
            'pos': pos,
            'collection': collection,
        })

    context = {
        'shift_data': shift_data,
        'page_title': 'تقرير المناوبات',
    }
    return render(request, 'pages/reports/shift_report.html', context)


@login_required
def report_monthly(request):
    today = date.today()
    month = int(request.GET.get('month', today.month))
    year = int(request.GET.get('year', today.year))

    shifts = Shift.objects.filter(date__month=month, date__year=year)
    station_id = request.GET.get('station')
    if station_id:
        shifts = shifts.filter(station_id=station_id)

    total_liters = MeterReading.objects.filter(
        shift__date__month=month, shift__date__year=year
    ).aggregate(total=Sum('liters_sold'))['total'] or Decimal('0')

    total_cash = CashCollection.objects.filter(
        shift__date__month=month, shift__date__year=year
    ).aggregate(total=Sum('amount'))['total'] or Decimal('0')

    total_vouchers = Voucher.objects.filter(
        shift__date__month=month, shift__date__year=year
    ).aggregate(total=Sum('total_value'))['total'] or Decimal('0')

    total_pos = POSRecord.objects.filter(
        shift__date__month=month, shift__date__year=year
    ).aggregate(total=Sum('total_amount'))['total'] or Decimal('0')

    total_collection = total_cash + total_vouchers + total_pos

    total_expenses = Expense.objects.filter(
        created_at__month=month, created_at__year=year, status='approved'
    ).aggregate(total=Sum('amount'))['total'] or Decimal('0')

    context = {
        'month': month,
        'year': year,
        'total_liters': total_liters,
        'total_cash': total_cash,
        'total_vouchers': total_vouchers,
        'total_pos': total_pos,
        'total_collection': total_collection,
        'total_expenses': total_expenses,
        'page_title': 'التقرير الشهري',
    }
    return render(request, 'pages/reports/monthly.html', context)
```

- [ ] **Step 2: Create apps/reports/urls.py**

```python
from django.urls import path
from . import views

urlpatterns = [
    path('daily/', views.report_daily, name='report_daily'),
    path('shift/', views.report_shift, name='report_shift'),
    path('monthly/', views.report_monthly, name='report_monthly'),
]
```

- [ ] **Step 3: Create templates/pages/reports/daily.html**

```html
{% extends 'base.html' %}
{% load humanize %}

{% block content %}
<div class="mb-6">
    <form method="get" class="flex gap-4 items-end">
        <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">التاريخ</label>
            <input type="date" name="date" value="{{ report_date|date:'Y-m-d' }}" class="border border-gray-300 rounded-lg px-3 py-2">
        </div>
        <button type="submit" class="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">عرض</button>
    </form>
</div>

<div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <p class="text-sm text-gray-500">إجمالي اللترات</p>
        <p class="text-2xl font-bold" dir="ltr">{{ total_liters|intcomma }}</p>
    </div>
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <p class="text-sm text-gray-500">النقد</p>
        <p class="text-2xl font-bold" dir="ltr">{{ total_cash|intcomma }} د.ل</p>
    </div>
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <p class="text-sm text-gray-500">الكوبونات</p>
        <p class="text-2xl font-bold" dir="ltr">{{ total_vouchers|intcomma }} د.ل</p>
    </div>
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <p class="text-sm text-gray-500">POS</p>
        <p class="text-2xl font-bold" dir="ltr">{{ total_pos|intcomma }} د.ل</p>
    </div>
</div>

<div class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <p class="text-sm text-gray-500">إجمالي التحصيل</p>
        <p class="text-2xl font-bold text-primary" dir="ltr">{{ total_collection|intcomma }} د.ل</p>
    </div>
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <p class="text-sm text-gray-500">المصروفات</p>
        <p class="text-2xl font-bold text-danger" dir="ltr">{{ total_expenses|intcomma }} د.ل</p>
    </div>
</div>

<div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
    <div class="px-4 py-3 border-b border-gray-200">
        <h3 class="font-semibold">المناوبات - {{ report_date }}</h3>
    </div>
    <div class="overflow-x-auto">
        <table class="w-full text-sm">
            <thead class="bg-gray-50 border-b border-gray-200">
                <tr>
                    <th class="px-4 py-3 text-right font-medium text-gray-600">#</th>
                    <th class="px-4 py-3 text-right font-medium text-gray-600">المناوب</th>
                    <th class="px-4 py-3 text-right font-medium text-gray-600">المحطة</th>
                    <th class="px-4 py-3 text-right font-medium text-gray-600">الجزيرة</th>
                    <th class="px-4 py-3 text-right font-medium text-gray-600">الحالة</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
                {% for shift in shifts %}
                <tr class="hover:bg-gray-50 transition-colors">
                    <td class="px-4 py-3">{{ shift.id }}</td>
                    <td class="px-4 py-3">{{ shift.employee.name }}</td>
                    <td class="px-4 py-3 text-gray-600">{{ shift.station.name }}</td>
                    <td class="px-4 py-3 text-gray-600">{{ shift.island.name }}</td>
                    <td class="px-4 py-3">
                        <span class="px-2 py-1 rounded-full text-xs {% if shift.status == 'open' %}bg-success/10 text-success{% else %}bg-gray-100 text-gray-600{% endif %}">
                            {{ shift.get_status_display }}
                        </span>
                    </td>
                </tr>
                {% empty %}
                <tr>
                    <td colspan="5" class="px-4 py-8 text-center text-gray-500">لا توجد مناوبات在这个日期</td>
                </tr>
                {% endfor %}
            </tbody>
        </table>
    </div>
</div>
{% endblock %}
```

- [ ] **Step 4: Verify reports work**

```bash
cd /root/projects/Sejel/sejel
python manage.py shell -c "from apps.reports.views import report_daily; print('Reports OK')"
```

Expected: Reports OK

- [ ] **Step 5: Commit**

```bash
git add apps/reports/ templates/pages/reports/
git commit -m "feat: reports app - daily, shift, monthly views"
```

---

### Task 9: Final Migrations, Demo Data & Launch

**Files:**
- Create: `sejel/apps/core/management/__init__.py`
- Create: `sejel/apps/core/management/commands/__init__.py`
- Create: `sejel/apps/core/management/commands/seed_demo.py`

**Steps:**

- [ ] **Step 1: Create management command for demo data**

```python
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sejel.settings')

import django
django.setup()

from datetime import date, time, timedelta
from decimal import Decimal
from django.contrib.auth.models import User
from apps.core.models import MarketingCompany, Station, Island, Machine, FuelType, Tank, Meter, FuelPrice, StationSettings, UserProfile
from apps.employees.models import Employee
from apps.finance.models import VoucherCategory, ExpenseCategory


def create_demo_data():
    print("Creating demo data...")

    admin_user = User.objects.get(username='admin')
    UserProfile.objects.get_or_create(user=admin_user, defaults={'role': 'admin'})

    company, _ = MarketingCompany.objects.get_or_create(
        name='الراحلة',
        defaults={'name_en': 'Alrahla'}
    )

    gasoline, _ = FuelType.objects.get_or_create(name='بنزين', defaults={'name_en': 'Gasoline'})
    diesel, _ = FuelType.objects.get_or_create(name='ديزل', defaults={'name_en': 'Diesel'})

    FuelPrice.objects.get_or_create(
        fuel_type=gasoline,
        effective_date=date.today(),
        defaults={
            'selling_price': Decimal('0.150'),
            'profit_margin': Decimal('0.045'),
            'is_active': True,
        }
    )
    FuelPrice.objects.get_or_create(
        fuel_type=diesel,
        effective_date=date.today(),
        defaults={
            'selling_price': Decimal('0.150'),
            'profit_margin': Decimal('0.045'),
            'is_active': True,
        }
    )

    station, _ = Station.objects.get_or_create(
        name='محطة بنغازي الجديدة',
        defaults={
            'address': 'بنغازي، شارع العروبة',
            'status': 'active',
            'relationship_type': 'owned',
            'marketing_company': company,
            'cash_collection_mode': 'during_shift',
            'target_cash_amount': Decimal('500'),
        }
    )

    StationSettings.objects.get_or_create(
        station=station,
        defaults={
            'islands_count': 2,
            'machines_per_island': 2,
            'meters_per_machine': 2,
            'tanks_count': 4,
            'cash_target_amount': Decimal('500'),
        }
    )

    for i in range(1, 3):
        island, _ = Island.objects.get_or_create(
            station=station, number=i,
            defaults={'name': f'الجزيرة {i}', 'status': 'active'}
        )
        for j in range(1, 3):
            machine, _ = Machine.objects.get_or_create(
                island=island, number=j,
                defaults={'name': f'الماكينة {j}'}
            )
            for k in range(1, 3):
                fuel = gasoline if k == 1 else diesel
                tank, _ = Tank.objects.get_or_create(
                    station=station, fuel_type=fuel,
                    defaults={
                        'name': f'خزان {fuel.name} {i}-{j}-{k}',
                        'capacity': Decimal('20000'),
                        'current_level': Decimal('12000'),
                    }
                )
                Meter.objects.get_or_create(
                    machine=machine, code=f'M{i}{j}{k}',
                    defaults={
                        'fuel_type': fuel,
                        'tank': tank,
                        'current_reading': Decimal('3000000'),
                    }
                )

    employee, _ = Employee.objects.get_or_create(
        station=station, name='أحمد محمد',
        defaults={'phone': '0912345678', 'status': 'active', 'shift_type': 'morning'}
    )
    Employee.objects.get_or_create(
        station=station, name='محمد علي',
        defaults={'phone': '0923456789', 'status': 'active', 'shift_type': 'evening'}
    )

    for name, value in [('5 د.ل', 5), ('6 د.ل', 6), ('8 د.ل', 8)]:
        VoucherCategory.objects.get_or_create(
            name=name,
            defaults={'value': Decimal(str(value)), 'is_active': True}
        )

    for name in ['ماء', 'أكل', 'وجبات الحراسة', 'سلفة موظف', 'أخرى']:
        ExpenseCategory.objects.get_or_create(
            name=name,
            defaults={'is_active': True}
        )

    print("Demo data created successfully!")


if __name__ == '__main__':
    create_demo_data()
```

- [ ] **Step 2: Run demo data script**

```bash
cd /root/projects/Sejel/sejel
python manage.py seed_demo
```

Expected: Demo data created successfully!

- [ ] **Step 3: Run all migrations**

```bash
cd /root/projects/Sejel/sejel
python manage.py makemigrations
python manage.py migrate
```

- [ ] **Step 4: Verify server starts**

```bash
cd /root/projects/Sejel/sejel
timeout 5 python manage.py runserver 0.0.0.0:8002 2>&1 || true
```

Expected: Starting development server at http://0.0.0.0:8002/

- [ ] **Step 5: Final commit**

```bash
git add .
git commit -m "feat: seed demo data and final migrations"
```

---

## Summary

| Task | Description | Models | Views |
|------|-------------|--------|-------|
| 1 | Project scaffold | - | - |
| 2 | Core models | 10 models | - |
| 3 | Auth, middleware, base template | - | 8 views |
| 4 | Employee models & views | 2 models | 3 views |
| 5 | Shift models & closing flow | 2 models | 4 views |
| 6 | Finance models & views | 7 models | 7 views |
| 7 | Inventory models & views | 3 models | 4 views |
| 8 | Reports app | 0 models | 3 views |
| 9 | Demo data & launch | - | - |

**Total:** 24 Django models, 29 views, 9 tasks
