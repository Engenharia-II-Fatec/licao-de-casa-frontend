"use client";

import { useEffect, useId, useRef, useState } from "react";
import { baixarCsv } from "@/lib/csv";
import { imprimirTabelaPdf } from "@/lib/pdf";
import { useToast } from "./toast";

/** Dados já filtrados que a listagem quer exportar. */
export interface DadosExportacao {
  /** Nome do arquivo da planilha, sem data nem extensão (ex.: "alunos"). */
  arquivo: string;
  /** Título do PDF (ex.: "Base de Alunos"). */
  titulo: string;
  cabecalho: string[];
  linhas: string[][];
}

/**
 * Botão "Exportar" das listagens, com as opções planilha (CSV que abre no Excel)
 * e PDF. Use o mesmo componente em todas as telas para manter o padrão.
 */
export function ExportarMenu({
  disabled = false,
  dados,
}: {
  disabled?: boolean;
  /** Chamado só no clique, para pegar a lista filtrada do momento. */
  dados: () => DadosExportacao;
}) {
  const toast = useToast();
  const [aberto, setAberto] = useState(false);
  const raiz = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!aberto) return;
    const fora = (e: MouseEvent) => {
      if (!raiz.current?.contains(e.target as Node)) setAberto(false);
    };
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAberto(false);
    };
    document.addEventListener("mousedown", fora);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", fora);
      document.removeEventListener("keydown", esc);
    };
  }, [aberto]);

  function exportar(formato: "planilha" | "pdf") {
    setAberto(false);
    const { arquivo, titulo, cabecalho, linhas } = dados();
    if (formato === "planilha") {
      baixarCsv(arquivo, cabecalho, linhas);
    } else if (!imprimirTabelaPdf(titulo, cabecalho, linhas)) {
      toast.error("Permita pop-ups para exportar o PDF.");
    }
  }

  const opcao =
    "flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-semibold text-on-surface transition hover:bg-surface-container-low";

  return (
    <div ref={raiz} className="relative">
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        disabled={disabled}
        aria-haspopup="menu"
        aria-expanded={aberto}
        aria-controls={menuId}
        className="flex items-center gap-2 rounded-full bg-surface-container-lowest px-5 py-3.5 text-sm font-bold text-on-surface shadow-ambient transition hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-50 sm:py-4"
      >
        <span className="material-symbols-outlined text-xl">download</span>
        Exportar
        <span className="material-symbols-outlined -mr-1 text-lg">
          {aberto ? "expand_less" : "expand_more"}
        </span>
      </button>
      {aberto && (
        <div
          id={menuId}
          role="menu"
          className="absolute right-0 top-full z-30 mt-2 w-60 overflow-hidden rounded-2xl bg-surface-container-lowest py-1 shadow-ambient"
        >
          <button type="button" role="menuitem" onClick={() => exportar("planilha")} className={opcao}>
            <span className="material-symbols-outlined text-xl text-tertiary">table_view</span>
            <span>
              Planilha
              <span className="block text-xs font-medium text-on-surface-variant">
                Excel, Google Planilhas (.csv)
              </span>
            </span>
          </button>
          <button type="button" role="menuitem" onClick={() => exportar("pdf")} className={opcao}>
            <span className="material-symbols-outlined text-xl text-error">picture_as_pdf</span>
            <span>
              PDF
              <span className="block text-xs font-medium text-on-surface-variant">
                Para imprimir ou enviar
              </span>
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
