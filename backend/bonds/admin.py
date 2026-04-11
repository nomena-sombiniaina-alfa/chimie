from django.contrib import admin
from .models import BondType


@admin.register(BondType)
class BondTypeAdmin(admin.ModelAdmin):
    list_display = ('slug', 'icon', 'name', 'category', 'year', 'discovered_by')
    list_filter = ('category',)
    search_fields = ('name', 'slug')
    ordering = ('category', 'order')
