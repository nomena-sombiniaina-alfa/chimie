"""Charge les 8 types de liaisons chimiques (intra, inter, théories)."""
from django.core.management.base import BaseCommand
from django.db import transaction

from bonds.models import BondType
from bonds.seed_data import BONDS


class Command(BaseCommand):
    help = "Importe les types de liaisons chimiques et théories associées."

    def add_arguments(self, parser):
        parser.add_argument('--reset', action='store_true')

    @transaction.atomic
    def handle(self, *args, **opts):
        if opts['reset']:
            BondType.objects.all().delete()

        for b in BONDS:
            BondType.objects.update_or_create(
                slug=b['slug'],
                defaults={k: v for k, v in b.items() if k != 'slug'},
            )

        self.stdout.write(self.style.SUCCESS(f'OK · {len(BONDS)} liaisons'))
