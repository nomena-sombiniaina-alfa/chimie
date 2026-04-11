from rest_framework import serializers
from .models import BondType


class BondTypeListSerializer(serializers.ModelSerializer):
    class Meta:
        model = BondType
        fields = ('slug', 'name', 'icon', 'category', 'order')


class BondTypeDetailSerializer(serializers.ModelSerializer):
    discoveredBy = serializers.CharField(source='discovered_by')
    energyRange = serializers.CharField(source='energy_range')
    keyConcepts = serializers.JSONField(source='key_concepts')

    class Meta:
        model = BondType
        fields = (
            'slug', 'name', 'icon', 'category', 'order',
            'year', 'discoveredBy', 'definition', 'principle', 'energyRange',
            'examples', 'keyConcepts', 'pitfalls',
        )
