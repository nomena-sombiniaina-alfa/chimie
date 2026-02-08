from rest_framework.routers import DefaultRouter
from .views import UnitViewSet, SIConstantViewSet

router = DefaultRouter()
router.register(r'units', UnitViewSet, basename='unit')
router.register(r'si-constants', SIConstantViewSet, basename='si-constant')

urlpatterns = router.urls
