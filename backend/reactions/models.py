from django.db import models


class Reaction(models.Model):
    """Type de réaction chimique avec son équation, son mécanisme et ses exemples."""
    CATEGORIES = [
        ('redox',     "A. Transfert d'électrons (REDOX)"),
        ('acid-base', "B. Transfert de protons (acide-base)"),
        ('structure', "C. Réarrangement de liaisons (structure)"),
        ('solids',    "D. Formation / rupture de solides (équilibres)"),
    ]
    ENERGETICS = [
        ('exothermic',   'Exothermique'),
        ('endothermic',  'Endothermique'),
        ('athermic',     'Athermique'),
    ]

    slug = models.SlugField(primary_key=True, max_length=40)
    name = models.CharField(max_length=120)
    icon = models.CharField(max_length=4)
    category = models.CharField(max_length=20, choices=CATEGORIES)
    order = models.PositiveSmallIntegerField(default=0, db_index=True)

    equation = models.CharField(max_length=200, help_text="Équation type, ex: 'CH4 + 2 O2 -> CO2 + 2 H2O'")
    definition = models.TextField()
    principle = models.TextField()
    energetics = models.CharField(max_length=15, choices=ENERGETICS, blank=True, default='')

    # JSON pour les champs structurés
    mechanism = models.JSONField(default=list, blank=True, help_text='[{step:1, text:"..."}]')
    examples = models.JSONField(default=list, blank=True, help_text='[{name, equation, notes}]')
    key_concepts = models.JSONField(default=list, blank=True)
    pitfalls = models.JSONField(default=list, blank=True)

    class Meta:
        ordering = ['category', 'order', 'slug']

    def __str__(self):
        return f"{self.icon} {self.name}"
