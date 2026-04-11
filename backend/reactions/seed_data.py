"""13 réactions chimiques organisées en 4 grandes familles :
A. REDOX (transfert d'électrons) - corrosion, combustion, batteries, respiration
B. ACIDE-BASE (transfert de protons) - acides, bases, neutralisation
C. STRUCTURE (réarrangement de liaisons) - substitution, addition, élimination
D. SOLIDES (équilibres de phase) - précipitation, dissolution, équilibre ionique
"""


def _r(slug, name, icon, category, order, equation, definition, principle,
       energetics='', mechanism=None, examples=None, key_concepts=None, pitfalls=None):
    return dict(
        slug=slug, name=name, icon=icon, category=category, order=order,
        equation=equation, definition=definition, principle=principle,
        energetics=energetics,
        mechanism=mechanism or [], examples=examples or [],
        key_concepts=key_concepts or [], pitfalls=pitfalls or [],
    )


REACTIONS = [
    # ===== A. REDOX =====
    _r('corrosion', 'Corrosion (rouille)', '🦀', 'redox', 10,
       equation='4 Fe + 3 O₂ + 2x H₂O → 2 Fe₂O₃·x H₂O',
       definition="Oxydation lente d'un métal au contact de O₂ et d'humidité, formant un oxyde (rouille pour le fer, vert-de-gris pour le cuivre).",
       principle="Le métal cède des électrons à O₂. L'eau ionise et accélère la réaction en formant un microélectrolyte. La rouille est poreuse, elle n'isole pas le fer sous-jacent (contrairement à Al₂O₃ qui passive l'aluminium).",
       energetics='exothermic',
       mechanism=[
           {"step": 1, "text": "Anode : Fe -> Fe²⁺ + 2 e⁻ (oxydation du fer)"},
           {"step": 2, "text": "Cathode : ½ O₂ + H₂O + 2 e⁻ -> 2 OH⁻ (réduction de l'oxygène)"},
           {"step": 3, "text": "Fe²⁺ + 2 OH⁻ -> Fe(OH)₂ puis oxydation en Fe(OH)₃ rouille"},
           {"step": 4, "text": "Déshydratation partielle : Fe₂O₃·x H₂O - flocs poreux"},
       ],
       examples=[
           {"name": "Rouille du fer", "equation": "4 Fe + 3 O₂ -> 2 Fe₂O₃", "notes": "Volume 6x plus gros que le fer initial - éclate la peinture"},
           {"name": "Vert-de-gris du cuivre", "equation": "2 Cu + CO₂ + H₂O + O₂ -> Cu₂(OH)₂CO₃", "notes": "Couleur de la Statue de la Liberté"},
           {"name": "Passivation de l'aluminium", "equation": "4 Al + 3 O₂ -> 2 Al₂O₃", "notes": "Couche imperméable qui protège - l'inverse de la rouille"},
           {"name": "Argenterie noircie", "equation": "4 Ag + 2 H₂S + O₂ -> 2 Ag₂S + 2 H₂O", "notes": "Avec les composés soufrés (jaune d'œuf, etc.)"},
       ],
       key_concepts=[
           "Toute corrosion est une redox spontanée (le métal est le réducteur)",
           "Présence d'eau accélère drastiquement (pile microscopique locale)",
           "Protection : peinture, galvanisation (Zn sacrificiel), inox (Cr passivant)",
           "Économiquement : ~3 % du PIB mondial perdu chaque année",
       ],
       pitfalls=[
           "L'air sec ne suffit pas : sans humidité, le fer rouille à peine.",
           "Le sel marin accélère (ions Cl⁻ = électrolyte) - voitures côtières.",
           "L'aluminium « inoxydable » l'est par sa couche d'oxyde, pas par sa nature.",
       ]),

    _r('combustion', 'Combustion', '🔥', 'redox', 20,
       equation='CH₄ + 2 O₂ → CO₂ + 2 H₂O + énergie',
       definition="Oxydation rapide d'un combustible avec O₂, libérant chaleur et lumière. Cas particulier extrême d'une réaction redox.",
       principle="Le combustible (hydrocarbure, bois, H₂...) cède massivement des électrons à O₂. Énergie d'activation initiale (étincelle), puis la chaleur libérée entretient la réaction en chaîne.",
       energetics='exothermic',
       mechanism=[
           {"step": 1, "text": "Énergie d'activation : étincelle, flamme ou point chaud"},
           {"step": 2, "text": "Rupture des liaisons C-H et O=O (coût initial)"},
           {"step": 3, "text": "Formation de C=O et O-H (gain énergétique net)"},
           {"step": 4, "text": "Auto-entretien : la chaleur active les molécules voisines"},
       ],
       examples=[
           {"name": "Méthane (gaz naturel)", "equation": "CH₄ + 2 O₂ -> CO₂ + 2 H₂O", "notes": "ΔH = -890 kJ/mol"},
           {"name": "Propane (camping, brûleurs)", "equation": "C₃H₈ + 5 O₂ -> 3 CO₂ + 4 H₂O", "notes": "ΔH = -2 220 kJ/mol"},
           {"name": "Bois (cellulose)", "equation": "(C₆H₁₀O₅)ₙ + O₂ -> n CO₂ + n H₂O", "notes": "Combustion lente avec résidus"},
           {"name": "Hydrogène (combustion propre)", "equation": "2 H₂ + O₂ -> 2 H₂O", "notes": "Pas de CO₂"},
       ],
       key_concepts=[
           "Triangle du feu : combustible + comburant + énergie",
           "Combustion complète (CO₂) vs incomplète (CO toxique + suie)",
           "Pouvoir calorifique : kJ libérés par kg ou m³ brûlé",
           "Sous-cas de redox : O₂ accepteur d'e⁻ universel",
       ],
       pitfalls=[
           "Combustion incomplète -> monoxyde de carbone CO inodore et mortel.",
           "L'énergie vient des nouvelles liaisons formées, pas de la rupture.",
           "L'eau produite est vapeur à haute T, pas liquide.",
       ]),

    _r('batteries', 'Piles et batteries', '🔋', 'redox', 30,
       equation='Zn + Cu²⁺ → Zn²⁺ + Cu   (pile Daniell, E° = +1,10 V)',
       definition="Dispositif convertissant l'énergie chimique d'une redox spontanée en énergie électrique en séparant l'oxydation et la réduction par un circuit externe.",
       principle="Anode (oxydation) : le réducteur (Zn) cède des e⁻ qui circulent dans le fil. Cathode (réduction) : l'oxydant (Cu²⁺) les capte. Un pont salin (KNO₃) maintient la neutralité ionique des deux compartiments.",
       energetics='exothermic',
       mechanism=[
           {"step": 1, "text": "Anode (-) : Zn -> Zn²⁺ + 2 e⁻"},
           {"step": 2, "text": "Les e⁻ circulent dans le fil (courant utilisable)"},
           {"step": 3, "text": "Cathode (+) : Cu²⁺ + 2 e⁻ -> Cu (dépôt rouge)"},
           {"step": 4, "text": "Pont salin transporte K⁺ et NO₃⁻ pour équilibrer les charges"},
       ],
       examples=[
           {"name": "Pile alcaline AA", "equation": "Zn + 2 MnO₂ -> ZnO + Mn₂O₃", "notes": "1,5 V, jetable"},
           {"name": "Batterie plomb-acide", "equation": "Pb + PbO₂ + 2 H₂SO₄ -> 2 PbSO₄ + 2 H₂O", "notes": "12 V (6 cellules de 2 V), démarrage auto"},
           {"name": "Batterie lithium-ion", "equation": "LiC₆ + CoO₂ <-> C₆ + LiCoO₂", "notes": "3,7 V, rechargeable, smartphones et VE"},
           {"name": "Pile à combustible H₂", "equation": "2 H₂ + O₂ -> 2 H₂O + énergie élec.", "notes": "Sans CO₂, mais H₂ à produire"},
       ],
       key_concepts=[
           "Tension = différence des potentiels standards E° des deux couples",
           "Capacité (mAh) = charge totale disponible ; énergie (Wh) = capacité x tension",
           "Pile = jetable (réaction non réversible) ; batterie = rechargeable",
           "Échelle des potentiels (Li/Li⁺ très négatif) explique pourquoi Li domine en énergie spécifique",
       ],
       pitfalls=[
           "Pile vs batterie : abus de langage courant - précisez « accumulateur » pour le rechargeable.",
           "Une batterie « pleine » a sa tension max, pas sa capacité max (à mesurer en Ah).",
           "Brûler les piles au lithium est dangereux (emballement thermique).",
       ]),

    _r('respiration', 'Respiration cellulaire', '🫁', 'redox', 40,
       equation='C₆H₁₂O₆ + 6 O₂ → 6 CO₂ + 6 H₂O + ~38 ATP',
       definition="Oxydation contrôlée du glucose par O₂ dans les cellules vivantes, libérant l'énergie sous forme d'ATP (molécule énergétique universelle).",
       principle="C'est une combustion lente, en plusieurs étapes enzymatiques : glycolyse (cytoplasme) -> cycle de Krebs (matrice mitochondriale) -> chaîne respiratoire (membrane mitochondriale). Chaque étape récupère un peu d'énergie sous forme d'ATP.",
       energetics='exothermic',
       mechanism=[
           {"step": 1, "text": "Glycolyse (cytoplasme) : glucose -> 2 pyruvates + 2 ATP + 2 NADH"},
           {"step": 2, "text": "Cycle de Krebs (mitochondrie) : pyruvate -> CO₂ + NADH + FADH₂"},
           {"step": 3, "text": "Chaîne respiratoire : NADH cède ses e⁻ à O₂ via les complexes I-IV"},
           {"step": 4, "text": "ATP synthase : utilise le gradient de H⁺ pour produire ATP (~34 ATP)"},
       ],
       examples=[
           {"name": "Aérobie (avec O₂)", "equation": "C₆H₁₂O₆ + 6 O₂ -> 6 CO₂ + 6 H₂O", "notes": "~38 ATP par glucose, ΔG ≈ -2 870 kJ/mol"},
           {"name": "Fermentation lactique (sans O₂)", "equation": "C₆H₁₂O₆ -> 2 CH₃CHOHCOOH", "notes": "Seulement 2 ATP - muscles à l'effort"},
           {"name": "Fermentation alcoolique (levures)", "equation": "C₆H₁₂O₆ -> 2 C₂H₅OH + 2 CO₂", "notes": "2 ATP - bière, pain, vin"},
           {"name": "Photosynthèse (inverse)", "equation": "6 CO₂ + 6 H₂O -> C₆H₁₂O₆ + 6 O₂", "notes": "Endothermique, utilise la lumière solaire"},
       ],
       key_concepts=[
           "Même équation globale que la combustion, mais en ~30 étapes contrôlées",
           "Glucose oxydé (de 0 à +4 pour C), O₂ réduit (de 0 à -2)",
           "Couplage énergétique : énergie chimique -> ATP (« monnaie » cellulaire)",
           "Rendement ~40 %, le reste est dissipé en chaleur (37 °C corporel)",
       ],
       pitfalls=[
           "« Respirer » n'est pas « inspirer/expirer » : la respiration cellulaire est métabolique.",
           "L'O₂ n'est utilisé qu'en bout de chaîne, la majorité de l'ATP vient du gradient de H⁺.",
           "Glucose n'est pas le seul carburant : lipides et protéines aussi (mais voies différentes).",
       ]),

    # ===== B. ACIDE-BASE =====
    _r('acids', 'Acides (donneurs de H⁺)', '💧', 'acid-base', 10,
       equation='HCl(g) + H₂O(l) → H₃O⁺(aq) + Cl⁻(aq)',
       definition="Espèce capable de céder un proton H⁺ en solution. La force d'un acide se mesure par sa constante d'acidité Ka (et son pKa).",
       principle="L'acide HA s'ionise dans l'eau : HA + H₂O <-> H₃O⁺ + A⁻. Acide fort = ionisation totale (HCl, H₂SO₄). Acide faible = équilibre (CH₃COOH, HF). Le H⁺ est en réalité H₃O⁺ (proton hydraté).",
       energetics='exothermic',
       mechanism=[
           {"step": 1, "text": "La molécule d'acide rencontre H₂O"},
           {"step": 2, "text": "H₂O capte le proton : HA + H₂O -> H₃O⁺ + A⁻"},
           {"step": 3, "text": "L'anion A⁻ est solvaté par les molécules d'eau"},
           {"step": 4, "text": "Si acide fort : ionisation totale ; sinon équilibre Ka"},
       ],
       examples=[
           {"name": "Acide chlorhydrique (fort)", "equation": "HCl -> H⁺ + Cl⁻", "notes": "pKa ~ -7. Estomac humain : HCl gastrique"},
           {"name": "Acide sulfurique (fort)", "equation": "H₂SO₄ -> 2 H⁺ + SO₄²⁻", "notes": "Diprotique. Produit chimique n°1 mondial"},
           {"name": "Acide acétique (faible)", "equation": "CH₃COOH <-> CH₃COO⁻ + H⁺", "notes": "pKa = 4,76. Vinaigre, 5-8 % d'acide"},
           {"name": "Acide carbonique (très faible)", "equation": "CO₂ + H₂O <-> H₂CO₃ <-> H⁺ + HCO₃⁻", "notes": "Eau gazeuse, sang (tampon)"},
       ],
       key_concepts=[
           "pH = -log[H⁺] ; acide -> pH < 7",
           "pKa = -log Ka ; plus pKa est petit, plus l'acide est fort",
           "Définition de Brønsted : donneur de proton",
           "H⁺ n'existe pas seul en solution : c'est H₃O⁺ (hydronium)",
       ],
       pitfalls=[
           "« Acide » ne veut pas dire « dangereux » : le citron est acide, l'eau pure aussi très légèrement.",
           "Toujours verser l'acide DANS l'eau (jamais l'inverse) : risque d'éclaboussure.",
           "pH 0 n'est pas l'acidité maximale - H₂SO₄ concentré a pH négatif.",
       ]),

    _r('bases', 'Bases (capteurs de H⁺)', '🧪', 'acid-base', 20,
       equation='NaOH(s) → Na⁺(aq) + OH⁻(aq)',
       definition="Espèce capable de capter un proton H⁺ (ou de libérer un OH⁻ en solution). pH basique : > 7.",
       principle="Deux familles : bases d'Arrhenius (libèrent OH⁻ comme NaOH) et bases de Brønsted (acceptent H⁺ comme NH₃). En solution, OH⁻ neutralise H⁺ : OH⁻ + H⁺ -> H₂O.",
       energetics='exothermic',
       mechanism=[
           {"step": 1, "text": "Dissolution ou réaction avec H₂O"},
           {"step": 2, "text": "Libération de OH⁻ (NaOH) ou capture de H⁺ (NH₃ + H₂O -> NH₄⁺ + OH⁻)"},
           {"step": 3, "text": "OH⁻ augmente le pH au-dessus de 7"},
           {"step": 4, "text": "Si base forte : ionisation totale ; sinon équilibre Kb"},
       ],
       examples=[
           {"name": "Soude (base forte)", "equation": "NaOH -> Na⁺ + OH⁻", "notes": "pH 14 à 1 mol/L. Déboucheur, savons"},
           {"name": "Potasse", "equation": "KOH -> K⁺ + OH⁻", "notes": "Similaire à NaOH, plus soluble"},
           {"name": "Ammoniaque (base faible)", "equation": "NH₃ + H₂O <-> NH₄⁺ + OH⁻", "notes": "pKb = 4,75. Nettoyants ménagers"},
           {"name": "Bicarbonate (base faible)", "equation": "HCO₃⁻ + H⁺ -> H₂O + CO₂", "notes": "Antiacide ; pâtisserie (effervescence)"},
       ],
       key_concepts=[
           "pH = -log[H⁺] ; base -> pH > 7",
           "pKb = -log Kb ; relation : pKa + pKb = 14",
           "Bases d'Arrhenius (libèrent OH⁻) vs Brønsted (capte H⁺)",
           "Une base forte peut être tout aussi corrosive qu'un acide fort",
       ],
       pitfalls=[
           "NaOH solide attaque la peau (saponification de la graisse) - gants obligatoires.",
           "NH₃ gaz est toxique par inhalation, même en faible concentration.",
           "Une base forte + acide faible ne donne PAS un pH = 7 à l'équivalence (sel basique).",
       ]),

    _r('neutralization', 'Neutralisation', '⚖️', 'acid-base', 30,
       equation='HCl + NaOH → NaCl + H₂O',
       definition="Réaction entre un acide et une base produisant un sel et de l'eau. C'est l'équation clé du titrage acide-base.",
       principle="Le H⁺ de l'acide rencontre le OH⁻ de la base : H⁺ + OH⁻ -> H₂O. Les ions spectateurs (Na⁺, Cl⁻) restent en solution et forment un sel par évaporation. À l'équivalence, n(acide) = n(base).",
       energetics='exothermic',
       mechanism=[
           {"step": 1, "text": "Dissociation : HCl -> H⁺ + Cl⁻ ; NaOH -> Na⁺ + OH⁻"},
           {"step": 2, "text": "Combinaison H⁺ + OH⁻ -> H₂O (étape la plus rapide en chimie)"},
           {"step": 3, "text": "Ions spectateurs Na⁺ et Cl⁻ restent libres"},
           {"step": 4, "text": "Évaporation laisse le sel NaCl"},
       ],
       examples=[
           {"name": "HCl + NaOH (fort-fort)", "equation": "HCl + NaOH -> NaCl + H₂O", "notes": "pH = 7 à l'équivalence"},
           {"name": "H₂SO₄ + 2 NaOH", "equation": "H₂SO₄ + 2 NaOH -> Na₂SO₄ + 2 H₂O", "notes": "Diprotique : 2 OH⁻ par acide"},
           {"name": "CH₃COOH + NaOH (faible-fort)", "equation": "CH₃COOH + NaOH -> CH₃COONa + H₂O", "notes": "Équivalence : pH > 7 (sel basique)"},
           {"name": "NH₃ + HCl (faible-faible)", "equation": "NH₃ + HCl -> NH₄Cl", "notes": "Équivalence : pH < 7 (sel acide)"},
       ],
       key_concepts=[
           "À l'équivalence : moles d'acide = moles de base",
           "Le pH à l'équivalence dépend des forces relatives",
           "ΔH ~ -57 kJ/mol pour fort-fort (constant)",
           "Titrage = méthode de dosage par neutralisation",
       ],
       pitfalls=[
           "pH = 7 seulement pour fort-fort ; sinon le sel hydrolyse partiellement.",
           "Indicateur coloré à choisir selon le pH d'équivalence (BBT pour fort-fort, phénolphtaléine pour faible-fort).",
           "« Neutralisation » n'égale pas toujours « pH neutre ».",
       ]),

    # ===== C. STRUCTURE =====
    _r('substitution', 'Substitution', '🔄', 'structure', 10,
       equation='Zn + 2 HCl → ZnCl₂ + H₂ ↑',
       definition="Un atome ou groupe d'atomes en remplace un autre dans une molécule. Famille majeure en chimie organique (SN1, SN2) et inorganique (déplacement).",
       principle="Le réactif entrant prend la place du sortant. En chimie inorganique : un métal plus réducteur déplace un moins réducteur. En chimie organique : un nucléophile remplace un groupe partant (X⁻).",
       energetics='exothermic',
       mechanism=[
           {"step": 1, "text": "L'agent entrant s'approche de la molécule cible"},
           {"step": 2, "text": "Liaison neuve commence à se former (état de transition)"},
           {"step": 3, "text": "Liaison ancienne se rompt simultanément ou ensuite"},
           {"step": 4, "text": "Produit substitué + groupe partant libéré"},
       ],
       examples=[
           {"name": "Zinc + acide chlorhydrique", "equation": "Zn + 2 HCl -> ZnCl₂ + H₂↑", "notes": "Métal déplace H - bulles d'H₂"},
           {"name": "Halogénation d'un alcane", "equation": "CH₄ + Cl₂ -> CH₃Cl + HCl", "notes": "Substitution radicalaire, initiée par UV"},
           {"name": "Hydrolyse d'un halogénoalcane", "equation": "CH₃CH₂Br + OH⁻ -> CH₃CH₂OH + Br⁻", "notes": "SN2 : nucléophile OH⁻ remplace Br"},
           {"name": "Halogène + halogénure", "equation": "Cl₂ + 2 KBr -> 2 KCl + Br₂", "notes": "Cl plus oxydant que Br"},
       ],
       key_concepts=[
           "Forme A + BC -> AC + B",
           "En organique : SN1 (étape limite = formation carbocation) vs SN2 (concerté)",
           "Série de réactivité des métaux : K > Na > Ca > Mg > Al > Zn > Fe > H > Cu > Ag > Au",
           "Tout déplacement est une redox sous-jacente",
       ],
       pitfalls=[
           "Cu ne déplace pas H d'HCl (Cu après H dans la série) : il faut HNO₃ oxydant.",
           "SN1 favorisée par carbocations stables (tertiaires) ; SN2 par nucléophiles forts.",
           "Au et Pt ne réagissent qu'avec eau régale (HCl + HNO₃).",
       ]),

    _r('addition', 'Addition', '➕', 'structure', 20,
       equation='C₂H₄ + H₂ → C₂H₆   (hydrogénation)',
       definition="Deux molécules s'unissent en une seule sans perte d'atomes : la double (ou triple) liaison s'ouvre pour fixer les nouveaux groupes.",
       principle="Une liaison π faible se casse pour former deux nouvelles liaisons σ plus fortes. Caractéristique des alcènes et alcynes. Le bilan : tous les atomes des réactifs sont dans le produit (économie atomique 100 %).",
       energetics='exothermic',
       mechanism=[
           {"step": 1, "text": "L'agent (H₂, Br₂, HCl, H₂O...) s'approche de la double liaison"},
           {"step": 2, "text": "La liaison π des C=C s'ouvre"},
           {"step": 3, "text": "Chaque carbone forme une nouvelle liaison σ"},
           {"step": 4, "text": "Le produit est saturé (plus de double liaison)"},
       ],
       examples=[
           {"name": "Hydrogénation (margarine)", "equation": "C₂H₄ + H₂ -> C₂H₆", "notes": "Catalyseur Ni, Pd ou Pt. Convertit huile -> graisse"},
           {"name": "Halogénation (test de Baeyer)", "equation": "C₂H₄ + Br₂ -> CH₂BrCH₂Br", "notes": "Décoloration de l'eau de brome - test des alcènes"},
           {"name": "Hydratation (alcool)", "equation": "C₂H₄ + H₂O -> C₂H₅OH", "notes": "Catalyseur H₂SO₄. Production industrielle d'éthanol"},
           {"name": "Polymérisation (plastiques)", "equation": "n CH₂=CH₂ -> -(CH₂-CH₂)ₙ-", "notes": "PE : addition répétée -> polyéthylène"},
       ],
       key_concepts=[
           "Spécifique aux composés à liaisons multiples (alcènes, alcynes, carbonyles)",
           "Économie atomique parfaite : 100 % des atomes utilisés",
           "Règle de Markovnikov pour HX : H sur le C le plus hydrogéné",
           "Inverse de l'élimination",
       ],
       pitfalls=[
           "Les alcanes (saturés) ne font PAS d'addition - uniquement substitution.",
           "L'addition de HBr donne deux régiochimies (Markovnikov / anti-Markovnikov selon conditions).",
           "Catalyseurs Ni/Pd/Pt souvent indispensables - l'hydrogénation à froid n'est pas spontanée.",
       ]),

    _r('elimination', 'Élimination', '➖', 'structure', 30,
       equation='C₂H₅OH → C₂H₄ + H₂O   (déshydratation)',
       definition="Deux atomes ou groupes voisins partent d'une molécule, formant une nouvelle liaison multiple (double ou triple). Inverse de l'addition.",
       principle="Un proton et un groupe partant (OH, X) sont éliminés sur deux carbones voisins, créant une liaison π. Souvent catalysée par chauffage ou par acide (E1) ou par une base forte (E2).",
       energetics='endothermic',
       mechanism=[
           {"step": 1, "text": "Activation du groupe partant (protonation de OH par H⁺ par exemple)"},
           {"step": 2, "text": "Départ du groupe (H₂O, X⁻)"},
           {"step": 3, "text": "Formation d'un carbocation (E1) ou départ simultané (E2)"},
           {"step": 4, "text": "Perte d'un H+ voisin, fermeture de la double liaison"},
       ],
       examples=[
           {"name": "Déshydratation alcool -> alcène", "equation": "C₂H₅OH -> C₂H₄ + H₂O", "notes": "H₂SO₄ concentré, 170 °C. Inverse de l'hydratation"},
           {"name": "Déshydrohalogénation", "equation": "CH₃CH₂Br + KOH -> CH₂=CH₂ + KBr + H₂O", "notes": "Base forte (KOH alcoolique), E2"},
           {"name": "Craquage des hydrocarbures", "equation": "C₁₆H₃₄ -> C₈H₁₈ + C₈H₁₆", "notes": "Industrie pétrolière, 700 °C, catalyseur"},
           {"name": "Décarboxylation", "equation": "R-COOH -> R-H + CO₂", "notes": "Élimination du groupe COOH, libère CO₂"},
       ],
       key_concepts=[
           "Inverse de l'addition : produit insaturé",
           "Mécanismes E1 (deux étapes via carbocation) vs E2 (concerté avec base)",
           "Règle de Zaïtsev : alcène le plus substitué (le plus stable) majoritaire",
           "Nécessite souvent chauffage (endothermique)",
       ],
       pitfalls=[
           "E1 et SN1 sont compétitives (mêmes conditions) - produits parfois mélangés.",
           "E2 a besoin d'une base forte ET non nucléophile (sinon SN2).",
           "Une élimination intramoléculaire (perte d'eau) n'est PAS la même chose qu'un départ d'eau de solvatation.",
       ]),

    # ===== D. SOLIDES =====
    _r('precipitation', 'Précipitation', '⚗️', 'solids', 10,
       equation='Ag⁺(aq) + Cl⁻(aq) → AgCl(s) ↓',
       definition="Formation d'un solide insoluble quand deux solutions ioniques sont mélangées et que le produit ionique dépasse le produit de solubilité Ks.",
       principle="Les ions libres se trouvent et s'assemblent en germes cristallins. Quand [A⁺][B⁻] > Ks, le solide se sépare et sédimente. Test analytique classique pour identifier des ions.",
       energetics='exothermic',
       mechanism=[
           {"step": 1, "text": "Ions dispersés en solution par mouvement brownien"},
           {"step": 2, "text": "Collisions A⁺ ... B⁻ - formation de paires d'ions"},
           {"step": 3, "text": "Nucléation : premiers germes cristallins"},
           {"step": 4, "text": "Croissance des cristaux et sédimentation"},
       ],
       examples=[
           {"name": "Chlorure d'argent", "equation": "Ag⁺ + Cl⁻ -> AgCl(s)", "notes": "Ks = 1,8e-10. Précipité blanc qui noircit à la lumière"},
           {"name": "Sulfate de baryum", "equation": "Ba²⁺ + SO₄²⁻ -> BaSO₄(s)", "notes": "Ks = 1e-10. Repas baryté en radiologie"},
           {"name": "Hydroxyde de fer III", "equation": "Fe³⁺ + 3 OH⁻ -> Fe(OH)₃(s)", "notes": "Rouille caractéristique en milieu basique"},
           {"name": "Calcaire", "equation": "Ca²⁺ + CO₃²⁻ -> CaCO₃(s)", "notes": "Tartre dans les bouilloires"},
       ],
       key_concepts=[
           "Produit de solubilité Ks : seuil au-delà duquel le solide cristallise",
           "Solubilité dépend de T et parfois du pH",
           "Inverse : dissolution (voir section suivante)",
           "Test qualitatif des ions en chimie analytique",
       ],
       pitfalls=[
           "Tous les sels ne précipitent pas : Na⁺ et K⁺ restent toujours en solution.",
           "Le précipité peut se redissoudre en milieu acide (AgCl + NH₃ -> complexe).",
           "Un trouble fin peut être colloïdal - vrai solide mais difficile à filtrer.",
       ]),

    _r('dissolution', 'Dissolution', '💦', 'solids', 20,
       equation='NaCl(s) + H₂O → Na⁺(aq) + Cl⁻(aq)',
       definition="Décomposition d'un solide en ions ou molécules libres dans un solvant. Réaction inverse de la précipitation, gouvernée par les mêmes constantes d'équilibre.",
       principle="Les molécules de solvant (eau dipolaire) entourent les ions du cristal et les arrachent un par un. L'enthalpie de dissolution = énergie réticulaire (à fournir) + énergie de solvatation (libérée).",
       energetics='exothermic',
       mechanism=[
           {"step": 1, "text": "Les dipôles d'eau orientent leur pôle - vers les cations, + vers les anions"},
           {"step": 2, "text": "Les ions de surface sont arrachés du cristal et solvatés"},
           {"step": 3, "text": "Le cristal recule progressivement (la solution avance)"},
           {"step": 4, "text": "Équilibre atteint à saturation : dissolution = recristallisation"},
       ],
       examples=[
           {"name": "Sel de table", "equation": "NaCl + H₂O -> Na⁺(aq) + Cl⁻(aq)", "notes": "359 g/L à 20 °C ; ΔH ~ +3,9 kJ/mol (légèrement endothermique)"},
           {"name": "Sucre", "equation": "C₁₂H₂₂O₁₁(s) -> C₁₂H₂₂O₁₁(aq)", "notes": "Dissolution moléculaire, pas ionique. 2 kg/L à 20 °C !"},
           {"name": "Nitrate d'ammonium (poches de froid)", "equation": "NH₄NO₃ -> NH₄⁺ + NO₃⁻", "notes": "ΔH = +26 kJ/mol - solution se refroidit"},
           {"name": "Chlorure de calcium (poches chaudes)", "equation": "CaCl₂ -> Ca²⁺ + 2 Cl⁻", "notes": "ΔH = -82 kJ/mol - solution chauffe"},
       ],
       key_concepts=[
           "Solubilité = masse maximale dissoute par L de solvant à T donnée",
           "Bilan énergétique : ΔH_dissolution = ΔH_réticulaire - ΔH_solvatation",
           "Saturation : équilibre dynamique solide <-> solution",
           "« Qui se ressemble se dissout » : polaire-polaire, apolaire-apolaire",
       ],
       pitfalls=[
           "La dissolution peut être endothermique (NH₄NO₃) ou exothermique (CaCl₂).",
           "« Dissous » ne veut pas dire « ionisé » : le sucre est dissous mais reste molécule.",
           "L'huile ne se dissout pas dans l'eau (apolaire dans polaire) - règle de polarité.",
       ]),

    _r('ionic-equilibrium', 'Équilibre ionique', '⚖️', 'solids', 30,
       equation='H₂O ⇌ H⁺ + OH⁻   (Kw = 10⁻¹⁴ à 25 °C)',
       definition="État d'équilibre dynamique entre les espèces ioniques d'une solution. Caractérisé par une constante (Ks, Ka, Kw, Kc) qui dépend de la température.",
       principle="À l'équilibre, les vitesses des réactions directe et inverse sont égales. Le principe de Le Chatelier prédit le sens du déplacement quand on perturbe (ajout d'un ion, changement de T...).",
       energetics='athermic',
       mechanism=[
           {"step": 1, "text": "Système initial déséquilibré (ex : ajout d'ions)"},
           {"step": 2, "text": "Le système se déplace pour minimiser la perturbation (Le Chatelier)"},
           {"step": 3, "text": "Nouvelle position d'équilibre où Q (quotient) = K (constante)"},
           {"step": 4, "text": "Vitesses directe et inverse égales - équilibre dynamique"},
       ],
       examples=[
           {"name": "Autoprotolyse de l'eau", "equation": "2 H₂O <-> H₃O⁺ + OH⁻", "notes": "Kw = 1e-14 à 25 °C. Définit le pH = 7 neutre"},
           {"name": "Équilibre de Ks (AgCl)", "equation": "AgCl(s) <-> Ag⁺ + Cl⁻", "notes": "Ks = 1,8e-10. Ajout de Cl⁻ -> reprécipite (effet d'ion commun)"},
           {"name": "Effet d'ion commun", "equation": "CH₃COOH <-> H⁺ + CH₃COO⁻", "notes": "Ajout d'acétate de Na déplace vers la gauche"},
           {"name": "Tampon bicarbonate (sang)", "equation": "H⁺ + HCO₃⁻ <-> H₂CO₃", "notes": "Maintient pH sanguin à 7,4 ± 0,05"},
       ],
       key_concepts=[
           "Équilibre dynamique : pas d'arrêt, vitesses égales dans les deux sens",
           "Principe de Le Chatelier : déplacement vers le côté qui absorbe la perturbation",
           "Effet d'ion commun : ajouter un ion déjà présent recule l'équilibre",
           "K dépend SEULEMENT de T (pas de la concentration initiale)",
       ],
       pitfalls=[
           "Équilibre n'est pas rendement de 100 % : le réactif n'est jamais totalement consommé.",
           "Ajouter un catalyseur n'affecte pas la position de l'équilibre (juste la vitesse).",
           "Augmenter T déplace dans le sens endothermique (ATTENTION : c'est l'inverse pour Ks/Ka).",
       ]),
]
