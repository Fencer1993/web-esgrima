// Descarga el catálogo público de los proveedores (Grant Esgrima, Allstar y Villalbi)
// en un formato compacto para preparar la tienda del club. No descarga
// fotos: eso lo hace catalog-images.mjs con los productos ya elegidos.
// Uso: node .github/scripts/catalog-fetch.mjs <carpeta-salida>
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const OUT = process.argv[2] || "catalog-raw";
const UA =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function get(url, type = "text") {
  for (let i = 0; i < 4; i++) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": UA } });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return type === "json" ? await res.json() : await res.text();
    } catch (e) {
      console.warn(`  reintento ${i + 1} ${url}: ${e.message}`);
      await sleep(1500 * (i + 1));
    }
  }
  console.warn(`  FALLO ${url}`);
  return null;
}

const decode = (s) =>
  String(s ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&#8217;/g, "'")
    .replace(/&#8211;/g, "–")
    .replace(/&nbsp;/g, " ")
    .replace(/&euro;/g, "€")
    .replace(/\s+/g, " ")
    .trim();

// ---------------------------------------------------------------- Grant
// Tiendas WooCommerce (Grant Esgrima, Allstar España): API pública Store.
async function woo(site, label) {
  const B = `${site}/wp-json/wc/store/v1`;
  const cats = [];
  for (let p = 1; ; p++) {
    const page = await get(`${B}/products/categories?per_page=100&page=${p}`, "json");
    if (!page || page.length === 0) break;
    cats.push(...page.map((c) => ({ id: c.id, parent: c.parent, slug: c.slug, name: decode(c.name), count: c.count })));
    if (page.length < 100) break;
  }
  const products = [];
  for (let p = 1; ; p++) {
    const page = await get(`${B}/products?per_page=100&page=${p}`, "json");
    if (!page || page.length === 0) break;
    for (const x of page) {
      const desc = String(x.description || "");
      const guide = [...desc.matchAll(/href="([^"]+)"/g)]
        .map((m) => m[1])
        .filter((u) => /talla|size|medida/i.test(u));
      products.push({
        id: x.id,
        name: decode(x.name),
        url: x.permalink,
        sku: x.sku || "",
        type: x.type,
        // Precios en céntimos (Grant los publica sin IVA).
        price: x.prices?.price ? Number(x.prices.price) / 10 ** (x.prices.currency_minor_unit ?? 2) : null,
        priceMax: x.prices?.price_range?.max_amount
          ? Number(x.prices.price_range.max_amount) / 10 ** (x.prices.currency_minor_unit ?? 2)
          : null,
        image: x.images?.[0]?.src || "",
        cats: (x.categories || []).map((c) => c.slug),
        attrs: Object.fromEntries((x.attributes || []).map((a) => [decode(a.name), a.terms.map((t) => decode(t.name))])),
        inStock: x.is_in_stock,
        sizeGuide: guide[0] || "",
        text: decode(desc).slice(0, 300),
      });
    }
    console.log(`${label} página ${p}: ${products.length}`);
    if (page.length < 100) break;
    await sleep(500);
  }
  return { cats, products };
}

// -------------------------------------------------------------- Allstar
const ALLSTAR_CATS = [
  "waffen/saebel/komplette-saebel",
  "waffen/saebel/saebelklingen",
  "waffen/saebel/glocken-mehr",
  "waffen/saebel/griffe-mehr",
  "waffen/saebel/koerperkabel-mehr",
  "waffen/saebel",
  "masken/saebel",
  "masken/zubehoer",
  "bekleidung-schuhe/elektrowesten/saebel",
  "bekleidung-schuhe/elektrowesten/bedruckung-zubehoer",
  "bekleidung-schuhe/anzuege/350n",
  "bekleidung-schuhe/anzuege/fie-800n",
  "bekleidung-schuhe/handschuhe/saebel",
  "bekleidung-schuhe/handschuhe/zubehoer",
  "bekleidung-schuhe/schuhe-struempfe/schuhe",
  "bekleidung-schuhe/schuhe-struempfe/struempfe",
  "bekleidung-schuhe/schuhe-struempfe/sonstiges",
  "bekleidung-schuhe/schutzausruestung/brustschuetzer",
  "bekleidung-schuhe/schutzausruestung/unterziehplastrons",
  "bekleidung-schuhe/schutzausruestung/sonstige-schutzausruestung",
];

function allstarLinks(html) {
  return [
    ...new Set(
      [...html.matchAll(/href="(https:\/\/allstar\.de\/[^"?#]+)"[^>]*class="product-name/g)].map((m) => m[1]),
    ),
  ];
}

function allstarProduct(html, url) {
  const meta = (re) => (html.match(re) || [])[1] || "";
  const name = decode(meta(/<h1[^>]*product-detail-name[^>]*>([\s\S]*?)<\/h1>/));
  const sku = decode(meta(/itemprop="sku"[^>]*>([\s\S]*?)<\/span>/));
  const price = Number(meta(/itemprop="price" content="([\d.]+)"/)) || null;
  const image = meta(/property="og:image" content="([^"]+)"/).replace(/\?.*$/, "");
  const groups = {};
  const re = /product-detail-configurator-group-title[^>]*>([\s\S]*?)<\/[a-z]+>([\s\S]*?)(?=product-detail-configurator-group-title|<\/form>)/g;
  for (const m of html.matchAll(re)) {
    const title = decode(m[1]);
    const body = m[2];
    let opts = [...body.matchAll(/product-detail-configurator-option-label[^>]*title="([^"]+)"/g)].map((x) => decode(x[1]));
    if (opts.length === 0) {
      opts = [...body.matchAll(/<option[^>]*>([\s\S]*?)<\/option>/g)].map((x) => decode(x[1]));
    }
    if (title && opts.length) groups[title] = [...new Set(opts)];
  }
  const icons = [...html.matchAll(/class="ap-product-icon"[^>]*alt="([^"]+)"/g)].map((m) => m[1]);
  const guide = [...html.matchAll(/href="([^"]+)"/g)]
    .map((m) => m[1])
    .find((u) => /gr(oe|ö)(ss|ß)en|size-?chart|masstabelle|ma(ss|ß)e/i.test(u));
  return { name, sku, price, image, url, attrs: groups, icons: [...new Set(icons)], sizeGuide: guide || "" };
}

async function allstar() {
  const seen = new Map();
  for (const cat of ALLSTAR_CATS) {
    const links = [];
    for (let p = 1; p < 20; p++) {
      const html = await get(`https://allstar.de/${cat}/?p=${p}`);
      if (!html) break;
      const found = allstarLinks(html).filter((u) => !links.includes(u));
      if (found.length === 0) break;
      links.push(...found);
      await sleep(400);
    }
    console.log(`Allstar ${cat}: ${links.length}`);
    for (const u of links) {
      if (seen.has(u)) {
        seen.get(u).cats.push(cat);
        continue;
      }
      const html = await get(u);
      if (!html) continue;
      const p = allstarProduct(html, u);
      p.cats = [cat];
      seen.set(u, p);
      await sleep(300);
    }
  }
  return { products: [...seen.values()] };
}

// -------------------------------------------------------------- Villalbi
// Tienda Shopify (villalbiesgrima.es, Fuengirola): catálogo público en
// /products.json; las colecciones dicen a qué arma pertenece cada producto.
async function villalbi() {
  const B = "https://villalbiesgrima.es";
  const handlesOf = async (col) => {
    const out = new Set();
    for (let p = 1; p < 20; p++) {
      const d = await get(`${B}/collections/${col}/products.json?limit=250&page=${p}`, "json");
      if (!d?.products?.length) break;
      d.products.forEach((x) => out.add(x.handle));
      if (d.products.length < 250) break;
    }
    return out;
  };
  const cols = {};
  for (const c of ["sable", "espada", "florete", "bolsas-y-fundas", "caretas", "guantes", "hojas", "ropa", "armas", "iniciacion-primeras-compras"]) {
    cols[c] = await handlesOf(c);
    console.log(`Villalbi colección ${c}: ${cols[c].size}`);
  }
  const products = [];
  for (let p = 1; p < 20; p++) {
    const d = await get(`${B}/products.json?limit=250&page=${p}`, "json");
    if (!d?.products?.length) break;
    for (const x of d.products) {
      const prices = x.variants.map((v) => Number(v.price)).filter((n) => n > 0);
      products.push({
        handle: x.handle,
        name: decode(x.title),
        url: `${B}/products/${x.handle}`,
        type: x.product_type || "",
        tags: x.tags || [],
        cols: Object.keys(cols).filter((c) => cols[c].has(x.handle)),
        price: prices.length ? Math.min(...prices) : null,
        priceMax: prices.length ? Math.max(...prices) : null,
        sku: x.variants[0]?.sku || "",
        image: x.images?.[0]?.src || "",
        attrs: Object.fromEntries(
          (x.options || [])
            .filter((o) => !(o.values.length === 1 && /default title/i.test(o.values[0])))
            .map((o) => [decode(o.name), o.values.map(decode)]),
        ),
        available: x.variants.some((v) => v.available),
        text: decode(x.body_html).slice(0, 300),
      });
    }
    if (d.products.length < 250) break;
  }
  return { products };
}

mkdirSync(OUT, { recursive: true });
const only = (process.env.SUPPLIERS || "grant allstar allstarspain villalbi").split(/[\s,]+/);
if (only.includes("grant")) {
  const g = await woo("https://grantesgrima.com", "Grant");
  writeFileSync(join(OUT, "grant.json"), JSON.stringify(g, null, 0));
  console.log(`Grant: ${g.products.length} productos, ${g.cats.length} categorías`);
}
if (only.includes("allstar")) {
  const a = await allstar();
  writeFileSync(join(OUT, "allstar.json"), JSON.stringify(a, null, 0));
  console.log(`Allstar: ${a.products.length} productos`);
}
if (only.includes("allstarspain")) {
  const a = await woo("https://allstarspain.com", "Allstar España");
  writeFileSync(join(OUT, "allstarspain.json"), JSON.stringify(a, null, 0));
  console.log(`Allstar España: ${a.products.length} productos, ${a.cats.length} categorías`);
}
if (only.includes("villalbi")) {
  const v = await villalbi();
  writeFileSync(join(OUT, "villalbi.json"), JSON.stringify(v, null, 0));
  console.log(`Villalbi: ${v.products.length} productos`);
}
