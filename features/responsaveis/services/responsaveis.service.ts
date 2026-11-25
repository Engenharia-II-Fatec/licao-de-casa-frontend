import type { ResponsavelDetalhe, ResponsavelInput, ResponsavelResumo } from "../types";

/**
 * Contrato da camada de dados de Responsáveis. As telas só conhecem esta interface.
 * O cadastro de responsável continua em `features/alunos` (fluxo de "Novo Aluno").
 */
export interface ResponsaveisDetalheService {
  listar(): Promise<ResponsavelResumo[]>;
  buscarPorId(id: string): Promise<ResponsavelDetalhe | null>;
  atualizar(id: string, dados: ResponsavelInput): Promise<ResponsavelDetalhe>;
  /** Inativa (`false`) ou reativa (`true`) sem apagar dependentes nem histórico. */
  alterarStatus(id: string, ativo: boolean): Promise<ResponsavelDetalhe>;
  /** Vincula um aluno já cadastrado a este responsável (troca o responsável anterior, se houver). */
  vincularAluno(id: string, alunoId: string): Promise<ResponsavelDetalhe>;
  excluir(id: string): Promise<void>;
}

export class ResponsavelNaoEncontradoError extends Error {
  constructor() {
    super("Responsável não encontrado.");
    this.name = "ResponsavelNaoEncontradoError";
  }
}

/** O responsável ainda tem alunos vinculados e não pode ser excluído. */
export class ResponsavelComDependentesError extends Error {
  constructor(mensagem: string) {
    super(mensagem);
    this.name = "ResponsavelComDependentesError";
  }
}
