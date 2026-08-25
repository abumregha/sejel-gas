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
