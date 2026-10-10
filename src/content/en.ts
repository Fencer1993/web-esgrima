import "server-only";
import textos from "./data/en/textos.json";
import programas from "./data/en/programas.json";
import horariosEn from "./data/en/horarios.json";
import preciosEn from "./data/en/precios.json";
import faqEn from "./data/en/faq.json";
import faqSillaEn from "./data/en/faq-silla.json";
import claseGratisEn from "./data/en/clase-gratis.json";
import cifrasEn from "./data/en/cifras.json";
import equipoEn from "./data/en/equipo.json";
import horariosEs from "./data/horarios.json";
import faqEs from "./data/faq.json";
import faqSillaEs from "./data/faq-silla.json";
import claseGratisEs from "./data/clase-gratis.json";
import cifrasEs from "./data/cifras.json";
import { programs, values, coaches } from "./programs";
import {
  competitionGroups,
  physicalTraining,
  plans,
  bonos,
  federationFees,
} from "./pricing";
import { parseDays } from "@/components/PricingScheduleCard";
import type { FaqItem } from "./faq";
import type { PageText } from "./texts";

// Versión en inglés del sitio. Los HECHOS (horas, precios, números, nombres,
// fotos, teléfonos) se leen siempre de los JSON en español de
// src/content/data/*.json; en src/content/data/en/*.json solo hay prosa
// traducida, alineada con el original por posición (o por `slug`). Así un
// cambio de horario o de precio en el panel se aplica a los dos idiomas.
//
// Dentro de un texto inglés, {1}, {2}… son marcadores que se rellenan con el
// 1.º, 2.º… número (precio, hora, edad) del texto español equivalente. Si el
// original cambia y el marcador deja de existir, se muestra el texto español
// (y avisa en el build) en vez de un dato falso.

const NUMBER = /\d{1,2}:\d{2}|\d+(?:[.,]\d+)?€?/g;

function warn(msg: string) {
  console.warn(`[en] ${msg}`);
}

/** Rellena {1}, {2}… de `template` con los números de `source` (el texto español). */
export function fill(template: string, source: string): string {
  const nums = source.match(NUMBER) ?? [];
  let broken = false;
  const out = template.replace(/\{(\d+)\}/g, (_, n: string) => {
    const tok = nums[Number(n) - 1];
    if (tok === undefined) {
      broken = true;
      return "";
    }
    if (tok.endsWith("€")) return `€${tok.slice(0, -1).replace(",", ".")}`;
    return tok.includes(":") ? tok : tok.replace(",", ".");
  });
  if (broken) {
    warn(`Marcador sin número en «${template}»; se usa el texto español.`);
    return source;
  }
  return out;
}

/** "30€" → "€30", "Desde 20€" → "From €20", "Gratis" → "Free". */
export function priceEn(s: string): string {
  const t = s.trim();
  if (/^gratis$/i.test(t)) return "Free";
  const from = t.match(/^desde\s+(.+)$/i);
  if (from) return `From ${priceEn(from[1])}`;
  return t.replace(/(\d+(?:[.,]\d+)?)\s?€/g, (_, n: string) => `€${n.replace(",", ".")}`);
}

const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

/** "Martes, miércoles y jueves" → "Tuesday to Thursday" (días leídos del texto español). */
export function daysEn(es: string): string {
  const active = [...parseDays(es)].sort((a, b) => a - b);
  if (active.length === 0) return es;
  const runs: number[][] = [];
  for (const d of active) {
    const last = runs[runs.length - 1];
    if (last && d === last[last.length - 1] + 1) last.push(d);
    else runs.push([d]);
  }
  const parts = runs.flatMap((r) =>
    r.length >= 3
      ? [`${DAY_NAMES[r[0]]} to ${DAY_NAMES[r[r.length - 1]]}`]
      : r.map((d) => DAY_NAMES[d]),
  );
  return parts.length <= 1
    ? (parts[0] ?? es)
    : `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`;
}

function checkLength(name: string, en: unknown[], es: unknown[]) {
  if (en.length !== es.length) {
    warn(
      `src/content/data/en/${name}.json tiene ${en.length} elementos y el español ${es.length}: ` +
        `los que falten se muestran en español. Actualiza la versión en inglés.`,
    );
  }
}

// --- Cabeceras y textos de página ------------------------------------------

export const enHomeText = textos.inicio;

export function enPageText(path: string): PageText {
  const found = textos.paginas.find((p) => p.path === path);
  if (!found) throw new Error(`Falta el texto de "${path}" en src/content/data/en/textos.json`);
  return found;
}

// --- Programas, valores y equipo ---------------------------------------------

export function enPrograms() {
  return programs.map((p) => {
    const t = programas.programs.find((x) => x.slug === p.slug);
    if (!t) warn(`Falta el programa «${p.slug}» en data/en/programas.json`);
    return { ...p, title: t?.title ?? p.title, tagline: t?.tagline ?? p.tagline };
  });
}

export function enValues(): typeof values {
  checkLength("programas (values)", programas.values, values);
  return values.map((v, i) => ({ ...v, ...programas.values[i] }));
}

export function enCoaches(): typeof coaches {
  checkLength("equipo (coaches)", equipoEn.coaches, coaches);
  return coaches.map((c, i) => {
    const t = equipoEn.coaches[i];
    if (!t) return c;
    return {
      ...c,
      role: t.role,
      bio: fill(t.bio, c.bio),
      photo: { ...c.photo, alt: t.photoAlt },
    };
  });
}

// --- FAQ, clase gratis, cifras ------------------------------------------------

function translateFaq(name: string, en: FaqItem[], es: FaqItem[]): FaqItem[] {
  checkLength(name, en, es);
  return es.map((item, i) => {
    const t = en[i];
    return t ? { question: t.question, answer: fill(t.answer, item.answer) } : item;
  });
}

export const enFaq = (): FaqItem[] => translateFaq("faq", faqEn.items, faqEs.items);
export const enFaqSilla = (): FaqItem[] =>
  translateFaq("faq-silla", faqSillaEn.items, faqSillaEs.items);

/** Pasos de la clase gratis: texto inglés + `photo` (fragmento de nombre) del español. */
export function enClaseGratisSteps() {
  checkLength("clase-gratis", claseGratisEn.steps, claseGratisEs.steps);
  return claseGratisEs.steps.map((s, i) => ({
    title: claseGratisEn.steps[i]?.title ?? s.title,
    body: claseGratisEn.steps[i]?.text ?? s.text,
    photo: s.photo,
  }));
}

export function enStats() {
  checkLength("cifras", cifrasEn.stats, cifrasEs.stats);
  return cifrasEs.stats.map((s, i) => ({
    value: s.value,
    label: cifrasEn.stats[i]?.label ?? s.label,
    detail: cifrasEn.stats[i]?.detail ?? s.detail,
  }));
}

// --- Horarios y precios --------------------------------------------------------

export const enTechnificationNote = horariosEn.technificationNote;

export function enCompetitionGroups() {
  checkLength("horarios (competitionGroups)", horariosEn.competitionGroups, competitionGroups);
  return competitionGroups.map((g, i) => ({
    name: horariosEn.competitionGroups[i]?.name ?? g.name,
    text: horariosEn.competitionGroups[i]?.text ?? g.text,
    days: daysEn(g.days),
    hours: g.hours,
  }));
}

export function enPhysicalTraining() {
  return {
    name: horariosEn.physicalTraining.name,
    text: horariosEn.physicalTraining.text,
    price: priceEn(physicalTraining.price),
    days: daysEn(physicalTraining.days),
    hours: physicalTraining.hours,
  };
}

export type ScheduleRowEn = {
  group: string;
  days: string;
  /** Texto español de los días: de él se leen los chips L M X J V. */
  daysSource: string;
  hours: string;
  note?: string;
};

export function enSchedule(): ScheduleRowEn[] {
  const regular = horariosEs.groups;
  checkLength("horarios (groups)", horariosEn.groups, regular);
  const pt = enPhysicalTraining();
  return [
    ...enCompetitionGroups().map((g, i) => ({
      group: g.name,
      days: g.days,
      daysSource: competitionGroups[i].days,
      hours: g.hours,
      note: enTechnificationNote,
    })),
    ...regular.map((r, i) => {
      const t = horariosEn.groups[i] as { group: string; note?: string } | undefined;
      return {
        group: t?.group ?? r.group,
        days: daysEn(r.days),
        daysSource: r.days,
        hours: r.hours,
        note: t ? t.note || undefined : r.note || undefined,
      };
    }),
    {
      group: `${pt.name} (${pt.price.toLowerCase()})`,
      days: pt.days,
      daysSource: physicalTraining.days,
      hours: pt.hours,
    },
  ];
}

export function enPlans() {
  checkLength("precios (plans)", preciosEn.plans, plans);
  return plans.map((p, i) => {
    const t = preciosEn.plans[i];
    if (!t) return p;
    checkLength(`precios (plans[${i}].features)`, t.features, p.features);
    return {
      name: t.name,
      price: priceEn(p.price),
      period: t.period,
      features: p.features.map((f, j) => (t.features[j] ? fill(t.features[j], f) : f)),
    };
  });
}

export function enBonos() {
  checkLength("precios (bonos)", preciosEn.bonos, bonos);
  return bonos.map((b, i) => {
    const t = preciosEn.bonos[i];
    if (!t) return b;
    const child = b.childPrice.match(/\d+(?:[.,]\d+)?\s?€/)?.[0];
    return {
      name: fill(t.name, b.name),
      price: priceEn(b.price),
      childPrice: child ? `${priceEn(child)} ${t.childLabel}` : b.childPrice,
      note: t.note,
    };
  });
}

export function enFederationFees() {
  checkLength("precios (federationFees)", preciosEn.federationFees, federationFees);
  return federationFees.map((f, i) => {
    const t = preciosEn.federationFees[i];
    return {
      label: t ? fill(t.label, f.label) : f.label,
      price: priceEn(f.price),
    };
  });
}

/** Horario del grupo de silla de ruedas (se localiza en horarios.json por "silla"). */
export function enWheelchairSchedule() {
  const g = horariosEs.groups.find((x) => /silla/i.test(x.group));
  if (!g) throw new Error('No hay ningún grupo "silla" en horarios.json');
  return { days: daysEn(g.days), hours: g.hours };
}
