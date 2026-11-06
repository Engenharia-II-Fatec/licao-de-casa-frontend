"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AREAS, PROFESSORES, type Area } from "./dados";

export type DadosFormulario = {
  nome: string;
  cargaHoraria: string;
  ativa: boolean;
  area: Area | "";
  ementa: string;
  professores: number[];
};

const VAZIO: DadosFormulario = {
  nome: "",
  cargaHoraria: "",
  ativa: true,
  area: "",
  ementa: "",
  professores: [],
};

type Props = {
  inicial?: DadosFormulario;
  textoBotao: string;
};

export default function FormularioDisciplina({ inicial = VAZIO, textoBotao }: Props) {
  const router = useRouter();
  const [dados, setDados] = useState<DadosFormulario>(inicial);
  const [busca, setBusca] = useState("");
  const [erros, setErros] = useState<Record<string, string>>({});

  function atualizar<K extends keyof DadosFormulario>(campo: K, valor: DadosFormulario[K]) {
    setDados((atual) => ({ ...atual, [campo]: valor }));
  }

  const sugestoes = busca.trim()
    ? PROFESSORES.filter(
        (p) =>
          !dados.professores.includes(p.id) &&
          `${p.nome} ${p.especialidade}`.toLowerCase().includes(busca.toLowerCase())
      )
    : [];

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    const novos: Record<string, string> = {};
    if (!dados.nome.trim()) novos.nome = "Informe o nome da disciplina.";
    if (!dados.cargaHoraria || Number(dados.cargaHoraria) <= 0)
      novos.cargaHoraria = "Informe a carga horária semanal.";
    if (!dados.area) novos.area = "Selecione uma área de conhecimento.";
    setErros(novos);
    if (Object.keys(novos).length > 0) return;

    // Simulação: quando o back-end existir, a chamada à API entra aqui.
    alert("Disciplina salva com sucesso (simulação).");
    router.push("/disciplinas");
  }

  return (
    <form onSubmit={enviar} className="space-y-6 rounded-3xl bg-white p-6 shadow-sm">
      <h2 className="text-xs font-bold uppercase tracking-wide text-[#a8501a]">
        Informações básicas
      </h2>

      <div>
        <label htmlFor="nome" className="mb-1 block text-sm font-semibold">
          Nome da Disciplina *
        </label>
        <input
          id="nome"
          value={dados.nome}
          onChange={(e) => atualizar("nome", e.target.value)}
          placeholder="Ex: Matemática Aplicada e Resolução de Problemas"
          className="w-full rounded-full bg-[#f7f3f1] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-400"
        />
        {erros.nome && <p className="mt-1 text-xs text-red-600">{erros.nome}</p>}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="carga" className="mb-1 block text-sm font-semibold">
            Carga Horária Semanal *
          </label>
          <input
            id="carga"
            type="number"
            min={1}
            max={40}
            value={dados.cargaHoraria}
            onChange={(e) => atualizar("cargaHoraria", e.target.value)}
            placeholder="Ex: 4 horas/semana"
            className="w-full rounded-full bg-[#f7f3f1] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-400"
          />
          {erros.cargaHoraria && (
            <p className="mt-1 text-xs text-red-600">{erros.cargaHoraria}</p>
          )}
        </div>

        <div>
          <span className="mb-1 block text-sm font-semibold">Status da Disciplina</span>
          <div className="flex items-center justify-between rounded-full bg-[#f7f3f1] px-4 py-3">
            <span className="flex items-center gap-2 text-sm font-semibold">
              <span
                className={`h-2 w-2 rounded-full ${dados.ativa ? "bg-green-500" : "bg-neutral-400"}`}
              />
              {dados.ativa ? "Ativa no Período Letivo" : "Inativa"}
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={dados.ativa}
              onClick={() => atualizar("ativa", !dados.ativa)}
              className={`relative h-6 w-11 rounded-full transition ${
                dados.ativa ? "bg-orange-500" : "bg-neutral-300"
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${
                  dados.ativa ? "left-5" : "left-0.5"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      <div>
        <span className="mb-2 block text-sm font-semibold">Área de Conhecimento / Categoria *</span>
        <div className="flex flex-wrap gap-2">
          {AREAS.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => atualizar("area", a)}
              className={`rounded-full px-4 py-2 text-xs font-bold ${
                dados.area === a
                  ? "bg-orange-200 text-orange-800 ring-1 ring-orange-400"
                  : "bg-[#f7f3f1] text-neutral-600 hover:bg-orange-50"
              }`}
            >
              {a}
            </button>
          ))}
        </div>
        {erros.area && <p className="mt-1 text-xs text-red-600">{erros.area}</p>}
      </div>

      <div>
        <label htmlFor="ementa" className="mb-1 block text-sm font-semibold">
          Descrição Pedagógica / Ementa{" "}
          <span className="text-xs font-normal text-neutral-400">(opcional)</span>
        </label>
        <textarea
          id="ementa"
          rows={4}
          value={dados.ementa}
          onChange={(e) => atualizar("ementa", e.target.value)}
          placeholder="Descreva resumidamente os objetivos pedagógicos, temas principais abordados e proposta curricular desta matéria..."
          className="w-full rounded-3xl bg-[#f7f3f1] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-400"
        />
      </div>

      <div>
        <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#a8501a]">
          Professores responsáveis / instrutores
        </h2>
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Pesquisar professor por nome ou especialidade para vincular..."
          className="w-full rounded-full bg-[#f7f3f1] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-400"
        />
        {sugestoes.length > 0 && (
          <ul className="mt-2 overflow-hidden rounded-2xl border border-neutral-200 bg-white text-sm">
            {sugestoes.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => {
                    atualizar("professores", [...dados.professores, p.id]);
                    setBusca("");
                  }}
                  className="flex w-full justify-between px-4 py-2 text-left hover:bg-orange-50"
                >
                  <span>{p.nome}</span>
                  <span className="text-xs text-neutral-500">{p.especialidade}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-3 flex flex-wrap gap-2">
          {dados.professores.map((id) => {
            const p = PROFESSORES.find((x) => x.id === id);
            if (!p) return null;
            return (
              <span
                key={id}
                className="flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-900"
              >
                {p.nome} ({p.especialidade})
                <button
                  type="button"
                  aria-label={`Remover ${p.nome}`}
                  onClick={() =>
                    atualizar("professores", dados.professores.filter((x) => x !== id))
                  }
                >
                  ×
                </button>
              </span>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl bg-blue-50 p-4 text-xs text-blue-900">
        Após cadastrar a disciplina, você poderá criar questionários avaliativos, vincular
        turmas ou horários semanais na agenda escolar do módulo de alunos.
      </div>

      <div className="flex items-center justify-end gap-4">
        <Link href="/disciplinas" className="text-sm font-semibold text-neutral-600">
          Cancelar
        </Link>
        <button
          type="submit"
          className="rounded-full bg-gradient-to-r from-[#a8501a] to-[#ea7a1a] px-6 py-3 text-sm font-bold text-white shadow"
        >
          {textoBotao}
        </button>
      </div>
    </form>
  );
}