import { howToMeasure, sizeBrands, sizeGuideIntro } from "@/content/sizes";
import tiendaEn from "@/content/data/en/tienda.json";
import type { Lang } from "@/content/i18n";

const en = tiendaEn.sizeGuide;
const pairs = (list: { es: string; en: string }[]) =>
  new Map(list.filter((x) => x.es && x.en).map((x) => [x.es, x.en]));
const titlesEn = pairs(en.tableTitles);
const headersEn = pairs(en.headers);
const cellsEn = pairs(en.cells);
const brandsEn = new Map(en.brands.map((b) => [b.id, b]));
// Traducción de un texto de la tabla; si falta, se muestra el español.
const tr = (map: Map<string, string>, es: string, lang: Lang) =>
  lang === "en" ? (map.get(es) ?? es) : es;

// Guía de tallas de la tienda: cómo medirse y tablas por marca en texto
// (no imágenes), plegables con <details> para que sean accesibles por teclado
// y lector de pantalla. Las fichas de producto enlazan a #tallas-<marca>.
export function SizeGuide({ lang = "es" }: { lang?: Lang }) {
  const isEn = lang === "en";
  // Las medidas se alinean por posición con las españolas; si el inglés se
  // queda corto, se muestra el español de esa posición.
  const measure = howToMeasure.map((m, i) => ({
    part: isEn ? (en.howToMeasure[i]?.part ?? m.part) : m.part,
    how: isEn ? (en.howToMeasure[i]?.how ?? m.how) : m.how,
    es: isEn && !en.howToMeasure[i],
  }));
  return (
    <div id="guia-de-tallas" className="scroll-mt-24">
      <div className="max-w-2xl">
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-accent">
          {isEn ? en.eyebrow : "Antes de pedir"}
        </p>
        <h2 className="mt-2 text-3xl font-bold uppercase tracking-tight text-ink sm:text-4xl">
          {isEn ? en.title : "Guía de tallas"}
        </h2>
        <p className="mt-3 text-base text-ink-soft">{isEn ? en.intro : sizeGuideIntro}</p>
      </div>

      <h3 className="mt-8 text-lg font-bold uppercase tracking-tight text-ink">
        {isEn ? en.measureTitle : "Cómo tomarte las medidas"}
      </h3>
      <dl className="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
        {measure.map((m) => (
          <div
            key={m.part}
            {...(m.es ? { lang: "es" } : {})}
            className="rounded-sm border border-line bg-paper-raised p-4"
          >
            <dt className="text-sm font-bold text-ink">{m.part}</dt>
            <dd className="mt-1 text-sm text-ink-soft">{m.how}</dd>
          </div>
        ))}
      </dl>

      <h3 className="mt-10 text-lg font-bold uppercase tracking-tight text-ink">
        {isEn ? en.tablesTitle : "Tablas por marca"}
      </h3>
      <div className="mt-3 divide-y divide-line rounded-sm border border-line">
        {sizeBrands.map((b) => (
          <details key={b.id} id={`tallas-${b.id}`} className="group scroll-mt-24">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-4 hover:bg-accent-soft focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-accent [&::-webkit-details-marker]:hidden">
              <span>
                <span className="block text-base font-bold text-ink">
                  {isEn ? brandsEn.get(b.id)?.name || b.name : b.name}
                </span>
                <span className="block text-xs text-ink-faint">
                  {isEn ? en.productsFrom : "Productos de"} {b.suppliers}
                </span>
              </span>
              <span
                aria-hidden
                className="text-xl text-accent-dark transition-transform group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <div className="space-y-6 px-4 pb-6">
              <p className="max-w-2xl text-sm text-ink-soft">
                {isEn ? brandsEn.get(b.id)?.note || b.note : b.note}{" "}
                <a
                  href={b.source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-touche font-semibold text-accent-dark"
                >
                  {isEn
                    ? b.tables.length
                      ? en.sourceLink
                      : en.sourceLinkPdf
                    : b.tables.length
                      ? "Tabla original del proveedor"
                      : "Abrir la tabla de tallas (PDF)"}
                  <span className="sr-only">{isEn ? en.newTab : " (se abre en otra pestaña)"}</span> →
                </a>
              </p>
              {b.tables.map((t) => (
                <div key={t.title} className="overflow-x-auto">
                  <table className="w-full min-w-[20rem] border-collapse text-left text-sm">
                    <caption className="pb-2 text-left text-sm font-bold text-ink">
                      {tr(titlesEn, t.title, lang)}
                    </caption>
                    <thead>
                      <tr className="border-b-2 border-line">
                        {t.headers.map((h) => (
                          <th key={h} scope="col" className="whitespace-nowrap px-2 py-2 font-semibold text-ink">
                            {tr(headersEn, h, lang)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="tabular">
                      {t.rows.map((r, i) => (
                        <tr key={i} className="border-b border-line odd:bg-paper-raised">
                          {r.map((c, j) =>
                            j === 0 ? (
                              <th key={j} scope="row" className="whitespace-nowrap px-2 py-1.5 font-semibold text-ink">
                                {tr(cellsEn, c, lang)}
                              </th>
                            ) : (
                              <td key={j} className="whitespace-nowrap px-2 py-1.5 text-ink-soft">
                                {tr(cellsEn, c, lang)}
                              </td>
                            ),
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
