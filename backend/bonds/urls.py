from rest_framework.routers import DefaultRouter
from .views import BondTypeViewSet

router = DefaultRouter()
router.register(r'bonds', BondTypeViewSet, basename='bond')

urlpatterns = router.urls
