import "server-only";
import data from "./data/patrocinadores.json";
import { publicImageSize } from "@/lib/imageSize";

// Editable desde el panel (/admin): src/content/data/patrocinadores.json.
export const tiers = ["Principal", "Colaborador", "Institucional"] as const;
export type Tier = (typeof tiers)[number];

export type Sponsor = {
  name: string;
  logo?: { src: string; width: number; height: number };
  url?: string;
  tier: Tier;
};

type RawSponsor = { name?: string; logo?: string; url?: string; tier?: string };

export const sponsors: Sponsor[] = (data.sponsors as RawSponsor[])
  .filter((s) => s.name?.trim())
  .map((s) => ({
    name: s.name!.trim(),
    logo: s.logo?.trim()
      ? { src: s.logo.trim(), ...publicImageSize(s.logo.trim()) }
      : undefined,
    url: s.url?.trim() || undefined,
    tier: (tiers as readonly string[]).includes(s.tier ?? "") ? (s.tier as Tier) : "Colaborador",
  }));

export const sponsorText = {
  intro: data.intro,
  emptyTitle: data.emptyTitle,
  emptyText: data.emptyText,
  reasonsTitle: data.reasonsTitle,
  reasons: data.reasons,
  memoriaTitle: data.memoriaTitle,
  memoriaLede: data.memoriaLede,
  ctaTitle: data.ctaTitle,
  ctaText: data.ctaText,
  ctaMessage: data.ctaMessage,
};
