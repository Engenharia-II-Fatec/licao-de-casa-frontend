import type { CadastroAlunoForm, CadastroResponsavelForm } from "./types";

export const FILTRO_PLANO_TODOS = "Todos os Planos";

/** Siglas das 27 unidades federativas do Brasil, em ordem alfabética. */
export const UFS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO",
  "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI",
  "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
] as const;

export const OPCOES_UF = UFS.map((uf) => ({ value: uf, label: uf }));

export const CADASTRO_ALUNO_INICIAL: CadastroAlunoForm = {
  name: "",
  birthDate: "",
  rg: "",
  cpf: "",
  phone: "",
  schoolGrade: "Ensino Fundamental I",
  schoolName: "",
  cep: "",
  address: "",
  number: "",
  complement: "",
  neighborhood: "",
  state: "SP",
  city: "São Paulo",
  selectedResponsibleId: "",
  // O plano "Recomendado" vem selecionado por padrão.
  selectedPlan: "Atelier Total",
  photo: "",
  responsibleSearch: "",
};

export const CADASTRO_RESPONSAVEL_INICIAL: CadastroResponsavelForm = {
  name: "",
  photo: "",
  cpf: "",
  rg: "",
  email: "",
  phone: "",
  cep: "",
  address: "",
  number: "",
  complement: "",
  neighborhood: "",
  city: "",
  state: "",
};
