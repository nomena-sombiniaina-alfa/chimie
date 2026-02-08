from django.db import models


class Unit(models.Model):
    """Unité de mesure (SI base, SI dérivée, ou hors-SI acceptée)."""
    GROUPS = [
        ('base', 'Unités de base'),
        ('derived', 'Unités dérivées'),
        ('accepted', 'Hors-SI acceptées'),
    ]

    slug = models.SlugField(primary_key=True, max_length=40)
    symbol = models.CharField(max_length=10)
    name = models.CharField(max_length=60)
    quantity = models.CharField(max_length=80, help_text='Grandeur mesurée')
    group = models.CharField(max_length=10, choices=GROUPS, default='derived')
    order = models.PositiveSmallIntegerField(default=0, db_index=True)

    definition = models.TextField()
    formula = models.CharField(max_length=200, blank=True, default='')

    # Champs structurés (JSON pour rester souple)
    formula_legend = models.JSONField(default=list, blank=True,
                                      help_text='[{symbol, description}]')
    history = models.JSONField(default=list, blank=True,
                               help_text='[{year, text}]')
    conversions = models.JSONField(default=list, blank=True,
                                   help_text='[{from, to}]')
    pitfalls = models.JSONField(default=list, blank=True,
                                help_text='[str]')

    class Meta:
        ordering = ['group', 'order', 'slug']

    def __str__(self):
        return f"{self.symbol} · {self.name}"


class SIConstant(models.Model):
    """Constante physique fondamentale fixée pour la définition d'une unité de base."""
    slug = models.SlugField(primary_key=True, max_length=40)
    symbol = models.CharField(max_length=20)
    value = models.CharField(max_length=80, help_text='Valeur exacte')
    name = models.CharField(max_length=100)
    defines = models.CharField(max_length=40, help_text='Unité définie')
    order = models.PositiveSmallIntegerField(default=0, db_index=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.symbol} ({self.name})"
