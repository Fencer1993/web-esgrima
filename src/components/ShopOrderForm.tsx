"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

type FormProduct = { id: string; name: string; supplier: string; sizes: string[] };
type Line = { key: number; productId: string; size: string; qty: number };

const MAX_LINES = 20;
const input =
  "mt-1 w-full rounded-sm border border-line bg-paper px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/25";
const label = "text-xs font-medium uppercase tracking-wide text-ink-faint";

export function ShopOrderForm({ products }: { products: FormProduct[] }) {
  const [lines, setLines] = useState<Line[]>([
    { key: 1, productId: "", size: "", qty: 1 },
  ]);
  const [nextKey, setNextKey] = useState(2);
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">("idle");
  const [message, setMessage] = useState("");

  const byId = (id: string) => products.find((p) => p.id === id);

  function updateLine(key: number, patch: Partial<Line>) {
    setLines((ls) => ls.map((l) => (l.key === key ? { ...l, ...patch } : l)));
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const chosen = lines.filter((l) => l.productId);
    if (chosen.length === 0) {
      setStatus("error");
      setMessage("Añade al menos un producto a tu pedido.");
      return;
    }
    if (chosen.some((l) => (byId(l.productId)?.sizes.length ?? 0) > 0 && !l.size)) {
      setStatus("error");
      setMessage("Elige la talla de los productos que la requieren.");
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
          lines: chosen.map((l) => ({
            product: l.productId,
            size: l.size,
            qty: l.qty,
          })),
        }),
      });
      const data = await res.json().catch(() => null);
      if (data?.ok) {
        setStatus("ok");
        setMessage(
          `Solicitud recibida (ref. ${data.id}). Te hemos enviado una copia por correo; el club te avisará del importe antes de hacer el pedido.`,
        );
        form.reset();
        setLines([{ key: nextKey, productId: "", size: "", qty: 1 }]);
        setNextKey(nextKey + 1);
      } else {
        setStatus("error");
        setMessage(
          data?.error ??
            "No se pudo enviar la solicitud. Inténtalo de nuevo o escríbenos por WhatsApp.",
        );
      }
    } catch {
      setStatus("error");
      setMessage(
        "No se pudo enviar la solicitud. Revisa tu conexión o escríbenos por WhatsApp.",
      );
    }
  }

  if (products.length === 0) {
    return (
      <p className="text-sm text-ink-soft">
        Ahora mismo no hay productos disponibles para pedir.
      </p>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="relative rounded-sm border border-line border-t-4 border-t-accent bg-paper p-6 shadow-sm sm:p-8"
    >
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px]"
      />
      <div className="space-y-4">
        <div>
          <label htmlFor="shop-name" className={label}>
            Nombre del socio
          </label>
          <input id="shop-name" name="name" required maxLength={100} className={input} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="shop-email" className={label}>
              Correo electrónico
            </label>
            <input id="shop-email" name="email" type="email" required maxLength={150} className={input} />
          </div>
          <div>
            <label htmlFor="shop-phone" className={label}>
              Teléfono
            </label>
            <input id="shop-phone" name="phone" type="tel" required maxLength={30} className={input} />
          </div>
        </div>

        <fieldset className="space-y-3">
          <legend className={label}>Productos</legend>
          {lines.map((l, i) => {
            const prod = byId(l.productId);
            return (
              <div
                key={l.key}
                className="grid grid-cols-2 items-end gap-3 rounded-sm border border-line bg-paper-raised p-3 sm:grid-cols-[1fr_6rem_5rem_auto]"
              >
                <div className="col-span-2 sm:col-span-1">
                  <label htmlFor={`prod-${l.key}`} className="sr-only">
                    Producto {i + 1}
                  </label>
                  <select
                    id={`prod-${l.key}`}
                    value={l.productId}
                    onChange={(e) =>
                      updateLine(l.key, { productId: e.target.value, size: "" })
                    }
                    className={input}
                  >
                    <option value="">Elige un producto…</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.supplier})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor={`size-${l.key}`} className="sr-only">
                    Talla
                  </label>
                  {prod && prod.sizes.length > 0 ? (
                    <select
                      id={`size-${l.key}`}
                      value={l.size}
                      onChange={(e) => updateLine(l.key, { size: e.target.value })}
                      className={input}
                    >
                      <option value="">Talla…</option>
                      {prod.sizes.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="block px-1 py-2 text-xs text-ink-faint">
                      {prod ? "Sin talla" : "—"}
                    </span>
                  )}
                </div>
                <div>
                  <label htmlFor={`qty-${l.key}`} className="sr-only">
                    Cantidad
                  </label>
                  <select
                    id={`qty-${l.key}`}
                    value={l.qty}
                    onChange={(e) => updateLine(l.key, { qty: Number(e.target.value) })}
                    className={input}
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>
                        {n} ud.
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setLines((ls) => (ls.length > 1 ? ls.filter((x) => x.key !== l.key) : ls))
                  }
                  disabled={lines.length === 1}
                  className="justify-self-end px-2 py-2 text-xs font-semibold uppercase tracking-wide text-ink-faint hover:text-accent disabled:opacity-40"
                  aria-label={`Quitar producto ${i + 1}`}
                >
                  Quitar
                </button>
              </div>
            );
          })}
          {lines.length < MAX_LINES && (
            <button
              type="button"
              onClick={() => {
                setLines((ls) => [...ls, { key: nextKey, productId: "", size: "", qty: 1 }]);
                setNextKey(nextKey + 1);
              }}
              className="text-sm font-semibold text-accent hover:text-accent-dark"
            >
              + Añadir otro producto
            </button>
          )}
        </fieldset>

        <div>
          <label htmlFor="shop-notes" className={label}>
            Notas (opcional)
          </label>
          <textarea
            id="shop-notes"
            name="notes"
            rows={3}
            maxLength={1000}
            placeholder="Mano dominante, medidas, modelo preferido…"
            className={input}
          />
        </div>

        <p className="rounded-sm bg-accent-soft px-3 py-2 text-xs text-ink-soft">
          Esto es una solicitud: el club agrupa los pedidos y te avisa del importe antes de
          pedirlo al proveedor.
        </p>

        <label className="flex items-start gap-2 text-xs text-ink-soft">
          <input type="checkbox" required className="mt-0.5 h-4 w-4 accent-[var(--accent)]" />
          <span>
            He leído y acepto la{" "}
            <Link href="/politica-de-privacidad" className="font-semibold text-accent">
              política de privacidad
            </Link>
          </span>
        </label>

        <button
          type="submit"
          disabled={status === "sending"}
          className="btn-blade w-full rounded-sm bg-accent px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-accent-dark disabled:opacity-60"
        >
          {status === "sending" ? "Enviando…" : "Enviar solicitud"}
        </button>

        <div aria-live="polite">
          {status === "ok" && (
            <p className="rounded-sm border border-good bg-steel-soft px-3 py-2 text-sm text-ink">
              {message}
            </p>
          )}
          {status === "error" && (
            <p role="alert" className="rounded-sm border border-accent bg-paper px-3 py-2 text-sm text-ink">
              {message}
            </p>
          )}
        </div>
      </div>
    </form>
  );
}
