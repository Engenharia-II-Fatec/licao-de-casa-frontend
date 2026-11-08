import type { Plano, PlanoFiltro, PlanoInput } from "../types";
import {
  PlanoDuplicadoError,
  PlanoNaoEncontradoError,
  type PlanosService,
} from "./planos.service";
import { PlanosLocalStorageService } from "./planos.local-storage";

export class PlanosApiService implements PlanosService {
  private fallback = new PlanosLocalStorageService();

  async listar(filtro: PlanoFiltro = {}): Promise<Plano[]> {
    try {
      const params = new URLSearchParams();
      if (filtro.busca) params.set("busca", filtro.busca);
      if (filtro.status) params.set("status", filtro.status);

      const qs = params.toString() ? `?${params.toString()}` : "";
      const res = await fetch(`/api/planos${qs}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch {
      return this.fallback.listar(filtro);
    }
  }

  async buscarPorId(id: string): Promise<Plano | null> {
    try {
      const res = await fetch(`/api/planos/${encodeURIComponent(id)}`, { cache: "no-store" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch {
      return this.fallback.buscarPorId(id);
    }
  }

  async criar(dados: PlanoInput): Promise<Plano> {
    try {
      const res = await fetch("/api/planos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados),
      });

      if (res.status === 409) {
        throw new PlanoDuplicadoError();
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Erro ao salvar plano no banco.");
      }

      const salvo = await res.json();
      await this.fallback.criar(dados).catch(() => null);
      return salvo;
    } catch (e) {
      if (e instanceof PlanoDuplicadoError) throw e;
      return this.fallback.criar(dados);
    }
  }

  async atualizar(id: string, dados: PlanoInput): Promise<Plano> {
    try {
      const res = await fetch(`/api/planos/${encodeURIComponent(id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados),
      });

      if (res.status === 404) throw new PlanoNaoEncontradoError();
      if (res.status === 409) throw new PlanoDuplicadoError();
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Erro ao atualizar plano no banco.");
      }

      const salvo = await res.json();
      await this.fallback.atualizar(id, dados).catch(() => null);
      return salvo;
    } catch (e) {
      if (e instanceof PlanoNaoEncontradoError || e instanceof PlanoDuplicadoError) throw e;
      return this.fallback.atualizar(id, dados);
    }
  }

  async excluir(id: string): Promise<void> {
    try {
      const res = await fetch(`/api/planos/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Erro ao excluir plano.");
      await this.fallback.excluir(id).catch(() => null);
    } catch {
      await this.fallback.excluir(id);
    }
  }
}
