import data from "./data/tallas.json";

// Guía de tallas de la tienda (src/content/data/tallas.json, editable desde el panel).
export type SizeTable = { title: string; headers: string[]; rows: string[][] };
export type SizeBrand = {
  id: string;
  name: string;
  suppliers: string;
  note: string;
  source: string;
  tables: SizeTable[];
};

export const sizeGuideIntro: string = data.intro;
export const howToMeasure: { part: string; how: string }[] = data.howToMeasure;
export const sizeBrands: SizeBrand[] = data.brands;
