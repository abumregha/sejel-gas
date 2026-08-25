from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from .models import Delivery
from apps.core.models import Tank
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
