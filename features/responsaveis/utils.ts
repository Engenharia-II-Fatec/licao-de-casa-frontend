import { baixarCsv } from "@/lib/csv";
import type { FiltroStatusFinanceiro, ResponsavelResumo } from "./types";

export const PLANO_TODOS = "Todos os planos";

export function iniciaisDe(nome: string): string {
  const partes = nome.trim().split(/\s+/);
  return partes.length > 1
    ? `${partes[0][0]}${partes[partes.length - 1][0]}`.toUpperCase()
    : partes[0].slice(0, 2).toUpperCase();
}

const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

/** "2023-10-04T..." → "out/2023" (como no protótipo: "Cadastrado em out/2023"). */
export function mesAno(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : `${MESES[d.getMonth()]}/${d.getFullYear()}`;
}

/** "10/05/2024" → "10/05". Outros formatos voltam como vieram. */
export function diaMes(data: string): string {
  const m = /^(\d{2})\/(\d{2})\/\d{4}$/.exec(data.trim());
  return m ? `${m[1]}/${m[2]}` : data;
}

export function statusFinanceiro(r: ResponsavelResumo): Exclude<FiltroStatusFinanceiro, "Todos"> {
  if (!r.ativo) return "Inativo";
  return r.pagamentosPendentes > 0 ? "Pendente" : "Em dia";
}

/** Planos que aparecem entre os alunos vinculados, para o filtro "Plano do Aluno". */
export function planosDosAlunos(lista: ResponsavelResumo[]): string[] {
  return [...new Set(lista.flatMap((r) => r.dependentes.map((d) => d.plan)))].sort((a, b) =>
    a.localeCompare(b, "pt-BR"),
  );
}

export function filtrarResponsaveis(
  lista: ResponsavelResumo[],
  filtro: { busca: string; status: FiltroStatusFinanceiro; plano: string },
): ResponsavelResumo[] {
  const termo = filtro.busca.trim().toLowerCase();
  const digitos = termo.replace(/\D/g, "");
  return lista.filter((r) => {
    const correspondeBusca =
      !termo ||
      r.name.toLowerCase().includes(termo) ||
      (r.email ?? "").toLowerCase().includes(termo) ||
      r.dependentes.some((d) => d.name.toLowerCase().includes(termo)) ||
      (digitos.length >= 3 &&
        ((r.cpf ?? "").replace(/\D/g, "").includes(digitos) ||
          r.phone.replace(/\D/g, "").includes(digitos)));
    const correspondeStatus = filtro.status === "Todos" || statusFinanceiro(r) === filtro.status;
    const correspondePlano =
      filtro.plano === PLANO_TODOS || r.dependentes.some((d) => d.plan === filtro.plano);
    return correspondeBusca && correspondeStatus && correspondePlano;
  });
}

/** Baixa a lista (já filtrada) em CSV. */
export function exportarCsv(lista: ResponsavelResumo[]): void {
  baixarCsv(
    "responsaveis",
    ["Nome", "Vínculo", "CPF", "E-mail", "Telefone", "Alunos vinculados", "Status financeiro", "Cadastrado em"],
    lista.map((r) => [
      r.name,
      r.role,
      r.cpf ?? "",
      r.email ?? "",
      r.phone,
      r.dependentes.map((d) => d.name).join(", "),
      statusFinanceiro(r),
      mesAno(r.createdAt),
    ]),
  );
}
