/**
 * Gera um CSV separado por ";" (abre direto no Excel em português, com acentos)
 * e baixa no navegador. Ex.: baixarCsv("alunos", ["Nome"], [["Ana"]]).
 */
export function baixarCsv(nomeBase: string, cabecalho: string[], linhas: string[][]): void {
  const celula = (v: string) => `"${(v ?? "").replace(/"/g, '""')}"`;
  const conteudo =
    "﻿" + [cabecalho, ...linhas].map((linha) => linha.map(celula).join(";")).join("\r\n");
  const url = URL.createObjectURL(new Blob([conteudo], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `${nomeBase}-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
