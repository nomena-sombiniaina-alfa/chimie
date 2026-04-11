from rest_framework import viewsets, mixins
from .models import BondType
from .serializers import BondTypeListSerializer, BondTypeDetailSerializer


class BondTypeViewSet(mixins.RetrieveModelMixin,
                     mixins.ListModelMixin,
                     viewsets.GenericViewSet):
    queryset = BondType.objects.all()
    lookup_field = 'slug'

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return BondTypeDetailSerializer
        return BondTypeListSerializer
