"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ExportarMenu } from "@/components/ui/exportar-menu";
import { Skeleton } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";
import { useListaProfessores } from "../hooks";
import { professoresService } from "../services";
import type { FiltroSituacao, Professor, SituacaoProfessor } from "../types";
import { dadosExportacao, filtrarProfessores, valorHora } from "../utils";
import { AvatarProfessor } from "./avatar-professor";

const POR_PAGINA = 10;
const SITUACOES: FiltroSituacao[] = ["Todos", "Disponível", "Em aula", "Inativo"];

const COR_SITUACAO: Record<SituacaoProfessor, string> = {
  Disponível: "text-tertiary",
  "Em aula": "text-secondary",
  Inativo: "text-on-surface-variant/70",
};

function gerarBotoesPagina(atual: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const paginas = [...new Set([1, total, atual - 1, atual, atual + 1])]
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b);
  const resultado: (number | "...")[] = [];
  paginas.forEach((p, i) => {
    if (i > 0 && p - paginas[i - 1] > 1) resultado.push("...");
    resultado.push(p);
  });
  return resultado;
}


/** Tela "Gestão de Professores" — listagem (Figura 12). */
export function ProfessoresListagem() {
  const toast = useToast();
  const { professores, carregando, erro, recarregar } = useListaProfessores();
  const [busca, setBusca] = useState("");
  const [situacao, setSituacao] = useState<FiltroSituacao>("Todos");
  // Nenhum professor é excluído: a lixeira virou Inativar/Reativar.
  const [paraStatus, setParaStatus] = useState<Professor | null>(null);
  const [salvandoStatus, setSalvandoStatus] = useState(false);

  const filtrados = useMemo(
    () => filtrarProfessores(professores, { busca, situacao }),
    [professores, busca, situacao],
  );

  // Volta para a página 1 sempre que a busca ou o filtro mudam.
  const chave = `${busca}|${situacao}`;
  const [paginacao, setPaginacao] = useState({ chave, pagina: 1 });
  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  const pagina = Math.min(paginacao.chave === chave ? paginacao.pagina : 1, totalPaginas);
  const irPara = (p: number) => setPaginacao({ chave, pagina: Math.min(Math.max(1, p), totalPaginas) });
  const inicio = (pagina - 1) * POR_PAGINA;
  const daPagina = filtrados.slice(inicio, inicio + POR_PAGINA);

  async function confirmarStatus() {
    if (!paraStatus) return;
    const ativar = !paraStatus.ativo;
    setSalvandoStatus(true);
    try {
      await professoresService.alterarStatus(paraStatus.id, ativar);
      toast.success(`Professor ${paraStatus.nome} ${ativar ? "reativado" : "inativado"}.`);
      recarregar();
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : `Não foi possível ${ativar ? "reativar" : "inativar"} o professor.`,
      );
    } finally {
      setParaStatus(null);
      setSalvandoStatus(false);
    }
  }

  return (
    <div className="flex w-full flex-col gap-6 md:gap-8">
      {/* Cabeçalho */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center md:gap-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-on-surface sm:text-3xl">Gestão de Professores</h1>
          <p className="mt-1 text-sm text-on-surface-variant sm:text-base">
            Administre o corpo docente e suas especialidades.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <ExportarMenu
            disabled={carregando || filtrados.length === 0}
            dados={() => dadosExportacao(filtrados)}
          />
          <Link
            href="/professores/novo"
            className="flex items-center gap-2.5 rounded-full bg-linear-to-br from-primary to-primary-container px-6 py-3.5 font-bold text-white shadow-cta transition-all hover:-translate-y-0.5 hover:shadow-cta-hover active:scale-95 sm:px-8 sm:py-4"
          >
            <span className="material-symbols-outlined text-xl">person_add</span>
            Novo Professor
          </Link>
        </div>
      </div>

      {/* Busca e filtros */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-12">
        <div className="group relative sm:col-span-2 lg:col-span-8">
          <span className="material-symbols-outlined pointer-events-none absolute inset-y-0 left-4 my-auto h-fit text-2xl text-on-surface-variant/50 group-focus-within:text-primary">
            search
          </span>
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Pesquisar por nome ou disciplina..."
            aria-label="Pesquisar por nome, disciplina, e-mail, CPF ou telefone"
            className="w-full rounded-2xl bg-surface-container-low py-3.5 pl-12 pr-10 text-sm font-medium text-on-surface outline-none transition placeholder:text-on-surface-variant/50 focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/30 sm:py-4 sm:text-base"
          />
          {busca && (
            <button
              type="button"
              onClick={() => setBusca("")}
              aria-label="Limpar busca"
              className="absolute inset-y-0 right-0 flex items-center pr-4 text-on-surface-variant/60 hover:text-on-surface"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          )}
        </div>
        <div className="relative sm:col-span-2 lg:col-span-4">
          <select
            value={situacao}
            onChange={(e) => setSituacao(e.target.value as FiltroSituacao)}
            aria-label="Situação"
            className={`w-full appearance-none rounded-2xl bg-surface-container-low py-3.5 pl-4 pr-10 text-sm font-semibold text-on-surface-variant outline-none transition focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/30 sm:py-4 ${
              situacao !== "Todos" ? "ring-2 ring-primary-container" : ""
            }`}
          >
            {SITUACOES.map((s) => (
              <option key={s} value={s}>
                {s === "Todos" ? "Situação" : s}
              </option>
            ))}
          </select>
          <span className="material-symbols-outlined pointer-events-none absolute inset-y-0 right-3 my-auto h-fit text-on-surface-variant">
            expand_more
          </span>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl bg-surface-container-lowest pt-2 shadow-ambient">
        {/* Tabela */}
        <div className="overflow-x-auto px-2 sm:px-4">
          <table className="w-full border-separate border-spacing-y-2 text-left">
            <thead>
              <tr className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">
                <th className="px-4 py-2">Professor</th>
                <th className="px-4 py-2">Disciplinas</th>
                <th className="px-4 py-2">Valor hora/aula</th>
                <th className="px-4 py-2">Contato</th>
                <th className="px-4 py-2 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {carregando || erro ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6">
                    {erro ? (
                      <p className="text-center text-sm font-semibold text-error">{erro}</p>
                    ) : (
                      <div className="flex flex-col gap-3" role="status" aria-label="Carregando professores">
                        <Skeleton className="h-14" />
                        <Skeleton className="h-14" />
                        <Skeleton className="h-14" />
                      </div>
                    )}
                  </td>
                </tr>
              ) : filtrados.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-4xl text-on-surface-variant/40">person_search</span>
                    <p className="mt-2 text-base font-semibold">Nenhum professor encontrado</p>
                    <p className="text-sm text-on-surface-variant/70">
                      {professores.length === 0 ? "Cadastre o primeiro professor." : "Tente ajustar a busca ou o filtro."}
                    </p>
                  </td>
                </tr>
              ) : (
                daPagina.map((p, i) => (
                  <tr
                    key={p.id}
                    className={`group transition-colors [&>td]:bg-surface-container-low [&>td:first-child]:rounded-l-2xl [&>td:last-child]:rounded-r-2xl hover:[&>td]:bg-primary-fixed/30 ${
                      p.ativo ? "" : "opacity-60"
                    }`}
                  >
                    <td className="px-4 py-3">
                      <Link href={`/professores/${p.id}`} className="flex items-center gap-3">
                        <AvatarProfessor nome={p.nome} foto={p.foto} indice={i} tamanho="size-11 text-sm" />
                        <span>
                          <span className="block font-bold leading-tight text-on-surface group-hover:text-primary">
                            {p.nome}
                          </span>
                          <span className={`text-[10px] font-extrabold uppercase tracking-wider ${COR_SITUACAO[p.situacao]}`}>
                            {p.situacao}
                          </span>
                        </span>
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      {p.disciplinas.length === 0 ? (
                        <span className="text-sm text-on-surface-variant/60">Nenhuma</span>
                      ) : (
                        <div className="flex max-w-56 flex-wrap gap-1.5">
                          {p.disciplinas.map((d) => (
                            <span
                              key={d.id}
                              className="rounded-md bg-secondary-fixed px-2 py-0.5 text-[11px] font-semibold text-on-secondary-fixed"
                            >
                              {d.nome}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-extrabold text-on-surface">
                      {valorHora(p.valorHoraAula)}
                    </td>
                    <td className="px-4 py-3 text-xs text-on-surface-variant">
                      <p className="flex items-center gap-1.5 whitespace-nowrap">
                        <span className="material-symbols-outlined text-sm">mail</span>
                        {p.email || "Sem e-mail"}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1.5 whitespace-nowrap">
                        <span className="material-symbols-outlined text-sm">call</span>
                        {p.telefone || "Sem telefone"}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/professores/${p.id}`}
                          title={`Editar ${p.nome}`}
                          className="rounded-xl p-2 text-on-surface-variant transition hover:bg-surface-container-high active:scale-95"
                        >
                          <span className="material-symbols-outlined text-[20px]">edit_note</span>
                        </Link>
                        <button
                          type="button"
                          onClick={() => setParaStatus(p)}
                          title={`${p.ativo ? "Inativar" : "Reativar"} ${p.nome}`}
                          aria-label={`${p.ativo ? "Inativar" : "Reativar"} ${p.nome}`}
                          className={`rounded-xl p-2 transition active:scale-95 ${
                            p.ativo
                              ? "text-error hover:bg-error-container/60"
                              : "text-tertiary hover:bg-tertiary-fixed/40"
                          }`}
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            {p.ativo ? "person_off" : "person_check"}
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Rodapé com paginação */}
        <div className="flex flex-col items-center justify-between gap-4 p-4 sm:p-6 md:flex-row">
          <p className="text-sm text-on-surface-variant">
            Mostrando <span className="font-bold text-on-surface">{daPagina.length}</span> de{" "}
            <span className="font-bold text-on-surface">{filtrados.length}</span>{" "}
            {filtrados.length === 1 ? "professor" : "professores"}
          </p>
          <nav aria-label="Paginação" className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => irPara(pagina - 1)}
              disabled={pagina === 1}
              className="rounded-full bg-surface-container-low px-4 py-2 text-xs font-bold text-on-surface-variant transition hover:bg-surface-container-high disabled:cursor-not-allowed disabled:opacity-40 sm:text-sm"
            >
              Anterior
            </button>
            {gerarBotoesPagina(pagina, totalPaginas).map((n, i) =>
              n === "..." ? (
                <span key={`r-${i}`} className="w-6 select-none text-center text-on-surface-variant/60">…</span>
              ) : (
                <button
                  key={n}
                  type="button"
                  onClick={() => irPara(n)}
                  aria-current={n === pagina ? "page" : undefined}
                  className={`size-9 rounded-full text-xs font-bold transition sm:size-10 sm:text-sm ${
                    n === pagina ? "bg-primary text-white" : "text-on-surface-variant hover:bg-surface-container-low"
                  }`}
                >
                  {n}
                </button>
              ),
            )}
            <button
              type="button"
              onClick={() => irPara(pagina + 1)}
              disabled={pagina === totalPaginas}
              className="rounded-full bg-surface-container-low px-4 py-2 text-xs font-bold text-on-surface-variant transition hover:bg-surface-container-high disabled:cursor-not-allowed disabled:opacity-40 sm:text-sm"
            >
              Próximo
            </button>
          </nav>
        </div>
      </div>

      <ConfirmDialog
        open={paraStatus !== null}
        title={paraStatus?.ativo === false ? "Reativar professor?" : "Inativar professor?"}
        description={
          paraStatus?.ativo === false ? (
            <>
              <b>{paraStatus?.nome}</b> volta a ficar ativo e disponível para as disciplinas.
            </>
          ) : (
            <>
              <b>{paraStatus?.nome}</b> passa a ficar inativo. Nada é apagado: o cadastro, os vínculos com
              disciplinas e as aulas da agenda continuam guardados, e ele pode ser reativado depois.
            </>
          )
        }
        confirmLabel={paraStatus?.ativo === false ? "Reativar" : "Inativar"}
        tone={paraStatus?.ativo === false ? "primary" : "danger"}
        loading={salvandoStatus}
        onConfirm={confirmarStatus}
        onClose={() => setParaStatus(null)}
      />
    </div>
  );
}
