from .models import Station
from .permissions import is_owner, has_role, OPS_ROLES, FIN_OPS_ROLES


def station_context(request):
    context = {}
    if not request.user.is_authenticated:
        return context

    profile = getattr(request.user, 'profile', None)
    if profile:
        context['user_profile'] = profile
        context['user_role'] = profile.role
        if profile.station:
            context['current_station'] = profile.station
    if is_owner(request.user):
        context['stations'] = Station.objects.filter(status='active')
        context['current_station'] = getattr(profile, 'station', None)

    # role flags used by templates (sidebar + action buttons)
    context['user_is_owner'] = is_owner(request.user)
    context['user_is_supervisor'] = has_role(request.user, OPS_ROLES)
    context['user_is_finance'] = has_role(request.user, FIN_OPS_ROLES)
    return context
