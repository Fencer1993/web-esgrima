import { site, navigation } from "@/content/site";
import { schedule, plans, bonos, federationFees } from "@/content/pricing";
import { coaches } from "@/content/programs";
import { faq } from "@/content/faq";

// Resumen en texto plano/Markdown para asistentes de IA y rastreadores.
// Se genera en el build a partir de los mismos datos que pintan las
// páginas: no es una segunda versión del contenido, es otro formato del
// mismo, así que nunca puede contradecir a la web.
const url = (path: string) => `${site.url}${path === "/" ? "/" : `${path}/`}`;

function summary() {
  return [
    `# ${site.name}`,
    "",
    `> ${site.description}`,
    "",
    `- Dirección: ${site.address.venue}, ${site.address.line}, ${site.address.postalCode} ${site.address.city} (${site.address.region})`,
    `- Teléfono / WhatsApp: ${site.contact.phone}`,
    `- Email: ${site.contact.email}`,
    `- Instagram: ${site.social.instagram}`,
    `- Web: ${site.url}`,
    "",
    "## Páginas",
    "",
    ...navigation.map((n) => `- [${n.label}](${url(n.href)})`),
  ];
}

export function buildLlmsTxt() {
  return [
    ...summary(),
    "",
    "## Más detalle",
    "",
    `- [Versión ampliada con horarios, precios y preguntas frecuentes](${site.url}/llms-full.txt)`,
    "",
  ].join("\n");
}

export function buildLlmsFullTxt() {
  return [
    ...summary(),
    "",
    "## Horarios",
    "",
    ...schedule.map((s) => `- ${s.group}: ${s.days}, ${s.hours}`),
    "",
    "## Precios",
    "",
    ...plans.map((p) => `- ${p.name}: ${p.price} ${p.period}. ${p.features.join("; ")}.`),
    ...bonos.map((b) => `- ${b.name}: ${b.price} (${b.childPrice}). ${b.note}`),
    "",
    "## Licencias federativas (Federación Andaluza de Esgrima)",
    "",
    ...federationFees.map((f) => `- ${f.label}: ${f.price}`),
    "",
    "## Entrenadores",
    "",
    ...coaches.map((c) => `- ${c.name} — ${c.role}. ${c.bio}`),
    "",
    "## Preguntas frecuentes",
    "",
    ...faq.flatMap((f) => [`### ${f.question}`, "", f.answer, ""]),
  ].join("\n");
}
