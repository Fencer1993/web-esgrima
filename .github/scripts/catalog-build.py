"""Genera los productos de sable de la tienda a partir de data/catalog-raw/.

Uso: python3 .github/scripts/catalog-build.py
Conserva lo editado a mano en tienda.json (descripción, activo, foto) y los
productos que no vienen de la importación (sin "imported": true).
"""
import json, re, pathlib

ROOT = pathlib.Path(__file__).resolve().parents[2]
RAW = ROOT / "data/catalog-raw"
OUT = ROOT / "src/content/data/tienda.json"
IVA_ES = 1.21  # Grant publica precios sin IVA

SIZE_KEYS = {"talla", "tallas", "tallas us", "größe auswählen", "klingengröße auswählen"}
HAND_KEYS = {"mano", "lateralidad", "händigkeit auswählen"}
HANDS = {"diestro": "Diestro", "diestra": "Diestro", "rechts": "Diestro",
         "zurdo": "Zurdo", "zurda": "Zurdo", "links": "Zurdo"}
OPT_NAMES = {"klingenfarbe auswählen": "Color", "platzierung auswählen": "Posición"}
SIZE_TR = {"Maßanfertigung": "A medida", "Gr. 5 (Standard)": "5 (estándar)"}
COLOR_TR = {"gold": "Oro"}

# ---------------------------------------------------------------- Grant
GRANT_CATS = {
    'sable-cazoletas': 'Piezas y recambios', 'enchufes-y-fieltros': 'Piezas y recambios',
    'pomos': 'Piezas y recambios', 'sable-punos': 'Piezas y recambios',
    'articulos-de-reparacion': 'Piezas y recambios', 'kits': 'Piezas y recambios', 'prueba': 'Piezas y recambios',
    'armas-completas-sable-armas-y-hojas': 'Sables y hojas', 'hojas-sable-armas-y-hojas': 'Sables y hojas',
    'sable-armas-y-hojas': 'Sables y hojas',
    'calzado-calzado-y-medias': 'Calzado y medias', 'medias-y-talonera': 'Calzado y medias',
    'caretas': 'Caretas', '350': 'Caretas', 'fie': 'Caretas', 'accesorios': 'Caretas',
    'guantes-sable-electrico': 'Guantes y manguitos', 'manguitos': 'Guantes y manguitos',
    'sable': 'Chaquetas eléctricas', 'inox-sable': 'Chaquetas eléctricas', 'no-inox-sable': 'Chaquetas eléctricas',
    'petos-interiores': 'Protección', 'protectores': 'Protección', 'protector-hombre': 'Protección',
    'protector-mujer': 'Protección',
    'traje-350': 'Trajes', 'chaqueta-350': 'Trajes', 'pantalon-350': 'Trajes', 'trajes-completos': 'Trajes',
    'trajes-800-fie': 'Trajes', 'chaquetas-fie-800': 'Trajes', 'pantalones-fie': 'Trajes',
    'material-de-maestro': 'Material de maestro', 'caretas-guantes-protectores': 'Material de maestro',
    'gj': 'Material de maestro', 'light': 'Material de maestro', 'profi': 'Material de maestro',
    'ninos': 'Iniciación (plástico y espuma)', 'pasante-accesorios': 'Pasantes y conectores',
    'silla-de-ruedas': 'Silla de ruedas',
    'medias-y-talonera': 'Calzado y medias',
}
GRANT_EXC_CATS = {'florete', 'inox', 'no-inox', 'espada', 'florete-armas-y-hojas', 'guantes-espada-florete',
                  'puntas-espada', 'puntas-florete', 'pasante-espada', 'pasante-florete', 'material-de-pista',
                  'regalos-y-juguetes', 'bolsas', 'sable-laser'}
# Material de prueba de espada/florete (pesos y galgas de punta).
GRANT_EXC_NAME = re.compile(r'^(peso|galgas)', re.I)
GRANT_KEEP = {'Medias de esgrima negras PBT', 'Careta «PBT» 350N CE Negro'}

# -------------------------------------------------------------- Allstar
ALLSTAR_CATS = {
    'waffen/saebel/komplette-saebel': 'Sables y hojas', 'waffen/saebel/saebelklingen': 'Sables y hojas',
    'waffen/saebel/glocken-mehr': 'Piezas y recambios', 'waffen/saebel/griffe-mehr': 'Piezas y recambios',
    'waffen/saebel/koerperkabel-mehr': 'Pasantes y conectores',
    'masken/saebel': 'Caretas', 'masken/zubehoer': 'Caretas',
    'bekleidung-schuhe/elektrowesten/saebel': 'Chaquetas eléctricas',
    'bekleidung-schuhe/elektrowesten/bedruckung-zubehoer': 'Chaquetas eléctricas',
    'bekleidung-schuhe/anzuege/350n': 'Trajes', 'bekleidung-schuhe/anzuege/fie-800n': 'Trajes',
    'bekleidung-schuhe/handschuhe/saebel': 'Guantes y manguitos',
    'bekleidung-schuhe/handschuhe/zubehoer': 'Guantes y manguitos',
    'bekleidung-schuhe/schuhe-struempfe/schuhe': 'Calzado y medias',
    'bekleidung-schuhe/schuhe-struempfe/struempfe': 'Calzado y medias',
    'bekleidung-schuhe/schuhe-struempfe/sonstiges': 'Calzado y medias',
    'bekleidung-schuhe/schutzausruestung/brustschuetzer': 'Protección',
    'bekleidung-schuhe/schutzausruestung/unterziehplastrons': 'Protección',
    'bekleidung-schuhe/schutzausruestung/sonstige-schutzausruestung': 'Protección',
}
ALLSTAR_NAMES = {
    'ES17': 'Sable eléctrico BF FIE maraging', 'ES11': 'Sable eléctrico Allstar',
    'ES11-0': 'Sable eléctrico Allstar mini', 'ES10-0': 'Sable eléctrico Allstar Ecostar mini',
    'MS11': 'Sable Allstar (no eléctrico)', 'MS10-0': 'Sable Allstar Ecostar mini (no eléctrico)',
    'S27': 'Hoja de sable BF FIE maraging', 'S20': 'Hoja de sable Allstar Ecostar', 'S24': 'Hoja de sable Allstar',
    'S20-0': 'Hoja de sable Allstar Ecostar mini', 'S21-0': 'Hoja de sable Allstar mini',
    'SGE-P': 'Cazoleta de sable Predator con enchufe (negra, eléctrica/aislada)',
    'SGE': 'Cazoleta de sable Alu-Extra con enchufe (eléctrica/aislada)',
    'SGE1': 'Cazoleta de sable Alu-Extra sin enchufe (eléctrica/aislada)',
    'SG': 'Cazoleta de sable Alu-Extra (no eléctrica)',
    'SGE-0': 'Cazoleta de sable Alu-Extra mini con enchufe (eléctrica/aislada)',
    'SG-IT': 'Casquillo aislante para cazoleta de sable eléctrico',
    'SG-IT-S': 'Casquillo aislante para cazoleta de sable eléctrico (negro)',
    'SGS': 'Enchufe para cazoleta de sable', 'KSB': 'Conector de cortocircuito (esgrima o sensor)',
    'FP-TE-0': 'Almohadilla de cazoleta PVC transparente para sable (eléctrico)',
    'FP-FE-0': 'Fieltro de cazoleta para sable (eléctrico)',
    'FP-PE-0': 'Almohadilla de cazoleta PVC para sable (eléctrico)',
    'FP-F-0': 'Fieltro de cazoleta para sable (no eléctrico)',
    'FP-P-0': 'Almohadilla de cazoleta PVC para sable (no eléctrico)',
    'ASG': 'Puño de sable Allstar', 'ASG-0': 'Puño de sable Allstar mini',
    'SK-I': 'Pomo de sable (aislado)', 'SK': 'Pomo de sable (no eléctrico)',
    'TZ21': 'Terraja de roscar (6 mm)', 'TZ24': 'Portaterrajas',
    'FK-T': 'Pasante de florete y sable T2019 (conector transparente)',
    'FK-S': 'Pasante especial de florete y sable (transparente)',
    'FKS-T-UK': 'Kit de conversión para pasante (carcasas transparentes)',
    'FK-1': 'Cable para pasante de florete y sable', 'FKS2-T': 'Conector de pasante transparente (2 polos)',
    'DKS3-T': 'Conector de pasante transparente (3 polos)', 'FKS2-A3': 'Clavija de conector (3 mm)',
    'FKS2-A4': 'Clavija de conector (4 mm)', 'FKS2-B': 'Estribo de seguridad con tornillo',
    'FKS2-C': 'Perno de presión con muelle', 'FK-4': 'Pinza de cocodrilo',
    'FKS2-D': 'Tornillo de unión con tuerca (2 polos)', 'DKS-3-B': 'Tornillo de unión con tuerca (3 polos)',
    'AMI-S': 'Careta de sable FIE Inox', 'AMIC-S': 'Careta de sable FIE Comfort',
    'MZC20': 'Acolchado interior de recambio Comfort', 'MNB18': 'Cinta de nuca de recambio StaySafe (FIE 2018)',
    'MK': 'Cable de careta',
    '1155H': 'Chaqueta eléctrica de sable Inox hombre', '1150D': 'Chaqueta eléctrica de sable Inox mujer',
    '1255H': 'Chaqueta eléctrica de sable Inox cierre trasero hombre',
    '1250D': 'Chaqueta eléctrica de sable Inox cierre trasero mujer',
    '1155J': 'Chaqueta eléctrica de sable Inox niño', '1150M': 'Chaqueta eléctrica de sable Inox niña',
    '1255J': 'Chaqueta eléctrica de sable Inox cierre trasero niño',
    '1250M': 'Chaqueta eléctrica de sable Inox cierre trasero niña',
    'LEI-TP': 'Cinta textil conductora (5×15 cm)',
    'NAME-S': 'Nombre impreso en chaqueta eléctrica UltraLight (spray)',
    'NAME-T': 'Nombre impreso en chaqueta eléctrica Inox (transfer)',
    'NAME-ST': 'Nombre impreso en parche de tela (transfer)',
    '2500H': 'Chaqueta Alpha 350N hombre', '2501H': 'Pantalón Alpha 350N hombre',
    '2000D': 'Chaqueta Alpha 350N mujer', '2001D': 'Pantalón Alpha 350N mujer',
    '2500J': 'Chaqueta Alpha 350N niño', '2000M': 'Chaqueta Alpha 350N niña',
    '2301K': 'Pantalón Alpha 350N infantil', '1001E': 'Chaqueta Alpha Club 350N adulto',
    '1001K': 'Chaqueta Alpha Club 350N infantil',
    '9500H': 'Chaqueta Startex FIE 800N hombre', '9501H': 'Pantalón Startex FIE 800N hombre',
    '4500H': 'Chaqueta Ecostar FIE 800N hombre', '4501H': 'Pantalón Ecostar FIE 800N hombre',
    '9000D': 'Chaqueta Startex FIE 800N mujer', '9001D': 'Pantalón Startex FIE 800N mujer',
    '4000D': 'Chaqueta Ecostar FIE 800N mujer', '4001D': 'Pantalón Ecostar FIE 800N mujer',
    '9500J': 'Chaqueta Startex FIE 800N niño', '9000M': 'Chaqueta Startex FIE 800N niña',
    '9301K': 'Pantalón Startex FIE 800N infantil', '4500J': 'Chaqueta Ecostar FIE 800N niño',
    '4000M': 'Chaqueta Ecostar FIE 800N niña', '4301K': 'Pantalón Ecostar FIE 800N infantil',
    'ASH800-N': 'Guante de sable eléctrico Supreme 800N', 'SM': 'Manguito de sable eléctrico',
    '525KPA': 'Zapatillas Kempa Pro Agility', '524AZS': 'Zapatillas Azza Fencing 15/14 Sky',
    '524KAS': 'Zapatillas Kempa Attack Multicolor', '521NG': 'Zapatillas Nike Ballestra 2 Gold',
    'FSTR-PT': 'Medias de esgrima Allstar ProTec', 'FSTR-B': 'Medias de esgrima Allstar Basic',
    'FSTR-B-DE': 'Medias de esgrima Allstar Basic con logo GER', 'HP': 'Talonera',
    'SBS-D': 'Protector de pecho especial mujer', 'SBS-L': 'Protector de pecho De Luxe',
    'SBS-LH': 'Top bustier para protector De Luxe', 'SBS-H': 'Protector de pecho especial hombre',
    'SPG-H': 'Peto interior FIE ExtraLight hombre (3/4)', 'SPG-D': 'Peto interior FIE ExtraLight mujer (3/4)',
    'SPGH-E': 'Peto interior FIE Ecoline hombre (3/4)', 'SPGD-E': 'Peto interior FIE Ecoline mujer (3/4)',
    'SPG-K': 'Peto interior FIE ExtraLight infantil (3/4)', 'SPGK-E': 'Peto interior FIE Ecoline infantil (3/4)',
    'SUSP': 'Protector genital con copa hombre', 'SUSP-K': 'Protector genital con copa niño',
    'SUSP1': 'Suspensorio sin copa hombre',
}


def slug(s):
    s = s.lower()
    for a, b in zip("áéíóúüñäöß", "aeiouunaos"):
        s = s.replace(a, b)
    return re.sub(r"[^a-z0-9]+", "-", s).strip("-")[:60]


def euro(v):
    return f"{v:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".") + " €"


def split_attrs(attrs):
    sizes, hands, options = [], [], []
    for k, vals in attrs.items():
        key = k.strip().lower()
        vals = [v for v in vals if v]
        if key in SIZE_KEYS:
            sizes += [SIZE_TR.get(v, v) for v in vals]
        elif key in HAND_KEYS:
            hands += [HANDS.get(v.lower(), v) for v in vals]
        else:
            name = OPT_NAMES.get(key, k.strip())
            options.append({"name": name, "values": [COLOR_TR.get(v, v) for v in vals]})
    dedup = lambda xs: list(dict.fromkeys(xs))
    hands = dedup(hands)
    order = ["Diestro", "Zurdo"]
    hands.sort(key=lambda h: order.index(h) if h in order else 9)
    return dedup(sizes), hands, options


def grant_products():
    g = json.loads((RAW / "grant.json").read_text())
    out = []
    for p in g["products"]:
        hit = [GRANT_CATS[c] for c in p["cats"] if c in GRANT_CATS]
        n = p["name"].lower()
        keep = p["name"] in GRANT_KEEP
        if not keep:
            if not hit or (set(p["cats"]) & GRANT_EXC_CATS and "sable" not in n):
                continue
            if re.search(r"florete|espada", n) and "sable" not in n:
                continue
            if GRANT_EXC_NAME.search(p["name"]) or "chándal" in n:
                continue
        cat = hit[0] if hit else ("Caretas" if "careta" in n else "Calzado y medias")
        sizes, hands, options = split_attrs(p["attrs"])
        price = ""
        if p["price"]:
            v = p["price"] * IVA_ES
            varies = bool(p.get("priceMax") and p["priceMax"] > p["price"]) or any(
                "+" in x for o in options for x in o["values"])
            price = ("Desde " if varies else "") + euro(v)
        out.append({
            "id": "grant-" + slug(p["name"]), "name": p["name"], "supplier": "Grant Esgrima",
            "category": cat, "description": "", "price": price, "sizes": sizes, "hands": hands,
            "options": options, "photo": "", "imageSource": p["image"], "active": True,
            "ref": p["sku"], "url": p["url"], "sizeGuide": p.get("sizeGuide", ""), "imported": True,
        })
    return out


def allstar_products():
    a = json.loads((RAW / "allstar.json").read_text())
    out = []
    for p in a["products"]:
        ic = p["icons"]
        if "Auslaufartikel" in ic or p["sku"].startswith("LOGO"):
            continue
        if ("Florett" in ic or "Degen" in ic) and "Säbel" not in ic:
            continue
        ref = p["sku"].split("/")[0]
        name = ALLSTAR_NAMES.get(ref)
        if not name:
            print("sin traducción:", ref, p["name"])
            name = p["name"]
        cat = next((ALLSTAR_CATS[c] for c in p["cats"] if c in ALLSTAR_CATS), "Piezas y recambios")
        sizes, hands, options = split_attrs(p["attrs"])
        out.append({
            "id": "allstar-" + slug(ref), "name": name, "supplier": "Allstar", "category": cat,
            "description": "", "price": euro(p["price"]) if p["price"] else "", "sizes": sizes,
            "hands": hands, "options": options, "photo": "", "imageSource": p["image"], "active": True,
            "ref": ref, "url": p["url"], "sizeGuide": p.get("sizeGuide", ""), "imported": True,
        })
    return out


data = json.loads(OUT.read_text())
old = {p["id"]: p for p in data["products"]}
new = grant_products() + allstar_products()
ids = set()
for p in new:
    base, i = p["id"], 2
    while p["id"] in ids:
        p["id"] = f"{base}-{i}"; i += 1
    ids.add(p["id"])
    prev = old.get(p["id"])
    if prev:  # conserva lo editado a mano
        for k in ("description", "active", "photo", "category"):
            if prev.get(k) not in (None, ""):
                p[k] = prev[k]
manual = [p for p in data["products"] if not p.get("imported") and "Ejemplo —" not in p.get("description", "")]
data["products"] = manual + new
OUT.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
print(f"{len(new)} importados ({sum(p['supplier']=='Allstar' for p in new)} Allstar), {len(manual)} manuales")
