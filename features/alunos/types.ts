export type StatusAluno = "Ativo" | "Inativo";
export type FiltroStatusAluno = "Todos" | StatusAluno;

export interface RegistroPagamento {
  id: string;
  description: string;
  date: string;
  amount: string;
  status: "Pago" | "Pendente";
}

export interface Aluno {
  id: string;
  name: string;
  initials: string;
  avatarBg: string;
  avatarText: string;
  photo?: string;
  guardian: string;
  guardianRole?: string;
  guardianPhone?: string;
  guardianPhoto?: string;
  email?: string;
  rg?: string;
  cpf?: string;
  birthDate?: string;
  schoolGrade?: string;
  schoolName?: string;
  cep?: string;
  address?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  plan: string;
  planPrice?: string;
  planBadgeType: "orange" | "gray";
  status: StatusAluno;
  grade?: string;
  shift?: string;
  joinedDate?: string;
  renewalDate?: string;
  paymentHistory?: RegistroPagamento[];
}

export interface Responsavel {
  id: string;
  name: string;
  role: string;
  phone: string;
  photo?: string;
  cpf?: string;
  rg?: string;
  email?: string;
  cep?: string;
  address?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
}

export type ResponsavelInput = Omit<Responsavel, "id">;

/** Rascunho do formulário "Cadastro de Novo Aluno". */
export interface CadastroAlunoForm {
  name: string;
  birthDate: string;
  rg: string;
  cpf: string;
  phone: string;
  schoolGrade: string;
  schoolName: string;
  cep: string;
  address: string;
  number: string;
  complement: string;
  neighborhood: string;
  state: string;
  city: string;
  /** Apenas responsáveis cadastrados pelo usuário em "Criar Novo Responsável". */
  selectedResponsibleId: string;
  selectedPlan: string;
  photo: string;
  responsibleSearch: string;
}

/** Formulário da tela "Cadastro de Responsável". */
export interface CadastroResponsavelForm {
  name: string;
  photo: string;
  cpf: string;
  rg: string;
  email: string;
  phone: string;
  cep: string;
  address: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
}
