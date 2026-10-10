"""Genera los productos de sable de la tienda a partir de data/catalog-raw/.

Uso: python3 .github/scripts/catalog-build.py
Conserva lo editado a mano en tienda.json (descripción, activo, foto) y los
productos que no vienen de la importación (sin "imported": true).
"""
import html, json, re, pathlib

ROOT = pathlib.Path(__file__).resolve().parents[2]
RAW = ROOT / "data/catalog-raw"
OUT = ROOT / "src/content/data/tienda.json"
IVA_ES = 1.21  # Grant y Allstar España publican precios sin IVA
# Precio para el socio: precio del proveedor sin IVA, menos un 5 %, más IVA.
DISCOUNT = 0.05


def member_price(net):
    return net * (1 - DISCOUNT) * IVA_ES


# Guantes: por normativa solo manguito de velcro; para no dar demasiadas
# opciones se ofrecen solo estos tres (el chino económico y dos FIE).
GLOVES_KEEP = {
    "grant-guante-lavable-sable-electrico-eco-fie-800n-ce",
    "grant-guante-lavable-sable-electrico-fie-800n-ce-pbt-31-37",
    "allstar-ash800-e",
}

SIZE_KEYS = {"talla", "tallas", "tallas us", "talla (eu)", "talla de la hoja", "größe auswählen",
             "klingengröße auswählen"}
HAND_KEYS = {"mano", "lateralidad", "händigkeit auswählen"}
SKIP_KEYS = {"título"}
HANDS = {"diestro": "Diestro", "diestra": "Diestro", "diestros": "Diestro", "derecha": "Diestro",
         "rechts": "Diestro", "zurdo": "Zurdo", "zurda": "Zurdo", "zurdos": "Zurdo",
         "izquierda": "Zurdo", "links": "Zurdo"}
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

# ------------------------------------------------------- Allstar España
# allstarspain.com (distribuidor oficial): nombres en español y precio de
# España. Sustituye a la tienda alemana allstar.de.
ALLSTAR_SABRE = {
    'sable': 'Sables y hojas', 'sable-completo': 'Sables y hojas', 'sable-electrico': 'Sables y hojas',
    'hojas-sable': 'Sables y hojas',
    'cazoletas-y-accesorios-accesorios-sable': 'Piezas y recambios',
    'empunaduras-y-accesorios-accesorios-sable': 'Piezas y recambios',
    'accesorios-sable': 'Piezas y recambios', 'pasantes-sable': 'Pasantes y conectores',
    'chaquetillas-sable': 'Chaquetas eléctricas',
}
ALLSTAR_GENERAL = {
    'caretas': 'Caretas', 'caretas-350n': 'Caretas', 'caretas-fie': 'Caretas', 'accesorios-caretas': 'Caretas',
    'personalizacion-caretas': 'Caretas', 'reparacion-caretas': 'Caretas',
    'guantes': 'Guantes y manguitos', 'calzado': 'Calzado y medias', 'medias': 'Calzado y medias',
    'protecciones-otras-protecciones': 'Protección', 'protecciones-petos-interiores': 'Protección',
    'protecciones-protectores-pecho': 'Protección',
    'trajes-350-n': 'Trajes', 'trajes-fie': 'Trajes',
    'equipacion-maestro': 'Material de maestro', 'esgrima-en-silla-de-ruedas': 'Silla de ruedas',
    'material-de-control': 'Piezas y recambios', 'material-de-reparacion': 'Piezas y recambios',
}
# Caretas: solo las de sable o de maestro (el resto son de florete/espada).
ALLSTAR_MASK_OK = re.compile(r"sable|maestro|banda|recambio int|pinza|nombre|logo|reparaci", re.I)
MAX_PRICE = 1000  # material de sala (tablas de prueba, fijaciones…) fuera

# -------------------------------------------------------------- Villalbi
VILLALBI_TYPES = {
    'Arma Completa': 'Sables y hojas', 'Hoja': 'Sables y hojas', 'Cables': 'Pasantes y conectores',
    'Careta': 'Caretas', 'Guante': 'Guantes y manguitos', 'Lame': 'Chaquetas eléctricas',
    'Maestro': 'Material de maestro', 'Protecciones': 'Protección', 'Ropa': 'Calzado y medias',
    'Repuesto': 'Piezas y recambios', 'Puño': 'Piezas y recambios', 'Cazoletas y Al': 'Piezas y recambios',
    'Enchufes': 'Piezas y recambios', 'Control y Repa': 'Piezas y recambios',
}
VILLALBI_GUIDE = "https://villalbiesgrima.es/pages/guia-de-tallas"


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
        if key in SKIP_KEYS:
            continue
        if key == "opciones" and all(v.lower() in HANDS for v in vals):
            key = "mano"
        if key in SIZE_KEYS:
            sizes += [SIZE_TR.get(v, v) for v in vals]
        elif key in HAND_KEYS or (vals and all(v.lower() in HANDS for v in vals)):
            hands += [HANDS.get(v.lower(), v) for v in vals]
        else:
            name = OPT_NAMES.get(key, k.strip())
            options.append({"name": name, "values": [COLOR_TR.get(v, v) for v in vals]})
    dedup = lambda xs: list(dict.fromkeys(xs))
    hands = dedup(hands)
    order = ["Diestro", "Zurdo"]
    hands.sort(key=lambda h: order.index(h) if h in order else 9)
    return dedup(sizes), hands, options


SURCHARGE = re.compile(r"\(\+\s*([\d.,]+)\s*(?:\+\s*IVA|€)?\s*\)", re.I)


def with_vat(text):
    """Suplementos de Grant ("+2,69+IVA") a importe con IVA ("+3,25 €")."""
    return SURCHARGE.sub(lambda m: "(+" + euro(member_price(float(m.group(1).replace(",", ".")))) + ")", text)


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
        for o in options:
            o["values"] = [with_vat(v) for v in o["values"]]
        price = ""
        if p["price"]:
            v = member_price(p["price"])
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
    a = json.loads((RAW / "allstarspain.json").read_text())
    out = []
    for p in a["products"]:
        cats = p["cats"]
        n = p["name"].lower()
        cat = next((ALLSTAR_SABRE[c] for c in cats if c in ALLSTAR_SABRE), None)
        if not cat:
            cat = next((ALLSTAR_GENERAL[c] for c in cats if c in ALLSTAR_GENERAL), None)
            if not cat:
                continue
            if re.search(r"florete|espada|vario", n) and "sable" not in n:
                continue
            if cat == "Caretas" and not ALLSTAR_MASK_OK.search(p["name"]):
                continue
            if re.search(r"maestr", n) and cat != "Material de maestro":
                cat = "Material de maestro"
        if p["price"] and p["price"] > MAX_PRICE:
            continue
        sizes, hands, options = split_attrs(p["attrs"])
        ref = re.sub(r"^Ref\.?\s*", "", p["sku"]).strip()
        price = ""
        if p["price"]:
            pt = p.get("priceText", "").lower()
            net = p["price"] if re.search(r"\+\s*iva|sin iva|iva no incl", pt) else p["price"] / IVA_ES
            v = member_price(net)
            varies = bool(p.get("priceMax") and p["priceMax"] > p["price"])
            price = ("Desde " if varies else "") + euro(v)
        out.append({
            "id": "allstar-" + slug(ref or p["name"]), "name": p["name"], "supplier": "Allstar",
            "category": cat, "description": "", "price": price, "sizes": sizes, "hands": hands,
            "options": options, "photo": "", "imageSource": p["image"], "active": True,
            "ref": ref, "url": p["url"], "sizeGuide": p.get("sizeGuide", ""), "imported": True,
        })
    return out


def villalbi_products():
    v = json.loads((RAW / "villalbi.json").read_text())
    out = []
    for p in v["products"]:
        n = p["name"].lower()
        if p["type"].startswith(("Aparato", "Bolsa")):
            continue
        if "sable" not in p["cols"]:
            if {"espada", "florete"} & set(p["cols"]) or re.search(r"florete|espada", n):
                continue
            if "bolsas-y-fundas" in p["cols"]:
                continue
        if "kit de iniciaci" in n:
            cat = "Kits de iniciación"
        elif re.search(r"maestr", n):
            cat = "Material de maestro"
        else:
            cat = next((c for t, c in VILLALBI_TYPES.items() if p["type"].startswith(t)), "Piezas y recambios")
        sizes, hands, options = split_attrs(p["attrs"])
        guide = ""
        if sizes:
            guide = VILLALBI_GUIDE + ("-npt-1" if "npt" in n else "-ve" if " ve" in n else "")
        varies = bool(p.get("priceMax") and p["price"] and p["priceMax"] > p["price"])
        out.append({
            "id": "villalbi-" + slug(p["handle"]), "name": p["name"], "supplier": "Villalbi Esgrima",
            "category": cat, "description": "",
            # Villalbi publica con IVA incluido.
            "price": (("Desde " if varies else "") + euro(member_price(p["price"] / IVA_ES))) if p["price"] else "",
            "sizes": sizes, "hands": hands, "options": options, "photo": "", "imageSource": p["image"],
            "active": True, "ref": p["sku"], "url": p["url"], "sizeGuide": guide, "imported": True,
        })
    return out


data = json.loads(OUT.read_text())
old = {p["id"]: p for p in data["products"]}
new = grant_products() + allstar_products() + villalbi_products()
new = [p for p in new if not (p["category"] == "Guantes y manguitos" and "guante" in p["name"].lower()
                              and p["id"] not in GLOVES_KEEP)]
for p in new:
    p["name"] = html.unescape(p["name"]).replace("‘", "'").strip()
    # Tabla de tallas de la propia tienda (/tienda#tallas-<marca>).
    if p["sizes"]:
        n = p["name"].lower()
        p["sizeGuide"] = {"Allstar": "#tallas-allstar", "Grant Esgrima": "#tallas-pbt"}.get(
            p["supplier"], "#tallas-npt" if "npt" in n else "#tallas-ve")
    else:
        p["sizeGuide"] = ""
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
import collections
print(f"{len(new)} importados {dict(collections.Counter(p['supplier'] for p in new))}, {len(manual)} manuales")
# Fotos de productos que ya no están en la tienda
used = {p["photo"] for p in data["products"]}
for f in (ROOT / "public/images/tienda").glob("*.webp"):
    if f"/images/tienda/{f.name}" not in used:
        f.unlink()
        print("foto eliminada", f.name)
