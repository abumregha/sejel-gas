from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from .models import Employee, ShiftAssignment
from .forms import EmployeeForm, ShiftAssignmentForm
from apps.core.models import Station
from apps.core.permissions import (
    require_roles, ensure_station_access, is_owner, user_station,
    OPS_ROLES, safe_delete, describe_blockers,
)


def _limit_employee_form(form, user):
    """Restrict station choices to the current user's station (non-owners)."""
    st = user_station(user)
    if is_owner(user) or st is None:
        return
    if 'station' in form.fields:
        form.fields['station'].queryset = Station.objects.filter(pk=st.pk)


def _limit_assignment_form(form, user):
    st = user_station(user)
    if is_owner(user) or st is None:
        return
    form.fields['employee'].queryset = Employee.objects.filter(station=st)


@login_required
def employee_list(request):
    employees = Employee.objects.select_related('station').all()
    if not is_owner(request.user):
        st = user_station(request.user)
        if st:
            employees = employees.filter(station=st)
    station_id = request.GET.get('station')
    if station_id and is_owner(request.user):
        employees = employees.filter(station_id=station_id)
    return render(request, 'pages/employees/employee_list.html', {
        'employees': employees,
        'page_title': 'الموظفون',
    })


@login_required
def employee_detail(request, pk):
    employee = get_object_or_404(Employee, pk=pk)
    ensure_station_access(request.user, employee)
    assignments = employee.assignments.select_related('island', 'island__station').all()[:10]
    shifts = employee.shifts.select_related('station', 'island', 'definition').all()[:10]
    return render(request, 'pages/employees/employee_detail.html', {
        'employee': employee,
        'assignments': assignments,
        'shifts': shifts,
        'page_title': employee.name,
    })


@require_roles(OPS_ROLES)
def employee_create(request):
    if request.method == 'POST':
        form = EmployeeForm(request.POST)
        _limit_employee_form(form, request.user)
        if form.is_valid():
            employee = form.save(commit=False)
            st = user_station(request.user)
            if not is_owner(request.user) and st:
                employee.station = st
            employee.save()
            messages.success(request, 'تم إضافة الموظف بنجاح')
            return redirect('employee_list')
    else:
        form = EmployeeForm()
        _limit_employee_form(form, request.user)
    return render(request, 'pages/employees/employee_form.html', {
        'form': form,
        'page_title': 'إضافة موظف',
    })


@require_roles(OPS_ROLES)
def employee_edit(request, pk):
    employee = get_object_or_404(Employee, pk=pk)
    ensure_station_access(request.user, employee)
    if request.method == 'POST':
        form = EmployeeForm(request.POST, instance=employee)
        _limit_employee_form(form, request.user)
        if form.is_valid():
            form.save()
            messages.success(request, 'تم تعديل الموظف بنجاح')
            return redirect('employee_list')
    else:
        form = EmployeeForm(instance=employee)
        _limit_employee_form(form, request.user)
    return render(request, 'pages/employees/employee_form.html', {
        'form': form,
        'employee': employee,
        'page_title': f'تعديل {employee.name}',
    })


@require_roles(OPS_ROLES)
def employee_delete(request, pk):
    employee = get_object_or_404(Employee, pk=pk)
    ensure_station_access(request.user, employee)
    if request.method == 'POST':
        ok, blockers = safe_delete(employee)
        if ok:
            messages.success(request, 'تم حذف الموظف بنجاح')
        else:
            # Could not hard-delete; deactivate instead
            employee.status = 'inactive'
            employee.save(update_fields=['status'])
            messages.error(request,
                f'لا يمكن حذف الموظف "{employee.name}" لوجود سجلات مرتبطة '
                f'({describe_blockers(blockers)}). '
                'تم تعطيل الموظف بدلاً من حذفه.')
        return redirect('employee_list')
    return render(request, 'pages/employees/confirm_delete.html', {'object': employee, 'cancel_url': 'employee_list'})


@login_required
def shift_assignment_list(request):
    assignments = ShiftAssignment.objects.select_related('employee', 'island', 'island__station').all()
    if not is_owner(request.user):
        st = user_station(request.user)
        if st:
            assignments = assignments.filter(employee__station=st)
    return render(request, 'pages/employees/shift_assignment_list.html', {
        'assignments': assignments,
        'page_title': 'تعيينات المناوبات',
    })


@require_roles(OPS_ROLES)
def shift_assignment_create(request):
    if request.method == 'POST':
        form = ShiftAssignmentForm(request.POST)
        _limit_assignment_form(form, request.user)
        if form.is_valid():
            assignment = form.save(commit=False)
            ensure_station_access(request.user, assignment.employee)
            assignment.save()
            messages.success(request, 'تم إضافة التعيين بنجاح')
            return redirect('shift_assignment_list')
    else:
        form = ShiftAssignmentForm()
        _limit_assignment_form(form, request.user)
    return render(request, 'pages/employees/shift_assignment_form.html', {
        'form': form,
        'page_title': 'إضافة تعيين',
    })


@require_roles(OPS_ROLES)
def shift_assignment_edit(request, pk):
    assignment = get_object_or_404(ShiftAssignment, pk=pk)
    ensure_station_access(request.user, assignment.employee)
    if request.method == 'POST':
        form = ShiftAssignmentForm(request.POST, instance=assignment)
        _limit_assignment_form(form, request.user)
        if form.is_valid():
            form.save()
            messages.success(request, 'تم تعديل التعيين بنجاح')
            return redirect('shift_assignment_list')
    else:
        form = ShiftAssignmentForm(instance=assignment)
        _limit_assignment_form(form, request.user)
    return render(request, 'pages/employees/shift_assignment_form.html', {
        'form': form,
        'assignment': assignment,
        'page_title': 'تعديل التعيين',
    })


@require_roles(OPS_ROLES)
def shift_assignment_delete(request, pk):
    assignment = get_object_or_404(ShiftAssignment, pk=pk)
    ensure_station_access(request.user, assignment.employee)
    if request.method == 'POST':
        assignment.delete()
        messages.success(request, 'تم حذف التعيين بنجاح')
        return redirect('shift_assignment_list')
    return render(request, 'pages/employees/confirm_delete.html', {'object': assignment, 'cancel_url': 'shift_assignment_list'})
