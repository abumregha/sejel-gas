from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.db import transaction
from django.db.models import Sum
from django.utils import timezone
from .models import (Station, FuelType, FuelPrice, MarketingCompany, Island,
                     Machine, Meter, Tank, StationSettings)
from .forms import (StationForm, FuelTypeForm, FuelPriceForm, VoucherCategoryForm,
                    MarketingCompanyForm, IslandForm, MachineForm, MeterForm, StationSettingsForm,
                    UserForm)
from .permissions import (require_roles, require_staff, ensure_station_access,
                          safe_delete, describe_blockers, user_has_records, is_owner,
                          user_station, OWNER_ROLES, OPS_ROLES, FIN_OPS_ROLES,
                          count_dependents, station_has_financial_data)
from .audit import log_change, get_client_ip
from apps.finance.models import VoucherCategory, ExpenseCategory
from apps.core.forms import ExpenseCategoryForm


def limit_form_to_station(form, user):
    """Restrict FK choices in a form to the user's own station."""
    from apps.core.models import Station, Island, Machine, Tank
    st = user_station(user)
    if is_owner(user) or st is None:
        return
    if 'station' in form.fields:
        form.fields['station'].queryset = Station.objects.filter(pk=st.pk)
    if 'island' in form.fields:
        form.fields['island'].queryset = Island.objects.filter(station=st)
    if 'machine' in form.fields:
        form.fields['machine'].queryset = Machine.objects.filter(island__station=st)
    if 'tank' in form.fields:
        form.fields['tank'].queryset = Tank.objects.filter(station=st)


@login_required
def dashboard(request):
    today = timezone.now().date()
    month_start = today.replace(day=1)

    from apps.employees.models import Employee
    from apps.shifts.models import Shift
    from apps.finance.models import CashCollection, Voucher, POSRecord, Expense
    from apps.inventory.models import Delivery

    shifts_qs = Shift.objects.all()
    deliveries_qs = Delivery.objects.all()
    employees_qs = Employee.objects.all()
    if not is_owner(request.user):
        st = user_station(request.user)
        if st:
            shifts_qs = shifts_qs.filter(station=st)
            deliveries_qs = deliveries_qs.filter(station=st)
            employees_qs = employees_qs.filter(station=st)

    stations_count = Station.objects.filter(status='active').count() if is_owner(request.user) else 1
    employees_count = employees_qs.filter(status='active').count()
    today_shifts = shifts_qs.filter(date=today).count()
    open_shifts = shifts_qs.filter(status__in=['open', 'in_progress']).count()
    today_collections = CashCollection.objects.filter(shift__date=today, is_cancelled=False).filter(shift__in=shifts_qs).aggregate(total=Sum('amount'))['total'] or 0
    today_vouchers = Voucher.objects.filter(shift__date=today, is_cancelled=False).filter(shift__in=shifts_qs).aggregate(total=Sum('total_value'))['total'] or 0
    today_pos = POSRecord.objects.filter(shift__date=today, is_cancelled=False).filter(shift__in=shifts_qs).aggregate(total=Sum('total_amount'))['total'] or 0
    expenses_qs = Expense.objects.filter(created_at__date=today, status='approved')
    if not is_owner(request.user):
        st = user_station(request.user)
        if st:
            expenses_qs = expenses_qs.filter(station=st)
    today_expenses = expenses_qs.aggregate(total=Sum('amount'))['total'] or 0
    pending_expenses = expenses_qs.model.objects.filter(status='pending').count()
    recent_shifts = shifts_qs.select_related('employee', 'station', 'definition').order_by('-date', '-start_time')[:5]
    recent_deliveries = deliveries_qs.select_related('station', 'fuel_type').order_by('-order_date')[:5]

    # per-station summary for owners
    station_summary = []
    if is_owner(request.user):
        for st in Station.objects.filter(status='active'):
            st_shifts = Shift.objects.filter(station=st, date=today)
            liters = sum(s.readings.aggregate(t=Sum('liters_sold'))['t'] or 0 for s in st_shifts)
            cash = CashCollection.objects.filter(shift__station=st, shift__date=today, is_cancelled=False).aggregate(t=Sum('amount'))['t'] or 0
            vouchers = Voucher.objects.filter(shift__station=st, shift__date=today, is_cancelled=False).aggregate(t=Sum('total_value'))['t'] or 0
            pos = POSRecord.objects.filter(shift__station=st, shift__date=today, is_cancelled=False).aggregate(t=Sum('total_amount'))['t'] or 0
            expenses = Expense.objects.filter(station=st, created_at__date=today, status='approved', ).aggregate(t=Sum('amount'))['t'] or 0
            station_summary.append({
                'station': st, 'liters': liters, 'cash': cash,
                'vouchers': vouchers, 'pos': pos,
                'collection': cash + vouchers + pos, 'expenses': expenses,
            })

    return render(request, 'pages/dashboard.html', {
        'page_title': 'لوحة التحكم',
        'stations_count': stations_count,
        'employees_count': employees_count,
        'today_shifts': today_shifts,
        'open_shifts': open_shifts,
        'today_collections': today_collections,
        'today_vouchers': today_vouchers,
        'today_pos': today_pos,
        'today_expenses': today_expenses,
        'pending_expenses': pending_expenses,
        'recent_shifts': recent_shifts,
        'recent_deliveries': recent_deliveries,
        'station_summary': station_summary,
    })


def simple_logout(request):
    """Logout on both GET and POST, then redirect to login page."""
    from django.contrib.auth import logout
    logout(request)
    return redirect('login')


@login_required
def user_guide(request):
    return render(request, 'pages/guide.html', {'page_title': 'دليل الاستخدام'})


# ---------------- User management (System Admin only) ----------------

@require_staff
def users_list(request):
    from django.contrib.auth.models import User
    users = User.objects.select_related('profile', 'profile__station').order_by('username')
    return render(request, 'pages/users/list.html', {'users': users, 'page_title': 'المستخدمون والصلاحيات'})


@require_staff
def user_create(request):
    if request.method == 'POST':
        form = UserForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, 'تم إنشاء المستخدم بنجاح')
            return redirect('users_list')
    else:
        form = UserForm()
    return render(request, 'pages/users/form.html', {'form': form, 'page_title': 'إضافة مستخدم'})


@require_staff
def user_edit(request, pk):
    from django.contrib.auth.models import User
    user = get_object_or_404(User, pk=pk)
    if request.method == 'POST':
        form = UserForm(request.POST, instance=user)
        if form.is_valid():
            form.save()
            messages.success(request, 'تم تعديل المستخدم بنجاح')
            return redirect('users_list')
    else:
        form = UserForm(instance=user)
    return render(request, 'pages/users/form.html', {'form': form, 'target_user': user,
                                                     'page_title': 'تعديل مستخدم'})


@require_staff
def user_delete(request, pk):
    from django.contrib.auth.models import User
    user = get_object_or_404(User, pk=pk)
    if user == request.user:
        messages.error(request, 'لا يمكنك حذف حسابك الخاص')
        return redirect('users_list')
    if request.method == 'POST':
        if user_has_records(user):
            # audit trail must survive: disable instead of deleting
            user.is_active = False
            user.save(update_fields=['is_active'])
            messages.error(request,
                f'لا يمكن حذف "{user.username}" لوجود سجلات مرتبطة به. '
                'تم تعطيل الحساب بدلاً من حذفه حفاظاً على سجل التدقيق.')
        else:
            ok, blockers = safe_delete(user)
            if ok:
                messages.success(request, f'تم حذف المستخدم "{user.username}" بنجاح')
            else:
                user.is_active = False
                user.save(update_fields=['is_active'])
                messages.error(request,
                    f'لا يمكن حذف "{user.username}" لوجود سجلات مرتبطة به ({describe_blockers(blockers)}). '
                    'تم تعطيل الحساب بدلاً من حذفه.')
        return redirect('users_list')
    return render(request, 'pages/settings/confirm_delete.html', {'object': user, 'cancel_url': 'users_list'})


@require_staff
def user_toggle_active(request, pk):
    from django.contrib.auth.models import User
    user = get_object_or_404(User, pk=pk)
    if user != request.user:
        user.is_active = not user.is_active
        user.save(update_fields=['is_active'])
        status = 'تفعيل' if user.is_active else 'تعطيل'
        messages.success(request, f'تم {status} المستخدم "{user.username}"')
    return redirect('users_list')


# ---------------- Stations (Owner only) ----------------

@require_roles(OWNER_ROLES)
def station_list(request):
    stations = Station.objects.all()
    return render(request, 'pages/stations/list.html', {'stations': stations})


@require_roles(OWNER_ROLES)
def station_create(request):
    if request.method == 'POST':
        form = StationForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, 'تم إضافة المحطة بنجاح')
            return redirect('station_list')
    else:
        form = StationForm()
    return render(request, 'pages/stations/form.html', {'form': form})


@require_roles(OWNER_ROLES)
def station_detail(request, pk):
    station = get_object_or_404(Station, pk=pk)
    ensure_station_access(request.user, station)
    return render(request, 'pages/stations/detail.html', {'station': station})


@require_roles(OWNER_ROLES)
def station_edit(request, pk):
    station = get_object_or_404(Station, pk=pk)
    if request.method == 'POST':
        form = StationForm(request.POST, instance=station)
        if form.is_valid():
            form.save()
            messages.success(request, 'تم تعديل المحطة بنجاح')
            return redirect('station_detail', pk=pk)
    else:
        form = StationForm(instance=station)
    return render(request, 'pages/stations/form.html', {'form': form, 'station': station})


@require_roles(OWNER_ROLES)
def station_delete(request, pk):
    station = get_object_or_404(Station, pk=pk)
    ensure_station_access(request.user, station)
    dependents = count_dependents(station)
    has_financial = station_has_financial_data(station)

    if request.method == 'POST':
        if has_financial:
            messages.error(request,
                f'لا يمكن حذف المحطة "{station.name}" لوجود سجلات مالية مرتبطة. '
                'يمكنك تعطيل المحطة بدلاً من حذفها.')
            return redirect('station_list')
        # Force-delete all dependent objects in the correct order to avoid PROTECT blocks
        with transaction.atomic():
            from apps.shifts.models import Shift, ShiftDefinition, MeterReading
            from apps.employees.models import Employee
            from apps.finance.models import CashCollection, Voucher, POSRecord, Reconciliation, Expense
            from apps.inventory.models import Delivery, ShortageClaim, DeliveryDocument, FuelReconciliation, DeliveryRequest
            from apps.core.models import TankReading, TankTransfer, TankAlert
            shift_ids = list(station.shifts.values_list('id', flat=True))
            if shift_ids:
                MeterReading.objects.filter(shift_id__in=shift_ids).delete()
                CashCollection.objects.filter(shift_id__in=shift_ids).delete()
                Voucher.objects.filter(shift_id__in=shift_ids).delete()
                POSRecord.objects.filter(shift_id__in=shift_ids).delete()
                Reconciliation.objects.filter(shift_id__in=shift_ids).delete()
                Shift.objects.filter(id__in=shift_ids).delete()
            Expense.objects.filter(station=station).delete()
            ShiftDefinition.objects.filter(station=station).delete()
            Employee.objects.filter(station=station).delete()
            # Inventory
            deliveries = Delivery.objects.filter(station=station)
            for d in deliveries:
                ShortageClaim.objects.filter(delivery=d).delete()
                DeliveryDocument.objects.filter(delivery=d).delete()
            deliveries.delete()
            # Tanks (must delete meters first due to PROTECT)
            # Delete ALL MeterReadings for meters in this station (before meters, before tanks)
            MeterReading.objects.filter(meter__machine__island__station=station).delete()
            # Now delete tanks — PROTECT on Meter.tank is satisfied because meters are deleted first
            for tank in station.tanks.all():
                tank.meter_set.all().delete()  # related_name default from FK Tank
                TankReading.objects.filter(tank=tank).delete()
                TankTransfer.objects.filter(from_tank=tank).delete()
                TankTransfer.objects.filter(to_tank=tank).delete()
                TankAlert.objects.filter(tank=tank).delete()
                FuelReconciliation.objects.filter(tank=tank).delete()
                DeliveryRequest.objects.filter(tank=tank).delete()
            station.tanks.all().delete()
            # Islands/Machines (cascaded but be explicit)
            for island in station.islands.all():
                island.machines.all().delete()
            station.islands.all().delete()
            # Finally delete the station
            station.delete()
        messages.success(request, f'تم حذف المحطة "{station.name}" بنجاح')
        return redirect('station_list')
    return render(request, 'pages/stations/confirm_delete.html', {
        'object': station, 'cancel_url': 'station_list',
        'dependents': dependents, 'has_financial_data': has_financial,
    })


# ---------------- Settings: owner-only definitions ----------------

@require_roles(OWNER_ROLES | OPS_ROLES)
def fuel_type_list(request):
    fuel_types = FuelType.objects.all()
    return render(request, 'pages/settings/fuel_types/list.html', {'fuel_types': fuel_types})


@require_roles(OWNER_ROLES)
def fuel_type_create(request):
    if request.method == 'POST':
        form = FuelTypeForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, 'تم إضافة نوع الوقود بنجاح')
            return redirect('fuel_type_list')
    else:
        form = FuelTypeForm()
    return render(request, 'pages/settings/fuel_types/form.html', {'form': form})


@require_roles(OWNER_ROLES)
def fuel_type_edit(request, pk):
    fuel_type = get_object_or_404(FuelType, pk=pk)
    if request.method == 'POST':
        form = FuelTypeForm(request.POST, instance=fuel_type)
        if form.is_valid():
            form.save()
            messages.success(request, 'تم تعديل نوع الوقود بنجاح')
            return redirect('fuel_type_list')
    else:
        form = FuelTypeForm(instance=fuel_type)
    return render(request, 'pages/settings/fuel_types/form.html', {'form': form, 'fuel_type': fuel_type})


@require_roles(OWNER_ROLES)
def fuel_type_delete(request, pk):
    fuel_type = get_object_or_404(FuelType, pk=pk)
    if request.method == 'POST':
        ok, blockers = safe_delete(fuel_type)
        if ok:
            messages.success(request, 'تم حذف نوع الوقود بنجاح')
        else:
            messages.error(request,
                f'لا يمكن حذف نوع الوقود "{fuel_type.name}" لوجود سجلات مرتبطة '
                f'({describe_blockers(blockers)})')
        return redirect('fuel_type_list')
    dependents = count_dependents(fuel_type)
    return render(request, 'pages/settings/confirm_delete.html', {
        'object': fuel_type, 'cancel_url': 'fuel_type_list', 'dependents': dependents,
    })


@require_roles(OWNER_ROLES | OPS_ROLES)
def fuel_price_list(request):
    fuel_prices = FuelPrice.objects.select_related('fuel_type').all()
    return render(request, 'pages/settings/fuel_prices/list.html', {'fuel_prices': fuel_prices})


@require_roles(OWNER_ROLES)
def fuel_price_create(request):
    if request.method == 'POST':
        form = FuelPriceForm(request.POST)
        if form.is_valid():
            fp = form.save()
            log_change(request.user, 'create', fp, ip_address=get_client_ip(request))
            messages.success(request, 'تم إضافة سعر الوقود بنجاح')
            return redirect('fuel_price_list')
    else:
        form = FuelPriceForm()
    return render(request, 'pages/settings/fuel_prices/form.html', {'form': form})


@require_roles(OWNER_ROLES)
def fuel_price_edit(request, pk):
    fuel_price = get_object_or_404(FuelPrice, pk=pk)
    if request.method == 'POST':
        old_value = {'selling_price': str(fuel_price.selling_price), 'effective_date': str(fuel_price.effective_date)}
        form = FuelPriceForm(request.POST, instance=fuel_price)
        if form.is_valid():
            fp = form.save()
            log_change(request.user, 'update', fp, old_value=old_value,
                       new_value={'selling_price': str(fp.selling_price), 'effective_date': str(fp.effective_date)},
                       ip_address=get_client_ip(request))
            messages.success(request, 'تم تعديل سعر الوقود بنجاح')
            return redirect('fuel_price_list')
    else:
        form = FuelPriceForm(instance=fuel_price)
    return render(request, 'pages/settings/fuel_prices/form.html', {'form': form, 'fuel_price': fuel_price})


@require_roles(OWNER_ROLES)
def fuel_price_delete(request, pk):
    fuel_price = get_object_or_404(FuelPrice, pk=pk)
    if request.method == 'POST':
        ok, blockers = safe_delete(fuel_price)
        if ok:
            messages.success(request, 'تم حذف سعر الوقود بنجاح')
        else:
            messages.error(request,
                f'لا يمكن حذف سعر الوقود لوجود سجلات مرتبطة '
                f'({describe_blockers(blockers)})')
        return redirect('fuel_price_list')
    return render(request, 'pages/settings/confirm_delete.html', {'object': fuel_price, 'cancel_url': 'fuel_price_list'})


# ---------------- Categories (Finance + Owner) ----------------

@require_roles(FIN_OPS_ROLES)
def voucher_category_list(request):
    voucher_categories = VoucherCategory.objects.all()
    return render(request, 'pages/settings/voucher_categories/list.html', {'voucher_categories': voucher_categories})


@require_roles(FIN_OPS_ROLES)
def voucher_category_create(request):
    if request.method == 'POST':
        form = VoucherCategoryForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, 'تم إضافة فئة الكوبون بنجاح')
            return redirect('voucher_category_list')
    else:
        form = VoucherCategoryForm()
    return render(request, 'pages/settings/voucher_categories/form.html', {'form': form})


@require_roles(FIN_OPS_ROLES)
def voucher_category_edit(request, pk):
    voucher_category = get_object_or_404(VoucherCategory, pk=pk)
    if request.method == 'POST':
        form = VoucherCategoryForm(request.POST, instance=voucher_category)
        if form.is_valid():
            form.save()
            messages.success(request, 'تم تعديل فئة الكوبون بنجاح')
            return redirect('voucher_category_list')
    else:
        form = VoucherCategoryForm(instance=voucher_category)
    return render(request, 'pages/settings/voucher_categories/form.html', {'form': form, 'voucher_category': voucher_category})


@require_roles(FIN_OPS_ROLES)
def voucher_category_delete(request, pk):
    voucher_category = get_object_or_404(VoucherCategory, pk=pk)
    if request.method == 'POST':
        ok, blockers = safe_delete(voucher_category)
        if ok:
            messages.success(request, 'تم حذف فئة الكوبون بنجاح')
        else:
            messages.error(request,
                f'لا يمكن حذف فئة الكوبون "{voucher_category.name}" لوجود سجلات مرتبطة '
                f'({describe_blockers(blockers)})')
        return redirect('voucher_category_list')
    return render(request, 'pages/settings/confirm_delete.html', {'object': voucher_category, 'cancel_url': 'voucher_category_list'})


# ---------------- Marketing companies (Owner) ----------------

@require_roles(OWNER_ROLES)
def marketing_company_list(request):
    companies = MarketingCompany.objects.all()
    return render(request, 'pages/settings/marketing_companies/list.html', {'companies': companies})


@require_roles(OWNER_ROLES)
def marketing_company_create(request):
    if request.method == 'POST':
        form = MarketingCompanyForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, 'تم إضافة شركة التسويق بنجاح')
            return redirect('marketing_company_list')
    else:
        form = MarketingCompanyForm()
    return render(request, 'pages/settings/marketing_companies/form.html', {'form': form})


@require_roles(OWNER_ROLES)
def marketing_company_edit(request, pk):
    company = get_object_or_404(MarketingCompany, pk=pk)
    if request.method == 'POST':
        form = MarketingCompanyForm(request.POST, instance=company)
        if form.is_valid():
            form.save()
            messages.success(request, 'تم تعديل شركة التسويق بنجاح')
            return redirect('marketing_company_list')
    else:
        form = MarketingCompanyForm(instance=company)
    return render(request, 'pages/settings/marketing_companies/form.html', {'form': form, 'company': company})


@require_roles(OWNER_ROLES)
def marketing_company_delete(request, pk):
    company = get_object_or_404(MarketingCompany, pk=pk)
    if request.method == 'POST':
        ok, blockers = safe_delete(company)
        if ok:
            messages.success(request, 'تم حذف شركة التسويق بنجاح')
        else:
            messages.error(request,
                f'لا يمكن حذف شركة التسويق "{company.name}" لوجود سجلات مرتبطة '
                f'({describe_blockers(blockers)})')
        return redirect('marketing_company_list')
    return render(request, 'pages/settings/confirm_delete.html', {'object': company, 'cancel_url': 'marketing_company_list'})


# ---------------- Islands / Machines / Meters (Operations, station-scoped) ----------------

def _scoped_stations(user):
    qs = Station.objects.all()
    st = user_station(user)
    if not is_owner(user) and st:
        qs = qs.filter(pk=st.pk)
    return qs


@require_roles(OPS_ROLES)
def island_list(request):
    islands = Island.objects.select_related('station').all()
    if not is_owner(request.user):
        st = user_station(request.user)
        if st:
            islands = islands.filter(station=st)
    station_id = request.GET.get('station')
    if station_id and is_owner(request.user):
        islands = islands.filter(station_id=station_id)
    return render(request, 'pages/settings/islands/list.html', {'islands': islands})


@require_roles(OPS_ROLES)
def island_create(request):
    if request.method == 'POST':
        form = IslandForm(request.POST)
        limit_form_to_station(form, request.user)
        if form.is_valid():
            form.save()
            messages.success(request, 'تم إضافة الجزيرة بنجاح')
            return redirect('island_list')
    else:
        form = IslandForm()
        limit_form_to_station(form, request.user)
    return render(request, 'pages/settings/islands/form.html', {'form': form})


@require_roles(OPS_ROLES)
def island_edit(request, pk):
    island = get_object_or_404(Island, pk=pk)
    ensure_station_access(request.user, island)
    if request.method == 'POST':
        form = IslandForm(request.POST, instance=island)
        limit_form_to_station(form, request.user)
        if form.is_valid():
            form.save()
            messages.success(request, 'تم تعديل الجزيرة بنجاح')
            return redirect('island_list')
    else:
        form = IslandForm(instance=island)
        limit_form_to_station(form, request.user)
    return render(request, 'pages/settings/islands/form.html', {'form': form, 'island': island})


@require_roles(OPS_ROLES)
def island_delete(request, pk):
    island = get_object_or_404(Island, pk=pk)
    ensure_station_access(request.user, island)
    if request.method == 'POST':
        ok, blockers = safe_delete(island)
        if ok:
            messages.success(request, 'تم حذف الجزيرة بنجاح')
        else:
            messages.error(request, f'لا يمكن الحذف لوجود سجلات مرتبطة ({describe_blockers(blockers)})')
        return redirect('island_list')
    dependents = count_dependents(island)
    return render(request, 'pages/settings/confirm_delete.html', {
        'object': island, 'cancel_url': 'island_list', 'dependents': dependents,
    })


@require_roles(OPS_ROLES)
def machine_list(request):
    machines = Machine.objects.select_related('island', 'island__station').all()
    if not is_owner(request.user):
        st = user_station(request.user)
        if st:
            machines = machines.filter(island__station=st)
    return render(request, 'pages/settings/machines/list.html', {'machines': machines})


@require_roles(OPS_ROLES)
def machine_create(request):
    if request.method == 'POST':
        form = MachineForm(request.POST)
        limit_form_to_station(form, request.user)
        if form.is_valid():
            form.save()
            messages.success(request, 'تم إضافة المضخة بنجاح')
            return redirect('machine_list')
    else:
        form = MachineForm()
        limit_form_to_station(form, request.user)
    return render(request, 'pages/settings/machines/form.html', {'form': form})


@require_roles(OPS_ROLES)
def machine_edit(request, pk):
    machine = get_object_or_404(Machine, pk=pk)
    ensure_station_access(request.user, machine.island)
    if request.method == 'POST':
        form = MachineForm(request.POST, instance=machine)
        limit_form_to_station(form, request.user)
        if form.is_valid():
            form.save()
            messages.success(request, 'تم تعديل المضخة بنجاح')
            return redirect('machine_list')
    else:
        form = MachineForm(instance=machine)
        limit_form_to_station(form, request.user)
    return render(request, 'pages/settings/machines/form.html', {'form': form, 'machine': machine})


@require_roles(OPS_ROLES)
def machine_delete(request, pk):
    machine = get_object_or_404(Machine, pk=pk)
    ensure_station_access(request.user, machine.island)
    if request.method == 'POST':
        ok, blockers = safe_delete(machine)
        if ok:
            messages.success(request, 'تم حذف المضخة بنجاح')
        else:
            messages.error(request, f'لا يمكن الحذف لوجود سجلات مرتبطة ({describe_blockers(blockers)})')
        return redirect('machine_list')
    dependents = count_dependents(machine)
    return render(request, 'pages/settings/confirm_delete.html', {
        'object': machine, 'cancel_url': 'machine_list', 'dependents': dependents,
    })


@require_roles(OPS_ROLES)
def meter_list(request):
    meters = Meter.objects.select_related('machine', 'machine__island', 'fuel_type', 'tank').all()
    if not is_owner(request.user):
        st = user_station(request.user)
        if st:
            meters = meters.filter(machine__island__station=st)
    return render(request, 'pages/settings/meters/list.html', {'meters': meters})


@require_roles(OPS_ROLES)
def meter_create(request):
    if request.method == 'POST':
        form = MeterForm(request.POST)
        limit_form_to_station(form, request.user)
        if form.is_valid():
            form.save()
            messages.success(request, 'تم إضافة العدّاد بنجاح')
            return redirect('meter_list')
    else:
        form = MeterForm()
        limit_form_to_station(form, request.user)
    return render(request, 'pages/settings/meters/form.html', {'form': form})


@require_roles(OPS_ROLES)
def meter_edit(request, pk):
    meter = get_object_or_404(Meter, pk=pk)
    ensure_station_access(request.user, meter.machine.island)
    if request.method == 'POST':
        form = MeterForm(request.POST, instance=meter)
        limit_form_to_station(form, request.user)
        if form.is_valid():
            form.save()
            messages.success(request, 'تم تعديل العدّاد بنجاح')
            return redirect('meter_list')
    else:
        form = MeterForm(instance=meter)
        limit_form_to_station(form, request.user)
    return render(request, 'pages/settings/meters/form.html', {'form': form, 'meter': meter})


@require_roles(OPS_ROLES)
def meter_delete(request, pk):
    meter = get_object_or_404(Meter, pk=pk)
    ensure_station_access(request.user, meter.machine.island)
    if request.method == 'POST':
        ok, blockers = safe_delete(meter)
        if ok:
            messages.success(request, 'تم حذف العدّاد بنجاح')
        else:
            messages.error(request, f'لا يمكن الحذف لوجود قراءات مسجلة على هذا العدّاد ({describe_blockers(blockers)}). يمكنك تعطيله بدلاً من حذفه.')
        return redirect('meter_list')
    dependents = count_dependents(meter)
    return render(request, 'pages/settings/confirm_delete.html', {
        'object': meter, 'cancel_url': 'meter_list', 'dependents': dependents,
    })


# ---------------- Expense categories (Finance + Owner) ----------------

@require_roles(FIN_OPS_ROLES)
def expense_category_list(request):
    categories = ExpenseCategory.objects.all()
    return render(request, 'pages/settings/expense_categories/list.html', {'categories': categories})


@require_roles(FIN_OPS_ROLES)
def expense_category_create(request):
    if request.method == 'POST':
        form = ExpenseCategoryForm(request.POST)
        limit_form_to_station(form, request.user)
        if form.is_valid():
            form.save()
            messages.success(request, 'تم إضافة فئة المصروف بنجاح')
            return redirect('expense_category_list')
    else:
        form = ExpenseCategoryForm()
        limit_form_to_station(form, request.user)
    return render(request, 'pages/settings/expense_categories/form.html', {'form': form})


@require_roles(FIN_OPS_ROLES)
def expense_category_edit(request, pk):
    category = get_object_or_404(ExpenseCategory, pk=pk)
    if request.method == 'POST':
        form = ExpenseCategoryForm(request.POST, instance=category)
        limit_form_to_station(form, request.user)
        if form.is_valid():
            form.save()
            messages.success(request, 'تم تعديل فئة المصروف بنجاح')
            return redirect('expense_category_list')
    else:
        form = ExpenseCategoryForm(instance=category)
        limit_form_to_station(form, request.user)
    return render(request, 'pages/settings/expense_categories/form.html', {'form': form, 'category': category})


@require_roles(FIN_OPS_ROLES)
def expense_category_delete(request, pk):
    category = get_object_or_404(ExpenseCategory, pk=pk)
    if request.method == 'POST':
        ok, blockers = safe_delete(category)
        if ok:
            messages.success(request, 'تم حذف فئة المصروف بنجاح')
        else:
            messages.error(request,
                f'لا يمكن حذف فئة المصروف "{category.name}" لوجود سجلات مرتبطة '
                f'({describe_blockers(blockers)})')
        return redirect('expense_category_list')
    return render(request, 'pages/settings/confirm_delete.html', {'object': category, 'cancel_url': 'expense_category_list'})
