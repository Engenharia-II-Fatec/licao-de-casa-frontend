import type {
  Disciplina,
  DisciplinaAtualizacao,
  DisciplinaDetalhe,
  DisciplinaInput,
  ProfessorOpcao,
} from "../types";
import { DisciplinaNaoEncontradaError, type DisciplinasService } from "./disciplinas.service";

async function mensagemDeErro(res: Response, padrao: string): Promise<string> {
  const corpo = await res.json().catch(() => ({}));
  return typeof corpo.error === "string" ? corpo.error : padrao;
}

const JSON_HEADERS = { "Content-Type": "application/json" };

export class DisciplinasApiService implements DisciplinasService {
  async listar(): Promise<Disciplina[]> {
    const res = await fetch("/api/disciplinas", { cache: "no-store" });
    if (!res.ok) throw new Error(await mensagemDeErro(res, "Erro ao carregar as disciplinas."));
    return res.json();
  }

  async buscarPorId(id: number): Promise<DisciplinaDetalhe | null> {
    const res = await fetch(`/api/disciplinas/${id}`, { cache: "no-store" });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(await mensagemDeErro(res, "Erro ao carregar a disciplina."));
    return res.json();
  }

  async criar(dados: DisciplinaInput): Promise<Disciplina> {
    const res = await fetch("/api/disciplinas", {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify(dados),
    });
    if (!res.ok) throw new Error(await mensagemDeErro(res, "Erro ao cadastrar a disciplina."));
    return res.json();
  }

  async atualizar(id: number, dados: DisciplinaAtualizacao): Promise<Disciplina> {
    const res = await fetch(`/api/disciplinas/${id}`, {
      method: "PUT",
      headers: JSON_HEADERS,
      body: JSON.stringify(dados),
    });
    if (res.status === 404) throw new DisciplinaNaoEncontradaError();
    if (!res.ok) throw new Error(await mensagemDeErro(res, "Erro ao salvar a disciplina."));
    return res.json();
  }

  async alterarStatus(id: number, ativo: boolean): Promise<void> {
    const res = await fetch(`/api/disciplinas/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ativo }),
    });
    if (res.status === 404) throw new DisciplinaNaoEncontradaError();
    if (!res.ok) throw new Error(await mensagemDeErro(res, "Erro ao alterar o status da disciplina."));
  }

  async listarProfessores(): Promise<ProfessorOpcao[]> {
    const res = await fetch("/api/professores", { cache: "no-store" });
    if (!res.ok) throw new Error(await mensagemDeErro(res, "Erro ao carregar os professores."));
    const lista: { id: number; nome: string; especialidade?: string | null; ativo: boolean }[] =
      await res.json();
    return lista.map(({ id, nome, especialidade, ativo }) => ({
      id,
      nome,
      especialidade: especialidade ?? "",
      ativo,
    }));
  }
}
