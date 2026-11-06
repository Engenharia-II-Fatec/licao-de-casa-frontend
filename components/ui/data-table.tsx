import type { ReactNode } from "react";

export interface Column<T> {
  key: string;
  header: string;
  cell: (linha: T) => ReactNode;
  align?: "left" | "right";
  className?: string;
}

/**
 * Tabela genérica no padrão do design system: sem bordas, linhas alternadas,
 * contêiner aninhado (surface-container-highest > lowest).
 */
export function DataTable<T>({
  columns,
  rows,
  getRowKey,
  caption,
}: {
  columns: Column<T>[];
  rows: T[];
  getRowKey: (linha: T) => string;
  caption: string;
}) {
  return (
    <div className="rounded-[3rem] bg-surface-container-highest p-1.5 md:p-2">
      <div className="overflow-hidden rounded-[2rem] bg-surface-container-lowest shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[40rem] border-collapse text-left">
            <caption className="sr-only">{caption}</caption>
            <thead>
              <tr className="bg-surface">
                {columns.map((c) => (
                  <th
                    key={c.key}
                    scope="col"
                    className={`px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface ${
                      c.align === "right" ? "text-right" : ""
                    }`}
                  >
                    {c.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-sm">
              {rows.map((linha, i) => (
                <tr
                  key={getRowKey(linha)}
                  className={`transition-colors hover:bg-surface-container-low ${
                    i % 2 === 1 ? "bg-surface" : "bg-surface-container-lowest"
                  }`}
                >
                  {columns.map((c) => (
                    <td
                      key={c.key}
                      className={`px-6 py-4 text-on-surface-variant ${
                        c.align === "right" ? "text-right" : ""
                      } ${c.className ?? ""}`}
                    >
                      {c.cell(linha)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
