from rest_framework import serializers
from .models import Reaction


class ReactionListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reaction
        fields = ('slug', 'name', 'icon', 'category', 'order', 'equation')


class ReactionDetailSerializer(serializers.ModelSerializer):
    keyConcepts = serializers.JSONField(source='key_concepts')

    class Meta:
        model = Reaction
        fields = (
            'slug', 'name', 'icon', 'category', 'order',
            'equation', 'definition', 'principle', 'energetics',
            'mechanism', 'examples', 'keyConcepts', 'pitfalls',
        )
