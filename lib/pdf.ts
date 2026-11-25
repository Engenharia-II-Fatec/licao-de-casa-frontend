function escaparHtml(texto: string): string {
  return (texto ?? "").replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

/**
 * Abre uma tabela numa janela pronta para impressão; no diálogo do navegador,
 * escolha "Salvar como PDF". Devolve `false` se o navegador bloqueou o pop-up.
 * Ex.: imprimirTabelaPdf("Alunos", ["Nome"], [["Ana"]]).
 */
export function imprimirTabelaPdf(titulo: string, cabecalho: string[], linhas: string[][]): boolean {
  const janela = window.open("", "_blank");
  if (!janela) return false;
  const th = cabecalho.map((c) => `<th>${escaparHtml(c)}</th>`).join("");
  const tr = linhas
    .map((l) => `<tr>${l.map((c) => `<td>${escaparHtml(c || "—")}</td>`).join("")}</tr>`)
    .join("");
  const total = `${linhas.length} ${linhas.length === 1 ? "registro" : "registros"}`;
  janela.document.write(`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
    <title>${escaparHtml(titulo)} — Espaço Lição de Casa</title>
    <style>
      body{font-family:"Plus Jakarta Sans",Arial,sans-serif;color:#1b1c1c;margin:32px}
      h1{font-size:20px;margin:0}p{color:#584237;font-size:12px;margin:4px 0 20px}
      table{width:100%;border-collapse:collapse;font-size:12px}
      th{text-align:left;text-transform:uppercase;font-size:10px;letter-spacing:.08em;color:#584237;background:#f6f3f2;padding:8px}
      td{padding:8px;vertical-align:top}tr:nth-child(even) td{background:#fbf9f8}
    </style></head><body>
    <h1>${escaparHtml(titulo)}</h1>
    <p>Espaço Lição de Casa · ${total} · gerado em ${new Date().toLocaleString("pt-BR")}</p>
    <table><thead><tr>${th}</tr></thead><tbody>${tr}</tbody></table></body></html>`);
  janela.document.close();
  janela.focus();
  janela.print();
  return true;
}
