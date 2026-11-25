"use client";

import Link from "next/link";
import { useState } from "react";
import { Button, buttonClasses } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState, Skeleton } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";
import { AREAS, ESTILO_AREA, ESTILO_PADRAO } from "@/features/disciplinas/constants";
import { useListaDisciplinas } from "@/features/disciplinas/hooks";
import { disciplinasService } from "@/features/disciplinas/services";
import type { Area, Disciplina } from "@/features/disciplinas/types";

const POR_PAGINA = 6;

export default function ListagemDisciplinas() {
  const { disciplinas: lista, setDisciplinas, carregando, erro, recarregar } = useListaDisciplinas();
  const toast = useToast();
  const [busca, setBusca] = useState("");
  const [area, setArea] = useState<Area | "todas">("todas");
  const [pagina, setPagina] = useState(1);
  const [paraExcluir, setParaExcluir] = useState<Disciplina | null>(null);
  const [excluindo, setExcluindo] = useState(false);

  const filtradas = lista.filter(
    (d) =>
      d.nome.toLowerCase().includes(busca.toLowerCase()) &&
      (area === "todas" || d.area === area)
  );
  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / POR_PAGINA));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const visiveis = filtradas.slice(
    (paginaAtual - 1) * POR_PAGINA,
    paginaAtual * POR_PAGINA
  );

  async function confirmarExclusao() {
    if (!paraExcluir) return;
    setExcluindo(true);
    try {
      await disciplinasService.excluir(paraExcluir.id);
      setDisciplinas((atual) => (atual ?? []).filter((d) => d.id !== paraExcluir.id));
      toast.success(`Disciplina ${paraExcluir.nome} excluída.`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não foi possível excluir a disciplina.");
    } finally {
      // Fecha o diálogo também no erro: o modal ficaria por cima do toast.
      setParaExcluir(null);
      setExcluindo(false);
    }
  }

  return (
    <div className="text-neutral-900">
      <div className="mx-auto max-w-5xl space-y-6">
        <h1 className="text-xl font-bold">Gestão de Disciplinas</h1>

        <section className="rounded-3xl bg-gradient-to-r from-[#3b2314] to-[#a8501a] p-8 text-white">
          <h2 className="text-3xl font-bold">Curriculum Atelier</h2>
          <p className="mt-2 max-w-md text-sm text-orange-100">
            Gerencie as áreas de conhecimento e disciplinas que compõem a jornada
            acadêmica dos nossos alunos.
          </p>
        </section>

        <section className="flex flex-wrap items-center gap-3 rounded-3xl bg-white p-3 shadow-sm">
          <input
            value={busca}
            onChange={(e) => {
              setBusca(e.target.value);
              setPagina(1);
            }}
            placeholder="Filtrar disciplinas por nome..."
            className="min-w-48 flex-1 rounded-full bg-[#f7f3f1] px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-400"
          />
          <select
            value={area}
            onChange={(e) => {
              setArea(e.target.value as Area | "todas");
              setPagina(1);
            }}
            className="rounded-full bg-[#f7f3f1] px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-400"
          >
            <option value="todas">Todas as áreas</option>
            {AREAS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
          {!carregando && !erro && (
            <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-600">
              {lista.filter((d) => d.ativa).length} Disciplinas Ativas
            </span>
          )}
          <Link
            href="/disciplinas/nova"
            className="rounded-full bg-gradient-to-r from-[#a8501a] to-[#ea7a1a] px-5 py-2 text-sm font-bold text-white shadow"
          >
            + Cadastrar Disciplina
          </Link>
        </section>

        {carregando ? (
          <section className="grid gap-4 md:grid-cols-2" aria-busy="true">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="h-36 rounded-3xl" />
            ))}
          </section>
        ) : erro ? (
          <div
            role="alert"
            className="flex flex-col items-center gap-4 rounded-[2rem] bg-error-container/40 px-6 py-14 text-center"
          >
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-bold text-on-surface">
                Não foi possível carregar as disciplinas
              </h2>
              <p className="max-w-md text-sm text-on-surface-variant">{erro}</p>
            </div>
            <Button variant="secondary" onClick={recarregar}>
              Tentar novamente
            </Button>
          </div>
        ) : lista.length === 0 ? (
          <EmptyState
            title="Nenhuma disciplina cadastrada"
            description="Cadastre a primeira disciplina para montar a grade curricular."
            action={
              <Link href="/disciplinas/nova" className={buttonClasses()}>
                + Cadastrar Disciplina
              </Link>
            }
          />
        ) : visiveis.length === 0 ? (
          <EmptyState
            title="Nenhuma disciplina encontrada"
            description="Nenhuma disciplina corresponde à busca ou ao filtro de área."
          />
        ) : (
          <section className="grid gap-4 md:grid-cols-2">
            {visiveis.map((d) => {
              const estilo = ESTILO_AREA[d.area] ?? ESTILO_PADRAO;
              return (
                <article
                  key={d.id}
                  className={`rounded-3xl p-5 shadow-sm ${d.ativa ? "bg-white" : "bg-neutral-50"}`}
                >
                  <div className="flex gap-4">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xl ${estilo.icone}`}
                    >
                      {estilo.emoji}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold">{d.nome}</h3>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${estilo.tag}`}
                          >
                            {d.area}
                          </span>
                          <span
                            className={`flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                              d.ativa
                                ? "bg-green-100 text-green-700"
                                : "bg-neutral-200 text-neutral-600"
                            }`}
                          >
                            <span
                              aria-hidden="true"
                              className={`h-1.5 w-1.5 rounded-full ${d.ativa ? "bg-green-500" : "bg-neutral-400"}`}
                            />
                            {d.ativa ? "Ativa" : "Inativa"}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          <Link
                            href={`/disciplinas/${d.id}/editar`}
                            aria-label={`Editar ${d.nome}`}
                            className="rounded-full bg-neutral-100 p-2 text-neutral-600 hover:bg-orange-100"
                          >
                            <IconeEditar />
                          </Link>
                          <button
                            onClick={() => setParaExcluir(d)}
                            aria-label={`Excluir ${d.nome}`}
                            className="rounded-full bg-neutral-100 p-2 text-neutral-600 hover:bg-red-100 hover:text-red-600"
                          >
                            <IconeLixeira />
                          </button>
                        </div>
                      </div>
                      <p className="mt-1 line-clamp-2 text-sm text-neutral-500">
                        {d.descricao}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-2 text-xs text-neutral-500">
                    <span>Carga Horária: {d.cargaHoraria}h/sem</span>
                    <span>{d.alunos} Alunos</span>
                    <span>{d.professor}</span>
                  </div>
                </article>
              );
            })}
          </section>
        )}

        {!carregando && !erro && filtradas.length > 0 && (
        <nav className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPagina(paginaAtual - 1)}
            disabled={paginaAtual === 1}
            className="h-8 w-8 rounded-full bg-white shadow-sm disabled:opacity-40"
          >
            ‹
          </button>
          {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => setPagina(n)}
              className={`h-8 w-8 rounded-full text-sm font-bold ${
                n === paginaAtual ? "bg-[#a8501a] text-white" : "bg-white shadow-sm"
              }`}
            >
              {n}
            </button>
          ))}
          <button
            onClick={() => setPagina(paginaAtual + 1)}
            disabled={paginaAtual === totalPaginas}
            className="h-8 w-8 rounded-full bg-white shadow-sm disabled:opacity-40"
          >
            ›
          </button>
        </nav>
        )}
      </div>

      <ConfirmDialog
        open={paraExcluir !== null}
        title="Excluir disciplina?"
        description={
          <>
            A disciplina <strong>{paraExcluir?.nome}</strong> será excluída, junto com os vínculos
            de professores e as matrículas dos alunos. Esta ação não pode ser desfeita.
          </>
        }
        confirmLabel="Excluir"
        loading={excluindo}
        onConfirm={confirmarExclusao}
        onClose={() => setParaExcluir(null)}
      />
    </div>
  );
}

function IconeEditar() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
    </svg>
  );
}

function IconeLixeira() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}