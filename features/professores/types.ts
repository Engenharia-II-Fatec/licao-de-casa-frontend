export type SituacaoProfessor = "Disponível" | "Em aula" | "Inativo";

export interface DisciplinaResumo {
  id: number;
  nome: string;
  area: string;
}

/** Disciplina oferecida para vincular ao professor. */
export interface DisciplinaOpcao extends DisciplinaResumo {
  ativa: boolean;
}

export interface CurriculoInfo {
  nome: string;
  tipo: string;
}

/** Professor como vem da API (listagem e base do detalhe). */
export interface Professor {
  id: number;
  nome: string;
  especialidade?: string;
  email?: string;
  telefone?: string;
  foto?: string;
  cpf?: string;
  rg?: string;
  /** "AAAA-MM-DD" */
  dataNascimento?: string;
  valorHoraAula?: number;
  formacao?: string;
  curriculo?: CurriculoInfo;
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  ativo: boolean;
  situacao: SituacaoProfessor;
  /** ISO 8601 */
  createdAt: string;
  disciplinas: DisciplinaResumo[];
}

export interface ResumoAtividades {
  aulasConcluidas: number;
  proximasAulas: number;
  alunosAtendidos: number;
}

export interface ProfessorDetalhe extends Professor {
  resumo: ResumoAtividades;
}

/** Arquivo novo escolhido no formulário (data URL). */
export interface CurriculoArquivo extends CurriculoInfo {
  dados: string;
}

/** Corpo enviado para criar/atualizar. `curriculo`: undefined = manter, null = remover. */
export interface ProfessorInput {
  nome: string;
  email: string;
  telefone: string;
  foto: string;
  cpf: string;
  rg: string;
  dataNascimento: string;
  valorHoraAula: number | null;
  formacao: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
  disciplinaIds: number[];
  curriculo?: CurriculoArquivo | null;
}

export type FiltroSituacao = "Todos" | SituacaoProfessor;
