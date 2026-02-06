from rest_framework.routers import DefaultRouter
from .views import ElementViewSet, CategoryViewSet, SourceViewSet

router = DefaultRouter()
router.register(r'elements', ElementViewSet, basename='element')
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'sources', SourceViewSet, basename='source')

urlpatterns = router.urls
