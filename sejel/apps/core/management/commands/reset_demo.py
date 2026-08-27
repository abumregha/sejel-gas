"""Reset the database and seed fresh demo data.

Usage: python manage.py reset_demo

Creates:
  - 2 stations (بنغازي الجديدة, السراج)
  - Fuel types, prices, tanks, islands, machines, meters
  - 2 employees per station
  - Owner (superuser) + sysadmin (superuser)
  - 3 recurring shift definitions per station (morning/evening/night)
"""
from datetime import time
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.contrib.auth.models import User

from apps.core.models import (
    Station, StationSettings, Island, Machine, Meter,
    FuelType, FuelPrice, Tank, MarketingCompany, UserProfile,
)
from apps.employees.models import Employee
from apps.shifts.models import ShiftDefinition


FUEL_TYPES = [
    ('بنزين', 'Gasoline'),
    ('ديزل', 'Diesel'),
]

STATIONS = [
    ('محطة بنغazi الجديدة', 'شارع طرابلس - بنغازي', 'owned'),
    ('محطة السراج', 'شارع الشهداء - طرابلس', 'owned'),
]

DEFINITIONS = [
    ('المناوبة الصباحية', time(6, 0), time(14, 0)),
    ('المناوبة المسائية', time(14, 0), time(22, 0)),
    ('المناوبة الليلية', time(22, 0), time(6, 0)),
]

ALL_DAYS = '0,1,2,3,4,5,6'


class Command(BaseCommand):
    help = 'Reset database and seed fresh demo data (stations, users, shift definitions)'

    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING('Resetting all data...'))

        # ── Users ──
        # Owner (superuser, sees all stations)
        owner, _ = User.objects.get_or_create(
            username='owner',
            defaults={'first_name': 'المالك', 'is_staff': True, 'is_superuser': True},
        )
        owner.set_password('owner123')
        owner.is_active = True
        owner.is_staff = True
        owner.is_superuser = True
        owner.save()
        UserProfile.objects.get_or_create(user=owner, defaults={'role': 'admin'})
        self.stdout.write(self.style.SUCCESS('✅ owner / owner123 (مالك - كل المحطات)'))

        # Sys admin (superuser, full backend access)
        admin_user, _ = User.objects.get_or_create(
            username='admin',
            defaults={'first_name': 'مدير النظام', 'is_staff': True, 'is_superuser': True},
        )
        admin_user.set_password('admin123')
        admin_user.is_active = True
        admin_user.is_staff = True
        admin_user.is_superuser = True
        admin_user.save()
        self.stdout.write(self.style.SUCCESS('✅ admin / admin123 (مدير النظام)'))

        # ── Fuel types ──
        ft_map = {}
        for name_ar, name_en in FUEL_TYPES:
            ft, _ = FuelType.objects.get_or_create(name=name_ar, defaults={'name_en': name_en})
            ft_map[name_ar] = ft
        self.stdout.write(self.style.SUCCESS('✅ Fuel types: بنزين, ديزل'))

        # ── Stations ──
        station_objs = []
        for i, (name, address, rel) in enumerate(STATIONS):
            st, _ = Station.objects.get_or_create(
                name=name,
                defaults={'address': address, 'relationship_type': rel, 'status': 'active'},
            )
            StationSettings.objects.get_or_create(station=st)
            station_objs.append(st)
            self.stdout.write(self.style.SUCCESS(f'✅ Station: {name}'))

        # ── Fuel prices ──
        prices_data = [
            (ft_map['بنزين'], Decimal('0.480'), Decimal('0.080'), Decimal('0.400')),
            (ft_map['ديزل'], Decimal('0.350'), Decimal('0.050'), Decimal('0.300')),
        ]
        for ft, sell, margin, cost in prices_data:
            FuelPrice.objects.get_or_create(
                fuel_type=ft,
                effective_date='2026-01-01',
                defaults={
                    'selling_price': sell,
                    'profit_margin': margin,
                    'cost_per_liter': cost,
                    'is_active': True,
                },
            )
        self.stdout.write(self.style.SUCCESS('✅ Fuel prices set'))

        # ── Per-station setup ──
        labels = ['a', 'b']
        for i, station in enumerate(station_objs):
            label = labels[i] if i < len(labels) else str(i + 1)

            # Islands + machines + meters
            for island_num in range(1, 3):
                island, _ = Island.objects.get_or_create(
                    station=station, number=island_num,
                    defaults={'name': f'الجزيرة {island_num}', 'status': 'active'},
                )
                for machine_num in range(1, 3):
                    machine, _ = Machine.objects.get_or_create(
                        island=island, number=machine_num,
                        defaults={'name': f'المضخة {machine_num}'},
                    )
                    for fuel_ar in ['بنزين', 'ديزل']:
                        ft = ft_map[fuel_ar]
                        tank, _ = Tank.objects.get_or_create(
                            station=station, fuel_type=ft,
                            defaults={
                                'capacity': Decimal('20000'),
                                'current_level': Decimal('10000'),
                                'name': f'خزان {fuel_ar} {station.name}',
                            },
                        )
                        Meter.objects.get_or_create(
                            machine=machine,
                            code=f'{station.id}-{island_num}{machine_num}-{fuel_ar[:1]}',
                            defaults={'fuel_type': ft, 'tank': tank, 'status': 'active'},
                        )

            # Employees
            emp_ahmed, _ = Employee.objects.get_or_create(
                station=station, name='أحمد محمد',
                defaults={'phone': '0910000001', 'status': 'active', 'shift_type': 'morning'},
            )
            emp_mohamed, _ = Employee.objects.get_or_create(
                station=station, name='محمد علي',
                defaults={'phone': '0910000002', 'status': 'active', 'shift_type': 'evening'},
            )

            # Shift definitions
            for order, (name, start_t, end_t) in enumerate(DEFINITIONS):
                default_emp = emp_ahmed if order == 0 else (emp_mohamed if order == 1 else None)
                ShiftDefinition.objects.get_or_create(
                    station=station, name=name,
                    defaults={
                        'start_time': start_t,
                        'end_time': end_t,
                        'days': ALL_DAYS,
                        'default_employee': default_emp,
                        'display_order': order,
                        'is_active': True,
                        'description': f'{name} - تتكرر كل أيام الأسبوع',
                    },
                )

            # Per-station users
            sup, _ = User.objects.get_or_create(
                username=f'supervisor_{label}',
                defaults={'first_name': f'مشرف {station.name}'},
            )
            sup.set_password('super123')
            sup.save()
            p, _ = UserProfile.objects.get_or_create(user=sup, defaults={'role': 'manager'})
            p.station = station
            p.save()

            fin, _ = User.objects.get_or_create(
                username=f'finance_{label}',
                defaults={'first_name': f'مالي {station.name}'},
            )
            fin.set_password('fin123')
            fin.save()
            p2, _ = UserProfile.objects.get_or_create(user=fin, defaults={'role': 'finance'})
            p2.station = station
            p2.save()

            self.stdout.write(self.style.SUCCESS(
                f'  ✅ {station.name}: islands, machines, meters, tanks, employees, shift defs\n'
                f'     supervisor_{label} / super123 | finance_{label} / fin123'
            ))

        self.stdout.write(self.style.SUCCESS('\n🎉 Demo data ready!'))
        self.stdout.write(self.style.SUCCESS('   owner / owner123     → مالك (كل المحطات)'))
        self.stdout.write(self.style.SUCCESS('   admin / admin123      → مدير النظام'))
        self.stdout.write(self.style.SUCCESS('   supervisor_a / super123 → مشرف بنغازي'))
        self.stdout.write(self.style.SUCCESS('   finance_a / fin123      → مالي بنغازي'))
        self.stdout.write(self.style.SUCCESS('   supervisor_b / super123 → مشرف السراج'))
        self.stdout.write(self.style.SUCCESS('   finance_b / fin123      → مالي السراج'))
