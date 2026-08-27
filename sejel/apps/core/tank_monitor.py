"""Automated tank level monitoring.

Checks tank levels and generates alerts when:
- Tank level < 20% capacity → low alert
- Tank level < 10% capacity → critical alert
- Tank level = 0 → empty alert
- Tank level >= 95% capacity → full alert
"""
from decimal import Decimal
from .models import Tank, TankAlert


LOW_THRESHOLD = Decimal('20')    # percent
CRITICAL_THRESHOLD = Decimal('10')  # percent
FULL_THRESHOLD = Decimal('95')    # percent


def check_tank_levels(station=None):
    """Check all tanks and generate alerts for low/critical/empty levels.
    
    Returns list of new alerts created.
    """
    tanks = Tank.objects.filter(station__status='active').select_related('station', 'fuel_type')
    if station:
        tanks = tanks.filter(station=station)
    
    new_alerts = []
    for tank in tanks:
        if tank.capacity <= 0:
            continue
        
        level_percent = (tank.current_level / tank.capacity * 100)
        
        # Check for existing unresolved alert of same type
        existing = TankAlert.objects.filter(
            tank=tank, is_resolved=False
        ).values_list('alert_type', flat=True)
        
        if level_percent <= 0 and 'empty' not in existing:
            alert = TankAlert.objects.create(
                station=tank.station,
                tank=tank,
                alert_type='empty',
                message=f'الخزان "{tank.name or tank.fuel_type}" فارغ تماماً',
            )
            new_alerts.append(alert)
        
        elif level_percent < CRITICAL_THRESHOLD and 'critical' not in existing and 'empty' not in existing:
            alert = TankAlert.objects.create(
                station=tank.station,
                tank=tank,
                alert_type='critical',
                message=f'الخزان "{tank.name or tank.fuel_type}" رصيد حرج: {level_percent:.1f}% ({tank.current_level} لتر)',
            )
            new_alerts.append(alert)
        
        elif level_percent < LOW_THRESHOLD and 'low' not in existing and 'critical' not in existing and 'empty' not in existing:
            alert = TankAlert.objects.create(
                station=tank.station,
                tank=tank,
                alert_type='low',
                message=f'الخزان "{tank.name or tank.fuel_type}" رصيد منخفض: {level_percent:.1f}% ({tank.current_level} لتر)',
            )
            new_alerts.append(alert)
        
        elif level_percent >= FULL_THRESHOLD and 'full' not in existing:
            alert = TankAlert.objects.create(
                station=tank.station,
                tank=tank,
                alert_type='full',
                message=f'الخزان "{tank.name or tank.fuel_type}" يكاد يكون ممتلئاً: {level_percent:.1f}%',
            )
            new_alerts.append(alert)
    
    return new_alerts


def get_active_alerts(station=None):
    """Get all unresolved alerts, optionally filtered by station."""
    qs = TankAlert.objects.filter(is_resolved=False).select_related('tank', 'station')
    if station:
        qs = qs.filter(station=station)
    return qs


def resolve_alert(alert_id):
    """Mark an alert as resolved."""
    from django.utils import timezone
    alert = TankAlert.objects.get(pk=alert_id)
    alert.is_resolved = True
    alert.resolved_at = timezone.now()
    alert.save(update_fields=['is_resolved', 'resolved_at'])
