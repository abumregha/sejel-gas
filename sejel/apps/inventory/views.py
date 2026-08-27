from decimal import Decimal

from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.utils import timezone
from .models import Delivery, DeliveryDocument, ShortageClaim, FuelReconciliation
from apps.core.models import Tank, TankReading, TankTransfer
from apps.core.permissions import (
    require_roles, ensure_station_access, is_owner, user_station,
    safe_delete, describe_blockers, OPS_ROLES, count_dependents,
)
from .forms import DeliveryForm, DeliveryDocumentForm, ShortageClaimForm, TankForm


def _scope(request, qs):
    if not is_owner(request.user):
        st = user_station(request.user)
        if st:
            qs = qs.filter(station=st)
    return qs


def _limit_tank_form(form, user):
    from apps.core.models import Station, FuelType
    st = user_station(user)
    if is_owner(user) or st is None:
        return
    form.fields['station'].queryset = Station.objects.filter(pk=st.pk)


def _limit_delivery_form(form, user):
    from apps.core.models import Station
    st = user_station(user)
    if is_owner(user) or st is None:
        return
    form.fields['station'].queryset = Station.objects.filter(pk=st.pk)
    form.fields['tank'].queryset = Tank.objects.filter(station=st)


@login_required
def tank_list(request):
    tanks = _scope(request, Tank.objects.select_related('station', 'fuel_type').all())
    station_id = request.GET.get('station')
    if station_id and is_owner(request.user):
        tanks = tanks.filter(station_id=station_id)
    return render(request, 'pages/inventory/tank_list.html', {
        'tanks': tanks,
        'page_title': 'الخزانات',
    })


@login_required
def tank_json(request):
    """Return tanks as JSON for a given station (for transfer form)."""
    from django.http import JsonResponse
    station_id = request.GET.get('station')
    if not station_id:
        return JsonResponse([], safe=False)
    tanks = Tank.objects.filter(station_id=station_id).select_related('fuel_type')
    if not is_owner(request.user):
        st = user_station(request.user)
        if st:
            tanks = tanks.filter(station=st)
    data = [
        {
            'id': t.pk,
            'name': t.name or str(t.fuel_type),
            'fuel_type': str(t.fuel_type),
            'fuel_type_id': t.fuel_type_id,
            'capacity': float(t.capacity),
            'current_level': float(t.current_level),
        }
        for t in tanks
    ]
    return JsonResponse(data, safe=False)


@login_required
@require_roles(OPS_ROLES)
def tank_create(request):
    if request.method == 'POST':
        form = TankForm(request.POST)
        _limit_tank_form(form, request.user)
        if form.is_valid():
            form.save()
            messages.success(request, 'تم إضافة الخزان بنجاح')
            return redirect('tank_list')
    else:
        form = TankForm()
        _limit_tank_form(form, request.user)
    return render(request, 'pages/inventory/tank_form.html', {
        'form': form,
        'page_title': 'إضافة خزان',
    })


@login_required
@require_roles(OPS_ROLES)
def tank_edit(request, pk):
    tank = get_object_or_404(Tank, pk=pk)
    ensure_station_access(request.user, tank)
    if request.method == 'POST':
        form = TankForm(request.POST, instance=tank)
        _limit_tank_form(form, request.user)
        if form.is_valid():
            form.save()
            messages.success(request, 'تم تعديل الخزان بنجاح')
            return redirect('tank_list')
    else:
        form = TankForm(instance=tank)
        _limit_tank_form(form, request.user)
    return render(request, 'pages/inventory/tank_form.html', {
        'form': form,
        'tank': tank,
        'page_title': 'تعديل الخزان',
    })


@login_required
@require_roles(OPS_ROLES)
def tank_delete(request, pk):
    tank = get_object_or_404(Tank, pk=pk)
    ensure_station_access(request.user, tank)
    if request.method == 'POST':
        ok, blockers = safe_delete(tank)
        if ok:
            messages.success(request, 'تم حذف الخزان بنجاح')
        else:
            messages.error(request, f'لا يمكن حذف الخزان لأن العدّادات مرتبطة به ({describe_blockers(blockers)}). يمكنك تعطيله بدلاً من حذفه.')
        return redirect('tank_list')
    dependents = count_dependents(tank)
    return render(request, 'pages/inventory/confirm_delete.html', {
        'object': tank, 'cancel_url': 'tank_list', 'dependents': dependents,
    })


@login_required
def tank_detail(request, pk):
    tank = get_object_or_404(Tank.objects.select_related('station', 'fuel_type'), pk=pk)
    ensure_station_access(request.user, tank)
    readings = tank.readings.select_related('recorded_by').all()[:20]
    # Recent deliveries for this tank
    deliveries = Delivery.objects.filter(tank=tank).select_related(
        'fuel_type', 'supplier').order_by('-order_date')[:10]
    # Balance calculation
    from decimal import Decimal
    last_reading = tank.latest_reading()
    theoretical = tank.theoretical_level()
    return render(request, 'pages/inventory/tank_detail.html', {
        'tank': tank,
        'readings': readings,
        'deliveries': deliveries,
        'last_reading': last_reading,
        'theoretical_level': theoretical,
        'level_percent': tank.level_percent,
        'page_title': f'الخزان: {tank.name or tank.fuel_type}',
    })


@login_required
@require_roles(OPS_ROLES)
def tank_reading_add(request, tank_id):
    tank = get_object_or_404(Tank, pk=tank_id)
    ensure_station_access(request.user, tank)
    if request.method == 'POST':
        reading_level = request.POST.get('reading_level')
        reading_type = request.POST.get('reading_type', 'daily')
        recorded_at = request.POST.get('recorded_at')
        notes = request.POST.get('notes', '')
        if reading_level:
            from django.utils import timezone as tz
            TankReading.objects.create(
                tank=tank,
                reading_level=reading_level,
                reading_type=reading_type,
                recorded_at=recorded_at or tz.now(),
                recorded_by=request.user,
                notes=notes,
            )
            # Update tank's current_level and last_reading_date
            tank.current_level = reading_level
            tank.last_reading_date = recorded_at or tz.now()
            tank.save(update_fields=['current_level', 'last_reading_date'])
            messages.success(request, 'تم تسجيل القراءة بنجاح')
            return redirect('tank_detail', pk=tank.pk)
        else:
            messages.error(request, 'أدخل مستوى القراءة')
    from django.utils import timezone as tz
    return render(request, 'pages/inventory/tank_reading_form.html', {
        'tank': tank,
        'page_title': f'إضافة قراءة خزان: {tank.name or tank.fuel_type}',
        'initial_recorded_at': tz.now().strftime('%Y-%m-%dT%H:%M'),
    })


@login_required
def delivery_list(request):
    deliveries = _scope(request, Delivery.objects.select_related('station', 'fuel_type', 'tank').all())
    status = request.GET.get('status')
    if status:
        deliveries = deliveries.filter(status=status)
    return render(request, 'pages/inventory/delivery_list.html', {
        'deliveries': deliveries,
        'page_title': 'الشحنات',
    })


@login_required
@require_roles(OPS_ROLES)
def delivery_create(request):
    if request.method == 'POST':
        form = DeliveryForm(request.POST)
        _limit_delivery_form(form, request.user)
        if form.is_valid():
            form.save()
            messages.success(request, 'تم إضافة الشحنة بنجاح')
            return redirect('delivery_list')
    else:
        form = DeliveryForm()
        _limit_delivery_form(form, request.user)
    return render(request, 'pages/inventory/delivery_form.html', {
        'form': form,
        'page_title': 'إضافة شحنة',
    })


@login_required
def delivery_detail(request, pk):
    delivery = get_object_or_404(Delivery, pk=pk)
    ensure_station_access(request.user, delivery)
    shortage_claim = getattr(delivery, 'shortage_claim', None)
    documents = delivery.documents.all()
    return render(request, 'pages/inventory/delivery_detail.html', {
        'delivery': delivery,
        'shortage_claim': shortage_claim,
        'documents': documents,
        'page_title': f'شحنة #{delivery.id}',
    })


@login_required
@require_roles(OPS_ROLES)
def delivery_edit(request, pk):
    delivery = get_object_or_404(Delivery, pk=pk)
    ensure_station_access(request.user, delivery)
    if request.method == 'POST':
        form = DeliveryForm(request.POST, instance=delivery)
        _limit_delivery_form(form, request.user)
        if form.is_valid():
            form.save()
            messages.success(request, 'تم تعديل الشحنة بنجاح')
            return redirect('delivery_detail', pk=pk)
    else:
        form = DeliveryForm(instance=delivery)
        _limit_delivery_form(form, request.user)
    return render(request, 'pages/inventory/delivery_form.html', {
        'form': form,
        'delivery': delivery,
        'page_title': f'تعديل الشحنة #{delivery.id}',
    })


@login_required
@require_roles(OPS_ROLES)
def delivery_delete(request, pk):
    delivery = get_object_or_404(Delivery, pk=pk)
    ensure_station_access(request.user, delivery)
    if request.method == 'POST':
        ok, blockers = safe_delete(delivery)
        if ok:
            messages.success(request, 'تم حذف الشحنة بنجاح')
        else:
            messages.error(request, f'لا يمكن الحذف لوجود سجلات مرتبطة ({describe_blockers(blockers)})')
        return redirect('delivery_list')
    dependents = count_dependents(delivery)
    return render(request, 'pages/inventory/confirm_delete.html', {
        'object': delivery, 'cancel_url': 'delivery_list', 'dependents': dependents,
    })


@login_required
@require_roles(OPS_ROLES)
def delivery_document_create(request, delivery_id):
    delivery = get_object_or_404(Delivery, pk=delivery_id)
    ensure_station_access(request.user, delivery)
    if request.method == 'POST':
        form = DeliveryDocumentForm(request.POST, request.FILES)
        if form.is_valid():
            doc = form.save(commit=False)
            doc.delivery = delivery
            doc.uploaded_by = request.user
            doc.save()
            messages.success(request, 'تم إضافة المستند بنجاح')
            return redirect('delivery_detail', pk=delivery_id)
    else:
        form = DeliveryDocumentForm()
    return render(request, 'pages/inventory/document_form.html', {
        'form': form,
        'delivery': delivery,
        'page_title': 'إضافة مستند',
    })


@login_required
@require_roles(OPS_ROLES)
def delivery_document_delete(request, pk):
    doc = get_object_or_404(DeliveryDocument.objects.select_related('delivery'), pk=pk)
    ensure_station_access(request.user, doc.delivery)
    delivery_id = doc.delivery_id
    if request.method == 'POST':
        doc.delete()
        messages.success(request, 'تم حذف المستند بنجاح')
        return redirect('delivery_detail', pk=delivery_id)
    return render(request, 'pages/inventory/confirm_delete.html', {'object': doc, 'cancel_url': 'delivery_detail', 'cancel_pk': delivery_id})


@login_required
def shortage_claim_list(request):
    claims = ShortageClaim.objects.select_related('delivery', 'delivery__station', 'delivery__fuel_type').all()
    if not is_owner(request.user):
        st = user_station(request.user)
        if st:
            claims = claims.filter(delivery__station=st)
    return render(request, 'pages/inventory/shortage_claim_list.html', {
        'claims': claims,
        'page_title': 'مطالبات النقص',
    })


@login_required
@require_roles(OPS_ROLES)
def shortage_claim_create(request, delivery_id):
    delivery = get_object_or_404(Delivery, pk=delivery_id)
    ensure_station_access(request.user, delivery)
    if hasattr(delivery, 'shortage_claim'):
        messages.error(request, 'هذه الشحنة لديها مطالبة بالفعل')
        return redirect('delivery_detail', pk=delivery_id)
    if request.method == 'POST':
        form = ShortageClaimForm(request.POST)
        if form.is_valid():
            claim = form.save(commit=False)
            claim.delivery = delivery
            claim.shortage_amount = delivery.shortage
            claim.claim_date = timezone.now()
            claim.save()
            messages.success(request, 'تم إنشاء المطالبة بنجاح')
            return redirect('delivery_detail', pk=delivery_id)
    else:
        form = ShortageClaimForm(initial={'shortage_amount': delivery.shortage})
    return render(request, 'pages/inventory/shortage_claim_form.html', {
        'form': form,
        'delivery': delivery,
        'page_title': 'إضافة مطالبة نقص',
    })


@login_required
@require_roles(OPS_ROLES)
def shortage_claim_edit(request, pk):
    claim = get_object_or_404(ShortageClaim.objects.select_related('delivery'), pk=pk)
    ensure_station_access(request.user, claim.delivery)
    delivery_id = claim.delivery_id
    if request.method == 'POST':
        form = ShortageClaimForm(request.POST, instance=claim)
        if form.is_valid():
            form.save()
            messages.success(request, 'تم تعديل المطالبة بنجاح')
            return redirect('delivery_detail', pk=delivery_id)
    else:
        form = ShortageClaimForm(instance=claim)
    return render(request, 'pages/inventory/shortage_claim_form.html', {
        'form': form,
        'claim': claim,
        'delivery': claim.delivery,
        'page_title': 'تعديل المطالبة',
    })


@login_required
@require_roles(OPS_ROLES)
def shortage_claim_delete(request, pk):
    claim = get_object_or_404(ShortageClaim.objects.select_related('delivery'), pk=pk)
    ensure_station_access(request.user, claim.delivery)
    delivery_id = claim.delivery_id
    if request.method == 'POST':
        claim.delete()
        messages.success(request, 'تم حذف المطالبة بنجاح')
        return redirect('delivery_detail', pk=delivery_id)
    return render(request, 'pages/inventory/confirm_delete.html', {'object': claim, 'cancel_url': 'delivery_detail', 'cancel_pk': delivery_id})


# ---------------- Delivery Requests ----------------

@login_required
def delivery_request_list(request):
    """List all delivery requests, scoped by station."""
    from .models import DeliveryRequest
    requests_qs = DeliveryRequest.objects.select_related(
        'station', 'tank', 'fuel_type', 'created_by'
    )
    if not is_owner(request.user):
        st = user_station(request.user)
        if st:
            requests_qs = requests_qs.filter(station=st)
    status = request.GET.get('status')
    if status:
        requests_qs = requests_qs.filter(status=status)
    return render(request, 'pages/inventory/delivery_request_list.html', {
        'requests': requests_qs,
        'page_title': 'طلبات التوريد',
    })


@login_required
@require_roles(OPS_ROLES)
def delivery_request_create(request):
    """Create a new delivery request."""
    from .models import DeliveryRequest
    from apps.core.models import Station as StationModel
    
    if request.method == 'POST':
        station_id = request.POST.get('station')
        tank_id = request.POST.get('tank')
        quantity = request.POST.get('requested_quantity')
        priority = request.POST.get('priority', 'normal')
        reason = request.POST.get('reason', '')
        expected_date = request.POST.get('expected_delivery_date')
        
        if not all([station_id, tank_id, quantity]):
            messages.error(request, 'المحطة والخزان والكمية مطلوبة')
            return redirect('delivery_request_create')
        
        from apps.core.models import Tank as TankModel, FuelType as FTModel
        tank = get_object_or_404(TankModel, pk=tank_id)
        ensure_station_access(request.user, tank)
        
        try:
            qty = Decimal(quantity)
        except (ValueError, TypeError):
            messages.error(request, 'الكمية غير صحيحة')
            return redirect('delivery_request_create')
        
        if qty <= 0:
            messages.error(request, 'الكمية يجب أن تكون أكبر من صفر')
            return redirect('delivery_request_create')
        
        dr = DeliveryRequest.objects.create(
            station=tank.station,
            tank=tank,
            fuel_type=tank.fuel_type,
            requested_quantity=qty,
            priority=priority,
            current_level=tank.current_level,
            reason=reason,
            expected_delivery_date=expected_date or None,
            created_by=request.user,
        )
        messages.success(request, f'تم إنشاء طلب التوريد #{dr.pk} بنجاح')
        return redirect('delivery_request_detail', pk=dr.pk)
    
    # GET
    if is_owner(request.user):
        stations = StationModel.objects.filter(status='active')
    else:
        st = user_station(request.user)
        stations = StationModel.objects.filter(pk=st.pk) if st else StationModel.objects.none()
    
    return render(request, 'pages/inventory/delivery_request_form.html', {
        'stations': stations,
        'page_title': 'طلب توريد جديد',
    })


@login_required
def delivery_request_detail(request, pk):
    """View delivery request details."""
    from .models import DeliveryRequest
    dr = get_object_or_404(
        DeliveryRequest.objects.select_related(
            'station', 'tank', 'tank__fuel_type', 'fuel_type', 'created_by'
        ),
        pk=pk
    )
    ensure_station_access(request.user, dr)
    return render(request, 'pages/inventory/delivery_request_detail.html', {
        'request_obj': dr,
        'page_title': f'طلب توريد #{dr.pk}',
    })


@login_required
@require_roles(OPS_ROLES)
def delivery_request_update_status(request, pk):
    """Update delivery request status."""
    from .models import DeliveryRequest
    dr = get_object_or_404(DeliveryRequest, pk=pk)
    ensure_station_access(request.user, dr)
    
    if request.method == 'POST':
        new_status = request.POST.get('status')
        notes = request.POST.get('notes', '')
        if new_status in dict(DeliveryRequest.STATUS_CHOICES):
            dr.status = new_status
            if notes:
                dr.notes = notes
            dr.save(update_fields=['status', 'notes'])
            messages.success(request, f'تم تحديث حالة الطلب إلى: {dr.get_status_display()}')
    
    return redirect('delivery_request_detail', pk=pk)


# ---------------- Tank Transfers ----------------

@login_required
def tank_transfer_list(request):
    """List all tank transfers, scoped by station."""
    transfers = TankTransfer.objects.select_related(
        'station', 'from_tank', 'to_tank', 'fuel_type', 'created_by'
    )
    if not is_owner(request.user):
        st = user_station(request.user)
        if st:
            transfers = transfers.filter(station=st)
    station_id = request.GET.get('station')
    if station_id and is_owner(request.user):
        transfers = transfers.filter(station_id=station_id)
    status = request.GET.get('status')
    if status:
        transfers = transfers.filter(status=status)
    return render(request, 'pages/inventory/tank_transfer_list.html', {
        'transfers': transfers,
        'page_title': 'التحويلات بين الخزانات',
    })


@login_required
@require_roles(OPS_ROLES)
def tank_transfer_create(request):
    """Create a new tank transfer."""
    from django import forms
    from apps.core.models import Station as StationModel
    
    if request.method == 'POST':
        station_id = request.POST.get('station')
        from_tank_id = request.POST.get('from_tank')
        to_tank_id = request.POST.get('to_tank')
        quantity = request.POST.get('quantity')
        transfer_date = request.POST.get('transfer_date')
        notes = request.POST.get('notes', '')
        
        # Validation
        if not all([station_id, from_tank_id, to_tank_id, quantity, transfer_date]):
            messages.error(request, 'جميع الحقول مطلوبة')
            return redirect('tank_transfer_create')
        
        from_tank = get_object_or_404(Tank, pk=from_tank_id)
        to_tank = get_object_or_404(Tank, pk=to_tank_id)
        
        ensure_station_access(request.user, from_tank)
        ensure_station_access(request.user, to_tank)
        
        # Validate transfer
        if from_tank.pk == to_tank.pk:
            messages.error(request, 'لا يمكن النقل من خزان إلى نفسه')
            return redirect('tank_transfer_create')
        
        if from_tank.fuel_type_id != to_tank.fuel_type_id:
            messages.error(request, 'لا يمكن النقل بين خزانات بأنواع وقود مختلفة')
            return redirect('tank_transfer_create')
        
        if from_tank.station_id != to_tank.station_id:
            messages.error(request, 'لا يمكن النقل بين خزانات في محطات مختلفة')
            return redirect('tank_transfer_create')
        
        try:
            qty = Decimal(quantity)
        except (ValueError, TypeError):
            messages.error(request, 'الكمية غير صحيحة')
            return redirect('tank_transfer_create')
        
        if qty <= 0:
            messages.error(request, 'الكمية يجب أن تكون أكبر من صفر')
            return redirect('tank_transfer_create')
        
        if qty > from_tank.current_level:
            messages.error(request, f'الكمية المطلوبة ({qty} لتر) أكبر من الرصيد المتاح ({from_tank.current_level} لتر) في الخزان المصدر')
            return redirect('tank_transfer_create')
        
        if qty > (to_tank.capacity - to_tank.current_level):
            remaining = to_tank.capacity - to_tank.current_level
            messages.error(request, f'الكمية المطلوبة ({qty} لتر) تتجاوز المساحة المتاحة ({remaining} لتر) في الخزان الوجهة')
            return redirect('tank_transfer_create')
        
        # Create transfer
        transfer = TankTransfer.objects.create(
            station=from_tank.station,
            from_tank=from_tank,
            to_tank=to_tank,
            fuel_type=from_tank.fuel_type,
            quantity=qty,
            transfer_date=transfer_date,
            notes=notes,
            created_by=request.user,
            status='completed',
        )
        
        # Update tank levels
        from_tank.current_level -= qty
        from_tank.save(update_fields=['current_level'])
        to_tank.current_level += qty
        to_tank.save(update_fields=['current_level'])
        
        messages.success(request, f'تم تحويل {qty} لتر من {from_tank.name or from_tank.fuel_type} إلى {to_tank.name or to_tank.fuel_type}')
        return redirect('tank_transfer_detail', pk=transfer.pk)
    
    # GET: prepare form data
    if is_owner(request.user):
        stations = StationModel.objects.filter(status='active')
    else:
        st = user_station(request.user)
        stations = StationModel.objects.filter(pk=st.pk) if st else StationModel.objects.none()
    
    return render(request, 'pages/inventory/tank_transfer_form.html', {
        'stations': stations,
        'page_title': 'تحويل بين الخزانات',
        'today': timezone.now().strftime('%Y-%m-%dT%H:%M'),
    })


@login_required
def tank_transfer_detail(request, pk):
    """View tank transfer details."""
    transfer = get_object_or_404(
        TankTransfer.objects.select_related(
            'station', 'from_tank', 'from_tank__fuel_type',
            'to_tank', 'to_tank__fuel_type', 'fuel_type', 'created_by'
        ),
        pk=pk
    )
    ensure_station_access(request.user, transfer)
    return render(request, 'pages/inventory/tank_transfer_detail.html', {
        'transfer': transfer,
        'page_title': f'تحويل #{transfer.pk}',
    })


@login_required
@require_roles(OPS_ROLES)
def tank_transfer_delete(request, pk):
    """Delete a tank transfer (only completed, with level reversal)."""
    transfer = get_object_or_404(TankTransfer, pk=pk)
    ensure_station_access(request.user, transfer)
    
    if transfer.status != 'completed':
        messages.error(request, 'لا يمكن حذف تحويل غير مكتمل')
        return redirect('tank_transfer_detail', pk=pk)
    
    if request.method == 'POST':
        # Reverse the tank levels
        from_tank = transfer.from_tank
        to_tank = transfer.to_tank
        from_tank.current_level += transfer.quantity
        from_tank.save(update_fields=['current_level'])
        to_tank.current_level -= transfer.quantity
        to_tank.save(update_fields=['current_level'])
        
        transfer.status = 'cancelled'
        transfer.save(update_fields=['status'])
        messages.success(request, 'تم إلغاء التحويل (تم إعادة الرصيد)')
        return redirect('tank_transfer_list')
    
    return render(request, 'pages/inventory/confirm_delete.html', {
        'object': transfer,
        'cancel_url': 'tank_transfer_list',
    })


# ---------------- Fuel Reconciliation ----------------

@login_required
def fuel_reconciliation_list(request):
    """List all fuel reconciliations, scoped by station."""
    reconciliations = FuelReconciliation.objects.select_related(
        'tank', 'tank__fuel_type', 'station', 'confirmed_by', 'created_by'
    )
    if not is_owner(request.user):
        st = user_station(request.user)
        if st:
            reconciliations = reconciliations.filter(station=st)
    station_id = request.GET.get('station')
    if station_id and is_owner(request.user):
        reconciliations = reconciliations.filter(station_id=station_id)
    tank_id = request.GET.get('tank')
    if tank_id:
        reconciliations = reconciliations.filter(tank_id=tank_id)
    status = request.GET.get('status')
    if status:
        reconciliations = reconciliations.filter(status=status)
    return render(request, 'pages/inventory/fuel_reconciliation_list.html', {
        'reconciliations': reconciliations,
        'page_title': 'مطابقة الوقود',
    })


@login_required
@require_roles(OPS_ROLES)
def fuel_reconciliation_create(request, tank_id):
    """Create a new fuel reconciliation for a specific tank."""
    tank = get_object_or_404(Tank.objects.select_related('station', 'fuel_type'), pk=tank_id)
    ensure_station_access(request.user, tank)
    
    if request.method == 'POST':
        closing_reading_id = request.POST.get('closing_reading')
        notes = request.POST.get('notes', '')
        date_str = request.POST.get('date')
        
        if not closing_reading_id:
            messages.error(request, 'يجب اختيار قراءة الخزان الختامية')
            return redirect('fuel_reconciliation_create', tank_id=tank.pk)
        
        from datetime import date as date_type
        try:
            reconcile_date = date_type.fromisoformat(date_str) if date_str else timezone.now().date()
        except (ValueError, TypeError):
            reconcile_date = timezone.now().date()
        
        try:
            from .fuel_reconciliation import create_fuel_reconciliation
            reconciliation = create_fuel_reconciliation(
                tank=tank,
                date=reconcile_date,
                closing_reading_id=int(closing_reading_id),
                notes=notes,
                created_by=request.user,
            )
            messages.success(request, 'تم إنشاء مطابقة الوقود بنجاح')
            return redirect('fuel_reconciliation_detail', pk=reconciliation.pk)
        except ValueError as e:
            messages.error(request, str(e))
        except TankReading.DoesNotExist:
            messages.error(request, 'القراءة المحددة غير موجودة')
    
    # Get available tank readings for this tank
    readings = tank.readings.order_by('-recorded_at')[:20]
    return render(request, 'pages/inventory/fuel_reconciliation_form.html', {
        'tank': tank,
        'readings': readings,
        'today': timezone.now().date().isoformat(),
        'page_title': f'مطابقة الوقود - {tank.name or tank.fuel_type}',
    })


@login_required
def fuel_reconciliation_detail(request, pk):
    """View fuel reconciliation details."""
    reconciliation = get_object_or_404(
        FuelReconciliation.objects.select_related(
            'tank', 'tank__fuel_type', 'station', 'opening_reading',
            'closing_reading', 'confirmed_by', 'created_by'
        ),
        pk=pk
    )
    ensure_station_access(request.user, reconciliation)
    
    # Get meter sales breakdown for this tank during the reconciliation period
    from apps.shifts.models import MeterReading
    from collections import defaultdict
    
    meter_sales = []
    if reconciliation.opening_reading:
        since = reconciliation.opening_reading.recorded_at
        qs = MeterReading.objects.filter(
            meter__tank=reconciliation.tank,
            liters_sold__isnull=False,
            liters_sold__gt=0,
            recorded_at__gte=since,
        ).select_related('meter', 'meter__fuel_type', 'meter__machine', 'meter__machine__island', 'shift')
        
        # Group by meter
        from collections import defaultdict
        meter_totals = defaultdict(lambda: {'liters': Decimal('0'), 'meter': None, 'island': None, 'shifts': set()})
        for reading in qs:
            meter_id = reading.meter_id
            meter_totals[meter_id]['liters'] += reading.liters_sold
            meter_totals[meter_id]['meter'] = reading.meter
            meter_totals[meter_id]['island'] = reading.meter.machine.island
            if reading.shift_id:
                meter_totals[meter_id]['shifts'].add(reading.shift_id)
        
        for meter_id, data in sorted(meter_totals.items(), key=lambda x: x[1]['meter'].code if x[1]['meter'] else ''):
            meter_sales.append({
                'meter': data['meter'],
                'island': data['island'],
                'liters_sold': data['liters'],
                'shifts_count': len(data['shifts']),
            })
    
    return render(request, 'pages/inventory/fuel_reconciliation_detail.html', {
        'reconciliation': reconciliation,
        'meter_sales': meter_sales,
        'page_title': f'مطابقة الوقود #{reconciliation.pk}',
    })


@login_required
@require_roles(OPS_ROLES)
def fuel_reconciliation_confirm(request, pk):
    """Confirm a fuel reconciliation."""
    reconciliation = get_object_or_404(FuelReconciliation, pk=pk)
    ensure_station_access(request.user, reconciliation)
    
    if request.method == 'POST':
        reconciliation.status = 'confirmed'
        reconciliation.confirmed_by = request.user
        reconciliation.confirmed_at = timezone.now()
        reconciliation.save(update_fields=['status', 'confirmed_by', 'confirmed_at'])
        messages.success(request, 'تم اعتماد مطابقة الوقود')
    
    return redirect('fuel_reconciliation_detail', pk=pk)


@login_required
@require_roles(OPS_ROLES)
def fuel_reconciliation_delete(request, pk):
    """Delete a fuel reconciliation (only drafts)."""
    reconciliation = get_object_or_404(FuelReconciliation, pk=pk)
    ensure_station_access(request.user, reconciliation)
    
    if reconciliation.status == 'confirmed':
        messages.error(request, 'لا يمكن حذف مطابقة مؤكدة')
        return redirect('fuel_reconciliation_detail', pk=pk)
    
    if request.method == 'POST':
        tank_id = reconciliation.tank_id
        reconciliation.delete()
        messages.success(request, 'تم حذف مطابقة الوقود')
        return redirect('tank_detail', pk=tank_id)
    
    return render(request, 'pages/inventory/confirm_delete.html', {
        'object': reconciliation,
        'cancel_url': 'fuel_reconciliation_detail',
        'cancel_pk': pk,
    })
