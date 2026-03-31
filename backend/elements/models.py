from django.db import models


class Category(models.Model):
    """Catégorie d'élément (alcalin, halogène, gaz noble, etc.)"""
    code = models.SlugField(primary_key=True, max_length=40)
    label = models.CharField(max_length=80)
    color = models.CharField(max_length=10, help_text='Couleur HSL/hex')

    class Meta:
        verbose_name_plural = 'Categories'
        ordering = ['code']

    def __str__(self):
        return self.label


class Element(models.Model):
    """Élément chimique du tableau périodique (Z = 1 à 118)."""
    Z = models.PositiveSmallIntegerField(primary_key=True)
    symbol = models.CharField(max_length=4, db_index=True)
    name_fr = models.CharField(max_length=40)
    mass = models.FloatField(help_text='Masse atomique (u)')
    category = models.ForeignKey(
        Category, on_delete=models.PROTECT, related_name='elements'
    )
    period = models.PositiveSmallIntegerField()
    group = models.PositiveSmallIntegerField(null=True, blank=True)
    block = models.CharField(max_length=1, choices=[
        ('s', 's'), ('p', 'p'), ('d', 'd'), ('f', 'f')
    ])
    electronegativity = models.FloatField(null=True, blank=True)
    atomic_radius = models.PositiveIntegerField(null=True, blank=True, help_text='pm')
    ionization_energy = models.FloatField(null=True, blank=True, help_text='kJ/mol')
    density = models.FloatField(null=True, blank=True, help_text='g/cm³')
    year = models.IntegerField(null=True, blank=True, help_text='0 = antiquité')
    color = models.CharField(max_length=10, help_text='Couleur CPK')
    state = models.CharField(max_length=10, choices=[
        ('solid', 'Solide'), ('liquid', 'Liquide'),
        ('gas', 'Gazeux'), ('synthetic', 'Synthétique')
    ])

    # Description pédagogique structurée
    occurrence = models.TextField(blank=True, default='')
    specificity = models.TextField(blank=True, default='')
    uses = models.JSONField(default=list, blank=True)
    role = models.TextField(blank=True, default='')

    # Ions : états d'oxydation courants et énergies d'ionisation successives (kJ/mol)
    valid_charges = models.JSONField(default=list, blank=True,
                                     help_text="États d'oxydation observés (ex : [0, +2, +3] pour le fer)")
    ionization_energies = models.JSONField(default=list, blank=True,
                                          help_text="IE1, IE2, IE3, ... en kJ/mol")
    electron_affinity = models.FloatField(null=True, blank=True,
                                          help_text="Affinité électronique (kJ/mol)")

    class Meta:
        ordering = ['Z']

    def __str__(self):
        return f"{self.Z} · {self.symbol} ({self.name_fr})"


class Source(models.Model):
    """Source scientifique cross-vérifiée pendant la construction du dataset."""
    code = models.SlugField(primary_key=True, max_length=40)
    label = models.CharField(max_length=100)
    url = models.URLField(max_length=400)
    note = models.TextField(blank=True, default='')
    verifies = models.JSONField(default=list, blank=True,
                                help_text='Liste des champs vérifiés')

    class Meta:
        ordering = ['code']

    def __str__(self):
        return self.label
