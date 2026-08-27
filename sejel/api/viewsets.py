"""DRF viewsets with station isolation and role-based access."""
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.db.models import Count, Sum, Q, F
from django.utils import timezone
from datetime import date, timedelta
from decimal import Decimal

from rest_framework import viewsets, status, permissions
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from apps.core.models import (
    MarketingCompany, Station, Island, Machine, FuelType, Tank,
    TankReading, Meter, FuelPrice, StationSettings, TankAlert,
    TankTransfer, UserProfile,
)
from apps.shifts.models import ShiftDefinition, Shift, MeterReading
from apps.finance.models import (
    VoucherCategory, CashCollection, Voucher, POSRecord,
    ExpenseCategory, Expense, VoucherSettlement, Reconciliation,
    ShiftFuelSummary,
)
from apps.inventory.models import (
    FuelReconciliation, DeliveryRequest, Delivery,
    DeliveryDocument, ShortageClaim,
)
from apps.employees.models import Employee, ShiftAssignment
from apps.core.permissions import is_owner, user_station, FIN_OPS_ROLES, OPS_ROLES
import calendar as cal

from .serializers import (
    UserSerializer, LoginSerializer,
    MarketingCompanySerializer, StationSerializer, StationDetailSerializer,
    IslandSerializer, MachineSerializer, FuelTypeSerializer, TankSerializer,
    TankReadingSerializer, MeterSerializer, FuelPriceSerializer,
    StationSettingsSerializer, TankAlertSerializer, TankTransferSerializer,
    UserProfileSerializer,
    EmployeeSerializer, ShiftAssignmentSerializer,
    ShiftDefinitionSerializer, ShiftSerializer, MeterReadingSerializer,
    VoucherCategorySerializer, CashCollectionSerializer, VoucherSerializer,
    POSRecordSerializer, ExpenseCategorySerializer, ExpenseSerializer,
    VoucherSettlementSerializer, ReconciliationSerializer,
    ShiftFuelSummarySerializer,
    DeliverySerializer, DeliveryDocumentSerializer, ShortageClaimSerializer,
    FuelReconciliationSerializer, DeliveryRequestSerializer,
)


# ── Helper ────────────────────────────────────────────────────

def _scope_qs(request, qs, station_field='station'):
    """Filter queryset to user's station if not owner."""
    if not is_owner(request.user):
        st = user_station(request.user)
        if st:
            qs = qs.filter(**{station_field: st})
    return qs


# ── Auth ──────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(username=username, password=password)
    if user is None:
        return Response({'error': 'بيانات الدخول غير صحيحة'}, status=status.HTTP_401_UNAUTHORIZED)
    refresh = RefreshToken.for_user(user)
    return Response({
        'access': str(refresh.access_token),
        'refresh': str(refresh),
        'user': UserSerializer(user).data,
    })


@api_view(['GET'])
def me_view(request):
    return Response(UserSerializer(request.user).data)


# ── Users / Profile ──────────────────────────────────────────

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.select_related('profile', 'profile__station').all()
    serializer_class = UserSerializer

    def get_queryset(self):
        if is_owner(self.request.user):
            return self.queryset
        return self.queryset.filter(pk=self.request.user.pk)

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        password = data.pop('password', 'user123')
        role = data.pop('role', 'supervisor')
        station_id = data.pop('station_id', None)
        user = User.objects.create_user(**data, password=password)
        UserProfile.objects.create(user=user, role=role, station_id=station_id)
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)


# ── Core ──────────────────────────────────────────────────────

class MarketingCompanyViewSet(viewsets.ModelViewSet):
    queryset = MarketingCompany.objects.all()
    serializer_class = MarketingCompanySerializer


class FuelTypeViewSet(viewsets.ModelViewSet):
    queryset = FuelType.objects.all()
    serializer_class = FuelTypeSerializer


class StationViewSet(viewsets.ModelViewSet):
    serializer_class = StationSerializer

    def get_queryset(self):
        qs = Station.objects.annotate(
            islands_count=Count('islands', distinct=True),
            meters_count=Count('islands__machines__meters', distinct=True),
            employees_count=Count('employees', distinct=True),
            tanks_count=Count('tanks', distinct=True),
            shifts_count=Count('shifts', distinct=True),
        )
        return _scope_qs(self.request, qs)

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return StationDetailSerializer
        return StationSerializer


class IslandViewSet(viewsets.ModelViewSet):
    serializer_class = IslandSerializer

    def get_queryset(self):
        qs = Island.objects.annotate(machines_count=Count('machines', distinct=True))
        qs = _scope_qs(self.request, qs)
        station_id = self.request.query_params.get('station')
        if station_id:
            qs = qs.filter(station_id=station_id)
        return qs


class MachineViewSet(viewsets.ModelViewSet):
    serializer_class = MachineSerializer

    def get_queryset(self):
        qs = Machine.objects.annotate(meters_count=Count('meters', distinct=True))
        if not is_owner(self.request.user):
            st = user_station(self.request.user)
            if st:
                qs = qs.filter(island__station=st)
        station_id = self.request.query_params.get('station')
        if station_id:
            qs = qs.filter(island__station_id=station_id)
        island_id = self.request.query_params.get('island')
        if island_id:
            qs = qs.filter(island_id=island_id)
        return qs


class TankViewSet(viewsets.ModelViewSet):
    serializer_class = TankSerializer

    def get_queryset(self):
        qs = Tank.objects.all()
        qs = _scope_qs(self.request, qs)
        station_id = self.request.query_params.get('station')
        if station_id:
            qs = qs.filter(station_id=station_id)
        fuel_type = self.request.query_params.get('fuel_type')
        if fuel_type:
            qs = qs.filter(fuel_type_id=fuel_type)
        return qs


class TankReadingViewSet(viewsets.ModelViewSet):
    serializer_class = TankReadingSerializer

    def get_queryset(self):
        qs = TankReading.objects.select_related('tank', 'recorded_by')
        if not is_owner(self.request.user):
            st = user_station(self.request.user)
            if st:
                qs = qs.filter(tank__station=st)
        tank_id = self.request.query_params.get('tank')
        if tank_id:
            qs = qs.filter(tank_id=tank_id)
        return qs

    def perform_create(self, serializer):
        serializer.save(recorded_by=self.request.user)


class MeterViewSet(viewsets.ModelViewSet):
    serializer_class = MeterSerializer

    def get_queryset(self):
        qs = Meter.objects.select_related('machine__island__station', 'fuel_type', 'tank')
        if not is_owner(self.request.user):
            st = user_station(self.request.user)
            if st:
                qs = qs.filter(machine__island__station=st)
        station_id = self.request.query_params.get('station')
        if station_id:
            qs = qs.filter(machine__island__station_id=station_id)
        return qs


class FuelPriceViewSet(viewsets.ModelViewSet):
    serializer_class = FuelPriceSerializer

    def get_queryset(self):
        return FuelPrice.objects.select_related('fuel_type').all()


class TankAlertViewSet(viewsets.ModelViewSet):
    serializer_class = TankAlertSerializer

    def get_queryset(self):
        qs = TankAlert.objects.select_related('tank', 'station')
        qs = _scope_qs(self.request, qs)
        resolved = self.request.query_params.get('resolved')
        if resolved is not None:
            qs = qs.filter(is_resolved=resolved.lower() == 'true')
        return qs


class TankTransferViewSet(viewsets.ModelViewSet):
    serializer_class = TankTransferSerializer

    def get_queryset(self):
        qs = TankTransfer.objects.select_related('station', 'from_tank', 'to_tank', 'fuel_type', 'created_by')
        qs = _scope_qs(self.request, qs)
        station_id = self.request.query_params.get('station')
        if station_id:
            qs = qs.filter(station_id=station_id)
        return qs

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


# ── Employees ─────────────────────────────────────────────────

class EmployeeViewSet(viewsets.ModelViewSet):
    serializer_class = EmployeeSerializer

    def get_queryset(self):
        qs = Employee.objects.all()
        qs = _scope_qs(self.request, qs)
        station_id = self.request.query_params.get('station')
        if station_id:
            qs = qs.filter(station_id=station_id)
        return qs


class ShiftAssignmentViewSet(viewsets.ModelViewSet):
    serializer_class = ShiftAssignmentSerializer
    queryset = ShiftAssignment.objects.select_related('employee', 'island')


# ── Shifts ────────────────────────────────────────────────────

class ShiftDefinitionViewSet(viewsets.ModelViewSet):
    serializer_class = ShiftDefinitionSerializer

    def get_queryset(self):
        qs = ShiftDefinition.objects.select_related('station', 'island')
        qs = _scope_qs(self.request, qs)
        station_id = self.request.query_params.get('station')
        if station_id:
            qs = qs.filter(station_id=station_id)
        return qs

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class MeterReadingViewSet(viewsets.ModelViewSet):
    serializer_class = MeterReadingSerializer

    def get_queryset(self):
        qs = MeterReading.objects.select_related('shift', 'meter', 'meter__fuel_type', 'attendant')
        if not is_owner(self.request.user):
            st = user_station(self.request.user)
            if st:
                qs = qs.filter(shift__station=st)
        shift_id = self.request.query_params.get('shift')
        if shift_id:
            qs = qs.filter(shift_id=shift_id)
        return qs

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class ShiftViewSet(viewsets.ModelViewSet):
    serializer_class = ShiftSerializer

    def get_queryset(self):
        qs = Shift.objects.select_related(
            'station', 'island', 'definition', 'employee', 'closed_by'
        ).prefetch_related('readings', 'readings__meter', 'cash_collections', 'vouchers', 'pos_records')
        qs = _scope_qs(self.request, qs)
        station_id = self.request.query_params.get('station')
        if station_id:
            qs = qs.filter(station_id=station_id)
        shift_status = self.request.query_params.get('status')
        if shift_status:
            qs = qs.filter(status=shift_status)
        shift_date = self.request.query_params.get('date')
        if shift_date:
            qs = qs.filter(date=shift_date)
        return qs

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['post'])
    def close(self, request, pk=None):
        """Close a shift and create reconciliation."""
        shift = self.get_object()
        try:
            from apps.shifts.services import close_shift
            rec = close_shift(shift, closed_by=request.user)
            return Response(ReconciliationSerializer(rec).data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


# ── Finance ───────────────────────────────────────────────────

class VoucherCategoryViewSet(viewsets.ModelViewSet):
    queryset = VoucherCategory.objects.all()
    serializer_class = VoucherCategorySerializer


class CashCollectionViewSet(viewsets.ModelViewSet):
    serializer_class = CashCollectionSerializer

    def get_queryset(self):
        qs = CashCollection.objects.select_related('shift', 'received_by')
        if not is_owner(self.request.user):
            st = user_station(self.request.user)
            if st:
                qs = qs.filter(shift__station=st)
        shift_id = self.request.query_params.get('shift')
        if shift_id:
            qs = qs.filter(shift_id=shift_id)
        return qs

    def perform_create(self, serializer):
        serializer.save(received_by=self.request.user)


class VoucherViewSet(viewsets.ModelViewSet):
    serializer_class = VoucherSerializer

    def get_queryset(self):
        qs = Voucher.objects.select_related('shift', 'category')
        if not is_owner(self.request.user):
            st = user_station(self.request.user)
            if st:
                qs = qs.filter(shift__station=st)
        shift_id = self.request.query_params.get('shift')
        if shift_id:
            qs = qs.filter(shift_id=shift_id)
        return qs


class POSRecordViewSet(viewsets.ModelViewSet):
    serializer_class = POSRecordSerializer

    def get_queryset(self):
        qs = POSRecord.objects.select_related('shift', 'entered_by')
        if not is_owner(self.request.user):
            st = user_station(self.request.user)
            if st:
                qs = qs.filter(shift__station=st)
        shift_id = self.request.query_params.get('shift')
        if shift_id:
            qs = qs.filter(shift_id=shift_id)
        return qs

    def perform_create(self, serializer):
        serializer.save(entered_by=self.request.user)


class ExpenseCategoryViewSet(viewsets.ModelViewSet):
    serializer_class = ExpenseCategorySerializer
    queryset = ExpenseCategory.objects.all()


class ExpenseViewSet(viewsets.ModelViewSet):
    serializer_class = ExpenseSerializer

    def get_queryset(self):
        qs = Expense.objects.select_related('station', 'shift', 'category', 'created_by')
        qs = _scope_qs(self.request, qs)
        station_id = self.request.query_params.get('station')
        if station_id:
            qs = qs.filter(station_id=station_id)
        return qs

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class VoucherSettlementViewSet(viewsets.ModelViewSet):
    serializer_class = VoucherSettlementSerializer

    def get_queryset(self):
        qs = VoucherSettlement.objects.select_related('station', 'created_by')
        qs = _scope_qs(self.request, qs)
        station_id = self.request.query_params.get('station')
        if station_id:
            qs = qs.filter(station_id=station_id)
        return qs

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class ReconciliationViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ReconciliationSerializer

    def get_queryset(self):
        qs = Reconciliation.objects.select_related('shift', 'shift__station').prefetch_related('fuel_breakdown')
        qs = _scope_qs(self.request, qs, station_field='shift__station')
        return qs


# ── Inventory ─────────────────────────────────────────────────

class DeliveryViewSet(viewsets.ModelViewSet):
    serializer_class = DeliverySerializer

    def get_queryset(self):
        qs = Delivery.objects.select_related('station', 'tank', 'fuel_type', 'supplier')
        qs = _scope_qs(self.request, qs)
        station_id = self.request.query_params.get('station')
        if station_id:
            qs = qs.filter(station_id=station_id)
        return qs

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class DeliveryDocumentViewSet(viewsets.ModelViewSet):
    serializer_class = DeliveryDocumentSerializer

    def get_queryset(self):
        return DeliveryDocument.objects.select_related('delivery', 'uploaded_by')

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)


class ShortageClaimViewSet(viewsets.ModelViewSet):
    serializer_class = ShortageClaimSerializer

    def get_queryset(self):
        qs = ShortageClaim.objects.select_related('delivery', 'delivery__station')
        if not is_owner(self.request.user):
            st = user_station(self.request.user)
            if st:
                qs = qs.filter(delivery__station=st)
        return qs


class FuelReconciliationViewSet(viewsets.ModelViewSet):
    serializer_class = FuelReconciliationSerializer

    def get_queryset(self):
        qs = FuelReconciliation.objects.select_related('tank', 'station')
        qs = _scope_qs(self.request, qs)
        station_id = self.request.query_params.get('station')
        if station_id:
            qs = qs.filter(station_id=station_id)
        return qs

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class DeliveryRequestViewSet(viewsets.ModelViewSet):
    serializer_class = DeliveryRequestSerializer

    def get_queryset(self):
        qs = DeliveryRequest.objects.select_related('station', 'tank', 'fuel_type', 'created_by')
        qs = _scope_qs(self.request, qs)
        station_id = self.request.query_params.get('station')
        if station_id:
            qs = qs.filter(station_id=station_id)
        return qs

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


# ── Reports API ─────────────────────────────────────────────

@api_view(['GET'])
def report_daily_api(request):
    """Daily report API endpoint."""
    report_date = request.GET.get('date', date.today().isoformat())
    if isinstance(report_date, str):
        report_date = date.fromisoformat(report_date)

    shifts = Shift.objects.filter(date=report_date)
    if not is_owner(request.user):
        st = user_station(request.user)
        if st:
            shifts = shifts.filter(station=st)

    readings = MeterReading.objects.filter(shift__date=report_date, shift__in=shifts)
    total_liters = readings.aggregate(t=Sum('liters_sold'))['t'] or Decimal('0')
    total_cash = CashCollection.objects.filter(shift__in=shifts, is_cancelled=False).aggregate(t=Sum('amount'))['t'] or Decimal('0')
    total_vouchers = Voucher.objects.filter(shift__in=shifts, is_cancelled=False).aggregate(t=Sum('total_value'))['t'] or Decimal('0')
    total_pos = POSRecord.objects.filter(shift__in=shifts, is_cancelled=False).aggregate(t=Sum('total_amount'))['t'] or Decimal('0')
    total_collection = total_cash + total_vouchers + total_pos

    stations_data = []
    for st in Station.objects.all():
        if not is_owner(request.user):
            ust = user_station(request.user)
            if ust and st.pk != ust.pk:
                continue
        st_shifts = shifts.filter(station=st)
        if not st_shifts.exists():
            continue
        st_readings = MeterReading.objects.filter(shift__in=st_shifts)
        st_liters = st_readings.aggregate(t=Sum('liters_sold'))['t'] or Decimal('0')
        st_cash = CashCollection.objects.filter(shift__in=st_shifts, is_cancelled=False).aggregate(t=Sum('amount'))['t'] or Decimal('0')
        st_vouchers = Voucher.objects.filter(shift__in=st_shifts, is_cancelled=False).aggregate(t=Sum('total_value'))['t'] or Decimal('0')
        st_pos = POSRecord.objects.filter(shift__in=st_shifts, is_cancelled=False).aggregate(t=Sum('total_amount'))['t'] or Decimal('0')
        st_collection = st_cash + st_vouchers + st_pos
        # Use average fuel price for expected sales
        st_expected = st_readings.aggregate(t=Sum('liters_sold'))['t'] or Decimal('0')
        from apps.core.models import FuelPrice
        avg_price = FuelPrice.objects.order_by('-effective_date').first()
        price_val = avg_price.price if avg_price else Decimal('0.150')
        st_expected_sales = st_expected * price_val
        stations_data.append({
            'id': st.pk, 'name': st.name,
            'liters': str(st_liters), 'expected_sales': str(st_expected_sales),
            'collected': str(st_collection), 'difference': str(st_collection - st_expected_sales),
        })

    from apps.core.models import FuelPrice
    avg_price = FuelPrice.objects.order_by('-effective_date').first()
    price_val = avg_price.price if avg_price else Decimal('0.150')
    total_expected = total_liters * price_val

    return Response({
        'total_liters': str(total_liters),
        'total_expected_sales': str(total_expected),
        'total_collected': str(total_collection),
        'difference': str(total_collection - total_expected),
        'stations': stations_data,
    })


@api_view(['GET'])
def report_monthly_api(request):
    """Monthly report API endpoint."""
    today = date.today()
    month = int(request.GET.get('month', today.month))
    year = int(request.GET.get('year', today.year))

    shifts = Shift.objects.filter(date__month=month, date__year=year)
    if not is_owner(request.user):
        st = user_station(request.user)
        if st:
            shifts = shifts.filter(station=st)

    readings = MeterReading.objects.filter(shift__in=shifts)
    total_liters = readings.aggregate(t=Sum('liters_sold'))['t'] or Decimal('0')
    total_cash = CashCollection.objects.filter(shift__in=shifts, is_cancelled=False).aggregate(t=Sum('amount'))['t'] or Decimal('0')
    total_vouchers = Voucher.objects.filter(shift__in=shifts, is_cancelled=False).aggregate(t=Sum('total_value'))['t'] or Decimal('0')
    total_pos = POSRecord.objects.filter(shift__in=shifts, is_cancelled=False).aggregate(t=Sum('total_amount'))['t'] or Decimal('0')
    total_collection = total_cash + total_vouchers + total_pos

    stations_data = []
    for st in Station.objects.all():
        if not is_owner(request.user):
            ust = user_station(request.user)
            if ust and st.pk != ust.pk:
                continue
        st_shifts = shifts.filter(station=st)
        if not st_shifts.exists():
            continue
        st_readings = MeterReading.objects.filter(shift__in=st_shifts)
        st_liters = st_readings.aggregate(t=Sum('liters_sold'))['t'] or Decimal('0')
        st_cash = CashCollection.objects.filter(shift__in=st_shifts, is_cancelled=False).aggregate(t=Sum('amount'))['t'] or Decimal('0')
        st_vouchers = Voucher.objects.filter(shift__in=st_shifts, is_cancelled=False).aggregate(t=Sum('total_value'))['t'] or Decimal('0')
        st_pos = POSRecord.objects.filter(shift__in=st_shifts, is_cancelled=False).aggregate(t=Sum('total_amount'))['t'] or Decimal('0')
        st_collection = st_cash + st_vouchers + st_pos
        from apps.core.models import FuelPrice
        avg_price = FuelPrice.objects.order_by('-effective_date').first()
        price_val = avg_price.price if avg_price else Decimal('0.150')
        st_expected = st_liters * price_val
        stations_data.append({
            'id': st.pk, 'name': st.name,
            'liters': str(st_liters), 'expected_sales': str(st_expected),
            'collected': str(st_collection),
        })

    from apps.core.models import FuelPrice
    avg_price = FuelPrice.objects.order_by('-effective_date').first()
    price_val = avg_price.price if avg_price else Decimal('0.150')
    total_expected = total_liters * price_val

    return Response({
        'total_liters': str(total_liters),
        'total_expected_sales': str(total_expected),
        'total_collected': str(total_collection),
        'total_shifts': shifts.count(),
        'stations': stations_data,
    })


# ── Dashboard ─────────────────────────────────────────────────

@api_view(['GET'])
def dashboard_view(request):
    """Aggregate dashboard data."""
    today = date.today()
    stations_qs = Station.objects.all()
    if not is_owner(request.user):
        st = user_station(request.user)
        if st:
            stations_qs = stations_qs.filter(pk=st.pk)

    shifts_today = Shift.objects.filter(date=today)
    if not is_owner(request.user):
        st = user_station(request.user)
        if st:
            shifts_today = shifts_today.filter(station=st)

    reading_agg = MeterReading.objects.filter(
        shift__date=today, liters_sold__isnull=False
    )
    if not is_owner(request.user):
        st = user_station(request.user)
        if st:
            reading_agg = reading_agg.filter(shift__station=st)

    collection_agg = CashCollection.objects.filter(
        shift__date=today, is_cancelled=False
    )
    if not is_owner(request.user):
        st = user_station(request.user)
        if st:
            collection_agg = collection_agg.filter(shift__station=st)

    alerts = TankAlert.objects.filter(is_resolved=False)
    if not is_owner(request.user):
        st = user_station(request.user)
        if st:
            alerts = alerts.filter(station=st)

    recent = Shift.objects.select_related(
        'station', 'island', 'employee', 'definition'
    ).order_by('-date', '-start_time')[:10]
    if not is_owner(request.user):
        st = user_station(request.user)
        if st:
            recent = recent.filter(station=st)

    station_data = Station.objects.annotate(
        islands_count=Count('islands', distinct=True),
        meters_count=Count('islands__machines__meters', distinct=True),
        tanks_count=Count('tanks', distinct=True),
    )
    if not is_owner(request.user):
        st = user_station(request.user)
        if st:
            station_data = station_data.filter(pk=st.pk)

    return Response({
        'stations_count': stations_qs.count(),
        'total_shifts_today': shifts_today.count(),
        'total_liters_today': reading_agg.aggregate(t=Sum('liters_sold'))['t'] or Decimal('0'),
        'total_collections_today': collection_agg.aggregate(t=Sum('amount'))['t'] or Decimal('0'),
        'tank_alerts': TankAlertSerializer(alerts[:10], many=True).data,
        'recent_shifts': ShiftSerializer(recent, many=True).data,
        'stations_summary': StationSerializer(station_data, many=True).data,
    })
