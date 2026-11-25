"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ExportarMenu } from "@/components/ui/exportar-menu";
import { Skeleton } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";
import { useListaResponsaveis } from "../hooks";
import { responsaveisDetalheService } from "../services";
import type { FiltroStatusFinanceiro, ResponsavelResumo } from "../types";
import {
  PLANO_TODOS,
  dadosExportacao,
  filtrarResponsaveis,
  mesAno,
  planosDosAlunos,
  statusFinanceiro,
} from "../utils";
import { AvatarResponsavel } from "./avatar-responsavel";

const POR_PAGINA = 10;
const STATUS: FiltroStatusFinanceiro[] = ["Todos", "Em dia", "Pendente", "Inativo"];

const selectClasses =
  "w-full appearance-none rounded-2xl bg-surface-container-low py-3.5 pl-4 pr-10 text-sm font-semibold text-on-surface-variant outline-none transition focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/30 sm:py-4";

const BADGE_STATUS: Record<Exclude<FiltroStatusFinanceiro, "Todos">, string> = {
  "Em dia": "bg-tertiary-fixed/40 text-on-tertiary-fixed-variant",
  Pendente: "bg-primary-fixed text-on-primary-fixed-variant",
  Inativo: "bg-surface-container-high text-on-surface-variant",
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

/** Tela "Listagem de Responsáveis" (Figura 9). */
export function ResponsaveisListagem() {
  const toast = useToast();
  const { responsaveis, carregando, erro, recarregar } = useListaResponsaveis();
  const [busca, setBusca] = useState("");
  const [status, setStatus] = useState<FiltroStatusFinanceiro>("Todos");
  const [plano, setPlano] = useState(PLANO_TODOS);
  const [paraExcluir, setParaExcluir] = useState<ResponsavelResumo | null>(null);
  const [excluindo, setExcluindo] = useState(false);

  const planos = useMemo(() => planosDosAlunos(responsaveis), [responsaveis]);
  const filtrados = useMemo(
    () => filtrarResponsaveis(responsaveis, { busca, status, plano }),
    [responsaveis, busca, status, plano],
  );

  // Volta para a página 1 sempre que a busca ou os filtros mudam.
  const chave = `${busca}|${status}|${plano}`;
  const [paginacao, setPaginacao] = useState({ chave, pagina: 1 });
  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  const pagina = Math.min(paginacao.chave === chave ? paginacao.pagina : 1, totalPaginas);
  const irPara = (p: number) => setPaginacao({ chave, pagina: Math.min(Math.max(1, p), totalPaginas) });
  const inicio = (pagina - 1) * POR_PAGINA;
  const daPagina = filtrados.slice(inicio, inicio + POR_PAGINA);

  async function confirmarExclusao() {
    if (!paraExcluir) return;
    setExcluindo(true);
    try {
      await responsaveisDetalheService.excluir(paraExcluir.id);
      toast.success(`Responsável ${paraExcluir.name} excluído.`);
      recarregar();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não foi possível excluir o responsável.");
    } finally {
      setParaExcluir(null);
      setExcluindo(false);
    }
  }

  return (
    <div className="flex w-full flex-col gap-6 md:gap-8">
      {/* Cabeçalho */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center md:gap-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-on-surface sm:text-3xl">
            Listagem de Responsáveis
          </h1>
          <p className="mt-1 text-sm text-on-surface-variant sm:text-base">
            Gerencie os contatos, pagamentos e vínculos dos responsáveis.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <ExportarMenu
            disabled={carregando || filtrados.length === 0}
            dados={() => dadosExportacao(filtrados)}
          />
          <Link
            href="/responsaveis/novo"
            className="flex items-center gap-2.5 rounded-full bg-linear-to-br from-primary to-primary-container px-6 py-3.5 font-bold text-white shadow-cta transition-all hover:-translate-y-0.5 hover:shadow-cta-hover active:scale-95 sm:px-8 sm:py-4"
          >
            <span className="material-symbols-outlined text-xl">person_add</span>
            Novo Responsável
          </Link>
        </div>
      </div>

      {/* Busca e filtros */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-12">
        <div className="group relative sm:col-span-2 lg:col-span-6">
          <span className="material-symbols-outlined pointer-events-none absolute inset-y-0 left-4 my-auto h-fit text-2xl text-on-surface-variant/50 group-focus-within:text-primary">
            search
          </span>
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Pesquisar por nome ou CPF..."
            aria-label="Pesquisar por nome, CPF, telefone, e-mail ou aluno"
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
        <div className="relative lg:col-span-3">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as FiltroStatusFinanceiro)}
            aria-label="Status financeiro"
            className={`${selectClasses} ${status !== "Todos" ? "ring-2 ring-primary-container" : ""}`}
          >
            {STATUS.map((s) => (
              <option key={s} value={s}>
                {s === "Todos" ? "Status Financeiro" : s}
              </option>
            ))}
          </select>
          <span className="material-symbols-outlined pointer-events-none absolute inset-y-0 right-3 my-auto h-fit text-on-surface-variant">
            expand_more
          </span>
        </div>
        <div className="relative lg:col-span-3">
          <select
            value={plano}
            onChange={(e) => setPlano(e.target.value)}
            aria-label="Plano do aluno"
            className={`${selectClasses} ${plano !== PLANO_TODOS ? "ring-2 ring-primary-container" : ""}`}
          >
            <option value={PLANO_TODOS}>Plano do Aluno</option>
            {planos.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <span className="material-symbols-outlined pointer-events-none absolute inset-y-0 right-3 my-auto h-fit text-on-surface-variant">
            expand_more
          </span>
        </div>
      </div>

      {/* Tabela */}
      <div className="overflow-hidden rounded-3xl bg-surface-container-lowest shadow-ambient">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-surface-container-low text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                <th className="px-6 py-5">Nome do Responsável</th>
                <th className="px-6 py-5">Contato</th>
                <th className="px-6 py-5">Alunos Vinculados</th>
                <th className="px-6 py-5">Status Financeiro</th>
                <th className="px-6 py-5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {carregando || erro ? (
                <tr>
                  <td colSpan={5} className="px-6 py-6">
                    {erro ? (
                      <p className="text-center text-sm font-semibold text-error">{erro}</p>
                    ) : (
                      <div className="flex flex-col gap-3" role="status" aria-label="Carregando responsáveis">
                        <Skeleton className="h-12" />
                        <Skeleton className="h-12" />
                        <Skeleton className="h-12" />
                      </div>
                    )}
                  </td>
                </tr>
              ) : filtrados.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-4xl text-on-surface-variant/40">person_search</span>
                    <p className="mt-2 text-base font-semibold">Nenhum responsável encontrado</p>
                    <p className="text-sm text-on-surface-variant/70">Tente ajustar a busca ou os filtros.</p>
                  </td>
                </tr>
              ) : (
                daPagina.map((r, i) => {
                  const situacao = statusFinanceiro(r);
                  return (
                    <tr
                      key={r.id}
                      className={`${i % 2 === 1 ? "bg-surface" : ""} group transition-colors hover:bg-primary-fixed/20 ${
                        r.ativo ? "" : "opacity-60"
                      }`}
                    >
                      <td className="px-6 py-4">
                        <Link href={`/responsaveis/${r.id}`} className="flex items-center gap-3">
                          <AvatarResponsavel nome={r.name} foto={r.photo} indice={i} />
                          <span>
                            <span className="block whitespace-nowrap font-bold leading-tight text-on-surface group-hover:text-primary">
                              {r.name}
                            </span>
                            <span className="whitespace-nowrap text-xs font-medium text-on-surface-variant">
                              Cadastrado em {mesAno(r.createdAt)}
                            </span>
                          </span>
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <p className="whitespace-nowrap font-medium text-on-surface">{r.email || "Sem e-mail"}</p>
                        <p className="whitespace-nowrap text-xs text-on-surface-variant">{r.phone}</p>
                      </td>
                      <td className="px-6 py-4">
                        {r.dependentes.length === 0 ? (
                          <span className="text-sm text-on-surface-variant/60">Nenhum</span>
                        ) : (
                          <div
                            className="flex items-center -space-x-2"
                            title={r.dependentes.map((d) => d.name).join(", ")}
                          >
                            {r.dependentes.slice(0, 2).map((d) => (
                              <span
                                key={d.id}
                                className={`grid size-8 place-items-center overflow-hidden rounded-full text-[11px] font-bold ring-2 ring-surface-container-lowest ${d.avatarBg} ${d.avatarText}`}
                              >
                                {d.photo ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={d.photo} alt="" className="size-full object-cover" />
                                ) : (
                                  d.initials
                                )}
                              </span>
                            ))}
                            {r.dependentes.length > 2 && (
                              <span className="grid size-8 place-items-center rounded-full bg-surface-container-high text-[11px] font-bold text-on-surface-variant ring-2 ring-surface-container-lowest">
                                +{r.dependentes.length - 2}
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`whitespace-nowrap rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide ${BADGE_STATUS[situacao]}`}
                          title={
                            situacao === "Pendente"
                              ? `${r.pagamentosPendentes} ${r.pagamentosPendentes === 1 ? "pagamento pendente" : "pagamentos pendentes"}`
                              : undefined
                          }
                        >
                          {situacao}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/responsaveis/${r.id}`}
                            title={`Editar ${r.name}`}
                            className="rounded-xl p-2 text-on-surface-variant transition hover:bg-surface-container-high active:scale-95"
                          >
                            <span className="material-symbols-outlined text-[20px]">edit_note</span>
                          </Link>
                          <button
                            type="button"
                            onClick={() => setParaExcluir(r)}
                            title={`Excluir ${r.name}`}
                            className="rounded-xl p-2 text-error transition hover:bg-error-container/60 active:scale-95"
                          >
                            <span className="material-symbols-outlined text-[20px]">delete_outline</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Rodapé com paginação */}
        <div className="flex flex-col items-center justify-between gap-4 p-4 sm:p-6 md:flex-row">
          <p className="text-sm text-on-surface-variant">
            Mostrando <span className="font-bold text-on-surface">{daPagina.length}</span> de{" "}
            <span className="font-bold text-on-surface">{filtrados.length}</span>{" "}
            {filtrados.length === 1 ? "responsável" : "responsáveis"}
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
            {gerarBotoesPagina(pagina, totalPaginas).map((p, i) =>
              p === "..." ? (
                <span key={`r-${i}`} className="w-6 select-none text-center text-on-surface-variant/60">…</span>
              ) : (
                <button
                  key={p}
                  type="button"
                  onClick={() => irPara(p)}
                  aria-current={p === pagina ? "page" : undefined}
                  className={`size-9 rounded-full text-xs font-bold transition sm:size-10 sm:text-sm ${
                    p === pagina ? "bg-primary text-white" : "text-on-surface-variant hover:bg-surface-container-low"
                  }`}
                >
                  {p}
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
        open={paraExcluir !== null}
        title="Excluir responsável?"
        description={
          paraExcluir && paraExcluir.dependentes.length > 0 ? (
            <>
              <b>{paraExcluir.name}</b> tem {paraExcluir.dependentes.length}{" "}
              {paraExcluir.dependentes.length === 1 ? "aluno vinculado" : "alunos vinculados"} e não pode ser
              excluído. Para mantê-lo sem uso, abra o cadastro e use <b>Inativar Responsável</b>.
            </>
          ) : (
            <>
              O cadastro de <b>{paraExcluir ? paraExcluir.name : ""}</b> será removido. Esta ação não pode ser
              desfeita.
            </>
          )
        }
        confirmLabel={paraExcluir && paraExcluir.dependentes.length > 0 ? "Entendi" : "Excluir"}
        tone={paraExcluir && paraExcluir.dependentes.length > 0 ? "primary" : "danger"}
        loading={excluindo}
        onConfirm={() =>
          paraExcluir && paraExcluir.dependentes.length > 0 ? setParaExcluir(null) : confirmarExclusao()
        }
        onClose={() => setParaExcluir(null)}
      />
    </div>
  );
}

