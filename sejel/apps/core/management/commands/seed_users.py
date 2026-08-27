"""Seed role-based demo users and recurring shift definitions.

Usage: python manage.py seed_users

Creates (if missing):
    owner        -> Station Owner  (sees all stations)
    supervisor_a -> Supervisor of the 1st station
    finance_a    -> Finance of the 1st station
    supervisor_b / finance_b -> same for the 2nd station (if present)
Plus Morning/Evening/Night recurring shift definitions per station.
"""
from datetime import time
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.contrib.auth.models import User

from apps.core.models import Station, UserProfile, FuelType, Tank, Meter
from apps.employees.models import Employee
from apps.shifts.models import ShiftDefinition

ALL_DAYS = '0,1,2,3,4,5,6'

DEFINITIONS = [
    ('المناوبة الصباحية', time(6, 0), time(14, 0), 'morning'),
    ('المناوبة المسائية', time(14, 0), time(22, 0), 'evening'),
    ('المناوبة الليلية', time(22, 0), time(6, 0), 'full_day'),
]


class Command(BaseCommand):
    help = 'Create owner/supervisor/finance users and recurring shift definitions'

    def handle(self, *args, **options):
        stations = list(Station.objects.order_by('id'))

        if not stations:
            self.stdout.write(self.style.ERROR('لا توجد محطات - أنشئ محطة أولاً'))
            return

        # Owner — full superuser so they can manage users + all admin features
        owner, created = User.objects.get_or_create(
            username='owner',
            defaults={'first_name': 'المالك', 'is_staff': True, 'is_superuser': True},
        )
        owner.set_password('owner123')
        owner.is_active = True
        owner.is_staff = True
        owner.is_superuser = True
        owner.save()
        UserProfile.objects.get_or_create(user=owner, defaults={'role': 'admin'})
        self.stdout.write(self.style.SUCCESS('owner / owner123  (مالك - كل المحطات)'))

        # Per-station supervisor + finance + employees + shift definitions
        labels = ['a', 'b']
        for i, station in enumerate(stations[:2]):
            suffix = labels[i] if i < len(labels) else str(i + 1)

            sup, _ = User.objects.get_or_create(
                username=f'supervisor_{suffix}',
                defaults={'first_name': f'مشرف {station.name}'},
            )
            sup.set_password('super123')
            sup.save()
            profile, _ = UserProfile.objects.get_or_create(user=sup, defaults={'role': 'manager'})
            profile.station = station
            profile.save()
            self.stdout.write(self.style.SUCCESS(f'supervisor_{suffix} / super123  (مشرف - {station.name})'))

            fin, _ = User.objects.get_or_create(
                username=f'finance_{suffix}',
                defaults={'first_name': f'مالي {station.name}'},
            )
            fin.set_password('fin123')
            fin.save()
            profile, _ = UserProfile.objects.get_or_create(user=fin, defaults={'role': 'finance'})
            profile.station = station
            profile.save()
            self.stdout.write(self.style.SUCCESS(f'finance_{suffix} / fin123  (مالي - {station.name})'))

            # employees for attendant pickers
            if not station.employees.exists():
                Employee.objects.create(station=station, name='أحمد محمد', phone='0910000001',
                                        status='active', shift_type='morning')
                Employee.objects.create(station=station, name='محمد علي', phone='0910000002',
                                        status='active', shift_type='evening')

            # recurring shift definitions
            gasoline = FuelType.objects.filter(name='بنزين').first() or FuelType.objects.first()
            tank = Tank.objects.filter(station=station).first()
            if not tank and gasoline:
                tank = Tank.objects.create(station=station, fuel_type=gasoline,
                                           capacity=Decimal('20000'), current_level=Decimal('10000'),
                                           name=f'خزان رئيسي {station.name}')
            has_meters = Meter.objects.filter(machine__island__station=station).exists()
            if not has_meters and tank:
                from apps.core.models import Island, Machine
                island = station.islands.first() or Island.objects.create(
                    station=station, number=1, name='الجزيرة 1')
                machine = island.machines.first() or Machine.objects.create(
                    island=island, number=1, name='الماكينة 1')
                Meter.objects.create(machine=machine, code=f'M-{station.id}-1',
                                     fuel_type=tank.fuel_type, tank=tank)

            for order, (name, start_t, end_t, shift_type) in enumerate(DEFINITIONS):
                default_emp = None
                if station.employees.exists():
                    match = {'morning': 0, 'evening': 1}.get(shift_type)
                    emps = list(station.employees.order_by('id'))
                    if match is not None and match < len(emps):
                        default_emp = emps[match]
                ShiftDefinition.objects.get_or_create(
                    station=station, name=name,
                    defaults={
                        'start_time': start_t, 'end_time': end_t, 'days': ALL_DAYS,
                        'default_employee': default_emp, 'display_order': order,
                        'description': f'{name} - تتكرر كل أيام الأسبوع',
                    },
                )
            self.stdout.write(self.style.SUCCESS(f'  تعريفات المناوبات جاهزة لـ: {station.name}'))

        self.stdout.write(self.style.SUCCESS('\nتم إنشاء المستخدمين بنجاح'))
