// <img> directo: con `output: "export"` no hay optimizador de imágenes, así que
// las fotos ya están reducidas y en WebP dentro de public/images. Este
// componente solo antepone el basePath (staging en subcarpeta) y fija
// width/height para que la página no salte al cargar.
export function Photo({
  src,
  alt,
  width,
  height,
  className = "",
  priority = false,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
}) {
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`${base}${src}`}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      className={className}
    />
  );
}
