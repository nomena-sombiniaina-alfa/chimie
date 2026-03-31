"""Charge les catégories, éléments, descriptions et sources dans la base."""
from django.core.management.base import BaseCommand
from django.db import transaction

from elements.models import Category, Element, Source
from elements.seed_data import CATEGORIES, ELEMENTS_RAW, SOURCES
from elements.seed_descriptions import DESCRIPTIONS
from elements.seed_oxidation import VALID_CHARGES, IONIZATION_ENERGIES, ELECTRON_AFFINITIES


def _parse_float(s):
    return float(s) if s else None


def _parse_int(s):
    return int(s) if s else None


class Command(BaseCommand):
    help = "Importe les 118 éléments, leurs descriptions, catégories et sources."

    def add_arguments(self, parser):
        parser.add_argument('--reset', action='store_true',
                            help='Vide les tables avant de réimporter.')

    @transaction.atomic
    def handle(self, *args, **opts):
        if opts['reset']:
            self.stdout.write('Vidage des tables…')
            Element.objects.all().delete()
            Category.objects.all().delete()
            Source.objects.all().delete()

        # ── Categories ──
        self.stdout.write('Catégories…')
        for code, label, color in CATEGORIES:
            Category.objects.update_or_create(
                code=code,
                defaults={'label': label, 'color': color},
            )

        # ── Elements ──
        self.stdout.write('Éléments…')
        cats = {c.code: c for c in Category.objects.all()}
        created = 0
        for line in ELEMENTS_RAW.splitlines():
            line = line.strip()
            if not line:
                continue
            f = line.split('|')
            Z = int(f[0])
            desc = DESCRIPTIONS.get(Z, {})
            Element.objects.update_or_create(
                Z=Z,
                defaults=dict(
                    symbol=f[1],
                    name_fr=f[2],
                    mass=float(f[3]),
                    category=cats[f[4]],
                    period=int(f[5]),
                    group=_parse_int(f[6]),
                    block=f[7],
                    electronegativity=_parse_float(f[8]),
                    atomic_radius=_parse_int(f[9]),
                    ionization_energy=_parse_float(f[10]),
                    density=_parse_float(f[11]),
                    year=_parse_int(f[12]),
                    color=f[13],
                    state=f[14],
                    occurrence=desc.get('occurrence', ''),
                    specificity=desc.get('specificity', ''),
                    uses=desc.get('uses', []),
                    role=desc.get('role', ''),
                    valid_charges=VALID_CHARGES.get(Z, [0]),
                    ionization_energies=IONIZATION_ENERGIES.get(Z, []),
                    electron_affinity=ELECTRON_AFFINITIES.get(Z),
                ),
            )
            created += 1

        # ── Sources ──
        self.stdout.write('Sources…')
        for code, label, url, note, verifies in SOURCES:
            Source.objects.update_or_create(
                code=code,
                defaults={'label': label, 'url': url, 'note': note,
                          'verifies': verifies},
            )

        self.stdout.write(self.style.SUCCESS(
            f'OK · {created} éléments · {len(CATEGORIES)} catégories · {len(SOURCES)} sources'
        ))
