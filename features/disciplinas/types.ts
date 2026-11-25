import type { AREAS } from "./constants";

export type Area = (typeof AREAS)[number];

/** Disciplina como vem da listagem da API. */
export interface Disciplina {
  id: number;
  nome: string;
  area: Area;
  descricao: string;
  cargaHoraria: number;
  alunos: number;
  professor: string;
  ativa: boolean;
}

/** Disciplina com os dados extras do `GET /api/disciplinas/[id]`. */
export interface DisciplinaDetalhe extends Disciplina {
  ementa: string | null;
  professoresIds: number[];
}

/** Corpo do cadastro (`POST`). */
export interface DisciplinaInput {
  nome: string;
  area: Area;
  cargaHoraria: number;
  ativa: boolean;
  ementa: string;
  professores: number[];
}

/** Corpo da edição (`PUT`): só os campos enviados são alterados. */
export type DisciplinaAtualizacao = Partial<DisciplinaInput> & { descricao?: string };

/** Professor oferecido para vincular à disciplina. */
export interface ProfessorOpcao {
  id: number;
  nome: string;
  especialidade: string;
  ativo: boolean;
}
