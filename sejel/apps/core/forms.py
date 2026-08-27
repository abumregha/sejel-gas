from django import forms
from .models import (Station, FuelType, FuelPrice, MarketingCompany, Island,
                     Machine, Meter, StationSettings)
from apps.finance.models import VoucherCategory, ExpenseCategory


INPUT_CLASS = 'w-full border border-gray-300 rounded-lg px-4 py-2.5'

ROLE_CHOICES = [
    ('supervisor', 'مشرف محطة'),
    ('manager', 'مدير محطة'),
    ('finance', 'المالي'),
    ('admin', 'مالك / مدير النظام'),
]


class UserForm(forms.Form):
    """Create/edit system users (sysadmin only)."""
    username = forms.CharField(label='اسم المستخدم', max_length=150,
                               widget=forms.TextInput(attrs={'class': INPUT_CLASS, 'dir': 'ltr'}))
    first_name = forms.CharField(label='الاسم', max_length=150,
                                 widget=forms.TextInput(attrs={'class': INPUT_CLASS}))
    last_name = forms.CharField(label='اللقب', required=False, max_length=150,
                                widget=forms.TextInput(attrs={'class': INPUT_CLASS}))
    email = forms.EmailField(label='البريد الإلكتروني', required=False,
                             widget=forms.EmailInput(attrs={'class': INPUT_CLASS, 'dir': 'ltr'}))
    password = forms.CharField(label='كلمة المرور', required=False, strip=False,
                               widget=forms.PasswordInput(attrs={'class': INPUT_CLASS, 'dir': 'ltr'}),
                               help_text='اتركها فارغة عند التعديل للإبقاء على كلمة المرور الحالية')
    role = forms.ChoiceField(label='الدور / الصلاحية', choices=ROLE_CHOICES,
                             widget=forms.Select(attrs={'class': INPUT_CLASS}))
    station = forms.ModelChoiceField(label='المحطة', queryset=None, required=False,
                                     widget=forms.Select(attrs={'class': INPUT_CLASS}),
                                     help_text='مطلوبة للمشرف والمدير والمالي - اتركها فارغة للمالك')
    phone = forms.CharField(label='الهاتف', required=False, max_length=20,
                            widget=forms.TextInput(attrs={'class': INPUT_CLASS, 'dir': 'ltr'}))
    is_active = forms.BooleanField(label='نشط', initial=True, required=False)

    def __init__(self, *args, instance=None, **kwargs):
        from .models import Station
        super().__init__(*args, **kwargs)
        self.instance = instance
        self.fields['station'].queryset = Station.objects.all()
        if instance:
            self.initial.update({
                'username': instance.username,
                'first_name': instance.first_name,
                'last_name': instance.last_name,
                'email': instance.email,
                'is_active': instance.is_active,
                **({'role': instance.profile.role} if hasattr(instance, 'profile') else {}),
                **({'station': instance.profile.station} if getattr(instance, 'profile', None) and instance.profile.station else {}),
                **({'phone': instance.profile.phone} if hasattr(instance, 'profile') else {}),
            })

    def clean_username(self):
        from django.contrib.auth.models import User
        username = self.cleaned_data['username'].strip()
        qs = User.objects.filter(username=username)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise forms.ValidationError('اسم المستخدم مستخدم بالفعل')
        return username

    def clean(self):
        cleaned = super().clean()
        if not self.instance and not cleaned.get('password'):
            self.add_error('password', 'كلمة المرور مطلوبة عند إنشاء مستخدم جديد')
        if cleaned.get('role') in ('supervisor', 'manager', 'finance') and not cleaned.get('station'):
            self.add_error('station', 'هذا الدور يتطلب اختيار المحطة')
        return cleaned

    def save(self):
        from django.contrib.auth.models import User
        from .models import UserProfile
        data = self.cleaned_data
        user = self.instance or User(username=data['username'])
        user.username = data['username']
        user.first_name = data['first_name']
        user.last_name = data['last_name']
        user.email = data['email']
        user.is_active = data.get('is_active', False)
        if data['role'] == 'admin':
            user.is_staff = True
        if data.get('password'):
            user.set_password(data['password'])
        user.save()
        profile, _ = UserProfile.objects.get_or_create(user=user)
        profile.role = data['role']
        profile.station = data.get('station') or None
        profile.phone = data.get('phone', '')
        profile.save()
        return user


class StationForm(forms.ModelForm):
    class Meta:
        model = Station
        fields = ['name', 'address', 'status', 'relationship_type', 'marketing_company',
                  'cash_collection_mode', 'target_cash_amount', 'photo_meter_required']
        widgets = {
            'name': forms.TextInput(attrs={'class': INPUT_CLASS}),
            'address': forms.Textarea(attrs={'class': INPUT_CLASS, 'rows': 3}),
            'status': forms.Select(attrs={'class': INPUT_CLASS}),
            'relationship_type': forms.Select(attrs={'class': INPUT_CLASS}),
            'marketing_company': forms.Select(attrs={'class': INPUT_CLASS}),
            'cash_collection_mode': forms.Select(attrs={'class': INPUT_CLASS}),
            'target_cash_amount': forms.NumberInput(attrs={'class': INPUT_CLASS}),
        }


class FuelTypeForm(forms.ModelForm):
    class Meta:
        model = FuelType
        fields = ['name', 'name_en']
        widgets = {
            'name': forms.TextInput(attrs={'class': INPUT_CLASS}),
            'name_en': forms.TextInput(attrs={'class': INPUT_CLASS}),
        }


class FuelPriceForm(forms.ModelForm):
    class Meta:
        model = FuelPrice
        fields = ['fuel_type', 'selling_price', 'profit_margin', 'cost_per_liter', 'effective_date', 'is_active']
        widgets = {
            'fuel_type': forms.Select(attrs={'class': INPUT_CLASS}),
            'selling_price': forms.NumberInput(attrs={'class': INPUT_CLASS, 'step': '0.001'}),
            'profit_margin': forms.NumberInput(attrs={'class': INPUT_CLASS, 'step': '0.001'}),
            'cost_per_liter': forms.NumberInput(attrs={'class': INPUT_CLASS, 'step': '0.001'}),
            'effective_date': forms.DateInput(attrs={'class': INPUT_CLASS, 'type': 'date'}),
        }


class VoucherCategoryForm(forms.ModelForm):
    class Meta:
        model = VoucherCategory
        fields = ['name', 'value', 'is_active']
        widgets = {
            'name': forms.TextInput(attrs={'class': INPUT_CLASS}),
            'value': forms.NumberInput(attrs={'class': INPUT_CLASS, 'step': '0.001'}),
        }


class ExpenseCategoryForm(forms.ModelForm):
    class Meta:
        model = ExpenseCategory
        fields = ['name', 'station', 'is_active']
        widgets = {
            'name': forms.TextInput(attrs={'class': INPUT_CLASS}),
            'station': forms.Select(attrs={'class': INPUT_CLASS}),
        }


class MarketingCompanyForm(forms.ModelForm):
    class Meta:
        model = MarketingCompany
        fields = ['name', 'name_en']
        widgets = {
            'name': forms.TextInput(attrs={'class': INPUT_CLASS}),
            'name_en': forms.TextInput(attrs={'class': INPUT_CLASS}),
        }


class IslandForm(forms.ModelForm):
    class Meta:
        model = Island
        fields = ['station', 'name', 'number', 'status']
        widgets = {
            'station': forms.Select(attrs={'class': INPUT_CLASS}),
            'name': forms.TextInput(attrs={'class': INPUT_CLASS}),
            'number': forms.NumberInput(attrs={'class': INPUT_CLASS}),
            'status': forms.Select(attrs={'class': INPUT_CLASS}),
        }


class MachineForm(forms.ModelForm):
    class Meta:
        model = Machine
        fields = ['island', 'name', 'number']
        widgets = {
            'island': forms.Select(attrs={'class': INPUT_CLASS}),
            'name': forms.TextInput(attrs={'class': INPUT_CLASS}),
            'number': forms.NumberInput(attrs={'class': INPUT_CLASS}),
        }


class MeterForm(forms.ModelForm):
    class Meta:
        model = Meter
        fields = ['machine', 'code', 'fuel_type', 'tank', 'current_reading', 'status']
        widgets = {
            'machine': forms.Select(attrs={'class': INPUT_CLASS}),
            'code': forms.TextInput(attrs={'class': INPUT_CLASS}),
            'fuel_type': forms.Select(attrs={'class': INPUT_CLASS}),
            'tank': forms.Select(attrs={'class': INPUT_CLASS}),
            'current_reading': forms.NumberInput(attrs={'class': INPUT_CLASS, 'step': '0.001'}),
            'status': forms.Select(attrs={'class': INPUT_CLASS}),
        }


class StationSettingsForm(forms.ModelForm):
    class Meta:
        model = StationSettings
        fields = ['islands_count', 'machines_per_island', 'meters_per_machine',
                  'tanks_count', 'cash_target_amount', 'photo_meter_required']
        widgets = {
            'islands_count': forms.NumberInput(attrs={'class': INPUT_CLASS}),
            'machines_per_island': forms.NumberInput(attrs={'class': INPUT_CLASS}),
            'meters_per_machine': forms.NumberInput(attrs={'class': INPUT_CLASS}),
            'tanks_count': forms.NumberInput(attrs={'class': INPUT_CLASS}),
            'cash_target_amount': forms.NumberInput(attrs={'class': INPUT_CLASS, 'step': '0.001'}),
        }
