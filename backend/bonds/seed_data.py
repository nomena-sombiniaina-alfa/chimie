"""Données initiales pour les types de liaisons chimiques.

Les 8 entrées couvrent les liaisons intramoléculaires (ionique, covalente, métallique),
intermoléculaires (hydrogène, Van der Waals), et trois théories explicatives
(Lewis, VSEPR, orbitales moléculaires).
"""


def _b(slug, name, icon, category, order, year, discovered_by, definition,
       principle, energy_range='', examples=None, key_concepts=None, pitfalls=None):
    return dict(
        slug=slug, name=name, icon=icon, category=category, order=order,
        year=year, discovered_by=discovered_by,
        definition=definition, principle=principle, energy_range=energy_range,
        examples=examples or [], key_concepts=key_concepts or [], pitfalls=pitfalls or [],
    )


BONDS = [
    # ───────────────  Liaisons intramoléculaires  ───────────────
    _b('ionic', 'Liaison ionique', '⚡', 'intra', 10,
        year='1916', discovered_by="Walther Kossel",
        definition="Liaison résultant du transfert complet d'un ou plusieurs électrons d'un atome (peu électronégatif) vers un autre (très électronégatif), puis de l'attraction électrostatique entre les ions formés.",
        principle="L'atome donneur perd des électrons et devient cation (charge +). L'atome receveur les capte et devient anion (charge -). Les deux ions s'attirent par force de Coulomb. Apparaît typiquement quand ΔEN > 1,7.",
        energy_range="600-4 000 kJ/mol (réseau cristallin)",
        examples=[
            {"formula": "NaCl", "name": "Chlorure de sodium (sel)", "notes": "ΔEN ≈ 2,1. Na donne, Cl capte."},
            {"formula": "MgO", "name": "Oxyde de magnésium", "notes": "Liaison ionique très forte (2 électrons transférés)."},
            {"formula": "CaF₂", "name": "Fluorure de calcium (fluorite)", "notes": "Ca²⁺ et deux F⁻."},
            {"formula": "K₂O", "name": "Oxyde de potassium", "notes": "Deux K⁺ et un O²⁻."},
        ],
        key_concepts=[
            "Différence d'électronégativité (ΔEN) élevée, typiquement > 1,7",
            "Réseau cristallin tridimensionnel - pas de molécules isolées",
            "Conduit l'électricité fondu ou en solution aqueuse",
            "Points de fusion et d'ébullition très élevés",
        ],
        pitfalls=[
            "Le « pourcentage ionique » est une approximation : aucune liaison n'est 100 % ionique.",
            "NaCl solide ne conduit pas - les ions doivent être mobiles (fusion ou dissolution).",
            "Ne pas dessiner Na-Cl comme une paire isolée : c'est un réseau infini.",
        ]),

    _b('covalent', 'Liaison covalente', '🤝', 'intra', 20,
        year='1916', discovered_by="Gilbert Lewis",
        definition="Liaison formée par le partage d'une ou plusieurs paires d'électrons entre deux atomes, chacun contribuant typiquement un électron à la paire.",
        principle="Les noyaux des deux atomes attirent simultanément la même paire d'électrons. Selon ΔEN, la liaison est non polaire (ΔEN ≈ 0), polaire (0 < ΔEN < 1,7), ou tend vers ionique (ΔEN > 1,7). Peut être simple (σ), double (σ + π) ou triple (σ + 2π).",
        energy_range="150-1 000 kJ/mol",
        examples=[
            {"formula": "H₂", "name": "Dihydrogène", "notes": "Liaison σ simple, parfaitement non polaire."},
            {"formula": "O₂", "name": "Dioxygène", "notes": "Double liaison O=O (σ + π)."},
            {"formula": "N₂", "name": "Diazote", "notes": "Triple liaison N≡N - 945 kJ/mol, l'une des plus fortes connues."},
            {"formula": "H₂O", "name": "Eau", "notes": "Deux liaisons O-H polaires (ΔEN = 1,24)."},
            {"formula": "CH₄", "name": "Méthane", "notes": "Quatre liaisons C-H quasi non polaires (ΔEN = 0,35)."},
        ],
        key_concepts=[
            "Partage symétrique ou dissymétrique selon ΔEN",
            "Géométrie déterminée par VSEPR et la nature des paires",
            "Liaisons σ (recouvrement axial) plus fortes que π (recouvrement latéral)",
            "Forme des molécules discrètes (gaz, liquides, solides moléculaires)",
        ],
        pitfalls=[
            "La double liaison n'est pas « 2 simples » : la liaison π est faible (~250 kJ/mol) face à la σ (~350 kJ/mol).",
            "La polarité d'une liaison ≠ polarité d'une molécule (cf. CO₂, polaire localement mais globalement apolaire).",
            "L'octet n'est pas universel : H se contente de 2, P, S, Si peuvent l'étendre à 10 ou 12.",
        ]),

    _b('metallic', 'Liaison métallique', '⚙️', 'intra', 30,
        year='1900', discovered_by="Paul Drude",
        definition="Liaison entre atomes métalliques où les électrons de valence sont délocalisés dans un « gaz » ou « mer » d'électrons libres autour des cations.",
        principle="Chaque atome métallique cède ses électrons de valence au pool commun. Les cations se rangent en réseau régulier ; les électrons délocalisés assurent la cohésion et expliquent les propriétés métalliques (conduction, malléabilité, brillance).",
        energy_range="100-850 kJ/mol",
        examples=[
            {"formula": "Fe", "name": "Fer", "notes": "Métal ferromagnétique, structure cubique centrée."},
            {"formula": "Cu", "name": "Cuivre", "notes": "Excellent conducteur grâce à un électron 4s très mobile."},
            {"formula": "Au", "name": "Or", "notes": "Très ductile : 1 g s'étire en fil de 2,4 km."},
            {"formula": "Na", "name": "Sodium", "notes": "Métal mou, 1 électron de valence par atome."},
        ],
        key_concepts=[
            "Cations en réseau + électrons délocalisés (modèle de Drude)",
            "Conductivité électrique et thermique élevées",
            "Malléabilité : les couches glissent sans rompre la « colle » électronique",
            "Éclat métallique : interaction des électrons libres avec la lumière",
        ],
        pitfalls=[
            "Le modèle de Drude est classique ; la théorie des bandes (quantique) est plus exacte mais moins intuitive.",
            "Tous les métaux ne sont pas bons conducteurs au même degré (Fe < Cu < Ag).",
            "Le mercure est métallique mais liquide à T ambiante - exception due à des effets relativistes.",
        ]),

    # ───────────────  Liaisons intermoléculaires  ───────────────
    _b('hydrogen', 'Liaison hydrogène', '💧', 'inter', 40,
        year='1920', discovered_by="Wendell Latimer & Worth Rodebush",
        definition="Interaction attractive entre un atome d'hydrogène lié à un atome très électronégatif (F, O, N) et un autre atome électronégatif porteur d'un doublet libre.",
        principle="L'hydrogène lié à F, O ou N devient fortement δ⁺ (peu écranté car pas d'électron interne). Il attire un doublet d'une autre molécule. Plus forte que Van der Waals, plus faible qu'une liaison covalente - environ 10× plus faible.",
        energy_range="5-40 kJ/mol",
        examples=[
            {"formula": "H₂O ⋯ H₂O", "name": "Eau liquide", "notes": "Réseau de ponts H - point d'ébullition anormalement haut."},
            {"formula": "DNA base pairs", "name": "ADN (A-T, G-C)", "notes": "2 ou 3 liaisons H stabilisent la double hélice."},
            {"formula": "NH₃ ⋯ NH₃", "name": "Ammoniac liquide", "notes": "Moins fortes que dans l'eau (N moins EN que O)."},
            {"formula": "HF ⋯ HF", "name": "Fluorure d'hydrogène", "notes": "Le plus fort cas - F a la plus haute EN."},
        ],
        key_concepts=[
            "Pré-requis : H lié à F, O ou N (les 3 atomes très électronégatifs)",
            "Force ~10× supérieure à Van der Waals classique",
            "Explique les propriétés anormales de l'eau (densité max à 4 °C, capacité calorifique élevée)",
            "Cohésion structurelle en biologie (protéines, ADN)",
        ],
        pitfalls=[
            "Le terme « liaison » est trompeur : ce n'est pas un vrai partage d'électrons, c'est une interaction électrostatique forte.",
            "Pas seulement « H + atome EN » : il faut un H lié à F, O ou N spécifiquement. Le C-H n'engendre pas de pont H.",
            "Les liaisons H ne sont pas linéaires en général ; l'angle optimum est ~180° mais beaucoup sont coudées.",
        ]),

    _b('van-der-waals', 'Forces de Van der Waals', '🌫️', 'inter', 50,
        year='1873', discovered_by="Johannes van der Waals",
        definition="Famille d'interactions intermoléculaires faibles dues aux fluctuations électroniques : dipôles permanents, induits ou instantanés (force de London).",
        principle="Les électrons fluctuent en position. À un instant donné, une molécule peut avoir un dipôle instantané, qui induit un dipôle opposé sur sa voisine. Cohérence d'ensemble = attraction faible. Augmente avec la taille / polarisabilité de la molécule.",
        energy_range="0,4-4 kJ/mol",
        examples=[
            {"formula": "He ⋯ He", "name": "Hélium liquide", "notes": "Seules les forces de London - d'où T très basse pour liquéfier."},
            {"formula": "CH₄ ⋯ CH₄", "name": "Méthane", "notes": "Apolaire, T_eb = -161 °C."},
            {"formula": "I₂ (s)", "name": "Diiode solide", "notes": "Molécules apolaires liées uniquement par London."},
            {"formula": "Gecko ⋯ surface", "name": "Adhésion du gecko", "notes": "Forces de London cumulées sur des millions de poils."},
        ],
        key_concepts=[
            "Trois sous-types : Keesom (dipôle-dipôle), Debye (dipôle-induit), London (instantané-induit)",
            "Toujours présentes, même entre molécules apolaires",
            "Augmente avec la masse molaire et la polarisabilité",
            "Responsable de la liquéfaction des gaz nobles aux très basses températures",
        ],
        pitfalls=[
            "Ne pas confondre avec liaison hydrogène : Van der Waals est ~10× plus faible.",
            "« London » englobe à la fois l'effet dipôle instantané ET son nom : force de dispersion de London.",
            "À ne pas négliger en chimie supramoléculaire : leur somme peut être considérable (gecko, ADN, cristaux moléculaires).",
        ]),

    # ───────────────  Théories explicatives  ───────────────
    _b('lewis-theory', 'Théorie de Lewis', '✦', 'theory', 60,
        year='1916', discovered_by="Gilbert N. Lewis",
        definition="Représentation des liaisons par les paires d'électrons partagées (covalentes) ou transférées (ioniques) entre atomes, avec respect de la règle de l'octet (ou du duet pour H).",
        principle="Les atomes cherchent à compléter leur couche externe à 8 électrons (ou 2 pour H). On dessine les électrons de valence en points, les liaisons en traits, les doublets libres en doublets. Les paires actives définissent la réactivité.",
        examples=[
            {"formula": "H₂O", "name": "Eau", "notes": "O entouré de 2 doublets libres + 2 liaisons O-H."},
            {"formula": "NH₃", "name": "Ammoniac", "notes": "N avec 1 doublet libre + 3 liaisons N-H."},
            {"formula": "CO₂", "name": "Dioxyde de carbone", "notes": "O=C=O - deux doubles liaisons, géométrie linéaire."},
            {"formula": "BF₃", "name": "Trifluorure de bore", "notes": "B avec seulement 6 électrons - exception à l'octet."},
        ],
        key_concepts=[
            "Règle de l'octet (ou duet pour H et He)",
            "Doublets liants (paires partagées) vs doublets non liants (paires libres)",
            "Formule développée et formules semi-développées",
            "Précurseure de la théorie de la liaison de valence et de VSEPR",
        ],
        pitfalls=[
            "L'octet a des exceptions importantes : B (6e⁻), expansion pour P, S, Si (10 ou 12 e⁻).",
            "Lewis ne donne pas la géométrie 3D : pour cela, utiliser VSEPR.",
            "Pour les molécules à nombre impair d'électrons (NO, NO₂), la règle est violée.",
        ]),

    _b('vsepr', 'Théorie VSEPR (Gillespie)', '📐', 'theory', 70,
        year='1957', discovered_by="Ronald Gillespie & Ronald Nyholm",
        definition="Modèle géométrique qui prédit la forme 3D des molécules à partir de la répulsion mutuelle des paires d'électrons (liantes et non liantes) autour de l'atome central.",
        principle="Les paires d'électrons se repoussent mutuellement et s'éloignent au maximum. La géométrie dépend du nombre total de paires (AXₙEₘ : A = atome central, X = liaison, E = paire libre). Les paires libres occupent plus de place que les paires liantes.",
        examples=[
            {"formula": "CH₄ (AX₄)", "name": "Méthane - tétraédrique", "notes": "Angle de 109,5°."},
            {"formula": "NH₃ (AX₃E)", "name": "Ammoniac - pyramidal", "notes": "Doublet libre comprime à 107°."},
            {"formula": "H₂O (AX₂E₂)", "name": "Eau - coudée", "notes": "Deux doublets libres comprimnt à 104,5°."},
            {"formula": "CO₂ (AX₂)", "name": "Dioxyde de carbone - linéaire", "notes": "Angle de 180°."},
            {"formula": "SF₆ (AX₆)", "name": "Hexafluorure de soufre - octaédrique", "notes": "Hypervalent, expansion de l'octet."},
        ],
        key_concepts=[
            "Notation AXₙEₘ : E = paire libre, X = atome lié",
            "Géométries de base : linéaire, trigonal plan, tétraédrique, bipyramide trigonale, octaédrique",
            "Les doublets libres déforment légèrement la géométrie idéale",
            "Prédit l'angle et la forme, pas l'énergie",
        ],
        pitfalls=[
            "VSEPR ne marche bien que pour les atomes du bloc principal - moins fiable pour les métaux de transition.",
            "Pour les molécules à plusieurs centres, appliquer la règle à chaque centre.",
            "La géométrie « moléculaire » diffère de la géométrie « électronique » dès qu'il y a des doublets libres.",
        ]),

    _b('molecular-orbital', 'Théorie des orbitales moléculaires', '☁️', 'theory', 80,
        year='1928-1932', discovered_by="Friedrich Hund & Robert Mulliken",
        definition="Description quantique de la liaison où les orbitales atomiques se combinent linéairement pour former des orbitales moléculaires (OM) délocalisées sur toute la molécule.",
        principle="Combinaison Linéaire d'Orbitales Atomiques (CLOA) : 2 OA → 2 OM, une liante (énergie basse) et une antiliante (énergie haute). On remplit les OM par ordre énergétique croissant (Aufbau, Hund, Pauli). L'ordre de liaison = (e⁻ liants − e⁻ antiliants) / 2.",
        examples=[
            {"formula": "H₂", "name": "Dihydrogène", "notes": "2 e⁻ en σ₁ₛ - ordre de liaison = 1, stable."},
            {"formula": "He₂", "name": "Dihélium (n'existe pas)", "notes": "2 e⁻ liants + 2 antiliants = ordre 0."},
            {"formula": "O₂", "name": "Dioxygène", "notes": "2 e⁻ célibataires en π* - paramagnétique. Lewis échouait à le prédire."},
            {"formula": "N₂", "name": "Diazote", "notes": "Ordre de liaison = 3, triple liaison, très stable."},
        ],
        key_concepts=[
            "OM liantes (énergie ↓) vs OM antiliantes (énergie ↑, notées *)",
            "Diagrammes d'énergie : niveaux d'OM remplis selon Aufbau / Hund / Pauli",
            "Ordre de liaison = (n_liants − n_antiliants) / 2",
            "Explique le paramagnétisme de O₂ que Lewis ne prévoyait pas",
        ],
        pitfalls=[
            "Plus rigoureuse que la liaison de valence mais moins intuitive - utiliser les deux selon le contexte.",
            "L'ordre énergétique des OM dépend de la molécule (O₂ vs N₂ ont des séquences différentes).",
            "Pour les grosses molécules, les calculs deviennent vite intractables sans logiciel quantique.",
        ]),
]
