from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse


def root(request):
    return JsonResponse({
        'name': 'Chimie API',
        'endpoints': {
            'elements':   '/api/elements/',
            'element':    '/api/elements/<Z>/',
            'categories': '/api/categories/',
            'sources':    '/api/sources/',
            'units':      '/api/units/',
            'unit':       '/api/units/<slug>/',
            'constants':  '/api/si-constants/',
            'bonds':      '/api/bonds/',
            'bond':       '/api/bonds/<slug>/',
        }
    })


urlpatterns = [
    path('', root),
    path('admin/', admin.site.urls),
    path('api/', include('elements.urls')),
    path('api/', include('units.urls')),
    path('api/', include('bonds.urls')),
]
