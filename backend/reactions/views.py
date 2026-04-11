from rest_framework import viewsets, mixins
from .models import Reaction
from .serializers import ReactionListSerializer, ReactionDetailSerializer


class ReactionViewSet(mixins.RetrieveModelMixin,
                     mixins.ListModelMixin,
                     viewsets.GenericViewSet):
    queryset = Reaction.objects.all()
    lookup_field = 'slug'

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ReactionDetailSerializer
        return ReactionListSerializer
