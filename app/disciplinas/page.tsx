"use client";

import Link from "next/link";
import { useState } from "react";
import { AREAS, DISCIPLINAS, ESTILO_AREA, type Area } from "./_components/dados";

const POR_PAGINA = 6;

export default function ListagemDisciplinas() {
  const [lista, setLista] = useState(DISCIPLINAS);
  const [busca, setBusca] = useState("");
  const [area, setArea] = useState<Area | "todas">("todas");
  const [pagina, setPagina] = useState(1);

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

  function remover(id: number) {
    if (confirm("Deseja realmente excluir esta disciplina?")) {
      setLista((atual) => atual.filter((d) => d.id !== id));
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f3f1] p-6 text-neutral-900">
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
          <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-600">
            {lista.filter((d) => d.ativa).length} Disciplinas Ativas
          </span>
          <Link
            href="/disciplinas/nova"
            className="rounded-full bg-gradient-to-r from-[#a8501a] to-[#ea7a1a] px-5 py-2 text-sm font-bold text-white shadow"
          >
            + Cadastrar Disciplina
          </Link>
        </section>

        {visiveis.length === 0 ? (
          <p className="py-10 text-center text-sm text-neutral-500">
            Nenhuma disciplina encontrada.
          </p>
        ) : (
          <section className="grid gap-4 md:grid-cols-2">
            {visiveis.map((d) => {
              const estilo = ESTILO_AREA[d.area];
              return (
                <article key={d.id} className="rounded-3xl bg-white p-5 shadow-sm">
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
                            onClick={() => remover(d.id)}
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
      </div>
    </main>
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