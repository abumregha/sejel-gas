from django import forms
from django.utils import timezone
from .models import ShiftDefinition, Shift, MeterReading

INPUT_CLASS = 'w-full border border-gray-300 rounded-lg px-4 py-2.5'


class ShiftDefinitionForm(forms.ModelForm):
    days = forms.MultipleChoiceField(
        choices=ShiftDefinition.WEEKDAY_CHOICES,
        widget=forms.CheckboxSelectMultiple,
        label='أيام العمل',
        initial=[0, 1, 2, 3, 4, 5, 6],
        required=False,
    )

    class Meta:
        model = ShiftDefinition
        fields = ['station', 'island', 'name', 'start_time', 'end_time', 'default_employee',
                  'is_active', 'description', 'display_order']
        widgets = {
            'station': forms.Select(attrs={'class': INPUT_CLASS}),
            'island': forms.Select(attrs={'class': INPUT_CLASS}),
            'name': forms.TextInput(attrs={'class': INPUT_CLASS}),
            'start_time': forms.TimeInput(attrs={'class': INPUT_CLASS, 'type': 'time'}),
            'end_time': forms.TimeInput(attrs={'class': INPUT_CLASS, 'type': 'time'}),
            'default_employee': forms.Select(attrs={'class': INPUT_CLASS}),
            'description': forms.Textarea(attrs={'class': INPUT_CLASS, 'rows': 2}),
            'display_order': forms.NumberInput(attrs={'class': INPUT_CLASS}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        from apps.core.models import Island as IslandModel
        self.fields['island'].required = False
        if self.instance and self.instance.pk:
            self.fields['days'].initial = self.instance.day_list()
        # limit island choices to selected station
        station = self.initial.get('station') or (
            self.instance.station if self.instance and self.instance.pk else None)
        if station:
            self.fields['island'].queryset = IslandModel.objects.filter(station=station)
        else:
            self.fields['island'].queryset = IslandModel.objects.none()

    def clean_days(self):
        return ','.join(sorted(self.cleaned_data.get('days', [])))

    def save(self, commit=True):
        obj = super().save(commit=False)
        obj.days = self.cleaned_data.get('days', obj.days)
        if commit:
            obj.save()
        return obj

    def clean(self):
        cleaned = super().clean()
        start = cleaned.get('start_time')
        end = cleaned.get('end_time')
        # overnight shifts (e.g. 22:00 -> 06:00) are allowed; equal times are not
        if start and end and start == end:
            raise forms.ValidationError('لا يمكن أن يكون وقت البداية والنهاية متساويين')
        employee = cleaned.get('default_employee')
        station = cleaned.get('station')
        if employee and station and employee.station_id != station.id:
            self.add_error('default_employee', 'الموظف الافتراضي يجب أن يكون تابعاً لنفس المحطة')
        island = cleaned.get('island')
        if island and station and island.station_id != station.id:
            self.add_error('island', 'الجزيرة يجب أن تكون تابعة لنفس المحطة')
        return cleaned


class ShiftForm(forms.ModelForm):
    """Create/edit a shift occurrence for a specific date.

    Simple path: pick a definition + date → everything else auto-fills.
    Advanced path: pick station + date + times (no definition).
    Employee is ALWAYS optional — the attendant is chosen later.
    """
    class Meta:
        model = Shift
        fields = ['definition', 'station', 'island', 'date', 'start_time',
                  'end_time', 'employee']
        widgets = {
            'definition': forms.Select(attrs={'class': INPUT_CLASS, 'id': 'id_definition'}),
            'station': forms.Select(attrs={'class': INPUT_CLASS, 'id': 'id_station'}),
            'island': forms.Select(attrs={'class': INPUT_CLASS}),
            'date': forms.DateInput(attrs={'class': INPUT_CLASS, 'type': 'date'}),
            'start_time': forms.TimeInput(attrs={'class': INPUT_CLASS, 'type': 'time', 'id': 'id_start_time'}),
            'end_time': forms.TimeInput(attrs={'class': INPUT_CLASS, 'type': 'time', 'id': 'id_end_time'}),
            'employee': forms.Select(attrs={'class': INPUT_CLASS}),
        }

    def __init__(self, *args, user=None, **kwargs):
        super().__init__(*args, **kwargs)
        from apps.core.permissions import is_owner, user_station
        from apps.shifts.models import ShiftDefinition
        self.fields['employee'].required = False
        self.fields['island'].required = False
        self.fields['definition'].required = False
        self.fields['station'].required = True
        self.fields['date'].required = True
        # only show active definitions with today-compatible days
        st = user_station(user) if user else None
        def_qs = ShiftDefinition.objects.filter(is_active=True)
        if user and not is_owner(user) and st:
            def_qs = def_qs.filter(station=st)
            self.fields['station'].queryset = type(self.fields['station'].queryset).model.objects.filter(pk=st.pk)
            self.fields['island'].queryset = self.fields['island'].queryset.filter(station=st)
            self.fields['employee'].queryset = self.fields['employee'].queryset.filter(station=st)
        self.fields['definition'].queryset = def_qs.select_related('station')
        # build a JSON lookup for JS auto-fill: {def_pk: {station_id, island_id, start_time, end_time}}
        import json
        self._def_data = {}
        for d in def_qs:
            self._def_data[str(d.pk)] = {
                'station_id': d.station_id,
                'island_id': d.island_id or None,
                'start_time': d.start_time.strftime('%H:%M') if d.start_time else '',
                'end_time': d.end_time.strftime('%H:%M') if d.end_time else '',
            }

    def def_json(self):
        import json
        return json.dumps(self._def_data)

    def clean(self):
        cleaned = super().clean()
        definition = cleaned.get('definition')
        date_val = cleaned.get('date')
        start = cleaned.get('start_time')

        if definition:
            if date_val and str(date_val.weekday()) not in [d.strip() for d in definition.days.split(',')]:
                raise forms.ValidationError(
                    f'التعريف "{definition.name}" لا يعمل يوم هذا التاريخ - '
                    f'أيام العمل: {definition.days_display()}'
                )
            # auto-fill from definition
            if not start:
                cleaned['start_time'] = definition.start_time
                self.instance.start_time = definition.start_time
            if not cleaned.get('end_time'):
                cleaned['end_time'] = definition.end_time
            cleaned['station'] = definition.station
            employee = cleaned.get('employee') or definition.default_employee
            cleaned['employee'] = employee
        else:
            # manual: must have station + date + times
            if not start:
                self.add_error('start_time', 'حدد وقت البداية أو اختر تعريف مناوبة')
            if not cleaned.get('end_time'):
                self.add_error('end_time', 'حدد وقت النهاية')

        employee = cleaned.get('employee')
        station = cleaned.get('station')
        if employee and station and employee.station_id != station.id:
            self.add_error('employee', 'الموظف يجب أن يكون تابعاً لنفس المحطة')
        island = cleaned.get('island')
        if island and station and island.station_id != station.id:
            self.add_error('island', 'الجزيرة يجب أن تكون تابعة لنفس المحطة')
        return cleaned


class MeterReadingEntryForm(forms.ModelForm):
    """Add a meter reading to a shift, choosing the actual attendant at entry time.

    Validates meter continuity against the previous closing reading.
    Supports documented exceptions for meter reset/replacement.
    """
    class Meta:
        model = MeterReading
        fields = ['meter', 'attendant', 'start_reading', 'end_reading',
                  'recorded_at', 'override_reason', 'exception_type', 'photo']
        widgets = {
            'meter': forms.Select(attrs={'class': INPUT_CLASS}),
            'attendant': forms.Select(attrs={'class': INPUT_CLASS}),
            'start_reading': forms.NumberInput(attrs={'class': INPUT_CLASS, 'step': '0.001'}),
            'end_reading': forms.NumberInput(attrs={'class': INPUT_CLASS, 'step': '0.001'}),
            'recorded_at': forms.DateTimeInput(attrs={'class': INPUT_CLASS, 'type': 'datetime-local'}),
            'override_reason': forms.Textarea(attrs={'class': INPUT_CLASS, 'rows': 2}),
            'exception_type': forms.Select(attrs={'class': INPUT_CLASS}),
            'photo': forms.ClearableFileInput(attrs={'class': INPUT_CLASS}),
        }

    def __init__(self, *args, shift=None, **kwargs):
        super().__init__(*args, **kwargs)
        self.shift = shift
        self.previous_closing = None
        self.fields['attendant'].required = False
        self.fields['end_reading'].required = False
        self.fields['override_reason'].required = False
        self.fields['exception_type'].required = False
        if not self.initial.get('recorded_at') and not self.instance.pk:
            self.initial['recorded_at'] = timezone.now().strftime('%Y-%m-%dT%H:%M')
        if shift:
            from apps.core.models import Meter as MeterModel
            from apps.employees.models import Employee as EmpModel
            meters_qs = MeterModel.objects.select_related('machine__island')
            if shift.island_id:
                meters_qs = meters_qs.filter(machine__island_id=shift.island_id)
            else:
                meters_qs = meters_qs.filter(machine__island__station=shift.station)
            self.fields['meter'].queryset = meters_qs
            self.fields['attendant'].queryset = EmpModel.objects.filter(
                station=shift.station, status='active')

    def clean(self):
        cleaned = super().clean()
        meter = cleaned.get('meter')
        attendant = cleaned.get('attendant')
        start_reading = cleaned.get('start_reading')
        end_reading = cleaned.get('end_reading')
        override_reason = cleaned.get('override_reason', '')
        exception_type = cleaned.get('exception_type', '')

        # Station/island validation
        if self.shift and meter:
            expected_station = self.shift.station
            meter_ok = (
                (self.shift.island_id and meter.machine.island_id == self.shift.island_id) or
                (not self.shift.island_id and meter.machine.island.station_id == expected_station.id)
            )
            if not meter_ok:
                raise forms.ValidationError('العدّاد غير تابع لمحطة/جزيرة هذه المناوبة')

        if self.shift and attendant and attendant.station_id != self.shift.station_id:
            self.add_error('attendant', 'الموظف يجب أن يكون تابعاً لمحطة المناوبة')

        # ── Continuity validation ──
        if meter and start_reading is not None:
            from .continuity import check_start_reading_continuity
            allow_exc = bool(exception_type)
            is_valid, msg, prev = check_start_reading_continuity(
                meter.pk, start_reading, allow_exception=allow_exc)
            self.previous_closing = prev
            if not is_valid:
                self.add_error('start_reading', msg)

        # ── End reading validation ──
        if end_reading and start_reading is not None:
            if end_reading < start_reading:
                if not exception_type and not override_reason:
                    self.add_error('end_reading',
                                   'القراءة النهائية أقل من القراءة الابتدائية - '
                                   'حدد نوع الاستثناء (تصفير/استبدال العداد) أو سجل سبب')

        return cleaned

    def save(self, commit=True):
        obj = super().save(commit=False)
        if obj.recorded_at is None:
            obj.recorded_at = timezone.now()
        if obj.end_reading is not None:
            obj.liters_sold = obj.end_reading - obj.start_reading
        if commit:
            obj.save()
        return obj


# kept for backwards compatibility (admin usage)
class MeterReadingForm(forms.ModelForm):
    class Meta:
        model = MeterReading
        fields = ['meter', 'start_reading', 'end_reading', 'override_reason', 'photo']
