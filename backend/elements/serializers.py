from rest_framework import serializers
from .models import Category, Element, Source


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ('code', 'label', 'color')


class ElementListSerializer(serializers.ModelSerializer):
    """Sérialisation légère pour le listing (tableau périodique)."""
    category = serializers.SlugRelatedField(read_only=True, slug_field='code')
    category_color = serializers.CharField(source='category.color', read_only=True)
    nameFR = serializers.CharField(source='name_fr')

    class Meta:
        model = Element
        fields = (
            'Z', 'symbol', 'nameFR', 'mass', 'category', 'category_color',
            'period', 'group', 'block', 'color', 'state'
        )


class ElementDetailSerializer(serializers.ModelSerializer):
    """Sérialisation complète d'un élément (modal de détail)."""
    category = CategorySerializer(read_only=True)
    nameFR = serializers.CharField(source='name_fr')
    electronegativity = serializers.FloatField(allow_null=True)
    atomicRadius = serializers.IntegerField(source='atomic_radius', allow_null=True)
    ionizationEnergy = serializers.FloatField(source='ionization_energy', allow_null=True)
    description = serializers.SerializerMethodField()

    class Meta:
        model = Element
        fields = (
            'Z', 'symbol', 'nameFR', 'mass', 'category',
            'period', 'group', 'block',
            'electronegativity', 'atomicRadius', 'ionizationEnergy', 'density',
            'year', 'color', 'state', 'description'
        )

    def get_description(self, obj):
        return {
            'occurrence': obj.occurrence,
            'specificity': obj.specificity,
            'uses': obj.uses,
            'role': obj.role,
        }


class SourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Source
        fields = ('code', 'label', 'url', 'note', 'verifies')
