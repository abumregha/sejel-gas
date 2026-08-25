from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from .models import Station, FuelType, FuelPrice
from apps.finance.models import VoucherCategory
from .forms import StationForm, FuelTypeForm, FuelPriceForm, VoucherCategoryForm


@login_required
def dashboard(request):
    return render(request, 'pages/dashboard.html')


@login_required
def station_list(request):
    stations = Station.objects.all()
    return render(request, 'pages/stations/list.html', {'stations': stations})


@login_required
def station_create(request):
    if request.method == 'POST':
        form = StationForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('station_list')
    else:
        form = StationForm()
    return render(request, 'pages/stations/form.html', {'form': form})


@login_required
def station_detail(request, pk):
    station = get_object_or_404(Station, pk=pk)
    return render(request, 'pages/stations/detail.html', {'station': station})


@login_required
def station_edit(request, pk):
    station = get_object_or_404(Station, pk=pk)
    if request.method == 'POST':
        form = StationForm(request.POST, instance=station)
        if form.is_valid():
            form.save()
            return redirect('station_detail', pk=pk)
    else:
        form = StationForm(instance=station)
    return render(request, 'pages/stations/form.html', {'form': form, 'station': station})


@login_required
def fuel_type_list(request):
    fuel_types = FuelType.objects.all()
    return render(request, 'pages/settings/fuel_types/list.html', {'fuel_types': fuel_types})


@login_required
def fuel_type_create(request):
    if request.method == 'POST':
        form = FuelTypeForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('fuel_type_list')
    else:
        form = FuelTypeForm()
    return render(request, 'pages/settings/fuel_types/form.html', {'form': form})


@login_required
def fuel_price_list(request):
    fuel_prices = FuelPrice.objects.all()
    return render(request, 'pages/settings/fuel_prices/list.html', {'fuel_prices': fuel_prices})


@login_required
def fuel_price_create(request):
    if request.method == 'POST':
        form = FuelPriceForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('fuel_price_list')
    else:
        form = FuelPriceForm()
    return render(request, 'pages/settings/fuel_prices/form.html', {'form': form})


@login_required
def voucher_category_list(request):
    voucher_categories = VoucherCategory.objects.all()
    return render(request, 'pages/settings/voucher_categories/list.html', {'voucher_categories': voucher_categories})


@login_required
def voucher_category_create(request):
    if request.method == 'POST':
        form = VoucherCategoryForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('voucher_category_list')
    else:
        form = VoucherCategoryForm()
    return render(request, 'pages/settings/voucher_categories/form.html', {'form': form})
