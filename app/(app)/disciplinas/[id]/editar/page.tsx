"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useState } from "react";
import {
  DISCIPLINAS,
  PROFESSORES,
  type Area,
  type Disciplina,
} from "../../_components/dados";

const CATEGORIAS = ["Exatas", "Humanas", "Linguagens", "Artes"] as const;
type Categoria = (typeof CATEGORIAS)[number];

// O protótipo da edição tem só 4 categorias, então as outras áreas são agrupadas.
const CATEGORIA_DA_AREA: Record<Area, Categoria> = {
  Exatas: "Exatas",
  Humanas: "Humanas",
  Linguagens: "Linguagens",
  Idiomas: "Linguagens",
  "Ciências Naturais": "Exatas",
  "Artes & Cultura": "Artes",
};

const classeRotulo = "mb-2 flex items-center gap-2 text-xs font-bold text-neutral-700";
const classeCampo =
  "w-full bg-[#f1eceb] px-5 py-3 text-sm text-neutral-800 outline-none focus:ring-2 focus:ring-orange-400";

function iniciais(nome: string) {
  return nome
    .replace(/^Profa?\.\s*/, "")
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

function Icone({ children }: { children: React.ReactNode }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="text-neutral-400"
    >
      {children}
    </svg>
  );
}

function Edicao({ disciplina }: { disciplina: Disciplina }) {
  const router = useRouter();
  const professorInicial = PROFESSORES.find((p) => p.nome === disciplina.professor);

  const [nome, setNome] = useState(disciplina.nome);
  const [categoria, setCategoria] = useState<Categoria>(CATEGORIA_DA_AREA[disciplina.area]);
  const [descricao, setDescricao] = useState(disciplina.descricao);
  const [professores, setProfessores] = useState<number[]>(
    professorInicial ? [professorInicial.id] : []
  );
  const [seletorAberto, setSeletorAberto] = useState(false);
  const [erro, setErro] = useState("");

  const disponiveis = PROFESSORES.filter((p) => !professores.includes(p.id));

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim()) {
      setErro("Informe o nome da disciplina.");
      return;
    }
    setErro("");
    try {
      const res = await fetch(`/api/disciplinas/${disciplina.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: nome.trim(),
          descricao: descricao.trim(),
          professores,
        }),
      });

      if (!res.ok) {
        throw new Error("Erro ao salvar disciplina.");
      }
      router.push("/disciplinas");
    } catch {
      setErro("Não foi possível salvar as alterações no banco de dados.");
    }
  }

  return (
    <div className="space-y-8">
      <div className="grid items-stretch gap-4 md:grid-cols-[1fr_2fr]">
        {/* Card lateral */}
        <aside className="flex flex-col justify-between gap-8 rounded-[2rem] bg-gradient-to-br from-[#ebe4e0] to-[#f5f0ed] p-7">
          <div>
            <h1 className="text-2xl font-extrabold leading-tight text-neutral-900">
              Refinando o
              <br />
              Currículo
            </h1>
            <p className="mt-3 text-xs leading-relaxed text-neutral-500">
              Mantenha as informações das disciplinas atualizadas para um melhor
              acompanhamento pedagógico.
            </p>
          </div>

          <div className="rounded-2xl bg-white/60 p-4">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-500 text-sm font-bold text-white">
                Σ
              </span>
              <div>
                <p className="text-[10px] font-bold text-neutral-700">Status Atual</p>
                <p className="text-xs font-bold text-neutral-900">
                  {disciplina.nome} {disciplina.ativa ? "Ativa" : "Inativa"}
                </p>
              </div>
            </div>
            <div className="mt-3 h-1 overflow-hidden rounded-full bg-neutral-200">
              <div className="h-full w-[70%] rounded-full bg-[#a8501a]" />
            </div>
            <p className="mt-2 text-[9px] leading-snug text-neutral-500">
              70% dos alunos matriculados nesta disciplina completaram as tarefas desta semana.
            </p>
          </div>
        </aside>

        {/* Formulário */}
        <form
          onSubmit={salvar}
          className="space-y-5 rounded-[2rem] bg-white p-7 shadow-xl shadow-orange-900/5"
        >
          <div>
            <label htmlFor="nome" className={classeRotulo}>
              <Icone>
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </Icone>
              Nome da Disciplina
            </label>
            <input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className={`${classeCampo} rounded-full`}
            />
            {erro && <p className="mt-1 text-xs text-red-600">{erro}</p>}
          </div>

          <div>
            <p className={classeRotulo}>
              <Icone>
                <path d="M20.59 13.41 13.42 20.58a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                <line x1="7" y1="7" x2="7.01" y2="7" />
              </Icone>
              Categoria
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {CATEGORIAS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategoria(c)}
                  className={`rounded-full border px-3 py-2.5 text-xs font-bold ${
                    categoria === c
                      ? "border-orange-400 bg-orange-100 text-orange-800"
                      : "border-transparent bg-[#f1eceb] text-neutral-700 hover:bg-orange-50"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="descricao" className={classeRotulo}>
              <Icone>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </Icone>
              Descrição da Disciplina
            </label>
            <textarea
              id="descricao"
              rows={5}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className={`${classeCampo} rounded-3xl leading-relaxed`}
            />
          </div>

          <div className="flex items-center justify-end gap-6 border-t border-neutral-100 pt-5">
            <Link href="/disciplinas" className="text-sm font-semibold text-neutral-700">
              Cancelar
            </Link>
            <button
              type="submit"
              className="rounded-full bg-gradient-to-r from-[#8f3d0a] to-[#e8731a] px-7 py-3 text-sm font-bold text-white shadow-lg shadow-orange-900/20"
            >
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>

      {/* Professores vinculados */}
      <section>
        <h2 className="mb-3 text-sm font-bold text-neutral-900">Professores Vinculados</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {professores.map((id) => {
            const p = PROFESSORES.find((x) => x.id === id);
            if (!p) return null;
            return (
              <div
                key={id}
                className="group relative flex items-center gap-3 rounded-full bg-[#efe9e6] px-4 py-3"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-200 text-sm font-bold text-orange-800">
                  {iniciais(p.nome)}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-neutral-900">{p.nome}</p>
                  <p className="truncate text-xs text-neutral-500">{p.especialidade}</p>
                </div>
                <button
                  type="button"
                  aria-label={`Desvincular ${p.nome}`}
                  onClick={() => setProfessores(professores.filter((x) => x !== id))}
                  className="absolute right-4 text-neutral-400 opacity-0 transition hover:text-red-600 focus:opacity-100 group-hover:opacity-100"
                >
                  ×
                </button>
              </div>
            );
          })}

          <div className="relative">
            <button
              type="button"
              onClick={() => setSeletorAberto(!seletorAberto)}
              className="flex h-full min-h-16 w-full items-center justify-center gap-2 rounded-full border-2 border-dashed border-orange-300 text-sm font-semibold text-neutral-700 hover:bg-orange-50"
            >
              <span aria-hidden="true">+</span> Vincular Professor
            </button>
            {seletorAberto && (
              <ul className="absolute left-0 right-0 top-full z-10 mt-2 overflow-hidden rounded-2xl border border-neutral-200 bg-white text-sm shadow-lg">
                {disponiveis.length === 0 ? (
                  <li className="px-4 py-3 text-neutral-500">Nenhum professor disponível.</li>
                ) : (
                  disponiveis.map((p) => (
                    <li key={p.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setProfessores([...professores, p.id]);
                          setSeletorAberto(false);
                        }}
                        className="flex w-full justify-between px-4 py-2 text-left hover:bg-orange-50"
                      >
                        <span>{p.nome}</span>
                        <span className="text-xs text-neutral-500">{p.especialidade}</span>
                      </button>
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default function EditarDisciplina({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const disciplina = DISCIPLINAS.find((d) => d.id === Number(id));

  if (!disciplina) {
    return (
      <div className="mx-auto max-w-5xl py-10 text-center text-sm text-neutral-500">
        Disciplina não encontrada.{" "}
        <Link href="/disciplinas" className="font-semibold text-[#a8501a]">
          Voltar para a lista
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <Edicao disciplina={disciplina} />
    </div>
  );
}