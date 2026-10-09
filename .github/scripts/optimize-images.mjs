// Optimiza fotos de public/images (WebP, máx. 1600 px, sin EXIF) y
// actualiza las referencias en src/content/data/*.json.
// Uso: node .github/scripts/optimize-images.mjs (con sharp instalado en NODE_PATH)
import { createRequire } from "node:module";
const sharp = createRequire(process.env.SHARP_DIR + "/")("sharp");
import { readdirSync, statSync, readFileSync, writeFileSync, unlinkSync } from "node:fs";
import path from "node:path";
const root = process.env.GITHUB_WORKSPACE ?? process.cwd();
const imgDir = path.join(root, "public/images");
const walk = (d) => readdirSync(d).flatMap((f) => { const p = path.join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
const renames = [];
for (const file of walk(imgDir)) {
  const ext = path.extname(file).toLowerCase();
  if (![".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif", ".avif"].includes(ext)) continue;
  const meta = await sharp(file).metadata().catch(() => null);
  if (!meta) continue;
  const big = Math.max(meta.width ?? 0, meta.height ?? 0) > 1800 || statSync(file).size > 450_000;
  if (ext === ".webp" && !big) continue;
  const out = file.slice(0, -ext.length) + ".webp";
  const buf = await sharp(file).rotate()
    .resize({ width: 1800, height: 1800, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 80 }).toBuffer();
  writeFileSync(out, buf);
  if (out !== file) { unlinkSync(file); renames.push([file, out]); }
  console.log("optimizada", path.relative(root, out), Math.round(buf.length / 1024) + "KB");
}
const dataDir = path.join(root, "src/content/data");
for (const f of readdirSync(dataDir).filter((f) => f.endsWith(".json"))) {
  const p = path.join(dataDir, f); let s = readFileSync(p, "utf8"); const before = s;
  for (const [a, b] of renames) s = s.split("/" + path.relative(path.join(root, "public"), a)).join("/" + path.relative(path.join(root, "public"), b));
  if (s !== before) { writeFileSync(p, s); console.log("referencias actualizadas en", f); }
}
