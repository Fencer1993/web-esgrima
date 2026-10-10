import type { ReactNode } from "react";
import Link from "next/link";

// Piezas de la página de contacto compartidas por /contacto y /en/contact.

export function MethodCard({
  icon,
  label,
  value,
  href,
  breakAll,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  href: string;
  breakAll?: boolean;
}) {
  return (
    <li className="reveal">
      <a
        href={href}
        className="group flex h-full items-center gap-4 rounded-sm border border-line bg-paper-raised p-5 transition-colors hover:border-accent"
      >
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sm bg-accent-soft text-accent-dark transition-colors group-hover:bg-accent group-hover:text-white">
          {icon}
        </span>
        <span className="min-w-0">
          <span className="block font-mono text-xs uppercase tracking-wide text-ink-faint">
            {label}
          </span>
          <span
            className={`mt-1 block text-sm font-semibold text-ink ${breakAll ? "break-all" : ""}`}
          >
            {value}
          </span>
        </span>
      </a>
    </li>
  );
}

export const iconProps = {
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  focusable: false,
};

export function IconWhatsapp() {
  return (
    <svg {...iconProps}>
      <path d="M3 21l1.6-4.8A8.5 8.5 0 1 1 8 19.5L3 21z" />
      <path d="M9 8.5c0 3.5 3 6.5 6.5 6.5l1-1.5-2-1-1 .8c-1-.4-2-1.4-2.4-2.4l.8-1-1-2L9 8.5z" />
    </svg>
  );
}

export function IconPhone() {
  return (
    <svg {...iconProps}>
      <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2z" />
    </svg>
  );
}

export function IconMail() {
  return (
    <svg {...iconProps}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </svg>
  );
}

export function IconPin() {
  return (
    <svg {...iconProps}>
      <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </svg>
  );
}

const formLabels = {
  es: {
    action: "../contact.php",
    title: "Escríbenos para más información",
    name: "Tu nombre",
    email: "Tu correo electrónico",
    phone: "Tu teléfono (opcional)",
    subject: "Asunto",
    message: "Tu mensaje (opcional)",
    consent: "He leído y acepto la",
    privacy: "política de privacidad",
    submit: "Enviar mensaje",
  },
  en: {
    action: "../../contact.php",
    title: "Write to us for more information",
    name: "Your name",
    email: "Your email address",
    phone: "Your phone number (optional)",
    subject: "Subject",
    message: "Your message (optional)",
    consent: "I have read and accept the",
    privacy: "privacy policy (in Spanish)",
    submit: "Send message",
  },
};

export function ContactForm({ lang = "es" }: { lang?: "es" | "en" }) {
  const t = formLabels[lang];
  return (
    <form
      action={t.action}
      method="post"
      className="relative rounded-sm border border-line border-t-4 border-t-accent bg-paper-raised p-6 shadow-sm sm:p-8"
    >
      <h2 className="text-2xl font-bold uppercase tracking-tight text-ink">
        {t.title}
      </h2>
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px]"
      />
      {lang === "en" && <input type="hidden" name="lang" value="en" />}
      <div className="mt-5 space-y-4">
        <Field label={t.name} name="name" type="text" required />
        <Field label={t.email} name="email" type="email" required />
        <Field label={t.phone} name="phone" type="tel" />
        <Field label={t.subject} name="subject" type="text" />
        <div>
          <label htmlFor="message" className="text-xs font-medium uppercase tracking-wide text-ink-faint">
            {t.message}
          </label>
          <textarea
            id="message"
            name="message"
            rows={4}
            className="mt-1 w-full rounded-sm border border-line bg-paper px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/25"
          />
        </div>
        <label className="flex items-start gap-2 text-xs text-ink-soft">
          <input type="checkbox" required className="mt-0.5 h-4 w-4 accent-[var(--accent)]" />
          {t.consent}{" "}
          <Link
            href="/politica-de-privacidad"
            hrefLang={lang === "en" ? "es" : undefined}
            className="font-semibold text-accent"
          >
            {t.privacy}
          </Link>
        </label>
        <button
          type="submit"
          className="btn-blade w-full rounded-sm bg-accent px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-accent-dark"
        >
          {t.submit}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  type,
  required,
}: {
  label: string;
  name: string;
  type: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="text-xs font-medium uppercase tracking-wide text-ink-faint">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        className="mt-1 w-full rounded-sm border border-line bg-paper px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/25"
      />
    </div>
  );
}
