import { howToMeasure, sizeBrands, sizeGuideIntro } from "@/content/sizes";

// Guía de tallas de la tienda: cómo medirse y tablas por marca en texto
// (no imágenes), plegables con <details> para que sean accesibles por teclado
// y lector de pantalla. Las fichas de producto enlazan a #tallas-<marca>.
export function SizeGuide() {
  return (
    <div id="guia-de-tallas" className="scroll-mt-24">
      <div className="max-w-2xl">
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-accent">
          Antes de pedir
        </p>
        <h2 className="mt-2 text-3xl font-bold uppercase tracking-tight text-ink sm:text-4xl">
          Guía de tallas
        </h2>
        <p className="mt-3 text-base text-ink-soft">{sizeGuideIntro}</p>
      </div>

      <h3 className="mt-8 text-lg font-bold uppercase tracking-tight text-ink">
        Cómo tomarte las medidas
      </h3>
      <dl className="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
        {howToMeasure.map((m) => (
          <div key={m.part} className="rounded-sm border border-line bg-paper-raised p-4">
            <dt className="text-sm font-bold text-ink">{m.part}</dt>
            <dd className="mt-1 text-sm text-ink-soft">{m.how}</dd>
          </div>
        ))}
      </dl>

      <h3 className="mt-10 text-lg font-bold uppercase tracking-tight text-ink">
        Tablas por marca
      </h3>
      <div className="mt-3 divide-y divide-line rounded-sm border border-line">
        {sizeBrands.map((b) => (
          <details key={b.id} id={`tallas-${b.id}`} className="group scroll-mt-24">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-4 hover:bg-accent-soft focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-accent [&::-webkit-details-marker]:hidden">
              <span>
                <span className="block text-base font-bold text-ink">{b.name}</span>
                <span className="block text-xs text-ink-faint">Productos de {b.suppliers}</span>
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
                {b.note}{" "}
                <a
                  href={b.source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-touche font-semibold text-accent-dark"
                >
                  {b.tables.length ? "Tabla original del proveedor" : "Abrir la tabla de tallas (PDF)"}
                  <span className="sr-only"> (se abre en otra pestaña)</span> →
                </a>
              </p>
              {b.tables.map((t) => (
                <div key={t.title} className="overflow-x-auto">
                  <table className="w-full min-w-[20rem] border-collapse text-left text-sm">
                    <caption className="pb-2 text-left text-sm font-bold text-ink">
                      {t.title}
                    </caption>
                    <thead>
                      <tr className="border-b-2 border-line">
                        {t.headers.map((h) => (
                          <th key={h} scope="col" className="whitespace-nowrap px-2 py-2 font-semibold text-ink">
                            {h}
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
                                {c}
                              </th>
                            ) : (
                              <td key={j} className="whitespace-nowrap px-2 py-1.5 text-ink-soft">
                                {c}
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
