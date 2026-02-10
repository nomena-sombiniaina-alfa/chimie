"""
Données initiales pour les éléments chimiques (118 éléments).
Portées depuis le projet Vue.js d'origine (reactions-visuelles).
"""

CATEGORIES = [
    # (code, label, color)
    ('alkali',          'Alcalin',                  '#ff3838'),
    ('alkaline-earth',  'Alcalino-terreux',         '#ff8a1a'),
    ('transition',      'Métal de transition',      '#ffd11a'),
    ('post-transition', 'Métal post-transition',    '#94a5c0'),
    ('metalloid',       'Métalloïde',               '#00ffb3'),
    ('nonmetal',        'Non-métal',                '#4dff66'),
    ('halogen',         'Halogène',                 '#caff1a'),
    ('noble-gas',       'Gaz noble',                '#33c2ff'),
    ('lanthanide',      'Lanthanide',               '#b366ff'),
    ('actinide',        'Actinide',                 '#ff4dd1'),
    ('unknown',         'Propriétés inconnues',     '#7a7d8a'),
]

# Format pipe-delimited : Z|symbol|name|mass|category|period|group|block|electroneg|radius|ionization|density|year|color|state
ELEMENTS_RAW = """
1|H|Hydrogène|1.008|nonmetal|1|1|s|2.20|53|1312|0.00009|1766|#ffffff|gas
2|He|Hélium|4.003|noble-gas|1|18|s||31|2372|0.000178|1868|#d9ffff|gas
3|Li|Lithium|6.94|alkali|2|1|s|0.98|152|520|0.534|1817|#cc80ff|solid
4|Be|Béryllium|9.012|alkaline-earth|2|2|s|1.57|112|899|1.85|1798|#c2ff00|solid
5|B|Bore|10.81|metalloid|2|13|p|2.04|87|801|2.34|1808|#ffb5b5|solid
6|C|Carbone|12.011|nonmetal|2|14|p|2.55|67|1086|2.267|0|#a8a8a8|solid
7|N|Azote|14.007|nonmetal|2|15|p|3.04|56|1402|0.001251|1772|#5070f8|gas
8|O|Oxygène|15.999|nonmetal|2|16|p|3.44|48|1314|0.001429|1774|#ff3030|gas
9|F|Fluor|18.998|halogen|2|17|p|3.98|42|1681|0.001696|1886|#90e050|gas
10|Ne|Néon|20.180|noble-gas|2|18|p||38|2081|0.0009|1898|#b3e3f5|gas
11|Na|Sodium|22.990|alkali|3|1|s|0.93|186|496|0.971|1807|#ab5cf2|solid
12|Mg|Magnésium|24.305|alkaline-earth|3|2|s|1.31|160|738|1.738|1808|#8aff00|solid
13|Al|Aluminium|26.982|post-transition|3|13|p|1.61|118|578|2.698|1825|#bfa6a6|solid
14|Si|Silicium|28.085|metalloid|3|14|p|1.90|111|786|2.3296|1824|#f0c8a0|solid
15|P|Phosphore|30.974|nonmetal|3|15|p|2.19|98|1012|1.823|1669|#ff8000|solid
16|S|Soufre|32.06|nonmetal|3|16|p|2.58|88|999.6|2.067|0|#ffe030|solid
17|Cl|Chlore|35.45|halogen|3|17|p|3.16|79|1251|0.003214|1774|#1ff01f|gas
18|Ar|Argon|39.948|noble-gas|3|18|p||71|1521|0.001784|1894|#80d1e3|gas
19|K|Potassium|39.098|alkali|4|1|s|0.82|243|419|0.862|1807|#8f40d4|solid
20|Ca|Calcium|40.078|alkaline-earth|4|2|s|1.00|194|590|1.55|1808|#3dff00|solid
21|Sc|Scandium|44.956|transition|4|3|d|1.36|184|633|2.985|1879|#e6e6e6|solid
22|Ti|Titane|47.867|transition|4|4|d|1.54|176|659|4.507|1791|#bfc2c7|solid
23|V|Vanadium|50.942|transition|4|5|d|1.63|171|651|6.11|1801|#a6a6ab|solid
24|Cr|Chrome|51.996|transition|4|6|d|1.66|166|653|7.14|1797|#8a99c7|solid
25|Mn|Manganèse|54.938|transition|4|7|d|1.55|161|717|7.47|1774|#9c7ac7|solid
26|Fe|Fer|55.845|transition|4|8|d|1.83|126|763|7.874|0|#e06633|solid
27|Co|Cobalt|58.933|transition|4|9|d|1.88|152|760|8.90|1735|#f090a0|solid
28|Ni|Nickel|58.693|transition|4|10|d|1.91|149|737|8.908|1751|#50d050|solid
29|Cu|Cuivre|63.546|transition|4|11|d|1.90|128|745|8.96|0|#c88033|solid
30|Zn|Zinc|65.38|transition|4|12|d|1.65|142|906|7.14|1746|#7d80b0|solid
31|Ga|Gallium|69.723|post-transition|4|13|p|1.81|136|579|5.91|1875|#c28f8f|solid
32|Ge|Germanium|72.630|metalloid|4|14|p|2.01|125|762|5.323|1886|#668f8f|solid
33|As|Arsenic|74.922|metalloid|4|15|p|2.18|114|947|5.776|1250|#bd80e3|solid
34|Se|Sélénium|78.971|nonmetal|4|16|p|2.55|103|941|4.809|1817|#ffa100|solid
35|Br|Brome|79.904|halogen|4|17|p|2.96|94|1140|3.122|1826|#a62929|liquid
36|Kr|Krypton|83.798|noble-gas|4|18|p|3.00|88|1351|0.003749|1898|#5cb8d1|gas
37|Rb|Rubidium|85.468|alkali|5|1|s|0.82|265|403|1.532|1861|#702eb0|solid
38|Sr|Strontium|87.62|alkaline-earth|5|2|s|0.95|219|549|2.64|1790|#00ff00|solid
39|Y|Yttrium|88.906|transition|5|3|d|1.22|212|600|4.472|1794|#94ffff|solid
40|Zr|Zirconium|91.224|transition|5|4|d|1.33|206|640|6.511|1789|#94e0e0|solid
41|Nb|Niobium|92.906|transition|5|5|d|1.6|198|652|8.57|1801|#73c2c9|solid
42|Mo|Molybdène|95.95|transition|5|6|d|2.16|190|684|10.28|1781|#54b5b5|solid
43|Tc|Technétium|98|transition|5|7|d|1.9|183|702|11.5|1937|#3b9e9e|solid
44|Ru|Ruthénium|101.07|transition|5|8|d|2.2|178|710|12.37|1844|#248f8f|solid
45|Rh|Rhodium|102.906|transition|5|9|d|2.28|173|720|12.45|1803|#0a7d8c|solid
46|Pd|Palladium|106.42|transition|5|10|d|2.20|169|804|12.023|1803|#006985|solid
47|Ag|Argent|107.868|transition|5|11|d|1.93|144|731|10.49|0|#c0c0c0|solid
48|Cd|Cadmium|112.414|transition|5|12|d|1.69|161|868|8.65|1817|#ffd98f|solid
49|In|Indium|114.818|post-transition|5|13|p|1.78|156|558|7.31|1863|#a67573|solid
50|Sn|Étain|118.710|post-transition|5|14|p|1.96|145|709|7.31|0|#668080|solid
51|Sb|Antimoine|121.760|metalloid|5|15|p|2.05|133|834|6.685|0|#9e63b5|solid
52|Te|Tellure|127.60|metalloid|5|16|p|2.10|123|869|6.232|1782|#d47a00|solid
53|I|Iode|126.904|halogen|5|17|p|2.66|115|1008|4.933|1811|#940094|solid
54|Xe|Xénon|131.293|noble-gas|5|18|p|2.6|108|1170|0.005894|1898|#429eb0|gas
55|Cs|Césium|132.905|alkali|6|1|s|0.79|298|376|1.873|1860|#57178f|solid
56|Ba|Baryum|137.327|alkaline-earth|6|2|s|0.89|253|503|3.62|1808|#00c900|solid
57|La|Lanthane|138.905|lanthanide|6|3|f|1.10|240|538|6.145|1839|#70d4ff|solid
58|Ce|Cérium|140.116|lanthanide|6||f|1.12|235|534|6.770|1803|#ffffc7|solid
59|Pr|Praséodyme|140.908|lanthanide|6||f|1.13|239|527|6.773|1885|#d9ffc7|solid
60|Nd|Néodyme|144.242|lanthanide|6||f|1.14|229|533|7.007|1885|#c7ffc7|solid
61|Pm|Prométhium|145|lanthanide|6||f|1.13|236|540|7.26|1945|#a3ffc7|solid
62|Sm|Samarium|150.36|lanthanide|6||f|1.17|229|545|7.52|1879|#8fffc7|solid
63|Eu|Europium|151.964|lanthanide|6||f|1.2|233|547|5.243|1901|#61ffc7|solid
64|Gd|Gadolinium|157.25|lanthanide|6||f|1.20|237|593|7.895|1880|#45ffc7|solid
65|Tb|Terbium|158.925|lanthanide|6||f|1.2|221|566|8.229|1843|#30ffc7|solid
66|Dy|Dysprosium|162.500|lanthanide|6||f|1.22|229|573|8.55|1886|#1fffc7|solid
67|Ho|Holmium|164.930|lanthanide|6||f|1.23|216|581|8.795|1878|#00ff9c|solid
68|Er|Erbium|167.259|lanthanide|6||f|1.24|235|589|9.066|1843|#00e675|solid
69|Tm|Thulium|168.934|lanthanide|6||f|1.25|227|597|9.321|1879|#00d452|solid
70|Yb|Ytterbium|173.045|lanthanide|6||f|1.1|242|603|6.965|1878|#00bf38|solid
71|Lu|Lutécium|174.967|lanthanide|6|3|d|1.27|221|524|9.84|1907|#00ab24|solid
72|Hf|Hafnium|178.49|transition|6|4|d|1.3|212|659|13.31|1923|#4dc2ff|solid
73|Ta|Tantale|180.948|transition|6|5|d|1.5|217|761|16.654|1802|#4da6ff|solid
74|W|Tungstène|183.84|transition|6|6|d|2.36|210|770|19.25|1783|#2194d6|solid
75|Re|Rhénium|186.207|transition|6|7|d|1.9|217|760|21.02|1925|#267dab|solid
76|Os|Osmium|190.23|transition|6|8|d|2.2|216|840|22.59|1803|#266696|solid
77|Ir|Iridium|192.217|transition|6|9|d|2.20|202|880|22.56|1803|#175487|solid
78|Pt|Platine|195.084|transition|6|10|d|2.28|209|870|21.45|1735|#d0d0e0|solid
79|Au|Or|196.967|transition|6|11|d|2.54|144|890|19.32|0|#ffd123|solid
80|Hg|Mercure|200.592|transition|6|12|d|2.00|209|1007|13.534|0|#b8b8d0|liquid
81|Tl|Thallium|204.38|post-transition|6|13|p|1.62|196|589|11.85|1861|#a6544d|solid
82|Pb|Plomb|207.2|post-transition|6|14|p|1.87|202|716|11.342|0|#575961|solid
83|Bi|Bismuth|208.980|post-transition|6|15|p|2.02|207|703|9.807|1753|#9e4fb5|solid
84|Po|Polonium|209|metalloid|6|16|p|2.0|197|812|9.32|1898|#ab5c00|solid
85|At|Astate|210|halogen|6|17|p|2.2|202|890|7|1940|#754f45|solid
86|Rn|Radon|222|noble-gas|6|18|p|2.2|220|1037|0.00973|1900|#428296|gas
87|Fr|Francium|223|alkali|7|1|s|0.7|348|380|1.87|1939|#420066|solid
88|Ra|Radium|226|alkaline-earth|7|2|s|0.9|283|509|5.5|1898|#007d00|solid
89|Ac|Actinium|227|actinide|7|3|f|1.1|260|499|10.07|1899|#70abfa|solid
90|Th|Thorium|232.038|actinide|7||f|1.3|240|587|11.72|1828|#00baff|solid
91|Pa|Protactinium|231.036|actinide|7||f|1.5|220|568|15.37|1913|#00a1ff|solid
92|U|Uranium|238.029|actinide|7||f|1.38|196|597|18.95|1789|#008fff|solid
93|Np|Neptunium|237|actinide|7||f|1.36|221|604|20.45|1940|#0080ff|solid
94|Pu|Plutonium|244|actinide|7||f|1.28|187|584|19.84|1940|#006bff|solid
95|Am|Américium|243|actinide|7||f|1.13|180|578|13.69|1944|#545cf2|solid
96|Cm|Curium|247|actinide|7||f|1.28|169|581|13.51|1944|#785ce3|solid
97|Bk|Berkélium|247|actinide|7||f|1.3|||14.78|1949|#8a4fe3|solid
98|Cf|Californium|251|actinide|7||f|1.3|||15.1|1950|#a136d4|solid
99|Es|Einsteinium|252|actinide|7||f|1.3|||8.84|1952|#b31fd4|solid
100|Fm|Fermium|257|actinide|7||f|1.3||||1953|#b31fba|solid
101|Md|Mendélévium|258|actinide|7||f|1.3||||1955|#b30da6|solid
102|No|Nobélium|259|actinide|7||f|1.3||||1958|#bd0d87|solid
103|Lr|Lawrencium|266|actinide|7|3|d|1.3||||1961|#c70066|solid
104|Rf|Rutherfordium|267|transition|7|4|d||||23.2|1964|#cc0059|solid
105|Db|Dubnium|268|transition|7|5|d||||29.3|1968|#d1004f|solid
106|Sg|Seaborgium|269|transition|7|6|d||||35.0|1974|#d90045|solid
107|Bh|Bohrium|270|transition|7|7|d||||37.1|1981|#e00038|solid
108|Hs|Hassium|277|transition|7|8|d||||40.7|1984|#e6002e|solid
109|Mt|Meitnérium|278|transition|7|9|d||||37.4|1982|#eb0026|solid
110|Ds|Darmstadtium|281|transition|7|10|d||||34.8|1994|#e50023|solid
111|Rg|Roentgenium|282|transition|7|11|d||||28.7|1994|#bf0023|solid
112|Cn|Copernicium|285|transition|7|12|d||||23.7|1996|#990023|solid
113|Nh|Nihonium|286|post-transition|7|13|p||||16|2004|#730023|solid
114|Fl|Flérovium|289|post-transition|7|14|p||||14|1998|#660023|solid
115|Mc|Moscovium|290|post-transition|7|15|p||||13.5|2003|#590023|solid
116|Lv|Livermorium|293|post-transition|7|16|p||||12.9|2000|#4f0023|solid
117|Ts|Tennesse|294|halogen|7|17|p||||7.2|2010|#440023|solid
118|Og|Oganesson|294|noble-gas|7|18|p||||5.0|2002|#380023|gas
""".strip()


SOURCES = [
    # (code, label, url, note, verifies)
    ('wikipedia-fr', 'Wikipédia (FR)',
     'https://fr.wikipedia.org/wiki/Liste_des_éléments_chimiques',
     'Référence pour la dénomination française et la classification.',
     ['nameFR', 'mass', 'category']),
    ('wikipedia-en', 'Wikipedia (EN) infobox',
     'https://en.wikipedia.org/wiki/Periodic_table',
     'Référence canonique pour les propriétés périodiques (rayon empirique, densité STP).',
     ['electronegativity', 'atomicRadius', 'density', 'ionizationEnergy']),
    ('nist', 'NIST Atomic Spectra Database',
     'https://physics.nist.gov/PhysRefData/ASD/ionEnergy.html',
     "Source primaire pour les énergies d'ionisation et les configurations électroniques d'état fondamental.",
     ['ionizationEnergy', 'electronConfiguration']),
    ('iupac', 'IUPAC',
     'https://iupac.org/what-we-do/periodic-table-of-elements/',
     'Autorité pour les noms officiels (notamment 113-118 nommés en 2016).',
     ['nameOfficial', 'symbol', 'recentElements']),
    ('webelements', 'WebElements',
     'https://www.webelements.com/',
     'Compilation indépendante utile en cross-check.',
     ['electronegativity', 'ionizationEnergy']),
    ('scf', 'Société Chimique de France',
     'https://www.societechimiquedefrance.fr/',
     "Référence pour les noms français officiels (ex: Tennesse, Flérovium).",
     ['nameFR']),
]
