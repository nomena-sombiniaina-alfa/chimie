from django.contrib import admin
from .models import Reaction


@admin.register(Reaction)
class ReactionAdmin(admin.ModelAdmin):
    list_display = ('slug', 'icon', 'name', 'category', 'energetics', 'equation')
    list_filter = ('category', 'energetics')
    search_fields = ('name', 'slug', 'equation')
    ordering = ('order',)
