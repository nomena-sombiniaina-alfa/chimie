from rest_framework import serializers
from .models import Unit, SIConstant


class UnitListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Unit
        fields = ('slug', 'symbol', 'name', 'quantity', 'group')


class UnitDetailSerializer(serializers.ModelSerializer):
    formulaLegend = serializers.JSONField(source='formula_legend')

    class Meta:
        model = Unit
        fields = (
            'slug', 'symbol', 'name', 'quantity', 'group',
            'definition', 'formula', 'formulaLegend',
            'history', 'conversions', 'pitfalls'
        )


class SIConstantSerializer(serializers.ModelSerializer):
    class Meta:
        model = SIConstant
        fields = ('slug', 'symbol', 'value', 'name', 'defines')
