import type { Responsavel, ResponsavelInput } from "@/features/alunos/types";

export type { Responsavel, ResponsavelInput };

/** Aluno exibido junto do responsável (listagem e "Alunos Vinculados"). */
export interface DependenteResumo {
  id: string;
  name: string;
  initials: string;
  avatarBg: string;
  avatarText: string;
  photo?: string;
  plan: string;
  planPrice?: string;
  status: "Ativo" | "Inativo";
  schoolGrade?: string;
}

interface ResponsavelComStatus extends Responsavel {
  ativo: boolean;
  /** ISO 8601 — exibido como "Cadastrado em mês/ano". */
  createdAt: string;
}

/** Linha da listagem de responsáveis. */
export interface ResponsavelResumo extends ResponsavelComStatus {
  dependentes: DependenteResumo[];
  /** Quantidade de pagamentos pendentes somando todos os dependentes. */
  pagamentosPendentes: number;
}

export interface PagamentoResponsavel {
  id: string;
  alunoId: string;
  alunoNome: string;
  description: string;
  date: string;
  amount: string;
  status: "Pago" | "Pendente";
}

/** Tela de edição: dados do responsável, alunos vinculados e histórico financeiro. */
export interface ResponsavelDetalhe extends ResponsavelComStatus {
  dependentes: DependenteResumo[];
  pagamentos: PagamentoResponsavel[];
}

export type FiltroStatusFinanceiro = "Todos" | "Em dia" | "Pendente" | "Inativo";
