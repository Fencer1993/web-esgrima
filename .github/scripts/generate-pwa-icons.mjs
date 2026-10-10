// Genera los iconos de la app (PWA) y el favicon a partir del escudo oficial
// del club (public/images/logo/logo-club-esgrima-torremolinos.png, fondo
// transparente). Uso: node .github/scripts/generate-pwa-icons.mjs
import sharp from "sharp";
import { mkdirSync, writeFileSync } from "node:fs";

const SRC = "public/images/logo/logo-club-esgrima-torremolinos.png";
mkdirSync("public/icons", { recursive: true });

// Escudo centrado sobre blanco: `inner` = tamaño del escudo dentro del lienzo.
async function onWhite(size, inner, file) {
  const logo = await sharp(SRC).resize(inner, inner, { kernel: "lanczos3" }).png().toBuffer();
  await sharp({ create: { width: size, height: size, channels: 4, background: "#ffffff" } })
    .composite([{ input: logo, gravity: "center" }])
    .flatten({ background: "#ffffff" })
    .png()
    .toFile(file);
}

await onWhite(192, 176, "public/icons/icon-192.png");
await onWhite(512, 472, "public/icons/icon-512.png");
await onWhite(512, 400, "public/icons/icon-maskable-512.png"); // zona segura
await onWhite(180, 164, "public/icons/apple-touch-icon.png");
await sharp(SRC).resize(96, 96, { kernel: "lanczos3" }).png().toFile("public/icons/favicon-96.png");
await sharp(SRC).resize(256, 256, { kernel: "lanczos3" }).webp({ quality: 90 })
  .toFile("public/images/logo/logo-club-esgrima-torremolinos-256.webp");

// favicon.ico con PNG de 16, 32 y 48 px dentro.
const sizes = [16, 32, 48];
const pngs = await Promise.all(sizes.map((s) => sharp(SRC).resize(s, s).png().toBuffer()));
const head = Buffer.alloc(6);
head.writeUInt16LE(0, 0);
head.writeUInt16LE(1, 2);
head.writeUInt16LE(sizes.length, 4);
let offset = 6 + 16 * sizes.length;
const dirs = sizes.map((s, i) => {
  const d = Buffer.alloc(16);
  d.writeUInt8(s, 0);
  d.writeUInt8(s, 1);
  d.writeUInt16LE(1, 4);
  d.writeUInt16LE(32, 6);
  d.writeUInt32LE(pngs[i].length, 8);
  d.writeUInt32LE(offset, 12);
  offset += pngs[i].length;
  return d;
});
writeFileSync("public/favicon.ico", Buffer.concat([head, ...dirs, ...pngs]));
console.log("Iconos generados");
