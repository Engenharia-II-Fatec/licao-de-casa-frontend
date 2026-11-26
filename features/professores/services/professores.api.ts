import type { DisciplinaOpcao, Professor, ProfessorDetalhe, ProfessorInput } from "../types";
import {
  ProfessorNaoEncontradoError,
  type ProfessoresService,
} from "./professores.service";

async function mensagemDeErro(res: Response, padrao: string): Promise<string> {
  const corpo = await res.json().catch(() => ({}));
  return typeof corpo.error === "string" ? corpo.error : padrao;
}

const JSON_HEADERS = { "Content-Type": "application/json" };

export class ProfessoresApiService implements ProfessoresService {
  async listar(): Promise<Professor[]> {
    const res = await fetch("/api/professores", { cache: "no-store" });
    if (!res.ok) throw new Error(await mensagemDeErro(res, "Erro ao carregar professores."));
    return res.json();
  }

  async buscarPorId(id: number): Promise<ProfessorDetalhe | null> {
    const res = await fetch(`/api/professores/${id}`, { cache: "no-store" });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(await mensagemDeErro(res, "Erro ao carregar o professor."));
    return res.json();
  }

  async criar(dados: ProfessorInput): Promise<Professor> {
    const res = await fetch("/api/professores", {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify(dados),
    });
    if (!res.ok) throw new Error(await mensagemDeErro(res, "Erro ao cadastrar o professor."));
    return res.json();
  }

  async atualizar(id: number, dados: ProfessorInput): Promise<ProfessorDetalhe> {
    const res = await fetch(`/api/professores/${id}`, {
      method: "PUT",
      headers: JSON_HEADERS,
      body: JSON.stringify(dados),
    });
    if (res.status === 404) throw new ProfessorNaoEncontradoError();
    if (!res.ok) throw new Error(await mensagemDeErro(res, "Erro ao salvar o professor."));
    return res.json();
  }

  async alterarStatus(id: number, ativo: boolean): Promise<ProfessorDetalhe> {
    const res = await fetch(`/api/professores/${id}`, {
      method: "PATCH",
      headers: JSON_HEADERS,
      body: JSON.stringify({ ativo }),
    });
    if (res.status === 404) throw new ProfessorNaoEncontradoError();
    if (!res.ok) throw new Error(await mensagemDeErro(res, "Erro ao alterar o status do professor."));
    return res.json();
  }


  async listarDisciplinas(): Promise<DisciplinaOpcao[]> {
    const res = await fetch("/api/disciplinas", { cache: "no-store" });
    if (!res.ok) throw new Error(await mensagemDeErro(res, "Erro ao carregar as disciplinas."));
    const lista: { id: number; nome: string; area: string; ativa: boolean }[] = await res.json();
    return lista.map(({ id, nome, area, ativa }) => ({ id, nome, area, ativa }));
  }

  urlCurriculo(id: number): string {
    return `/api/professores/${id}/curriculo`;
  }
}
