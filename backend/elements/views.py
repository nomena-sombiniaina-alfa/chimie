from rest_framework import viewsets, mixins
from rest_framework.response import Response
from .models import Category, Element, Source
from .serializers import (
    CategorySerializer, ElementListSerializer, ElementDetailSerializer,
    SourceSerializer
)


class ElementViewSet(mixins.RetrieveModelMixin,
                     mixins.ListModelMixin,
                     viewsets.GenericViewSet):
    """Endpoints en lecture seule pour les 118 éléments."""
    queryset = Element.objects.select_related('category').all()
    lookup_field = 'Z'
    lookup_value_regex = r'\d+'

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ElementDetailSerializer
        return ElementListSerializer


class CategoryViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class SourceViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    queryset = Source.objects.all()
    serializer_class = SourceSerializer
