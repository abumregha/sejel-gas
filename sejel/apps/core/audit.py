import json
from django.db.models import Model
from .models import AuditLog


def serialize_model_instance(instance):
    """Convert a model instance to a JSON-serializable dict of its fields."""
    data = {}
    for field in instance._meta.fields:
        value = getattr(instance, field.name)
        if isinstance(value, Model):
            value = value.pk
        elif hasattr(value, 'isoformat'):
            value = value.isoformat()
        elif hasattr(value, '__str__'):
            value = str(value)
        data[field.name] = value
    return data


def log_change(user, action, obj, old_value=None, new_value=None, reason='', ip_address=None):
    """Log a change to a model instance.

    Args:
        user: The User performing the action (or None for system)
        action: One of 'create', 'update', 'delete', 'close', 'reopen', 'cancel'
        obj: The model instance being changed
        old_value: Dict of previous field values (for updates)
        new_value: Dict of new field values (for creates/updates)
        reason: Optional reason for the change
        ip_address: Optional IP address of the requester
    """
    if new_value is None and action != 'delete':
        new_value = serialize_model_instance(obj)

    if old_value is None and action == 'update':
        old_value = {}

    AuditLog.objects.create(
        user=user,
        action=action,
        model_name=obj._meta.label,
        object_id=obj.pk,
        old_value=old_value,
        new_value=new_value,
        reason=reason,
        ip_address=ip_address,
    )


def get_client_ip(request):
    """Extract client IP from request, handling X-Forwarded-For."""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        return x_forwarded_for.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR')
