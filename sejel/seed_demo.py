import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sejel.settings')

import django
django.setup()

from datetime import date
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

    Employee.objects.get_or_create(
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
