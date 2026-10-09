"""Descarga los originales de las fotos del carrusel de la portada antigua.

Las miniaturas de Elementor no traen la carpeta año/mes, así que se busca
cada original por la API REST de WordPress y, si no responde, probando
carpetas año/mes.
"""
import json, pathlib, re, sys, urllib.request, urllib.parse, os

BASE = "https://www.esgrimatorremolinos.com"
UA = {"User-Agent": "Mozilla/5.0 (club-migration)"}
NAMES = """IMG-20221108-WA0003 IMG-20221217-WA0064 IMG-20221217-WA0037 IMG-20221217-WA0076
ensenando-esgrima-1 P1260621-rotated IMG-20220920-WA0012 IMG-20221102-WA0023
IMG-20221007-WA0030 IMG-20221217-WA0046 Imagen-de-WhatsApp-2023-06-05-a-las-19.50.24
Imagen-de-WhatsApp-2023-06-05-a-las-19.50.19 IMG-20230603-WA0036
Imagen-de-WhatsApp-2023-06-05-a-las-11.27.14 WhatsApp-Image-2022-08-02-at-16.31.21-2""".split()

def get(url):
    return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=30).read()

def find(name):
    try:
        data = json.loads(get(f"{BASE}/wp-json/wp/v2/media?per_page=5&search={urllib.parse.quote(name)}"))
        for m in data:
            if name.lower() in m["source_url"].lower():
                return m["source_url"]
    except Exception as e:
        print("  wp-json:", name, e, file=sys.stderr)
    for y in (2022, 2023, 2024, 2025):
        for mo in range(1, 13):
            for ext in ("jpg", "jpeg", "png"):
                u = f"{BASE}/wp-content/uploads/{y}/{mo:02d}/{name}.{ext}"
                try:
                    req = urllib.request.Request(u, headers=UA, method="HEAD")
                    urllib.request.urlopen(req, timeout=15)
                    return u
                except Exception:
                    pass
    return None

raw = pathlib.Path(os.environ["RUNNER_TEMP"]) / "raw"
raw.mkdir(parents=True, exist_ok=True)
done = {}
for n in NAMES:
    u = find(n)
    print(n, "->", u)
    if u:
        (raw / pathlib.Path(u).name).write_bytes(get(u))
        done[n] = u
pathlib.Path("import").mkdir(exist_ok=True)
pathlib.Path("import/carousel.json").write_text(json.dumps(done, indent=1))
