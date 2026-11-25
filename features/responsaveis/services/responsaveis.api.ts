import type { ResponsavelDetalhe, ResponsavelInput, ResponsavelResumo } from "../types";
import {
  ResponsavelComDependentesError,
  ResponsavelNaoEncontradoError,
  type ResponsaveisDetalheService,
} from "./responsaveis.service";

async function mensagemDeErro(res: Response, padrao: string): Promise<string> {
  const corpo = await res.json().catch(() => ({}));
  return typeof corpo.error === "string" ? corpo.error : padrao;
}

export class ResponsaveisApiService implements ResponsaveisDetalheService {
  async listar(): Promise<ResponsavelResumo[]> {
    const res = await fetch("/api/responsaveis", { cache: "no-store" });
    if (!res.ok) throw new Error(await mensagemDeErro(res, "Erro ao carregar responsáveis."));
    return res.json();
  }

  async buscarPorId(id: string): Promise<ResponsavelDetalhe | null> {
    const res = await fetch(`/api/responsaveis/${encodeURIComponent(id)}`, { cache: "no-store" });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(await mensagemDeErro(res, "Erro ao carregar o responsável."));
    return res.json();
  }

  async atualizar(id: string, dados: ResponsavelInput): Promise<ResponsavelDetalhe> {
    const res = await fetch(`/api/responsaveis/${encodeURIComponent(id)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    });
    if (res.status === 404) throw new ResponsavelNaoEncontradoError();
    if (!res.ok) throw new Error(await mensagemDeErro(res, "Erro ao salvar o responsável."));
    return res.json();
  }

  async alterarStatus(id: string, ativo: boolean): Promise<ResponsavelDetalhe> {
    const res = await fetch(`/api/responsaveis/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ativo }),
    });
    if (res.status === 404) throw new ResponsavelNaoEncontradoError();
    if (!res.ok) throw new Error(await mensagemDeErro(res, "Erro ao alterar o status do responsável."));
    return res.json();
  }

  async vincularAluno(id: string, alunoId: string): Promise<ResponsavelDetalhe> {
    const res = await fetch(`/api/responsaveis/${encodeURIComponent(id)}/alunos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alunoId }),
    });
    if (!res.ok) throw new Error(await mensagemDeErro(res, "Erro ao vincular o aluno."));
    return res.json();
  }

  async excluir(id: string): Promise<void> {
    const res = await fetch(`/api/responsaveis/${encodeURIComponent(id)}`, { method: "DELETE" });
    if (res.status === 404) throw new ResponsavelNaoEncontradoError();
    if (res.status === 409) {
      throw new ResponsavelComDependentesError(
        await mensagemDeErro(res, "O responsável possui alunos vinculados."),
      );
    }
    if (!res.ok) throw new Error(await mensagemDeErro(res, "Erro ao excluir o responsável."));
  }
}
