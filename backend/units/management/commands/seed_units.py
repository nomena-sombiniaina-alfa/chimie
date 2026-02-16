"""Charge les unités SI + hors-SI et les 7 constantes fondamentales."""
from django.core.management.base import BaseCommand
from django.db import transaction

from units.models import Unit, SIConstant
from units.seed_data import UNITS, SI_CONSTANTS


class Command(BaseCommand):
    help = "Importe les unités SI/hors-SI et les constantes fondamentales."

    def add_arguments(self, parser):
        parser.add_argument('--reset', action='store_true',
                            help='Vide les tables avant de réimporter.')

    @transaction.atomic
    def handle(self, *args, **opts):
        if opts['reset']:
            self.stdout.write('Vidage des tables…')
            Unit.objects.all().delete()
            SIConstant.objects.all().delete()

        # ── Constantes SI ──
        self.stdout.write('Constantes SI…')
        for slug, symbol, value, name, defines, order in SI_CONSTANTS:
            SIConstant.objects.update_or_create(
                slug=slug,
                defaults={'symbol': symbol, 'value': value, 'name': name,
                          'defines': defines, 'order': order},
            )

        # ── Unités ──
        self.stdout.write('Unités…')
        for u in UNITS:
            Unit.objects.update_or_create(
                slug=u['slug'],
                defaults={
                    'symbol': u['symbol'],
                    'name': u['name'],
                    'quantity': u['quantity'],
                    'group': u['group'],
                    'order': u['order'],
                    'definition': u['definition'],
                    'formula': u['formula'],
                    'formula_legend': u['formula_legend'],
                    'history': u['history'],
                    'conversions': u['conversions'],
                    'pitfalls': u['pitfalls'],
                },
            )

        self.stdout.write(self.style.SUCCESS(
            f'OK · {len(UNITS)} unités · {len(SI_CONSTANTS)} constantes SI'
        ))
