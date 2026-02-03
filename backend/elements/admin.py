from django.contrib import admin
from .models import Category, Element, Source


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('code', 'label', 'color')


@admin.register(Element)
class ElementAdmin(admin.ModelAdmin):
    list_display = ('Z', 'symbol', 'name_fr', 'category', 'mass', 'period', 'group')
    list_filter = ('category', 'period', 'block', 'state')
    search_fields = ('symbol', 'name_fr')
    ordering = ('Z',)


@admin.register(Source)
class SourceAdmin(admin.ModelAdmin):
    list_display = ('code', 'label', 'url')
