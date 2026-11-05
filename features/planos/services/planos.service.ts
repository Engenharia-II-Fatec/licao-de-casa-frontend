import type { Plano, PlanoFiltro, PlanoInput } from "../types";

/**
 * Contrato da camada de dados de Planos. As telas só conhecem esta interface.
 * Para integrar a API REST (Java/Spring Boot), crie uma nova implementação
 * (ex.: planos.api.ts) e troque a exportação em ./index.ts.
 */
export interface PlanosService {
  listar(filtro?: PlanoFiltro): Promise<Plano[]>;
  buscarPorId(id: string): Promise<Plano | null>;
  criar(dados: PlanoInput): Promise<Plano>;
  atualizar(id: string, dados: PlanoInput): Promise<Plano>;
  excluir(id: string): Promise<void>;
}

export class PlanoNaoEncontradoError extends Error {
  constructor() {
    super("Plano não encontrado.");
    this.name = "PlanoNaoEncontradoError";
  }
}

export class PlanoDuplicadoError extends Error {
  constructor() {
    super("Já existe um plano com este nome.");
    this.name = "PlanoDuplicadoError";
  }
}
