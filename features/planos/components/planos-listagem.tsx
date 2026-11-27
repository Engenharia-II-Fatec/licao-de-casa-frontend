"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Skeleton } from "@/components/ui/empty-state";
import { ExportarMenu } from "@/components/ui/exportar-menu";
import { formatarMoeda } from "@/lib/format";
import { gerarBotoesPagina } from "@/lib/paginacao";
import { usePlanos } from "../hooks";
import type { Plano, PlanoStatus } from "../types";
import { IconePlano } from "./icone-plano";
import { StatusPlanoDialog } from "./status-plano-dialog";

const PLANOS_POR_PAGINA = 10;

type FiltroStatus = "Todos" | PlanoStatus;
const OPCOES_STATUS: { valor: FiltroStatus; rotulo: string }[] = [
  { valor: "Todos", rotulo: "Todos os status" },
  { valor: "ATIVO", rotulo: "Somente ativos" },
  { valor: "INATIVO", rotulo: "Somente inativos" },
];

const textoValor = (p: Plano) => (p.valorMensal === null ? "Consultar" : formatarMoeda(p.valorMensal));
const textoAulas = (p: Plano) =>
  p.aulasIncluidas === null
    ? "Personalizado"
    : `${p.aulasIncluidas} ${p.aulasIncluidas === 1 ? "aula" : "aulas"}`;

/** Ícone do plano num círculo com as cores da capa (mesmo papel do avatar na Base de Alunos). */
function AvatarPlano({ plano }: { plano: Plano }) {
  const estilo =
    plano.capa.tipo === "gradiente"
      ? { backgroundImage: `linear-gradient(135deg, ${plano.capa.de}, ${plano.capa.para})` }
      : undefined;
  return (
    <div
      style={estilo}
      className={`flex size-10 shrink-0 items-center justify-center rounded-full shadow-sm ${
        estilo ? "text-white" : "bg-primary-fixed text-on-primary-fixed-variant"
      }`}
    >
      <IconePlano id={plano.icone} className="size-5" />
    </div>
  );
}

/** Tela "Gestão de Planos", no mesmo layout da "Base de Alunos". */
export function PlanosListagem() {
  const router = useRouter();
  const [busca, setBusca] = useState("");
  const [status, setStatus] = useState<FiltroStatus>("Todos");
  const [planoParaStatus, setPlanoParaStatus] = useState<Plano | null>(null);
  const { planos: todos, carregando, erro, recarregar } = usePlanos({ busca: busca.trim() });

  const planos = status === "Todos" ? todos : todos.filter((p) => p.status === status);

  // Paginação: volta para a página 1 sempre que a busca ou o filtro mudam.
  const chaveFiltros = `${busca}|${status}`;
  const [paginacao, setPaginacao] = useState({ chave: chaveFiltros, pagina: 1 });
  const totalPaginas = Math.max(1, Math.ceil(planos.length / PLANOS_POR_PAGINA));
  const paginaAtual = Math.min(paginacao.chave === chaveFiltros ? paginacao.pagina : 1, totalPaginas);
  const irParaPagina = (pagina: number) =>
    setPaginacao({ chave: chaveFiltros, pagina: Math.min(Math.max(1, pagina), totalPaginas) });
  const inicio = (paginaAtual - 1) * PLANOS_POR_PAGINA;
  const planosDaPagina = planos.slice(inicio, inicio + PLANOS_POR_PAGINA);

  const filtrosAtivos = busca.trim() !== "" || status !== "Todos";
  const limparFiltros = () => {
    setBusca("");
    setStatus("Todos");
  };

  const dadosExportacao = () => ({
    arquivo: "planos",
    titulo: "Gestão de Planos",
    cabecalho: ["Plano", "Valor mensal", "Aulas incluídas", "Status"],
    linhas: planos.map((p) => [
      p.nome,
      textoValor(p),
      textoAulas(p),
      p.status === "ATIVO" ? "Ativo" : "Inativo",
    ]),
  });

  return (
    <div className="flex w-full flex-col gap-6 md:gap-8">
      {/* Cabeçalho */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center md:gap-6">
        <div>
          <h3 className="text-2xl font-extrabold tracking-tight text-on-surface sm:text-3xl">
            Gestão de Planos
          </h3>
          <p className="mt-1 text-sm text-on-surface-variant sm:text-base">
            Visualize e gerencie os pacotes de aulas oferecidos aos alunos.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <ExportarMenu disabled={carregando || planos.length === 0} dados={dadosExportacao} />
          <Link
            href="/planos/novo"
            className="flex cursor-pointer items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-primary to-primary-container px-6 py-3.5 font-bold text-on-primary shadow-xl shadow-primary/25 transition-all hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-primary-container/30 active:scale-95 sm:px-8 sm:py-4"
          >
            <span className="material-symbols-outlined text-xl sm:text-2xl">add_card</span>
            <span>Novo Plano</span>
          </Link>
        </div>
      </div>

      {/* Busca e filtro */}
      <div className="grid grid-cols-1 items-center gap-3 sm:gap-4 lg:grid-cols-12">
        <div className="group relative lg:col-span-8">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <span className="material-symbols-outlined text-2xl text-on-surface-variant/50 transition-colors group-focus-within:text-primary">
              search
            </span>
          </div>
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Pesquisar plano pelo nome..."
            aria-label="Pesquisar planos"
            className="w-full rounded-2xl border-none bg-surface-container-low py-3.5 pl-12 pr-10 text-sm font-medium text-on-surface outline-none transition-all placeholder:text-on-surface-variant/50 focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 sm:py-4 sm:text-base"
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

        <div className="relative lg:col-span-4">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as FiltroStatus)}
            aria-label="Filtrar por status"
            className="w-full cursor-pointer appearance-none rounded-2xl border-none bg-surface-container-low px-4 py-3.5 pr-10 text-sm font-medium text-on-surface-variant outline-none focus:ring-2 focus:ring-primary/20 sm:py-4 sm:text-base"
          >
            {OPCOES_STATUS.map((o) => (
              <option key={o.valor} value={o.valor}>
                {o.rotulo}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-on-surface-variant">
            <span className="material-symbols-outlined text-xl">expand_more</span>
          </div>
        </div>
      </div>

      {/* Filtros ativos */}
      {filtrosAtivos && (
        <div className="-mt-2 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
            Filtros ativos:
          </span>
          {busca.trim() && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-fixed px-3 py-1 text-xs font-bold text-on-primary-fixed-variant">
              Busca: &quot;{busca.trim()}&quot;
              <button type="button" onClick={() => setBusca("")} aria-label="Remover busca" className="hover:opacity-75">
                ×
              </button>
            </span>
          )}
          {status !== "Todos" && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-fixed px-3 py-1 text-xs font-bold text-on-primary-fixed-variant">
              Status: {status === "ATIVO" ? "Ativo" : "Inativo"}
              <button
                type="button"
                onClick={() => setStatus("Todos")}
                aria-label="Remover filtro de status"
                className="hover:opacity-75"
              >
                ×
              </button>
            </span>
          )}
          <button
            type="button"
            onClick={limparFiltros}
            className="ml-2 cursor-pointer text-xs font-semibold text-primary hover:underline"
          >
            Limpar todos
          </button>
        </div>
      )}

      {/* Tabela */}
      <div className="overflow-hidden rounded-3xl border border-surface-container bg-surface-container-low p-1 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <caption className="sr-only">Lista de planos de aula</caption>
            <thead>
              <tr className="border-b border-surface-container-high text-xs font-bold uppercase tracking-widest text-on-surface-variant sm:text-sm">
                <th scope="col" className="px-6 py-5">Plano</th>
                <th scope="col" className="px-6 py-5">Valor mensal</th>
                <th scope="col" className="px-6 py-5">Aulas incluídas</th>
                <th scope="col" className="px-6 py-5">Status</th>
                <th scope="col" className="px-6 py-5 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container">
              {carregando || erro ? (
                <tr>
                  <td colSpan={5} className="bg-surface-container-lowest px-6 py-6">
                    {erro ? (
                      <p className="text-center text-sm font-semibold text-error">{erro}</p>
                    ) : (
                      <div className="flex flex-col gap-3" role="status" aria-label="Carregando planos">
                        <Skeleton className="h-12" />
                        <Skeleton className="h-12" />
                        <Skeleton className="h-12" />
                      </div>
                    )}
                  </td>
                </tr>
              ) : planos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="bg-surface-container-lowest px-6 py-12 text-center text-on-surface-variant">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-4xl text-on-surface-variant/40">
                        {filtrosAtivos ? "search_off" : "inventory_2"}
                      </span>
                      <p className="text-base font-semibold">
                        {filtrosAtivos ? "Nenhum plano encontrado" : "Nenhum plano cadastrado"}
                      </p>
                      <p className="text-sm text-on-surface-variant/70">
                        {filtrosAtivos
                          ? "Tente ajustar o filtro ou os termos da busca."
                          : "Clique em Novo Plano para criar o primeiro."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                planosDaPagina.map((plano, index) => {
                  const ativo = plano.status === "ATIVO";
                  return (
                    <tr
                      key={plano.id}
                      className={`${
                        index % 2 === 0 ? "bg-surface-container-lowest" : "bg-surface"
                      } group transition-colors hover:bg-primary-fixed/20`}
                    >
                      {/* Plano: clicar no ícone ou no nome abre os detalhes. */}
                      <td className="px-6 py-4">
                        <Link
                          href={`/planos/${plano.id}`}
                          title="Ver detalhes do plano"
                          className="group/plano flex items-center gap-3 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                        >
                          <AvatarPlano plano={plano} />
                          <div className="min-w-0">
                            <p className="font-bold leading-none text-on-surface underline-offset-2 group-hover/plano:text-primary group-hover/plano:underline">
                              {plano.nome}
                            </p>
                            {plano.descricao && (
                              <p className="mt-1 max-w-xs truncate text-xs font-medium text-on-surface-variant">
                                {plano.descricao}
                              </p>
                            )}
                          </div>
                        </Link>
                      </td>

                      <td
                        className={`whitespace-nowrap px-6 py-4 text-sm font-medium sm:text-base ${
                          plano.valorMensal === null ? "italic text-on-surface-variant" : "text-on-surface"
                        }`}
                      >
                        {textoValor(plano)}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-block whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold ${
                            ativo
                              ? "bg-primary-fixed text-on-primary-fixed-variant"
                              : "bg-surface-container-highest text-on-surface-variant"
                          }`}
                        >
                          {textoAulas(plano)}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        {ativo ? (
                          <div className="flex items-center gap-1.5 text-tertiary">
                            <span className="size-2 rounded-full bg-tertiary-container" />
                            <span className="text-sm font-bold">Ativo</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-on-surface-variant/50">
                            <span className="size-2 rounded-full bg-on-surface-variant/40" />
                            <span className="text-sm font-bold">Inativo</span>
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-70 transition-opacity group-hover:opacity-100">
                          <button
                            type="button"
                            onClick={() => router.push(`/planos/${plano.id}/editar`)}
                            title="Editar"
                            aria-label={`Editar ${plano.nome}`}
                            className="cursor-pointer rounded-xl p-2 text-on-surface-variant transition-all hover:bg-surface-container-high active:scale-95"
                          >
                            <span className="material-symbols-outlined text-[20px]">edit_note</span>
                          </button>
                          {ativo ? (
                            <button
                              type="button"
                              onClick={() => setPlanoParaStatus(plano)}
                              title="Inativar"
                              aria-label={`Inativar ${plano.nome}`}
                              className="cursor-pointer rounded-xl p-2 text-error transition-all hover:bg-error-container/60 active:scale-95"
                            >
                              <span className="material-symbols-outlined text-[20px]">block</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setPlanoParaStatus(plano)}
                              title="Reativar"
                              aria-label={`Reativar ${plano.nome}`}
                              className="cursor-pointer rounded-xl p-2 text-tertiary transition-all hover:bg-tertiary-fixed/40 active:scale-95"
                            >
                              <span className="material-symbols-outlined text-[20px]">restart_alt</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Rodapé: contagem e paginação */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-surface-container bg-surface-container-lowest p-4 sm:p-6 md:flex-row">
          <p className="text-sm text-on-surface-variant">
            Exibindo{" "}
            <span className="font-bold text-on-surface">
              {planos.length > 0 ? `${inicio + 1}-${inicio + planosDaPagina.length}` : "0"}
            </span>{" "}
            de <span className="font-bold text-on-surface">{planos.length}</span>{" "}
            {planos.length === 1 ? "plano" : "planos"}
          </p>
          <nav aria-label="Paginação" className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => irParaPagina(paginaAtual - 1)}
              disabled={paginaAtual === 1}
              className="cursor-pointer rounded-full bg-surface-container-low px-3 py-2 text-xs font-bold text-on-surface-variant transition-colors hover:bg-surface-container-high disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-surface-container-low sm:px-4 sm:text-sm"
            >
              Anterior
            </button>
            {gerarBotoesPagina(paginaAtual, totalPaginas).map((pagina, i) =>
              pagina === "..." ? (
                <span
                  key={`reticencias-${i}`}
                  className="w-6 select-none text-center text-xs font-bold text-on-surface-variant/60 sm:text-sm"
                >
                  …
                </span>
              ) : (
                <button
                  key={pagina}
                  type="button"
                  onClick={() => irParaPagina(pagina)}
                  aria-current={pagina === paginaAtual ? "page" : undefined}
                  className={`size-9 cursor-pointer rounded-full text-xs font-bold transition-colors sm:size-10 sm:text-sm ${
                    pagina === paginaAtual
                      ? "bg-primary text-on-primary shadow-md shadow-primary/20"
                      : "text-on-surface-variant hover:bg-surface-container-low"
                  }`}
                >
                  {pagina}
                </button>
              ),
            )}
            <button
              type="button"
              onClick={() => irParaPagina(paginaAtual + 1)}
              disabled={paginaAtual === totalPaginas}
              className="cursor-pointer rounded-full bg-surface-container-low px-3 py-2 text-xs font-bold text-on-surface-variant transition-colors hover:bg-surface-container-high disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-surface-container-low sm:px-4 sm:text-sm"
            >
              Próximo
            </button>
          </nav>
        </div>
      </div>

      <StatusPlanoDialog
        plano={planoParaStatus}
        onClose={() => setPlanoParaStatus(null)}
        onAlterado={() => {
          setPlanoParaStatus(null);
          recarregar();
        }}
      />
    </div>
  );
}
