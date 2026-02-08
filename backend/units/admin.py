from django.contrib import admin
from .models import Unit, SIConstant


@admin.register(Unit)
class UnitAdmin(admin.ModelAdmin):
    list_display = ('slug', 'symbol', 'name', 'quantity', 'group')
    list_filter = ('group',)
    search_fields = ('name', 'symbol', 'quantity')


@admin.register(SIConstant)
class SIConstantAdmin(admin.ModelAdmin):
    list_display = ('symbol', 'name', 'value', 'defines')
