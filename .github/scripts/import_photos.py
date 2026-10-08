"""Rastrea la web WordPress original y descarga las fotos que usa cada página.

Salida: public/images/import/<nombre>.webp (optimizadas) + import/manifest.json
"""
import json, re, sys, urllib.request, urllib.parse, pathlib, collections

BASE = "https://www.esgrimatorremolinos.com"
UA = {"User-Agent": "Mozilla/5.0 (club-migration)"}
IMG_RE = re.compile(r"https?://[^\s\"'()<>,]+/wp-content/uploads/[^\s\"'()<>,]+?\.(?:jpe?g|png|webp)", re.I)
SIZE_RE = re.compile(r"-\d+x\d+(?=\.[a-z]+$)", re.I)

def get(url, binary=False):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=30) as r:
        data = r.read()
    return data if binary else data.decode("utf-8", "replace")

def try_get(url, binary=False):
    try:
        return get(url, binary)
    except Exception as e:
        print("  fail", url, e, file=sys.stderr)
        return None

# 1. URLs de páginas: sitemaps de Yoast + rutas conocidas
pages = {BASE + "/"}
for sm in ("/sitemap_index.xml", "/page-sitemap.xml", "/post-sitemap.xml"):
    xml = try_get(BASE + sm)
    if xml:
        for loc in re.findall(r"<loc>([^<]+)</loc>", xml):
            if loc.endswith(".xml"):
                sub = try_get(loc)
                if sub:
                    pages.update(re.findall(r"<loc>([^<]+\.(?:html?|/)?)</loc>", sub) or re.findall(r"<loc>([^<]+)</loc>", sub))
            else:
                pages.add(loc)
pages = {p for p in pages if not re.search(r"\.(jpe?g|png|webp)$", p, re.I)}
print(len(pages), "páginas")

# 2. Imágenes por página (HTML + CSS enlazado, para fondos de Elementor)
found = collections.defaultdict(lambda: {"pages": set(), "alts": set()})
for p in sorted(pages):
    html = try_get(p)
    if not html:
        continue
    css_urls = re.findall(r'href=["\']([^"\']+\.css[^"\']*)["\']', html)
    blob = html
    for c in css_urls:
        if "/wp-content/uploads/elementor/" in c or "/wp-content/uploads/" in c:
            css = try_get(urllib.parse.urljoin(p, c))
            if css:
                blob += css
    blob = blob.replace("\\/", "/")
    for m in IMG_RE.finditer(blob):
        u = m.group(0)
        key = SIZE_RE.sub("", u)
        found[key]["pages"].add(p.replace(BASE, "") or "/")
    for tag in re.findall(r"<img\b[^>]*>", html):
        alt = re.search(r'alt=["\']([^"\']*)["\']', tag)
        src = IMG_RE.search(tag.replace("\\/", "/"))
        if src and alt and alt.group(1).strip():
            found[SIZE_RE.sub("", src.group(0))]["alts"].add(alt.group(1).strip())
print(len(found), "imágenes únicas")

# 3. Descarga + optimización (sharp)
import subprocess, os
out = pathlib.Path("public/images/import")
out.mkdir(parents=True, exist_ok=True)
raw = pathlib.Path(os.environ.get("RUNNER_TEMP", "/tmp")) / "raw"
raw.mkdir(parents=True, exist_ok=True)

manifest = []
for url, meta in sorted(found.items()):
    if "/elementor/thumbs/" in url or "/elementor/css/" in url:
        continue
    data = try_get(url, True)
    if not data:
        continue
    name = pathlib.Path(urllib.parse.urlparse(url).path).name
    (raw / name).write_bytes(data)
    manifest.append({
        "file": pathlib.Path(name).stem.lower() + ".webp",
        "source": url,
        "bytes": len(data),
        "pages": sorted(meta["pages"]),
        "alts": sorted(meta["alts"]),
    })
pathlib.Path("import").mkdir(exist_ok=True)
pathlib.Path("import/manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=1))
print(len(manifest), "descargadas")
