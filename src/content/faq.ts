import data from "./data/faq.json";

// Editable desde el panel (/admin): src/content/data/faq.json.
export type FaqItem = { question: string; answer: string };

export const faq: FaqItem[] = data.items;
