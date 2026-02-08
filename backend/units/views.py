from rest_framework import viewsets, mixins
from .models import Unit, SIConstant
from .serializers import UnitListSerializer, UnitDetailSerializer, SIConstantSerializer


class UnitViewSet(mixins.RetrieveModelMixin,
                  mixins.ListModelMixin,
                  viewsets.GenericViewSet):
    queryset = Unit.objects.all()
    lookup_field = 'slug'

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return UnitDetailSerializer
        return UnitListSerializer


class SIConstantViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    queryset = SIConstant.objects.all()
    serializer_class = SIConstantSerializer
