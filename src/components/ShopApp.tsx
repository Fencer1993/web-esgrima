"use client";

import Link from "next/link";
import { useId, useMemo, useState, useSyncExternalStore, type FormEvent, type MouseEvent } from "react";
import type { ShopProduct } from "@/content/shop";
import { Photo } from "@/components/Photo";
import { ShopDialog } from "@/components/ShopDialog";
import { getMySizes, savedSizeFor } from "@/lib/mySizes";
import type { Lang } from "@/content/i18n";
import {
  cartLineLabel,
  categoryLabel,
  handLabel,
  optionNameLabel,
  optionValueLabel,
  priceLabel,
  shopUi,
} from "@/content/shopText";
import {
  MAX_LINES,
  MAX_QTY,
  addToCart,
  clearCart,
  getServerSnapshot,
  getSnapshot,
  removeLine,
  setQty,
  subscribe,
  toggleFav,
  type CartLine,
} from "@/lib/shopStore";

const inputCls =
  "mt-1 w-full rounded-sm border border-line bg-paper px-3 py-2.5 text-base text-ink outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/25 sm:text-sm";
const labelCls = "text-xs font-medium uppercase tracking-wide text-ink-faint";
const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

const PAGE = 48;

const norm = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

function Placeholder({ size = 56 }: { size?: number }) {
  return (
    <div
      aria-hidden
      className="flex h-full w-full items-center justify-center bg-accent-soft text-accent-dark"
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 20L18 6" />
        <path d="M15 3l6 6" />
        <path d="M6 14l4 4" />
        <path d="M3 21l2-2" />
      </svg>
    </div>
  );
}

function Heart({ filled, className = "h-5 w-5" }: { filled: boolean; className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className={className}
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    >
      <path d="M12 20.5s-7.5-4.6-9.2-9.3C1.6 7.9 3.5 5 6.4 5c1.9 0 3.4 1 4.4 2.5.4.6 1 .6 1.4 0C13.2 6 14.7 5 16.6 5c2.9 0 4.8 2.9 3.6 6.2-1.7 4.7-8.2 9.3-8.2 9.3z" />
    </svg>
  );
}

function Stepper({
  value,
  onChange,
  label,
  lang,
}: {
  value: number;
  onChange: (n: number) => void;
  label: string;
  lang: Lang;
}) {
  const t = shopUi[lang];
  const btn = `flex h-10 w-10 items-center justify-center text-lg font-bold text-ink transition-colors hover:bg-accent-soft disabled:opacity-35 disabled:hover:bg-transparent ${focusRing}`;
  return (
    <div
      role="group"
      aria-label={label}
      className="inline-flex items-center rounded-sm border border-line bg-paper"
    >
      <button
        type="button"
        className={btn}
        onClick={() => onChange(value - 1)}
        disabled={value <= 1}
        aria-label={t.oneLess}
      >
        −
      </button>
      <span aria-live="polite" className="tabular w-8 text-center text-sm font-semibold">
        {value}
      </span>
      <button
        type="button"
        className={btn}
        onClick={() => onChange(value + 1)}
        disabled={value >= MAX_QTY}
        aria-label={t.oneMore}
      >
        +
      </button>
    </div>
  );
}

function Chips({
  legend,
  options,
  value,
  onChange,
  display = (o) => o,
}: {
  legend: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
  /** Texto mostrado de cada valor (el valor enviado no cambia). */
  display?: (o: string) => string;
}) {
  return (
    <fieldset>
      <legend className={labelCls}>{legend}</legend>
      <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label={legend}>
        {options.map((o) => (
          <button
            key={o}
            type="button"
            role="radio"
            aria-checked={value === o}
            onClick={() => onChange(o)}
            className={`min-w-11 rounded-sm border px-3 py-2 text-sm font-semibold transition-colors ${focusRing} ${
              value === o
                ? "border-accent bg-accent text-white"
                : "border-line bg-paper text-ink hover:border-accent"
            }`}
          >
            {display(o)}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

/** Cierra la ficha y abre la tabla de tallas de la marca en esta misma página. */
function openSizeGuide(e: MouseEvent<HTMLAnchorElement>, hash: string, close: () => void) {
  e.preventDefault();
  close();
  window.setTimeout(() => {
    const el = document.getElementById(hash.slice(1));
    if (!el) return;
    if (el instanceof HTMLDetailsElement) el.open = true;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    el.querySelector("summary")?.focus({ preventScroll: true });
    history.replaceState(null, "", hash);
  }, 60);
}

function ProductDetail({
  product,
  isFav,
  onClose,
  onAdded,
  lang,
}: {
  product: ShopProduct;
  isFav: boolean;
  onClose: () => void;
  onAdded: () => void;
  lang: Lang;
}) {
  const t = shopUi[lang];
  const name = (lang === "en" && product.nameEn) || product.name;
  const description = (lang === "en" && product.descriptionEn) || product.description;
  const titleId = useId();
  // Talla guardada por la calculadora (solo existe en este navegador). La ficha
  // se monta al abrirla, ya en el cliente, así que se puede leer aquí.
  const [calcSize] = useState(() =>
    product.sizes.length > 1 ? savedSizeFor(product, getMySizes()) : "",
  );
  const [size, setSize] = useState(
    product.sizes.length === 1 ? product.sizes[0] : calcSize,
  );
  const [hand, setHand] = useState(product.hands.length === 1 ? product.hands[0] : "");
  const [opts, setOpts] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      product.options.filter((o) => o.values.length === 1).map((o) => [o.name, o.values[0]]),
    ),
  );
  const [qty, setQ] = useState(1);
  const [error, setError] = useState("");

  function add() {
    if (product.sizes.length > 0 && !size) {
      setError(t.errSize);
      return;
    }
    if (product.hands.length > 0 && !hand) {
      setError(t.errHand);
      return;
    }
    const missing = product.options.find((o) => !opts[o.name]);
    if (missing) {
      setError(t.errOption(optionNameLabel(missing.name, lang)));
      return;
    }
    addToCart({ productId: product.id, size, hand, options: opts, qty });
    onAdded();
  }

  return (
    <ShopDialog labelledBy={titleId} onClose={onClose} variant="center">
      <div className="flex items-center justify-between border-b border-line px-5 py-3 sm:hidden">
        <p className="font-mono text-xs uppercase tracking-wide text-ink-faint">
          {product.supplier}
        </p>
        <button
          type="button"
          onClick={onClose}
          aria-label={t.close}
          className={`-mr-2 flex h-10 w-10 items-center justify-center text-2xl text-ink ${focusRing}`}
        >
          ×
        </button>
      </div>
      <div className="grid min-h-0 flex-1 overflow-y-auto sm:grid-cols-2">
        <div className="relative aspect-[4/3] w-full bg-accent-soft sm:aspect-auto sm:min-h-[26rem]">
          {product.photo ? (
            <Photo
              src={product.photo}
              alt={name}
              width={900}
              height={900}
              className="absolute inset-0 h-full w-full bg-white object-contain p-4"
            />
          ) : (
            <div className="absolute inset-0">
              <Placeholder size={88} />
            </div>
          )}
        </div>
        <div className="flex flex-col gap-5 p-5 sm:p-7">
          <div>
            <div className="hidden items-start justify-between gap-3 sm:flex">
              <p className="font-mono text-xs uppercase tracking-wide text-ink-faint">
                {product.supplier}
                {product.ref ? ` · ${t.refPrefix} ${product.ref}` : ""}
              </p>
              <button
                type="button"
                onClick={onClose}
                aria-label={t.close}
                className={`-mr-2 -mt-2 flex h-10 w-10 items-center justify-center text-2xl text-ink ${focusRing}`}
              >
                ×
              </button>
            </div>
            <div className="flex items-start justify-between gap-3">
              <h2
                id={titleId}
                className="mt-1 text-2xl font-bold uppercase leading-tight tracking-tight text-ink sm:text-3xl"
              >
                {name}
              </h2>
              <button
                type="button"
                onClick={() => toggleFav(product.id)}
                aria-pressed={isFav}
                aria-label={isFav ? t.removeFav() : t.addFav()}
                className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line ${
                  isFav ? "text-[#d6336c]" : "text-ink-soft"
                } hover:border-accent ${focusRing}`}
              >
                <Heart filled={isFav} />
              </button>
            </div>
            {product.price && (
              <p className="mt-2 text-2xl font-bold text-accent-dark">{priceLabel(product.price, lang)}</p>
            )}
          </div>

          {description && (
            <p
              {...(lang === "en" && !product.descriptionEn ? { lang: "es" } : {})}
              className="whitespace-pre-line text-sm leading-relaxed text-ink-soft"
            >
              {description}
            </p>
          )}

          {(product.url || product.sizeGuide) && (
            <div className="flex flex-col gap-1.5">
              {product.sizeGuide?.startsWith("#") && product.sizes.length > 0 && (
                <a
                  href="#calculadora"
                  onClick={(e) => openSizeGuide(e, "#calculadora", onClose)}
                  className="link-touche self-start text-sm font-semibold text-accent-dark"
                >
                  {t.calcLink}
                </a>
              )}
              {product.sizeGuide && (
                <a
                  href={product.sizeGuide}
                  {...(product.sizeGuide.startsWith("#")
                    ? { onClick: (e) => openSizeGuide(e, product.sizeGuide, onClose) }
                    : { target: "_blank", rel: "noopener noreferrer" })}
                  className="link-touche self-start text-sm font-semibold text-accent-dark"
                >
                  {t.sizeGuideLink}
                </a>
              )}
              {product.url && (
                <a
                  href={product.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-touche self-start text-sm font-semibold text-accent-dark"
                >
                  {t.supplierSheet(product.supplier, !product.sizeGuide)}
                </a>
              )}
            </div>
          )}

          {product.sizes.length > 0 && (
            <Chips
              legend={t.size}
              options={product.sizes}
              value={size}
              onChange={(v) => {
                setSize(v);
                setError("");
              }}
            />
          )}
          {calcSize && size === calcSize && (
            <p className="text-xs font-semibold text-accent-dark">✓ {t.yourSize}</p>
          )}
          {product.hands.length > 0 && (
            <Chips
              legend={t.hand}
              options={product.hands}
              display={(h) => handLabel(h, lang)}
              value={hand}
              onChange={(v) => {
                setHand(v);
                setError("");
              }}
            />
          )}

          {product.options.map((o) => (
            <Chips
              key={o.name}
              legend={optionNameLabel(o.name, lang)}
              options={o.values}
              display={(v) => optionValueLabel(v, lang)}
              value={opts[o.name] ?? ""}
              onChange={(v) => {
                setOpts((prev) => ({ ...prev, [o.name]: v }));
                setError("");
              }}
            />
          ))}

          <div>
            <p className={labelCls}>{t.quantity}</p>
            <div className="mt-2">
              <Stepper value={qty} onChange={setQ} label={t.quantity} lang={lang} />
            </div>
          </div>

          <div className="mt-auto pt-2">
            <p role="alert" className="min-h-5 text-sm font-medium text-[#b42318]">
              {error}
            </p>
            <button
              type="button"
              onClick={add}
              className={`btn-blade w-full rounded-sm bg-accent px-6 py-3.5 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-accent-dark ${focusRing}`}
            >
              {t.addToCart}
            </button>
          </div>
        </div>
      </div>
    </ShopDialog>
  );
}

function CartPanel({
  lines,
  byId,
  onClose,
  lang,
}: {
  lines: CartLine[];
  byId: Map<string, ShopProduct>;
  onClose: () => void;
  lang: Lang;
}) {
  const t = shopUi[lang];
  const titleId = useId();
  const [step, setStep] = useState<"cart" | "checkout" | "done">("cart");
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [message, setMessage] = useState("");
  const [orderId, setOrderId] = useState("");
  const units = lines.reduce((n, l) => n + l.qty, 0);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (lines.length === 0) return;
    if (lines.length > MAX_LINES) {
      setStatus("error");
      setMessage(t.errMaxLines(MAX_LINES));
      return;
    }
    setStatus("sending");
    setMessage("");
    try {
      const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
      const res = await fetch(`${base}/pedido.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fd.get("name"),
          email: fd.get("email"),
          phone: fd.get("phone"),
          notes: fd.get("notes"),
          website: fd.get("website"),
          ...(lang === "en" ? { lang: "en" } : {}),
          lines: lines.map((l) => ({
            product: l.productId,
            size: l.size,
            hand: l.hand,
            options: l.options,
            qty: l.qty,
          })),
        }),
      });
      const data = await res.json().catch(() => null);
      if (data?.ok) {
        setOrderId(String(data.id ?? ""));
        clearCart();
        setStatus("idle");
        setStep("done");
      } else {
        setStatus("error");
        setMessage(data?.error ?? t.errSend);
      }
    } catch {
      setStatus("error");
      setMessage(t.errNetwork);
    }
  }

  const heading =
    step === "done" ? t.headingDone : step === "checkout" ? t.headingCheckout : t.headingCart;

  return (
    <ShopDialog labelledBy={titleId} onClose={onClose} variant="right">
      <div className="flex items-center justify-between border-b border-line px-5 py-3">
        <h2 id={titleId} className="text-xl font-bold uppercase tracking-tight">
          {heading}
          {step === "cart" && units > 0 && (
            <span className="ml-2 font-mono text-sm font-normal text-ink-faint">
              ({units})
            </span>
          )}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label={t.closeCart}
          data-autofocus
          className={`-mr-2 flex h-10 w-10 items-center justify-center text-2xl text-ink ${focusRing}`}
        >
          ×
        </button>
      </div>

      {step === "done" ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 overflow-y-auto p-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-steel-soft text-good">
            <svg aria-hidden viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12.5l4.5 4.5L19 7.5" />
            </svg>
          </div>
          <p role="status" className="text-base text-ink">
            {t.received}{orderId ? <> ({t.refLabel} <strong className="font-mono">{orderId}</strong>)</> : null}.
          </p>
          <p className="text-sm text-ink-soft">{t.copySent}</p>
          <button
            type="button"
            onClick={onClose}
            className={`mt-2 rounded-sm bg-accent px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white hover:bg-accent-dark ${focusRing}`}
          >
            {t.backToShop}
          </button>
        </div>
      ) : lines.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
          <p className="text-base text-ink-soft">{t.emptyCart}</p>
          <button
            type="button"
            onClick={onClose}
            className={`rounded-sm border border-accent px-6 py-3 text-sm font-semibold uppercase tracking-wide text-accent-dark hover:bg-accent-soft ${focusRing}`}
          >
            {t.keepBrowsing}
          </button>
        </div>
      ) : step === "cart" ? (
        <>
          <ul className="flex-1 divide-y divide-line overflow-y-auto px-5">
            {lines.map((l) => {
              const p = byId.get(l.productId);
              if (!p) return null;
              const opts = cartLineLabel(l, lang);
              const pName = (lang === "en" && p.nameEn) || p.name;
              return (
                <li key={l.key} className="flex gap-3 py-4">
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-sm bg-accent-soft">
                    {p.photo ? (
                      <Photo src={p.photo} alt="" width={160} height={160} className="h-full w-full bg-white object-contain" />
                    ) : (
                      <Placeholder size={32} />
                    )}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <p className="font-mono text-[11px] uppercase tracking-wide text-ink-faint">
                      {p.supplier}
                    </p>
                    <p className="text-sm font-bold uppercase leading-tight text-ink">{pName}</p>
                    {opts && <p className="mt-0.5 text-xs text-ink-soft">{opts}</p>}
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <Stepper
                        value={l.qty}
                        onChange={(n) => setQty(l.key, n)}
                        label={t.quantityOf(pName)}
                        lang={lang}
                      />
                      <button
                        type="button"
                        onClick={() => removeLine(l.key)}
                        aria-label={t.removeLine(pName, opts)}
                        className={`px-2 py-2 text-xs font-semibold uppercase tracking-wide text-ink-faint hover:text-[#b42318] ${focusRing}`}
                      >
                        {t.remove}
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="space-y-2 border-t border-line bg-paper-raised p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
            <p className="text-xs text-ink-soft">{t.finalAmount}</p>
            <button
              type="button"
              onClick={() => setStep("checkout")}
              className={`btn-blade w-full rounded-sm bg-accent px-6 py-3.5 text-sm font-semibold uppercase tracking-wide text-white hover:bg-accent-dark ${focusRing}`}
            >
              {t.requestOrder(units)}
            </button>
            <button
              type="button"
              onClick={onClose}
              className={`w-full rounded-sm px-6 py-2.5 text-sm font-semibold text-accent-dark hover:bg-accent-soft ${focusRing}`}
            >
              {t.keepBrowsing}
            </button>
          </div>
        </>
      ) : (
        <form onSubmit={onSubmit} className="relative flex min-h-0 flex-1 flex-col">
          <div className="flex-1 space-y-4 overflow-y-auto p-5">
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="absolute left-[-9999px]"
            />
            <p className="rounded-sm bg-accent-soft px-3 py-2 text-xs text-ink-soft">
              {t.requestNote}
            </p>
            <div>
              <label htmlFor="cart-name" className={labelCls}>{t.name}</label>
              <input id="cart-name" name="name" required maxLength={100} autoComplete="name" className={inputCls} />
            </div>
            <div>
              <label htmlFor="cart-email" className={labelCls}>{t.email}</label>
              <input id="cart-email" name="email" type="email" required maxLength={150} autoComplete="email" className={inputCls} />
            </div>
            <div>
              <label htmlFor="cart-phone" className={labelCls}>{t.phone}</label>
              <input id="cart-phone" name="phone" type="tel" required maxLength={30} autoComplete="tel" className={inputCls} />
            </div>
            <div>
              <label htmlFor="cart-notes" className={labelCls}>{t.notes}</label>
              <textarea id="cart-notes" name="notes" rows={3} maxLength={1000} placeholder={t.notesPlaceholder} className={inputCls} />
            </div>
            <label className="flex items-start gap-2 text-xs text-ink-soft">
              <input type="checkbox" required className="mt-0.5 h-4 w-4 accent-[var(--accent)]" />
              <span>
                {t.privacyBefore}{" "}
                <Link
                  href={t.privacyHref}
                  target="_blank"
                  {...(lang === "en" ? { hrefLang: "es" } : {})}
                  className="font-semibold text-accent"
                >
                  {t.privacyLink}
                </Link>
              </span>
            </label>
            <p role="alert" className="text-sm font-medium text-[#b42318]">
              {status === "error" ? message : ""}
            </p>
          </div>
          <div className="space-y-2 border-t border-line bg-paper-raised p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
            <button
              type="submit"
              disabled={status === "sending"}
              className={`btn-blade w-full rounded-sm bg-accent px-6 py-3.5 text-sm font-semibold uppercase tracking-wide text-white hover:bg-accent-dark disabled:opacity-60 ${focusRing}`}
            >
              {status === "sending" ? t.sending : t.submit}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep("cart");
                setStatus("idle");
                setMessage("");
              }}
              className={`w-full rounded-sm px-6 py-2.5 text-sm font-semibold text-accent-dark hover:bg-accent-soft ${focusRing}`}
            >
              {t.backToCart}
            </button>
          </div>
        </form>
      )}
    </ShopDialog>
  );
}

export function ShopApp({
  products,
  categories,
  lang = "es",
}: {
  products: ShopProduct[];
  categories: string[];
  lang?: Lang;
}) {
  const t = shopUi[lang];
  const store = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [category, setCategory] = useState("Todo");
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(PAGE);
  const [openId, setOpenId] = useState<string | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const searchId = useId();

  const byId = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);
  const validLines = store.cart.filter((l) => byId.has(l.productId));
  const units = validLines.reduce((n, l) => n + l.qty, 0);
  const favCount = store.favs.filter((f) => byId.has(f)).length;

  const visible = useMemo(() => {
    const q = norm(query.trim());
    return products.filter((p) => {
      if (category === "Favoritos" ? !store.favs.includes(p.id) : category !== "Todo" && p.category !== category)
        return false;
      if (!q) return true;
      return norm(
        `${p.name} ${lang === "en" ? `${p.nameEn} ${categoryLabel(p.category, lang)} ` : ""}${p.supplier} ${p.category} ${p.ref}`,
      ).includes(q);
    });
  }, [products, category, query, store.favs, lang]);

  const opened = openId ? byId.get(openId) : undefined;
  // Los valores internos de los chips siguen siendo los españoles; solo cambia la etiqueta.
  const chips = ["Todo", ...categories, "Favoritos"];
  const chipLabel = (c: string) =>
    c === "Todo" ? t.allChip : c === "Favoritos" ? t.favChip : categoryLabel(c, lang);

  return (
    <>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0" role="group" aria-label={t.filterByCategory}>
          {chips.map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={category === c}
              onClick={() => {
                setCategory(c);
                setLimit(PAGE);
              }}
              className={`flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${focusRing} ${
                category === c
                  ? "border-accent bg-accent text-white"
                  : "border-line bg-paper text-ink hover:border-accent"
              }`}
            >
              {c === "Favoritos" && <Heart filled={category === c} className="h-4 w-4" />}
              {chipLabel(c)}
              {c === "Favoritos" && favCount > 0 && (
                <span className="tabular text-xs opacity-80">{favCount}</span>
              )}
            </button>
          ))}
        </div>
        <div className="relative w-full lg:max-w-xs">
          <label htmlFor={searchId} className="sr-only">{t.searchLabel}</label>
          <svg aria-hidden viewBox="0 0 24 24" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="6.5" />
            <path d="M20 20l-4-4" />
          </svg>
          <input
            id={searchId}
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setLimit(PAGE);
            }}
            placeholder={t.searchPlaceholder}
            className={`${inputCls} !mt-0 pl-9`}
          />
        </div>
      </div>

      <p className="mt-5 text-sm text-ink-faint" aria-live="polite">
        {visible.length} {visible.length === 1 ? t.product : t.products}
      </p>

      {visible.length === 0 ? (
        <p className="mt-6 rounded-sm border border-dashed border-line p-8 text-center text-sm text-ink-soft">
          {category === "Favoritos" && !query ? t.noFavs : t.noMatches}
        </p>
      ) : (
        <ul className="mt-3 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
          {visible.slice(0, limit).map((p) => {
            const fav = store.favs.includes(p.id);
            const pName = (lang === "en" && p.nameEn) || p.name;
            return (
              <li
                key={p.id}
                className="group relative flex flex-col overflow-hidden rounded-sm border border-line bg-paper-raised transition-shadow hover:shadow-md"
              >
                <button
                  type="button"
                  onClick={() => setOpenId(p.id)}
                  aria-label={t.viewProduct(pName, p.supplier)}
                  className={`flex flex-1 flex-col text-left ${focusRing}`}
                >
                  <div className="aspect-square w-full overflow-hidden bg-accent-soft">
                    {p.photo ? (
                      <Photo
                        src={p.photo}
                        alt=""
                        width={600}
                        height={600}
                        className="h-full w-full bg-white object-contain p-2 motion-safe:transition-transform motion-safe:duration-500 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <Placeholder />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-3 sm:p-4">
                    <p className="font-mono text-[11px] uppercase tracking-wide text-ink-faint">
                      {p.supplier}
                    </p>
                    <h3 className="mt-0.5 text-base font-bold uppercase leading-tight tracking-tight text-ink sm:text-lg">
                      {pName}
                    </h3>
                    {p.price && (
                      <p className="mt-auto pt-2 text-base font-bold text-accent-dark">
                        {priceLabel(p.price, lang)}
                      </p>
                    )}
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => toggleFav(p.id)}
                  aria-pressed={fav}
                  aria-label={fav ? t.removeFav(pName) : t.addFav(pName)}
                  className={`absolute right-2 top-2 flex h-10 w-10 items-center justify-center rounded-full bg-paper/90 shadow-sm backdrop-blur ${
                    fav ? "text-[#d6336c]" : "text-ink-soft hover:text-[#d6336c]"
                  } ${focusRing}`}
                >
                  <Heart filled={fav} />
                </button>
              </li>
            );
          })}
        </ul>
      )}
      {visible.length > limit && (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={() => setLimit((n) => n + PAGE)}
            className={`rounded-sm border border-accent px-6 py-3 text-sm font-semibold uppercase tracking-wide text-accent-dark hover:bg-accent-soft ${focusRing}`}
          >
            {t.seeMore(visible.length - limit)}
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={() => setCartOpen(true)}
        aria-label={t.openCart(units)}
        className={`fixed left-4 z-30 flex h-14 items-center gap-2 rounded-full bg-ink px-5 text-white shadow-lg shadow-black/25 transition-colors hover:bg-accent-dark lg:left-6 lg:h-12 ${focusRing}`}
        style={{ bottom: "calc(1rem + env(safe-area-inset-bottom))" }}
      >
        <svg aria-hidden viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 4h2.5l2.2 10.2a1.5 1.5 0 0 0 1.5 1.2h8.1a1.5 1.5 0 0 0 1.5-1.1L20.5 8H6.2" />
          <circle cx="9.5" cy="19.5" r="1.3" />
          <circle cx="17" cy="19.5" r="1.3" />
        </svg>
        <span className="hidden text-sm font-semibold uppercase tracking-wide sm:inline">{t.cart}</span>
        <span
          aria-hidden
          className={`tabular flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-xs font-bold ${
            units > 0 ? "bg-accent text-white" : "bg-white/20 text-white/80"
          }`}
        >
          {units}
        </span>
      </button>

      {opened && (
        <ProductDetail
          key={opened.id}
          product={opened}
          isFav={store.favs.includes(opened.id)}
          lang={lang}
          onClose={() => setOpenId(null)}
          onAdded={() => {
            setOpenId(null);
            setCartOpen(true);
          }}
        />
      )}
      {cartOpen && <CartPanel lines={validLines} byId={byId} onClose={() => setCartOpen(false)} lang={lang} />}
    </>
  );
}
