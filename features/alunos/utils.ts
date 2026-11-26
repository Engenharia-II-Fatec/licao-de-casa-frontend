import { FILTRO_PLANO_TODOS } from "./constants";
import type { Aluno, FiltroStatusAluno, Responsavel } from "./types";

/** O aluno é o próprio responsável financeiro (titular da conta)? */
export function ehTitular(aluno: Aluno): boolean {
  if (!aluno.name || !aluno.guardian) return false;
  return aluno.name.trim().toLowerCase() === aluno.guardian.trim().toLowerCase();
}

export function calcularIniciais(nome: string): string {
  const partes = nome.split(" ");
  return partes.length > 1
    ? `${partes[0][0]}${partes[partes.length - 1][0]}`.toUpperCase()
    : partes[0].slice(0, 2).toUpperCase();
}

export function precoDoPlano(plano: string): string {
  if (plano === "Atelier 2×") return "R$ 450,00";
  if (plano === "Atelier Total") return "R$ 890,00";
  return "Consultar";
}

export function tipoBadgeDoPlano(plano: string): Aluno["planBadgeType"] {
  return plano.includes("Atelier") || plano.includes("Trimestral") ? "orange" : "gray";
}

export interface FiltroAlunos {
  busca: string;
  plano: string;
  status: FiltroStatusAluno;
}

export function filtrarAlunos(alunos: Aluno[], filtro: FiltroAlunos): Aluno[] {
  const busca = filtro.busca.toLowerCase();
  return alunos.filter((aluno) => {
    const correspondeBusca =
      aluno.name.toLowerCase().includes(busca) ||
      aluno.guardian.toLowerCase().includes(busca) ||
      aluno.id.includes(filtro.busca);

    const correspondePlano =
      filtro.plano === FILTRO_PLANO_TODOS ||
      (filtro.plano === "Pacote Mensal" && aluno.plan.includes("Mensal")) ||
      (filtro.plano === "Pacote Trimestral" && aluno.plan.includes("Trimestral")) ||
      (filtro.plano === "Aula Particular" && aluno.plan.includes("Particular")) ||
      (filtro.plano === "Atelier" && aluno.plan.includes("Atelier")) ||
      aluno.plan.toLowerCase().includes(filtro.plano.toLowerCase());

    const correspondeStatus = filtro.status === "Todos" || aluno.status === filtro.status;

    return correspondeBusca && correspondePlano && correspondeStatus;
  });
}

/** Vincula o aluno a um responsável cadastrado, mantendo `guardian*` e `responsavelId` em sincronia. */
export function vincularResponsavel(aluno: Aluno, responsavel: Responsavel): Aluno {
  return {
    ...aluno,
    responsavelId: responsavel.id,
    guardian: responsavel.name,
    guardianRole: `${responsavel.role} • Principal`,
    guardianPhone: responsavel.phone,
    guardianPhoto: responsavel.photo,
  };
}

/**
 * Torna o aluno o próprio titular da conta (sem responsável vinculado).
 * `responsavelId: ""` faz a API gravar null e remover o vínculo existente.
 */
export function tornarTitular(aluno: Aluno): Aluno {
  return {
    ...aluno,
    responsavelId: "",
    guardian: aluno.name,
    guardianRole: "Titular da Conta",
    guardianPhoto: undefined,
  };
}
