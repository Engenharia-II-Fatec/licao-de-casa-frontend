import type {
  Disciplina,
  DisciplinaAtualizacao,
  DisciplinaDetalhe,
  DisciplinaInput,
  ProfessorOpcao,
} from "../types";

/** Contrato da camada de dados de Disciplinas. As telas só conhecem esta interface. */
export interface DisciplinasService {
  listar(): Promise<Disciplina[]>;
  buscarPorId(id: number): Promise<DisciplinaDetalhe | null>;
  criar(dados: DisciplinaInput): Promise<Disciplina>;
  atualizar(id: number, dados: DisciplinaAtualizacao): Promise<Disciplina>;
  /** Inativa (`false`) ou reativa (`true`). Nenhum cadastro é excluído de forma permanente. */
  alterarStatus(id: number, ativo: boolean): Promise<void>;
  /** Professores que podem ser vinculados à disciplina. */
  listarProfessores(): Promise<ProfessorOpcao[]>;
}

export class DisciplinaNaoEncontradaError extends Error {
  constructor() {
    super("Disciplina não encontrada.");
    this.name = "DisciplinaNaoEncontradaError";
  }
}
