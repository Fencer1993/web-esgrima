import sharp from "sharp";
import { readdirSync } from "node:fs";
import path from "node:path";

const raw = path.join(process.env.RUNNER_TEMP ?? "/tmp", "raw");
const out = "public/images/import";
for (const f of readdirSync(raw)) {
  const dest = path.join(out, path.parse(f).name.toLowerCase() + ".webp");
  try {
    const info = await sharp(path.join(raw, f))
      .rotate() // respeta orientación y elimina EXIF al exportar
      .resize({ width: 1600, withoutEnlargement: true })
      .webp({ quality: 78 })
      .toFile(dest);
    console.log(dest, info.width + "x" + info.height, info.size);
  } catch (e) {
    console.error("skip", f, e.message);
  }
}
