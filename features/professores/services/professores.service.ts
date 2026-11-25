import type { DisciplinaOpcao, Professor, ProfessorDetalhe, ProfessorInput } from "../types";

/** Contrato da camada de dados de Professores. As telas só conhecem esta interface. */
export interface ProfessoresService {
  listar(): Promise<Professor[]>;
  buscarPorId(id: number): Promise<ProfessorDetalhe | null>;
  criar(dados: ProfessorInput): Promise<Professor>;
  atualizar(id: number, dados: ProfessorInput): Promise<ProfessorDetalhe>;
  /** Inativa (`false`) ou reativa (`true`) sem apagar vínculos nem histórico. */
  alterarStatus(id: number, ativo: boolean): Promise<ProfessorDetalhe>;
  excluir(id: number): Promise<void>;
  /** Disciplinas que podem ser vinculadas ao professor. */
  listarDisciplinas(): Promise<DisciplinaOpcao[]>;
  /** Endereço para visualizar/baixar o currículo salvo. */
  urlCurriculo(id: number): string;
}

export class ProfessorNaoEncontradoError extends Error {
  constructor() {
    super("Professor não encontrado.");
    this.name = "ProfessorNaoEncontradoError";
  }
}

/** O professor tem aulas na agenda e não pode ser excluído (só inativado). */
export class ProfessorComAulasError extends Error {
  constructor(mensagem: string) {
    super(mensagem);
    this.name = "ProfessorComAulasError";
  }
}
