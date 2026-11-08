import type { Aluno, Responsavel, ResponsavelInput } from "../types";
import {
  AlunoNaoEncontradoError,
  type AlunosService,
  type ResponsaveisService,
} from "./alunos.service";
import { AlunosLocalStorageService, ResponsaveisLocalStorageService } from "./alunos.local-storage";

export class AlunosApiService implements AlunosService {
  private fallback = new AlunosLocalStorageService();

  async listar(): Promise<Aluno[]> {
    try {
      const res = await fetch("/api/alunos", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch {
      return this.fallback.listar();
    }
  }

  async criar(aluno: Aluno): Promise<Aluno> {
    try {
      const res = await fetch("/api/alunos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(aluno),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Erro ao salvar aluno no banco.");
      }
      const salvo = await res.json();
      await this.fallback.criar(salvo).catch(() => null);
      return salvo;
    } catch (e) {
      if (e instanceof Error && e.message.includes("banco")) throw e;
      return this.fallback.criar(aluno);
    }
  }

  async atualizar(aluno: Aluno): Promise<Aluno> {
    try {
      const res = await fetch(`/api/alunos/${encodeURIComponent(aluno.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(aluno),
      });
      if (res.status === 404) throw new AlunoNaoEncontradoError();
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Erro ao atualizar aluno no banco.");
      }
      const salvo = await res.json();
      await this.fallback.atualizar(salvo).catch(() => null);
      return salvo;
    } catch (e) {
      if (e instanceof AlunoNaoEncontradoError) throw e;
      return this.fallback.atualizar(aluno);
    }
  }

  async excluir(id: string): Promise<void> {
    try {
      const res = await fetch(`/api/alunos/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Erro ao excluir aluno.");
      await this.fallback.excluir(id).catch(() => null);
    } catch {
      await this.fallback.excluir(id);
    }
  }
}

export class ResponsaveisApiService implements ResponsaveisService {
  private fallback = new ResponsaveisLocalStorageService();

  async listar(): Promise<Responsavel[]> {
    try {
      const res = await fetch("/api/responsaveis", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch {
      return this.fallback.listar();
    }
  }

  async criar(dados: ResponsavelInput): Promise<Responsavel> {
    try {
      const res = await fetch("/api/responsaveis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Erro ao salvar responsável no banco.");
      }
      const salvo = await res.json();
      await this.fallback.criar(salvo).catch(() => null);
      return salvo;
    } catch {
      return this.fallback.criar(dados);
    }
  }
}
