from django.db import models


class BondType(models.Model):
    """Type de liaison chimique ou théorie associée."""
    CATEGORIES = [
        ('intra',  'Liaison intramoléculaire'),
        ('inter',  'Liaison intermoléculaire'),
        ('theory', 'Théorie de la liaison'),
    ]

    slug = models.SlugField(primary_key=True, max_length=40)
    name = models.CharField(max_length=80)
    icon = models.CharField(max_length=4)
    category = models.CharField(max_length=10, choices=CATEGORIES)
    order = models.PositiveSmallIntegerField(default=0, db_index=True)

    year = models.CharField(max_length=20, blank=True, default='')
    discovered_by = models.CharField(max_length=120, blank=True, default='')

    definition = models.TextField()
    principle = models.TextField()
    energy_range = models.CharField(max_length=80, blank=True, default='',
                                    help_text='ex : 400-1000 kJ/mol (ordre de grandeur)')

    # Champs JSON
    examples = models.JSONField(default=list, blank=True,
                                help_text='[{formula, name, notes}]')
    key_concepts = models.JSONField(default=list, blank=True, help_text='[str]')
    pitfalls = models.JSONField(default=list, blank=True, help_text='[str]')

    class Meta:
        ordering = ['category', 'order', 'slug']

    def __str__(self):
        return f"{self.icon} {self.name}"
