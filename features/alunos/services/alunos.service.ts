import type { Aluno, Responsavel, ResponsavelInput } from "../types";

/**
 * Contrato da camada de dados de Alunos. As telas só conhecem estas interfaces.
 * Para integrar a API REST, crie uma nova implementação (ex.: alunos.api.ts)
 * e troque a exportação em ./index.ts.
 */
export interface AlunosService {
  listar(): Promise<Aluno[]>;
  /** O aluno criado entra no topo da lista. */
  criar(aluno: Aluno): Promise<Aluno>;
  atualizar(aluno: Aluno): Promise<Aluno>;
  /** Inativa (`false`) ou reativa (`true`). Nenhum cadastro é excluído de forma permanente. */
  alterarStatus(id: string, ativo: boolean): Promise<void>;
}

export interface ResponsaveisService {
  listar(): Promise<Responsavel[]>;
  criar(dados: ResponsavelInput): Promise<Responsavel>;
}

export class AlunoNaoEncontradoError extends Error {
  constructor() {
    super("Aluno não encontrado.");
    this.name = "AlunoNaoEncontradoError";
  }
}
