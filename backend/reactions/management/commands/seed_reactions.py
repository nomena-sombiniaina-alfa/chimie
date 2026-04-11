from django.core.management.base import BaseCommand
from django.db import transaction

from reactions.models import Reaction
from reactions.seed_data import REACTIONS


class Command(BaseCommand):
    help = "Importe les 8 familles de réactions chimiques."

    def add_arguments(self, parser):
        parser.add_argument('--reset', action='store_true')

    @transaction.atomic
    def handle(self, *args, **opts):
        if opts['reset']:
            Reaction.objects.all().delete()

        for r in REACTIONS:
            Reaction.objects.update_or_create(
                slug=r['slug'],
                defaults={k: v for k, v in r.items() if k != 'slug'},
            )

        self.stdout.write(self.style.SUCCESS(f'OK · {len(REACTIONS)} réactions'))
