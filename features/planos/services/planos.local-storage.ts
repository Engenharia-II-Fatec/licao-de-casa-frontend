import { gravarJson, lerJson } from "@/lib/storage/local-storage";
import { criarSeedPlanos } from "../mock-data";
import type { Plano, PlanoFiltro, PlanoInput } from "../types";
import {
  PlanoDuplicadoError,
  PlanoNaoEncontradoError,
  type PlanosService,
} from "./planos.service";

const CHAVE = "licao:planos:v1";

function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

function carregar(): Plano[] {
  const salvos = lerJson<Plano[]>(CHAVE);
  if (Array.isArray(salvos)) return salvos;
  const seed = criarSeedPlanos();
  gravarJson(CHAVE, seed);
  return seed;
}

function nomeEmUso(planos: Plano[], nome: string, ignorarId?: string): boolean {
  const alvo = normalizar(nome);
  return planos.some((p) => p.id !== ignorarId && normalizar(p.nome) === alvo);
}

export class PlanosLocalStorageService implements PlanosService {
  async listar(filtro: PlanoFiltro = {}): Promise<Plano[]> {
    const busca = normalizar(filtro.busca ?? "");
    return carregar()
      .filter((p) => !filtro.status || p.status === filtro.status)
      .filter(
        (p) =>
          !busca ||
          normalizar(p.nome).includes(busca) ||
          normalizar(p.descricao).includes(busca),
      )
      .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
  }

  async buscarPorId(id: string): Promise<Plano | null> {
    return carregar().find((p) => p.id === id) ?? null;
  }

  async criar(dados: PlanoInput): Promise<Plano> {
    const planos = carregar();
    if (nomeEmUso(planos, dados.nome)) throw new PlanoDuplicadoError();
    const agora = new Date().toISOString();
    const novo: Plano = {
      ...dados,
      id: crypto.randomUUID(),
      criadoEm: agora,
      atualizadoEm: agora,
    };
    gravarJson(CHAVE, [...planos, novo]);
    return novo;
  }

  async atualizar(id: string, dados: PlanoInput): Promise<Plano> {
    const planos = carregar();
    const atual = planos.find((p) => p.id === id);
    if (!atual) throw new PlanoNaoEncontradoError();
    if (nomeEmUso(planos, dados.nome, id)) throw new PlanoDuplicadoError();
    const atualizado: Plano = {
      ...dados,
      id,
      criadoEm: atual.criadoEm,
      atualizadoEm: new Date().toISOString(),
    };
    gravarJson(
      CHAVE,
      planos.map((p) => (p.id === id ? atualizado : p)),
    );
    return atualizado;
  }

  async excluir(id: string): Promise<void> {
    const planos = carregar();
    if (!planos.some((p) => p.id === id)) throw new PlanoNaoEncontradoError();
    gravarJson(
      CHAVE,
      planos.filter((p) => p.id !== id),
    );
  }
}
