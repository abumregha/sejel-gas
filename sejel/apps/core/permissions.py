"""Role-based access control + station isolation.

Roles (UserProfile.role):
    admin      -> Station Owner: full access to all stations.
    manager,
    supervisor -> Station Supervisor: operations CRUD scoped to their station.
    finance    -> Station Finance: financial CRUD scoped to their station.

Authorization is enforced in views via decorators/helpers; hiding UI buttons
is only a convenience on top of this layer.
"""
from functools import wraps

from django.core.exceptions import PermissionDenied
from django.db.models import ProtectedError
from django.shortcuts import get_object_or_404, redirect

OWNER_ROLES = {'admin'}
SUPERVISOR_ROLES = {'manager', 'supervisor'}
FINANCE_ROLES = {'finance'}

# Role bundles per domain
OPS_ROLES = OWNER_ROLES | SUPERVISOR_ROLES          # operations CRUD
FIN_OPS_ROLES = OWNER_ROLES | FINANCE_ROLES         # finance CRUD
ALL_STAFF_ROLES = OPS_ROLES | FINANCE_ROLES


def role_of(user):
    if not user.is_authenticated:
        return None
    profile = getattr(user, 'profile', None)
    return profile.role if profile else None


def is_owner(user):
    return user.is_superuser or role_of(user) in OWNER_ROLES


def has_role(user, roles):
    return user.is_superuser or role_of(user) in roles


def user_station(user):
    """Station bound to the user's profile (None for owners)."""
    if not user.is_authenticated:
        return None
    profile = getattr(user, 'profile', None)
    return profile.station if profile else None


def require_roles(roles):
    """View decorator: allow only users whose role is in `roles`."""
    def decorator(view):
        @wraps(view)
        def wrapped(request, *args, **kwargs):
            if not request.user.is_authenticated:
                return redirect('login')
            if not has_role(request.user, roles):
                raise PermissionDenied
            return view(request, *args, **kwargs)
        return wrapped
    return decorator


def ensure_station_access(user, obj):
    """Raise PermissionDenied unless `user` may see `obj`.

    Owners can access everything; other roles are limited to objects that
    belong to their own station. Works with any object exposing `.station_id`
    or an explicit `station` kwarg. If `obj` IS a Station, uses its pk.
    """
    if is_owner(user):
        return
    # If obj is a Station itself, use its pk
    from apps.core.models import Station
    if isinstance(obj, Station):
        station_id = obj.pk
    else:
        station_id = getattr(obj, 'station_id', None)
    if station_id is None:
        # try common relations
        for rel in ('shift', 'delivery'):
            related = getattr(obj, rel, None)
            if related is not None:
                station_id = getattr(related, 'station_id', None)
                break
    own = getattr(user_station(user), 'id', None)
    if station_id != own:
        raise PermissionDenied


def scope_queryset(user, qs):
    """Filter a queryset with a `station` field to the user's station."""
    st = user_station(user)
    if is_owner(user) or st is None:
        return qs
    return qs.filter(station=st)


def scope_shift_queryset(user, qs):
    """Filter a queryset with a `shift__station` path to the user's station."""
    st = user_station(user)
    if is_owner(user) or st is None:
        return qs
    return qs.filter(shift__station=st)


def require_staff(view):
    """View decorator: allow only Django staff/superusers (system admins)."""
    @wraps(view)
    def wrapped(request, *args, **kwargs):
        if not request.user.is_authenticated:
            return redirect('login')
        if not (request.user.is_superuser or request.user.is_staff):
            raise PermissionDenied
        return view(request, *args, **kwargs)
    return wrapped


def safe_delete(obj):
    """Try to delete `obj`; returns (True, []) on success.

    On ProtectedError returns (False, [protected_objects]) so callers can
    show a friendly message instead of a 500 error page.
    """
    try:
        obj.delete()
        return True, []
    except ProtectedError as exc:
        return False, list(exc.protected_objects)


def describe_blockers(blockers):
    """Human-readable Arabic summary of objects blocking a deletion."""
    counts = {}
    for b in blockers:
        label = type(b)._meta.verbose_name
        counts[label] = counts.get(label, 0) + 1
    return '، '.join(f'{v} {k}' for k, v in counts.items())


def count_dependents(obj):
    """Count child objects that would be cascade-deleted.

    Returns a dict of {verbose_name: count} for all reverse FK relations
    that point at `obj`.  Useful for showing users what will be affected
    before a deletion.
    """
    counts = {}
    for rel in obj._meta.get_fields():
        if not rel.one_to_many or rel.auto_created:
            continue
        related_model = rel.related_model
        accessor_name = rel.get_accessor_name()
        qs = getattr(obj, accessor_name).all()
        # For OneToOneField reverse relations, count is 0 or 1
        if hasattr(rel, 'one_to_one') and rel.one_to_one:
            try:
                qs.get()
                label = related_model._meta.verbose_name
                counts[label] = 1
            except related_model.DoesNotExist:
                pass
        else:
            n = qs.count()
            if n:
                label = related_model._meta.verbose_name
                counts[label] = counts.get(label, 0) + n
    return counts


def user_has_records(user):
    """True if any business record references this user via an FK.

    Audit fields are usually SET_NULL, so Django allows deleting the user and
    silently losing who did what - we refuse that and disable instead.
    """
    from django.contrib.auth.models import User
    from django.apps import apps
    skip_apps = {'admin', 'auth', 'contenttypes', 'sessions'}
    skip_models = {'UserProfile'}
    for model in apps.get_models():
        if model._meta.app_label in skip_apps or model.__name__ in skip_models:
            continue
        for field in model._meta.concrete_fields:
            if getattr(field, 'related_model', None) is not User:
                continue
            if model._default_manager.filter(**{field.name: user}).exists():
                return True
    return False


def station_has_financial_data(station):
    """Check if a station has any financial records that must not be lost."""
    from apps.finance.models import CashCollection, Voucher, POSRecord, Reconciliation, Expense
    from apps.shifts.models import MeterReading
    from apps.inventory.models import Delivery

    # Check shift-based financial data
    shift_ids = list(
        station.shifts.values_list('id', flat=True)
    )
    if not shift_ids:
        return False

    # Check financial records associated with this station's shifts
    has_cash = CashCollection.objects.filter(shift_id__in=shift_ids, is_cancelled=False).exists()
    has_vouchers = Voucher.objects.filter(shift_id__in=shift_ids, is_cancelled=False).exists()
    has_pos = POSRecord.objects.filter(shift_id__in=shift_ids).exists()
    has_reconciliation = Reconciliation.objects.filter(shift_id__in=shift_ids).exists()
    has_expenses = Expense.objects.filter(station=station).exists()
    has_readings = MeterReading.objects.filter(shift_id__in=shift_ids).exists()
    has_deliveries = Delivery.objects.filter(station=station).exists()

    return any([has_cash, has_vouchers, has_pos, has_reconciliation,
                has_expenses, has_readings, has_deliveries])


def station_403(request, exception=None):
    from django.shortcuts import render
    return render(request, 'pages/403.html', status=403)
