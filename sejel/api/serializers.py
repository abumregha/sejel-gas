"""DRF serializers for all Sejel models."""
from rest_framework import serializers
from django.contrib.auth.models import User
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


# ── Auth ──────────────────────────────────────────────────────

class UserSerializer(serializers.ModelSerializer):
    role = serializers.CharField(source='profile.role', read_only=True)
    station_id = serializers.PrimaryKeyRelatedField(
        source='profile.station', read_only=True, default=None)
    station_name = serializers.CharField(
        source='profile.station.name', read_only=True, default=None)

    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name',
                  'email', 'is_staff', 'role', 'station_id', 'station_name']


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)


# ── Core ──────────────────────────────────────────────────────

class MarketingCompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = MarketingCompany
        fields = '__all__'


class FuelTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = FuelType
        fields = '__all__'


class StationSerializer(serializers.ModelSerializer):
    islands_count = serializers.IntegerField(read_only=True, default=0)
    meters_count = serializers.IntegerField(read_only=True, default=0)
    employees_count = serializers.IntegerField(read_only=True, default=0)
    tanks_count = serializers.IntegerField(read_only=True, default=0)
    shifts_count = serializers.IntegerField(read_only=True, default=0)

    class Meta:
        model = Station
        fields = '__all__'


class StationDetailSerializer(StationSerializer):
    islands = serializers.SerializerMethodField()
    tanks = serializers.SerializerMethodField()
    settings = serializers.SerializerMethodField()

    class Meta(StationSerializer.Meta):
        fields = '__all__'

    def get_islands(self, obj):
        return IslandSerializer(obj.islands.all(), many=True).data

    def get_tanks(self, obj):
        return TankSerializer(obj.tanks.all(), many=True).data

    def get_settings(self, obj):
        try:
            return StationSettingsSerializer(obj.settings).data
        except StationSettings.DoesNotExist:
            return None


class IslandSerializer(serializers.ModelSerializer):
    station_name = serializers.CharField(source='station.name', read_only=True)
    machines_count = serializers.IntegerField(read_only=True, default=0)

    class Meta:
        model = Island
        fields = '__all__'


class MachineSerializer(serializers.ModelSerializer):
    island_name = serializers.CharField(source='island.name', read_only=True)
    station_name = serializers.CharField(source='island.station.name', read_only=True)
    meters_count = serializers.IntegerField(read_only=True, default=0)

    class Meta:
        model = Machine
        fields = '__all__'


class TankSerializer(serializers.ModelSerializer):
    station_name = serializers.CharField(source='station.name', read_only=True)
    fuel_type_name = serializers.CharField(source='fuel_type.name', read_only=True)
    level_percent = serializers.DecimalField(max_digits=5, decimal_places=1, read_only=True)

    class Meta:
        model = Tank
        fields = '__all__'


class TankReadingSerializer(serializers.ModelSerializer):
    tank_name = serializers.CharField(source='tank.name', read_only=True)
    recorded_by_name = serializers.CharField(source='recorded_by.username', read_only=True, default=None)

    class Meta:
        model = TankReading
        fields = '__all__'


class MeterSerializer(serializers.ModelSerializer):
    machine_name = serializers.CharField(source='machine.name', read_only=True)
    island_name = serializers.CharField(source='machine.island.name', read_only=True)
    fuel_type_name = serializers.CharField(source='fuel_type.name', read_only=True)
    tank_name = serializers.CharField(source='tank.name', read_only=True)
    station_id = serializers.PrimaryKeyRelatedField(
        source='machine.island.station', read_only=True)

    class Meta:
        model = Meter
        fields = '__all__'


class FuelPriceSerializer(serializers.ModelSerializer):
    fuel_type_name = serializers.CharField(source='fuel_type.name', read_only=True)

    class Meta:
        model = FuelPrice
        fields = '__all__'


class StationSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = StationSettings
        fields = '__all__'


class TankAlertSerializer(serializers.ModelSerializer):
    tank_name = serializers.CharField(source='tank.name', read_only=True)
    alert_type_display = serializers.CharField(source='get_alert_type_display', read_only=True)

    class Meta:
        model = TankAlert
        fields = '__all__'


class TankTransferSerializer(serializers.ModelSerializer):
    station_name = serializers.CharField(source='station.name', read_only=True)
    from_tank_name = serializers.CharField(source='from_tank.name', read_only=True)
    to_tank_name = serializers.CharField(source='to_tank.name', read_only=True)
    fuel_type_name = serializers.CharField(source='fuel_type.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.username', read_only=True, default=None)

    class Meta:
        model = TankTransfer
        fields = '__all__'


class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    station_name = serializers.CharField(source='station.name', read_only=True, default=None)

    class Meta:
        model = UserProfile
        fields = '__all__'


# ── Employees ─────────────────────────────────────────────────

class EmployeeSerializer(serializers.ModelSerializer):
    station_name = serializers.CharField(source='station.name', read_only=True)

    class Meta:
        model = Employee
        fields = '__all__'


class ShiftAssignmentSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.name', read_only=True)
    island_name = serializers.CharField(source='island.name', read_only=True)

    class Meta:
        model = ShiftAssignment
        fields = '__all__'


# ── Shifts ────────────────────────────────────────────────────

class ShiftDefinitionSerializer(serializers.ModelSerializer):
    station_name = serializers.CharField(source='station.name', read_only=True)
    island_name = serializers.CharField(source='island.name', read_only=True, default=None)
    days_display = serializers.CharField(read_only=True)

    class Meta:
        model = ShiftDefinition
        fields = '__all__'


class MeterReadingSerializer(serializers.ModelSerializer):
    meter_code = serializers.CharField(source='meter.code', read_only=True)
    fuel_type_name = serializers.CharField(source='meter.fuel_type.name', read_only=True)
    attendant_name = serializers.CharField(source='attendant.name', read_only=True, default=None)
    previous_closing = serializers.DecimalField(
        max_digits=12, decimal_places=3, read_only=True, default=None)

    class Meta:
        model = MeterReading
        fields = '__all__'


class ShiftSerializer(serializers.ModelSerializer):
    station_name = serializers.CharField(source='station.name', read_only=True)
    island_name = serializers.CharField(source='island.name', read_only=True, default=None)
    definition_name = serializers.CharField(source='definition.name', read_only=True, default=None)
    employee_name = serializers.CharField(source='employee.name', read_only=True, default=None)
    readings = MeterReadingSerializer(many=True, read_only=True)
    reconciliation = serializers.SerializerMethodField()
    cash_total = serializers.SerializerMethodField()
    vouchers_total = serializers.SerializerMethodField()
    pos_total = serializers.SerializerMethodField()

    class Meta:
        model = Shift
        fields = '__all__'

    def get_reconciliation(self, obj):
        try:
            return ReconciliationSerializer(obj.reconciliation).data
        except Reconciliation.DoesNotExist:
            return None

    def get_cash_total(self, obj):
        from django.db.models import Sum
        total = obj.cash_collections.filter(is_cancelled=False).aggregate(
            t=Sum('amount'))['t']
        return str(total) if total else '0'

    def get_vouchers_total(self, obj):
        from django.db.models import Sum
        total = obj.vouchers.filter(is_cancelled=False).aggregate(
            t=Sum('total_value'))['t']
        return str(total) if total else '0'

    def get_pos_total(self, obj):
        from django.db.models import Sum
        total = obj.pos_records.filter(is_cancelled=False).aggregate(
            t=Sum('total_amount'))['t']
        return str(total) if total else '0'


# ── Finance ───────────────────────────────────────────────────

class VoucherCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = VoucherCategory
        fields = '__all__'


class CashCollectionSerializer(serializers.ModelSerializer):
    received_by_name = serializers.CharField(source='received_by.username', read_only=True, default=None)

    class Meta:
        model = CashCollection
        fields = '__all__'


class VoucherSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Voucher
        fields = '__all__'


class POSRecordSerializer(serializers.ModelSerializer):
    entered_by_name = serializers.CharField(source='entered_by.username', read_only=True, default=None)

    class Meta:
        model = POSRecord
        fields = '__all__'


class ExpenseCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ExpenseCategory
        fields = '__all__'


class ExpenseSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    station_name = serializers.CharField(source='station.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.username', read_only=True, default=None)

    class Meta:
        model = Expense
        fields = '__all__'


class ShiftFuelSummarySerializer(serializers.ModelSerializer):
    fuel_type_name = serializers.CharField(source='fuel_type.name', read_only=True)

    class Meta:
        model = ShiftFuelSummary
        fields = '__all__'


class ReconciliationSerializer(serializers.ModelSerializer):
    fuel_summaries = ShiftFuelSummarySerializer(many=True, read_only=True)
    shift_date = serializers.DateField(source='shift.date', read_only=True)

    class Meta:
        model = Reconciliation
        fields = '__all__'


class VoucherSettlementSerializer(serializers.ModelSerializer):
    station_name = serializers.CharField(source='station.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.username', read_only=True, default=None)
    outstanding = serializers.DecimalField(max_digits=12, decimal_places=3, read_only=True)

    class Meta:
        model = VoucherSettlement
        fields = '__all__'


# ── Inventory ─────────────────────────────────────────────────

class DeliverySerializer(serializers.ModelSerializer):
    station_name = serializers.CharField(source='station.name', read_only=True)
    tank_name = serializers.CharField(source='tank.name', read_only=True)
    fuel_type_name = serializers.CharField(source='fuel_type.name', read_only=True)
    supplier_name = serializers.CharField(source='supplier.name', read_only=True, default=None)

    class Meta:
        model = Delivery
        fields = '__all__'


class DeliveryDocumentSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.CharField(source='uploaded_by.username', read_only=True, default=None)

    class Meta:
        model = DeliveryDocument
        fields = '__all__'


class ShortageClaimSerializer(serializers.ModelSerializer):
    delivery_id_display = serializers.IntegerField(source='delivery.id', read_only=True)
    station_name = serializers.CharField(source='delivery.station.name', read_only=True)

    class Meta:
        model = ShortageClaim
        fields = '__all__'


class FuelReconciliationSerializer(serializers.ModelSerializer):
    tank_name = serializers.CharField(source='tank.name', read_only=True)
    station_name = serializers.CharField(source='station.name', read_only=True)

    class Meta:
        model = FuelReconciliation
        fields = '__all__'


class DeliveryRequestSerializer(serializers.ModelSerializer):
    station_name = serializers.CharField(source='station.name', read_only=True)
    tank_name = serializers.CharField(source='tank.name', read_only=True)
    fuel_type_name = serializers.CharField(source='fuel_type.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.username', read_only=True, default=None)

    class Meta:
        model = DeliveryRequest
        fields = '__all__'


# ── Dashboard / Reports ──────────────────────────────────────

class DashboardSerializer(serializers.Serializer):
    stations_count = serializers.IntegerField()
    total_shifts_today = serializers.IntegerField()
    total_liters_today = serializers.DecimalField(max_digits=12, decimal_places=3)
    total_collections_today = serializers.DecimalField(max_digits=12, decimal_places=3)
    tank_alerts = TankAlertSerializer(many=True)
    recent_shifts = ShiftSerializer(many=True)
    stations_summary = StationSerializer(many=True)
