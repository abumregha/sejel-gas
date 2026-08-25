from .models import Station


def station_context(request):
    context = {}
    if request.user.is_authenticated and hasattr(request.user, 'profile'):
        profile = request.user.profile
        context['user_profile'] = profile
        context['user_role'] = profile.role
        if profile.station:
            context['current_station'] = profile.station
        if profile.role == 'admin':
            context['stations'] = Station.objects.filter(status='active')
    return context
