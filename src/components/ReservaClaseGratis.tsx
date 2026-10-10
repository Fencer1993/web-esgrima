"use client";

import Link from "next/link";
import { useEffect, useId, useMemo, useRef, useState, type FormEvent } from "react";
import {
  buildIcs,
  buildSessions,
  formatDateLong,
  formatDateShort,
  googleCalendarUrl,
  type CalendarEvent,
  type ReservaConfig,
  type Session,
} from "@/lib/reservas";

const inputCls =
  "mt-1 w-full rounded-sm border border-line bg-paper px-3 py-2.5 text-base text-ink outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/25 sm:text-sm";
const labelCls = "text-xs font-medium uppercase tracking-wide text-ink-faint";
const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

type Done = { id: string; session: Session; name: string; event: CalendarEvent };

export function ReservaClaseGratis({
  config,
  place,
  mapsUrl,
  phone,
  whatsappUrl,
}: {
  config: ReservaConfig;
  place: string;
  mapsUrl: string;
  phone: string;
  whatsappUrl: string;
}) {
  const uid = useId();
  const [groupId, setGroupId] = useState<string>("");
  const [sessionKey, setSessionKey] = useState<string>("");
  const [booked, setBooked] = useState<Record<string, number> | null>(null);
  const [availability, setAvailability] = useState<"loading" | "ok" | "error">("loading");
  const [now, setNow] = useState<Date | null>(null);
  const [age, setAge] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [message, setMessage] = useState("");
  const [done, setDone] = useState<Done | null>(null);
  const doneRef = useRef<HTMLHeadingElement>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);

  const group = config.groups.find((g) => g.id === groupId) ?? null;

  // La fecha de hoy se lee en el navegador (la página es estática).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(new Date());
  }, []);

  async function loadAvailability() {
    setAvailability("loading");
    try {
      const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
      const res = await fetch(`${base}/reserva.php?disponibilidad=1`, { cache: "no-store" });
      const data = await res.json();
      if (data?.ok && data.booked && typeof data.booked === "object") {
        setBooked(data.booked as Record<string, number>);
        setAvailability("ok");
        return;
      }
      throw new Error("bad");
    } catch {
      setBooked(null);
      setAvailability("error");
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadAvailability();
  }, []);

  const sessions = useMemo<Session[]>(
    () => (group && now ? buildSessions(config, group, booked, now) : []),
    [config, group, booked, now],
  );
  const session = sessions.find((s) => s.key === sessionKey) ?? null;

  const ageNum = age.trim() === "" ? null : Number(age);
  const isMinor = ageNum !== null && ageNum < 18;

  useEffect(() => {
    if (done) doneRef.current?.focus();
  }, [done]);

  function pickGroup(id: string) {
    setGroupId(id);
    setSessionKey("");
    setStatus("idle");
    setMessage("");
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!session || !group || status === "sending") return;
    const fd = new FormData(e.currentTarget);
    const s = (k: string) => String(fd.get(k) ?? "").trim();

    const fail = (text: string) => {
      setStatus("error");
      setMessage(text);
      setTimeout(() => errorRef.current?.focus(), 0);
    };
    if (group.ageRequired && ageNum === null) return fail("Indica la edad de quien va a hacer la clase.");
    if (ageNum !== null) {
      if (!Number.isInteger(ageNum) || ageNum < 0 || ageNum > 110) return fail("Revisa la edad.");
      if (ageNum < group.minAgeYears || (group.maxAgeYears && ageNum > group.maxAgeYears)) {
        return fail(`Este grupo es: ${group.minAge.toLowerCase()}. Elige otro grupo o escríbenos.`);
      }
    }
    if (isMinor && s("guardian") === "") {
      return fail("Al ser menor de edad, indica el nombre del padre, madre o tutor.");
    }

    setStatus("sending");
    setMessage("");
    try {
      const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
      const res = await fetch(`${base}/reserva.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          group: group.id,
          date: session.date,
          name: s("name"),
          age: age.trim(),
          guardian: isMinor ? s("guardian") : "",
          email: s("email"),
          phone: s("phone"),
          notes: s("notes"),
          privacy: fd.get("privacy") === "on",
          website: s("website"),
        }),
      });
      const data = await res.json().catch(() => null);
      if (data?.ok) {
        const event: CalendarEvent = {
          id: String(data.id ?? "reserva"),
          date: session.date,
          start: group.start,
          end: group.end,
          title: "Clase gratis de esgrima · Club de Esgrima Torremolinos",
          location: place,
          description: `Grupo: ${group.name}. ${config.notes.join(" ")} Para cancelar: responde al correo de confirmación o escribe por WhatsApp al ${phone}. Referencia ${data.id}.`,
        };
        setDone({ id: String(data.id ?? ""), session, name: s("name"), event });
        setStatus("idle");
        void loadAvailability();
      } else {
        fail(
          data?.error ??
            "No se pudo enviar la reserva. Inténtalo de nuevo o escríbenos por WhatsApp.",
        );
        if (res.status === 409) void loadAvailability();
      }
    } catch {
      fail("No se pudo enviar la reserva. Revisa tu conexión o escríbenos por WhatsApp.");
    }
  }

  function downloadIcs() {
    if (!done) return;
    const blob = new Blob([buildIcs(done.event)], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "clase-gratis-esgrima-torremolinos.ics";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  // --- Confirmación ---------------------------------------------------------
  if (done) {
    const g = done.session.group;
    return (
      <div className="rounded-sm border border-accent bg-paper p-6 sm:p-8" role="status">
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-steel">Reserva recibida</p>
        <h3
          ref={doneRef}
          tabIndex={-1}
          className="mt-2 font-display text-2xl font-bold uppercase tracking-tight text-ink outline-none sm:text-3xl"
        >
          ¡Te esperamos, {done.name}!
        </h3>
        <dl className="mt-5 grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
          <div>
            <dt className={labelCls}>Cuándo</dt>
            <dd className="mt-0.5 text-ink first-letter:uppercase">
              {formatDateLong(done.session.date)}, de {g.start} a {g.end}
            </dd>
          </div>
          <div>
            <dt className={labelCls}>Grupo</dt>
            <dd className="mt-0.5 text-ink">{g.name}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className={labelCls}>Dónde</dt>
            <dd className="mt-0.5 text-ink">
              {place}{" "}
              <a
                href={mapsUrl}
                className={`font-semibold text-accent-dark underline underline-offset-2 ${focusRing}`}
              >
                Ver mapa
              </a>
            </dd>
          </div>
          <div>
            <dt className={labelCls}>Referencia</dt>
            <dd className="tabular mt-0.5 font-mono text-ink">{done.id}</dd>
          </div>
        </dl>
        <p className="mt-5 text-sm leading-relaxed text-ink-soft">
          Te hemos enviado un correo con estos datos (mira también en «no deseados»). El día antes
          te mandaremos un recordatorio. El club puede ponerse en contacto contigo para confirmar
          la plaza.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={downloadIcs}
            className={`rounded-sm bg-accent px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-accent-dark ${focusRing}`}
          >
            Añadir a mi calendario (.ics)
          </button>
          <a
            href={googleCalendarUrl(done.event)}
            target="_blank"
            rel="noopener noreferrer"
            className={`rounded-sm border border-line bg-paper px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-ink transition-colors hover:border-accent ${focusRing}`}
          >
            Google Calendar
          </a>
        </div>
        <p className="mt-5 text-sm text-ink-soft">
          Si no puedes venir, avísanos para liberar la plaza: responde al correo de confirmación o
          escríbenos por{" "}
          <a href={whatsappUrl} className={`font-semibold text-accent-dark underline ${focusRing}`}>
            WhatsApp
          </a>{" "}
          ({phone}).
        </p>
        <button
          type="button"
          onClick={() => {
            setDone(null);
            setSessionKey("");
          }}
          className={`mt-5 text-sm font-semibold text-accent-dark underline underline-offset-2 ${focusRing}`}
        >
          Reservar otra clase
        </button>
      </div>
    );
  }

  // --- Reserva --------------------------------------------------------------
  return (
    <div className="space-y-8">
      <div aria-live="polite" className="text-sm text-ink-soft">
        {availability === "loading" && <span>Consultando plazas…</span>}
        {availability === "error" && (
          <span className="block rounded-sm border border-line bg-paper px-4 py-3">
            Ahora mismo no podemos consultar las plazas libres. Puedes pedir tu clase igualmente y
            el club te confirmará la plaza por correo o teléfono.
          </span>
        )}
      </div>

      <fieldset>
        <legend className="font-display text-lg font-semibold uppercase tracking-tight text-ink">
          1. Elige tu grupo
        </legend>
        <div className="mt-3 grid gap-3 md:grid-cols-3" role="radiogroup" aria-label="Grupo">
          {config.groups.map((g) => {
            const on = g.id === groupId;
            return (
              <button
                key={g.id}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => pickGroup(g.id)}
                className={`rounded-sm border p-4 text-left transition-colors ${focusRing} ${
                  on ? "border-accent bg-accent-soft" : "border-line bg-paper hover:border-accent"
                }`}
              >
                <span className="block font-display text-lg font-semibold uppercase tracking-tight text-ink">
                  {g.name}
                </span>
                <span className="mt-1 block text-sm text-ink-soft">
                  {dayNames(g.weekdays)} · {g.start} – {g.end}
                </span>
                <span className="mt-1 block text-xs text-ink-faint">{g.minAge}</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      {group && (
        <fieldset>
          <legend className="font-display text-lg font-semibold uppercase tracking-tight text-ink">
            2. Elige el día
          </legend>
          <p className="mt-1 text-sm text-ink-soft">
            Próximas {config.weeksAhead} semanas. Hay {group.capacity} plazas de clase gratis por
            sesión.
          </p>
          {!now ? null : sessions.length === 0 ? (
            <p className="mt-3 text-sm text-ink-soft">
              No quedan clases que reservar en este grupo. Escríbenos por{" "}
              <a href={whatsappUrl} className="font-semibold text-accent-dark underline">
                WhatsApp
              </a>
              .
            </p>
          ) : (
            <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {sessions.map((s) => {
                const disabled = s.state === "full" || s.state === "blocked";
                const on = s.key === sessionKey;
                const d = formatDateShort(s.date);
                const sub =
                  s.state === "blocked"
                    ? `Sin clase${s.reason ? `: ${s.reason}` : ""}`
                    : s.state === "full"
                      ? "Completa"
                      : s.left === null
                        ? "Plazas por confirmar"
                        : s.left === 1
                          ? "Queda 1 plaza"
                          : `Quedan ${s.left} plazas`;
                return (
                  <li key={s.key}>
                    <button
                      type="button"
                      disabled={disabled}
                      aria-pressed={on}
                      aria-label={`${formatDateLong(s.date)}, de ${s.group.start} a ${s.group.end}. ${sub}`}
                      onClick={() => {
                        setSessionKey(s.key);
                        setStatus("idle");
                        setMessage("");
                      }}
                      className={`flex w-full flex-col rounded-sm border px-3 py-2.5 text-left transition-colors ${focusRing} ${
                        on
                          ? "border-accent bg-accent text-white"
                          : disabled
                            ? "cursor-not-allowed border-line bg-paper-raised text-ink-faint"
                            : "border-line bg-paper text-ink hover:border-accent"
                      }`}
                    >
                      <span className="text-sm font-semibold capitalize">
                        {d.weekday} {d.day} {d.month}
                      </span>
                      <span
                        className={`text-xs ${on ? "text-white/90" : disabled ? "" : "text-ink-soft"}`}
                      >
                        {sub}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </fieldset>
      )}

      {group && session && (
        <form onSubmit={onSubmit} className="relative rounded-sm border border-line bg-paper p-5 sm:p-6">
          <h3 className="font-display text-lg font-semibold uppercase tracking-tight text-ink">
            3. Tus datos
          </h3>
          <p className="mt-1 text-sm text-ink-soft first-letter:uppercase">
            {formatDateLong(session.date)}, de {group.start} a {group.end} · {group.name}
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor={`${uid}-name`} className={labelCls}>
                Nombre de quien hace la clase
              </label>
              <input id={`${uid}-name`} name="name" required maxLength={100} autoComplete="off" className={inputCls} />
            </div>
            <div>
              <label htmlFor={`${uid}-age`} className={labelCls}>
                Edad{group.ageRequired ? "" : " (opcional)"}
              </label>
              <input
                id={`${uid}-age`}
                name="age"
                type="number"
                inputMode="numeric"
                min={0}
                max={110}
                required={group.ageRequired}
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className={inputCls}
              />
            </div>
            {isMinor && (
              <div className="sm:col-span-2">
                <label htmlFor={`${uid}-guardian`} className={labelCls}>
                  Nombre del padre, madre o tutor
                </label>
                <input
                  id={`${uid}-guardian`}
                  name="guardian"
                  required
                  maxLength={100}
                  autoComplete="name"
                  className={inputCls}
                />
              </div>
            )}
            <div>
              <label htmlFor={`${uid}-email`} className={labelCls}>
                Correo electrónico
              </label>
              <input id={`${uid}-email`} name="email" type="email" required maxLength={150} autoComplete="email" className={inputCls} />
            </div>
            <div>
              <label htmlFor={`${uid}-phone`} className={labelCls}>
                Teléfono
              </label>
              <input id={`${uid}-phone`} name="phone" type="tel" required maxLength={30} autoComplete="tel" className={inputCls} />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor={`${uid}-notes`} className={labelCls}>
                Comentarios (opcional)
              </label>
              <textarea
                id={`${uid}-notes`}
                name="notes"
                rows={3}
                maxLength={1000}
                placeholder="Alguna lesión, experiencia previa, si vienes acompañado…"
                className={inputCls}
              />
            </div>
          </div>

          {/* Anti-spam: los bots lo rellenan, las personas no lo ven. */}
          <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
            <label>
              No rellenar
              <input name="website" tabIndex={-1} autoComplete="off" />
            </label>
          </div>

          <label className="mt-5 flex items-start gap-3 text-sm text-ink-soft">
            <input type="checkbox" name="privacy" required className="mt-1 h-4 w-4 accent-[var(--accent)]" />
            <span>
              He leído y acepto la{" "}
              <Link href="/politica-de-privacidad" target="_blank" className="font-semibold text-accent-dark underline">
                política de privacidad
              </Link>
              . Usaremos los datos solo para gestionar esta clase.
            </span>
          </label>

          {message && (
            <p
              ref={errorRef}
              tabIndex={-1}
              role="alert"
              className="mt-4 rounded-sm border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800 outline-none"
            >
              {message}
            </p>
          )}

          <div className="mt-5 flex flex-wrap items-center gap-4">
            <button
              type="submit"
              disabled={status === "sending"}
              className={`rounded-sm bg-accent px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-accent-dark disabled:opacity-60 ${focusRing}`}
            >
              {status === "sending" ? "Enviando…" : "Reservar mi clase gratis"}
            </button>
            <p className="text-xs text-ink-faint">Sin compromiso. Puedes cancelar cuando quieras.</p>
          </div>
        </form>
      )}

      <div className="rounded-sm border border-line bg-paper p-5">
        <p className="font-display text-base font-semibold uppercase tracking-tight text-ink">
          Qué traer
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink-soft">
          {config.notes.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-ink-soft">
          Lugar: {place}. ¿Prefieres hablar con nosotros? Escríbenos por{" "}
          <a href={whatsappUrl} className="font-semibold text-accent-dark underline">
            WhatsApp
          </a>
          .
        </p>
      </div>
    </div>
  );
}

const DAY_NAMES = ["", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"];

function dayNames(days: number[]): string {
  const names = [...days].sort((a, b) => a - b).map((d) => DAY_NAMES[d]);
  if (names.length <= 1) return names.join("");
  return `${names.slice(0, -1).join(", ")} y ${names[names.length - 1]}`;
}
