"use client";

import { useId, useState, useSyncExternalStore, type FormEvent } from "react";
import { sizeBrands } from "@/content/sizes";
import tiendaEn from "@/content/data/en/tienda.json";
import type { Lang } from "@/content/i18n";
import { clearMySizes, getMySizes, getMySizesServer, saveMySizes, subscribeMySizes } from "@/lib/mySizes";
import { recommend, toSaved, type Item, type Kind, type Measures, type Profile, type Result } from "@/lib/sizeCalc";

const en = tiendaEn.sizeGuide;
const titlesEn = new Map(en.tableTitles.filter((x) => x.es && x.en).map((x) => [x.es, x.en]));
const headersEn = new Map(en.headers.filter((x) => x.es && x.en).map((x) => [x.es, x.en]));
const brandsEn = new Map(en.brands.map((b) => [b.id, b.name]));

const T = {
  es: {
    eyebrow: "Sin dar vueltas",
    title: "¿Qué talla pido?",
    intro:
      "Escribe tus medidas y te decimos la talla de cada marca. Las medidas se quedan en tu navegador: no se envían a ningún sitio.",
    profile: "Para quién es",
    profiles: { nino: "Niño o niña", mujer: "Mujer", hombre: "Hombre" } as Record<Profile, string>,
    mode: "Tipo de cálculo",
    quick: "Rápida",
    exact: "Exacta",
    quickHint: "Solo con la altura (y la edad, en niños).",
    exactHint: "Con pecho, cintura y cadera sale más ajustado.",
    height: "Altura (cm)",
    age: "Edad (años, opcional)",
    chest: "Pecho (cm)",
    waist: "Cintura (cm)",
    hip: "Cadera (cm)",
    optional: "opcional",
    extras: "Careta, guante y zapatillas (opcional)",
    head: "Contorno de cabeza (cm)",
    hand: "Contorno de mano (cm)",
    shoe: "Número de pie (EU)",
    howTo: "Cómo medirte ↓",
    calc: "Calcular mi talla",
    errHeight: "Escribe tu altura en centímetros (entre 90 y 230).",
    errNumber: (label: string) => `«${label}» no parece un número válido.`,
    resultTitle: "Tu talla",
    forYou: "Tallas recomendadas",
    kinds: {
      suit: "Traje (chaqueta y pantalón)",
      vest: "Peto interior",
      jacket: "Chaqueta eléctrica",
      mask: "Careta",
      glove: "Guante",
      shoe: "Zapatillas (todas las marcas)",
    } as Record<Kind, string>,
    size: "Talla",
    fits: { good: "Encaja bien", approx: "Aproximada", out: "Fuera de tabla" },
    outText: "Tus medidas se salen de la tabla. Pruébate el material del club en clase o pregúntanos por WhatsApp.",
    grow: (s: string) => `Si crece rápido: la siguiente, ${s}.`,
    borrowed: (n: string) => `Según la tabla de ${n}.`,
    seeTable: "Ver tabla",
    save: "Usar mis tallas en la tienda",
    saved: "Guardadas en este navegador. Al abrir un producto verás tu talla ya elegida; no se añade nada al carrito.",
    saveFail: "Tu navegador no deja guardar datos; las tallas valen solo mientras no cierres esta página.",
    erase: "Borrar mis medidas",
    erased: "Medidas borradas.",
    disclaimer: "Orientativo. Si dudas, pruébate el material del club en clase.",
    nothing: "Con estos datos no hay tabla que aplicar.",
    savedNote: "Tienes tallas guardadas en este navegador.",
  },
  en: {
    eyebrow: "No guesswork",
    title: "What size should I order?",
    intro:
      "Enter your measurements and we show the size for each brand. Your measurements stay in your browser: they are not sent anywhere.",
    profile: "Who is it for",
    profiles: { nino: "Boy or girl", mujer: "Woman", hombre: "Man" } as Record<Profile, string>,
    mode: "Type of calculation",
    quick: "Quick",
    exact: "Exact",
    quickHint: "Height only (plus age, for children).",
    exactHint: "With chest, waist and hip the result is closer.",
    height: "Height (cm)",
    age: "Age (years, optional)",
    chest: "Chest (cm)",
    waist: "Waist (cm)",
    hip: "Hip (cm)",
    optional: "optional",
    extras: "Mask, glove and shoes (optional)",
    head: "Head circumference (cm)",
    hand: "Hand circumference (cm)",
    shoe: "Shoe size (EU)",
    howTo: "How to measure ↓",
    calc: "Work out my size",
    errHeight: "Enter your height in centimetres (between 90 and 230).",
    errNumber: (label: string) => `“${label}” does not look like a valid number.`,
    resultTitle: "Your size",
    forYou: "Recommended sizes",
    kinds: {
      suit: "Jacket and breeches",
      vest: "Underarm protector",
      jacket: "Electric jacket",
      mask: "Mask",
      glove: "Glove",
      shoe: "Shoes (all brands)",
    } as Record<Kind, string>,
    size: "Size",
    fits: { good: "Good fit", approx: "Approximate", out: "Outside the chart" },
    outText: "Your measurements are outside the chart. Try the club's kit in class or message us on WhatsApp.",
    grow: (s: string) => `If they are growing fast: the next one, ${s}.`,
    borrowed: (n: string) => `Based on the ${n} chart.`,
    seeTable: "See chart",
    save: "Use my sizes in the shop",
    saved: "Saved in this browser. When you open a product your size will be already selected; nothing is added to the basket.",
    saveFail: "Your browser does not allow saving data; the sizes last only while this page stays open.",
    erase: "Delete my measurements",
    erased: "Measurements deleted.",
    disclaimer: "Indicative only. If in doubt, try the club's kit in class.",
    nothing: "There is no chart to apply with this data.",
    savedNote: "You have sizes saved in this browser.",
  },
} as const;

/** Texto entre paréntesis del título de la tabla ("Trajes · Hombre (alta estatura)" → "alta estatura"). */
const variantOf = (title: string) => title.match(/\(([^)]+)\)\s*$/)?.[1] ?? "";

const field =
  "mt-1 block w-full rounded-sm border border-line bg-paper px-3 py-2.5 text-base text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";
const labelCls = "block text-sm font-semibold text-ink";

function parseInput(v: string): number | undefined {
  const n = parseFloat(v.replace(",", ".").trim());
  return v.trim() !== "" && Number.isFinite(n) ? n : undefined;
}

function Num({
  id,
  label,
  value,
  onChange,
  required,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className={labelCls}>
        {label}
      </label>
      <input
        id={id}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={field}
      />
    </div>
  );
}

export function SizeCalculator({ lang = "es" }: { lang?: Lang }) {
  const t = T[lang];
  const uid = useId();
  const [profile, setProfile] = useState<Profile>("hombre");
  const [mode, setMode] = useState<"quick" | "exact">("exact");
  const [v, setV] = useState({ height: "", age: "", chest: "", waist: "", hip: "", head: "", hand: "", shoe: "" });
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [notice, setNotice] = useState("");
  const stored = useSyncExternalStore(subscribeMySizes, getMySizes, getMySizesServer);
  const set = (k: keyof typeof v) => (x: string) => setV((o) => ({ ...o, [k]: x }));

  const tr = (map: Map<string, string>, s: string) => (lang === "en" ? (map.get(s) ?? s) : s);
  const brandName = (id: string) => {
    const b = sizeBrands.find((x) => x.id === id);
    return (lang === "en" && brandsEn.get(id)) || b?.name || id;
  };

  function submit(e: FormEvent) {
    e.preventDefault();
    setNotice("");
    const height = parseInput(v.height);
    if (height === undefined || height < 90 || height > 230) {
      setError(t.errHeight);
      setResult(null);
      return;
    }
    const fields: [keyof typeof v, string][] = [
      ["age", t.age],
      ["chest", t.chest],
      ["waist", t.waist],
      ["hip", t.hip],
      ["head", t.head],
      ["hand", t.hand],
      ["shoe", t.shoe],
    ];
    const m: Measures = { profile, height };
    for (const [k, label] of fields) {
      const raw = v[k];
      if (raw.trim() === "") continue;
      if (mode === "quick" && (k === "chest" || k === "waist" || k === "hip")) continue;
      const n = parseInput(raw);
      if (n === undefined || n <= 0) {
        setError(t.errNumber(label.replace(/\s*\(.*\)/, "")));
        setResult(null);
        return;
      }
      if (k === "age" && profile !== "nino") continue;
      m[k] = n;
    }
    setError("");
    setResult(recommend(sizeBrands, m));
  }

  const hasItems = result && (result.shoe || result.brands.some((b) => b.items.length > 0));

  function renderItem(brandId: string | null, it: Item) {
    const variant = it.variant ? variantOf(tr(titlesEn, it.table)) : "";
    return (
      <li key={it.kind} className="py-2.5">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <span className="text-sm text-ink-soft">{t.kinds[it.kind]}</span>
          {it.fit === "out" ? (
            <span className="text-sm font-semibold text-ink">{t.fits.out}</span>
          ) : (
            <span className="text-base font-bold text-ink">
              {t.size} {it.label}
            </span>
          )}
        </div>
        <p className="mt-0.5 text-xs text-ink-faint">
          {it.fit !== "out" && <span className="font-semibold">{t.fits[it.fit]}</span>}
          {variant && <> · {variant}</>}
          {it.extra && it.extra.length > 0 && (
            <> · {it.extra.map((x) => `${tr(headersEn, x.header)}: ${x.value}`).join(" · ")}</>
          )}
        </p>
        {it.fit === "out" && <p className="mt-0.5 text-xs text-ink-soft">{t.outText}</p>}
        {it.grow && it.fit !== "out" && <p className="mt-0.5 text-xs font-semibold text-accent-dark">{t.grow(it.grow)}</p>}
        {it.borrowed && brandId && (
          <p className="mt-0.5 text-xs text-ink-faint">{t.borrowed(brandName("ve"))}</p>
        )}
      </li>
    );
  }

  return (
    <div id="calculadora" className="scroll-mt-24 rounded-sm border border-line bg-paper-raised p-5 sm:p-7">
      <div className="max-w-2xl">
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-accent">{t.eyebrow}</p>
        <h2 className="mt-2 text-3xl font-bold uppercase tracking-tight text-ink sm:text-4xl">{t.title}</h2>
        <p className="mt-3 text-base text-ink-soft">{t.intro}</p>
      </div>

      <form onSubmit={submit} noValidate className="mt-6 max-w-2xl space-y-5">
        <fieldset>
          <legend className={labelCls}>{t.profile}</legend>
          <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label={t.profile}>
            {(Object.keys(t.profiles) as Profile[]).map((p) => (
              <button
                key={p}
                type="button"
                role="radio"
                aria-checked={profile === p}
                onClick={() => setProfile(p)}
                className={`min-h-11 rounded-sm border px-4 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                  profile === p ? "border-accent bg-accent text-white" : "border-line bg-paper text-ink hover:border-accent"
                }`}
              >
                {t.profiles[p]}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className={labelCls}>{t.mode}</legend>
          <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label={t.mode}>
            {(["quick", "exact"] as const).map((k) => (
              <button
                key={k}
                type="button"
                role="radio"
                aria-checked={mode === k}
                onClick={() => setMode(k)}
                className={`min-h-11 rounded-sm border px-4 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                  mode === k ? "border-accent bg-accent text-white" : "border-line bg-paper text-ink hover:border-accent"
                }`}
              >
                {t[k]}
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-xs text-ink-faint">{mode === "quick" ? t.quickHint : t.exactHint}</p>
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-2">
          <Num id={`${uid}-h`} label={t.height} value={v.height} onChange={set("height")} required />
          {profile === "nino" && <Num id={`${uid}-a`} label={t.age} value={v.age} onChange={set("age")} />}
          {mode === "exact" && (
            <>
              <Num id={`${uid}-c`} label={`${t.chest} · ${t.optional}`} value={v.chest} onChange={set("chest")} />
              <Num id={`${uid}-w`} label={`${t.waist} · ${t.optional}`} value={v.waist} onChange={set("waist")} />
              <Num id={`${uid}-p`} label={`${t.hip} · ${t.optional}`} value={v.hip} onChange={set("hip")} />
            </>
          )}
        </div>

        <details className="rounded-sm border border-line bg-paper px-4 py-3">
          <summary className="cursor-pointer text-sm font-semibold text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
            {t.extras}
          </summary>
          <div className="mt-3 grid gap-4 sm:grid-cols-3">
            <Num id={`${uid}-hd`} label={t.head} value={v.head} onChange={set("head")} />
            <Num id={`${uid}-hn`} label={t.hand} value={v.hand} onChange={set("hand")} />
            <Num id={`${uid}-sh`} label={t.shoe} value={v.shoe} onChange={set("shoe")} />
          </div>
        </details>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            className="inline-flex min-h-11 items-center rounded-sm bg-accent px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-white hover:bg-accent-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {t.calc}
          </button>
          <a href="#guia-de-tallas" className="link-touche text-sm font-semibold text-accent-dark">
            {t.howTo}
          </a>
        </div>
      </form>

      <div aria-live="polite" className="mt-6">
        {error && (
          <p role="alert" className="max-w-2xl rounded-sm border border-line bg-paper px-4 py-3 text-sm font-semibold text-ink">
            {error}
          </p>
        )}
        {result && !hasItems && <p className="text-sm text-ink-soft">{t.nothing}</p>}
        {result && hasItems && (
          <div>
            <h3 className="text-lg font-bold uppercase tracking-tight text-ink">{t.forYou}</h3>
            <div className="mt-3 grid gap-4 md:grid-cols-2">
              {result.brands
                .filter((b) => b.items.length > 0)
                .map((b) => (
                  <section key={b.id} aria-labelledby={`${uid}-b-${b.id}`} className="rounded-sm border border-line bg-paper p-4">
                    <div className="flex items-baseline justify-between gap-3">
                      <h4 id={`${uid}-b-${b.id}`} className="text-base font-bold text-ink">
                        {brandName(b.id)}
                      </h4>
                      <a
                        href={`#tallas-${b.id}`}
                        onClick={(e) => {
                          const el = document.getElementById(`tallas-${b.id}`);
                          if (el instanceof HTMLDetailsElement) el.open = true;
                          if (!el) e.preventDefault();
                        }}
                        className="link-touche text-xs font-semibold text-accent-dark"
                      >
                        {t.seeTable} →
                      </a>
                    </div>
                    <ul className="mt-1 divide-y divide-line">{b.items.map((it) => renderItem(b.id, it))}</ul>
                  </section>
                ))}
              {result.shoe && (
                <section aria-label={t.kinds.shoe} className="rounded-sm border border-line bg-paper p-4">
                  <ul>{renderItem(null, result.shoe)}</ul>
                </section>
              )}
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setNotice(saveMySizes(toSaved(result)) ? t.saved : t.saveFail);
                }}
                className="inline-flex min-h-11 items-center rounded-sm border border-accent px-4 py-2.5 text-sm font-semibold uppercase tracking-wide text-accent-dark hover:bg-accent-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                {t.save}
              </button>
            </div>
          </div>
        )}
        {notice && <p className="mt-3 max-w-2xl text-sm text-ink-soft">{notice}</p>}
      </div>

      {stored && (
        <p className="mt-4 flex flex-wrap items-center gap-3 text-sm text-ink-soft">
          <span>{t.savedNote}</span>
          <button
            type="button"
            onClick={() => {
              clearMySizes();
              setResult(null);
              setNotice(t.erased);
            }}
            className="link-touche min-h-11 font-semibold text-accent-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {t.erase}
          </button>
        </p>
      )}

      <p className="mt-4 text-xs text-ink-faint">{t.disclaimer}</p>
    </div>
  );
}
