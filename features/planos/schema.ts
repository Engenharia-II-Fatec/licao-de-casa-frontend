import { ehCorHex } from "@/lib/color";
import { parseMoeda } from "@/lib/format";
import { GRADIENTES_PREDEFINIDOS } from "./icones";
import type { IconePlanoId, Plano, PlanoCapa, PlanoInput, PlanoStatus } from "./types";

/** Valores do formulário (texto), antes da conversão para PlanoInput. */
export interface PlanoFormValues {
  nome: string;
  descricao: string;
  status: PlanoStatus;
  valorSobConsulta: boolean;
  valorMensal: string;
  aulasPersonalizadas: boolean;
  aulasIncluidas: string;
  beneficios: string[];
  icone: IconePlanoId;
  capa: PlanoCapa;
}

export type PlanoCampo =
  | "nome"
  | "descricao"
  | "valorMensal"
  | "aulasIncluidas"
  | "beneficios"
  | "capa";
export type PlanoErrors = Partial<Record<PlanoCampo, string>>;

export const LIMITES = {
  nomeMin: 3,
  nomeMax: 60,
  descricaoMax: 200,
  beneficioMax: 60,
  beneficiosQtd: 10,
  valorMax: 1_000_000,
  aulasMax: 200,
} as const;

export function formularioVazio(): PlanoFormValues {
  const g = GRADIENTES_PREDEFINIDOS[0];
  return {
    nome: "",
    descricao: "",
    status: "ATIVO",
    valorSobConsulta: false,
    valorMensal: "",
    aulasPersonalizadas: false,
    aulasIncluidas: "",
    beneficios: [],
    icone: "school",
    capa: { tipo: "gradiente", de: g.de, para: g.para },
  };
}

export function paraFormValues(p: Plano): PlanoFormValues {
  return {
    nome: p.nome,
    descricao: p.descricao,
    status: p.status,
    valorSobConsulta: p.valorMensal === null,
    valorMensal:
      p.valorMensal === null ? "" : p.valorMensal.toFixed(2).replace(".", ","),
    aulasPersonalizadas: p.aulasIncluidas === null,
    aulasIncluidas: p.aulasIncluidas === null ? "" : String(p.aulasIncluidas),
    beneficios: [...p.beneficios],
    icone: p.icone,
    capa: p.capa,
  };
}

export function validarPlano(v: PlanoFormValues): PlanoErrors {
  const e: PlanoErrors = {};

  const nome = v.nome.trim();
  if (!nome) e.nome = "Informe o nome do plano.";
  else if (nome.length < LIMITES.nomeMin)
    e.nome = `O nome deve ter ao menos ${LIMITES.nomeMin} caracteres.`;
  else if (nome.length > LIMITES.nomeMax)
    e.nome = `O nome deve ter no máximo ${LIMITES.nomeMax} caracteres.`;

  if (v.descricao.trim().length > LIMITES.descricaoMax)
    e.descricao = `A descrição deve ter no máximo ${LIMITES.descricaoMax} caracteres.`;

  if (!v.valorSobConsulta) {
    const valor = parseMoeda(v.valorMensal);
    if (!v.valorMensal.trim()) e.valorMensal = "Informe o valor ou marque “Consultar”.";
    else if (Number.isNaN(valor)) e.valorMensal = "Valor inválido. Ex: 450,00";
    else if (valor > LIMITES.valorMax) e.valorMensal = "Valor acima do permitido.";
  }

  if (!v.aulasPersonalizadas) {
    const aulas = Number(v.aulasIncluidas);
    if (!v.aulasIncluidas.trim())
      e.aulasIncluidas = "Informe as aulas ou marque “Personalizado”.";
    else if (!Number.isInteger(aulas) || aulas < 1)
      e.aulasIncluidas = "Use um número inteiro maior que zero.";
    else if (aulas > LIMITES.aulasMax) e.aulasIncluidas = "Quantidade acima do permitido.";
  }

  if (v.beneficios.length > LIMITES.beneficiosQtd)
    e.beneficios = `Máximo de ${LIMITES.beneficiosQtd} benefícios.`;

  if (v.capa.tipo === "gradiente") {
    if (!ehCorHex(v.capa.de) || !ehCorHex(v.capa.para)) e.capa = "Escolha cores válidas.";
  } else if (!v.capa.dataUrl) {
    e.capa = "Selecione uma imagem ou volte para o gradiente.";
  }

  return e;
}

/** Converte valores já validados em PlanoInput. */
export function paraInput(v: PlanoFormValues): PlanoInput {
  return {
    nome: v.nome.trim(),
    descricao: v.descricao.trim(),
    status: v.status,
    valorMensal: v.valorSobConsulta ? null : parseMoeda(v.valorMensal),
    aulasIncluidas: v.aulasPersonalizadas ? null : Number(v.aulasIncluidas),
    beneficios: v.beneficios,
    icone: v.icone,
    capa: v.capa,
  };
}
