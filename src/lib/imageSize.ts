import "server-only";
import { readFileSync } from "node:fs";
import path from "node:path";
import { imageSize } from "image-size";

// Medidas reales de una imagen de /public, leídas en el build. Así quien
// sube fotos desde el panel no tiene que indicar ancho y alto.
const cache = new Map<string, { width: number; height: number }>();

export function publicImageSize(src: string) {
  const hit = cache.get(src);
  if (hit) return hit;
  try {
    const { width = 1200, height = 900 } = imageSize(
      readFileSync(path.join(process.cwd(), "public", decodeURIComponent(src))),
    );
    const size = { width, height };
    cache.set(src, size);
    return size;
  } catch {
    return { width: 1200, height: 900 };
  }
}
