// Descarga y optimiza (WebP, máx. 800 px) la foto de cada producto de la
// tienda que tenga "imageSource" y cuya foto local aún no exista.
// Uso: SHARP_DIR=... node .github/scripts/catalog-images.mjs
import { createRequire } from "node:module";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
const sharp = createRequire(process.env.SHARP_DIR + "/")("sharp");
const root = process.env.GITHUB_WORKSPACE ?? process.cwd();
const jsonPath = path.join(root, "src/content/data/tienda.json");
const dir = path.join(root, "public/images/tienda");
mkdirSync(dir, { recursive: true });
const data = JSON.parse(readFileSync(jsonPath, "utf8"));
const UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/124 Safari/537.36";
let ok = 0, fail = 0;
for (const p of data.products) {
  if (!p.imageSource) continue;
  const rel = `/images/tienda/${p.id}.webp`;
  if (p.photo === rel && existsSync(path.join(root, "public", rel))) continue;
  try {
    const res = await fetch(p.imageSource, { headers: { "User-Agent": UA } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    const out = await sharp(buf).rotate().flatten({ background: "#ffffff" })
      .resize({ width: 800, height: 800, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 80 }).toBuffer();
    writeFileSync(path.join(root, "public", rel), out);
    p.photo = rel;
    ok++;
  } catch (e) {
    console.warn("sin foto", p.id, e.message);
    fail++;
  }
  await new Promise((r) => setTimeout(r, 250));
}
writeFileSync(jsonPath, JSON.stringify(data, null, 2) + "\n");
console.log(`fotos nuevas: ${ok}, fallidas: ${fail}`);
