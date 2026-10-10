// Genera los iconos de la app (PWA) en public/icons/ a partir del diseño de
// src/app/icon.tsx (fondo #17232b, "E" azul + "T" verde). Las letras se
// dibujan como polígonos para no depender de fuentes del sistema.
// Uso: node .github/scripts/generate-pwa-icons.mjs
import sharp from "sharp";
import { mkdirSync } from "node:fs";

const BG = "#17232b";
const BLUE = "#1797d1";
const GREEN = "#2e8f53";

// Letras en una rejilla de 226 x 140 (E: 0-100, T: 116-226), trazo 28.
const glyphs = `
  <path fill="${BLUE}" d="M0 0h100v28H28v28h60v28H28v28h72v28H0z"/>
  <path fill="${GREEN}" d="M116 0h110v28h-41v112h-28V28h-41z"/>`;

// `scale` = ancho de las letras respecto al lienzo; `radius` = esquinas.
function svg(size, scale, radius) {
  const k = (size * scale) / 226;
  const tx = (size - 226 * k) / 2;
  const ty = (size - 140 * k) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${radius}" fill="${BG}"/>
  <g transform="translate(${tx} ${ty}) scale(${k})">${glyphs}</g></svg>`;
}

const out = "public/icons";
mkdirSync(out, { recursive: true });
const jobs = [
  ["icon-192.png", 192, 0.56, 192 * 0.22],
  ["icon-512.png", 512, 0.56, 512 * 0.22],
  // Maskable: fondo a sangre y contenido dentro del círculo de seguridad (80 %).
  ["icon-maskable-512.png", 512, 0.46, 0],
  // iOS aplica su propia máscara: fondo a sangre.
  ["apple-touch-icon.png", 180, 0.56, 0],
];
for (const [name, size, scale, radius] of jobs) {
  await sharp(Buffer.from(svg(size, scale, radius))).png().toFile(`${out}/${name}`);
  console.log("ok", name);
}
