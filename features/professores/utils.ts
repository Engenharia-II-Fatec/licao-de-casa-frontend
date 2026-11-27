import type { DadosExportacao } from "@/components/ui/exportar-menu";
import { formatarMoeda, parseMoeda } from "@/lib/format";
import type {
  CurriculoArquivo,
  CurriculoInfo,
  FiltroSituacao,
  Professor,
  ProfessorDetalhe,
  ProfessorInput,
} from "./types";

export function iniciaisDe(nome: string): string {
  const partes = nome
    .replace(/^(prof\.?|profa\.?)\s+/i, "")
    .trim()
    .split(/\s+/);
  return partes.length > 1
    ? `${partes[0][0]}${partes[partes.length - 1][0]}`.toUpperCase()
    : partes[0].slice(0, 2).toUpperCase();
}

export function valorHora(valor?: number): string {
  return valor === undefined ? "—" : formatarMoeda(valor);
}

/** "#TCH-2024-089" a partir do ano de cadastro e do id (como no protótipo). */
export function codigoProfessor(p: Pick<Professor, "id" | "createdAt">): string {
  const ano = new Date(p.createdAt).getFullYear();
  return `#TCH-${Number.isNaN(ano) ? "0000" : ano}-${String(p.id).padStart(3, "0")}`;
}

export function filtrarProfessores(
  lista: Professor[],
  filtro: { busca: string; situacao: FiltroSituacao },
): Professor[] {
  const termo = filtro.busca.trim().toLowerCase();
  const digitos = termo.replace(/\D/g, "");
  return lista.filter((p) => {
    const correspondeBusca =
      !termo ||
      p.nome.toLowerCase().includes(termo) ||
      (p.email ?? "").toLowerCase().includes(termo) ||
      p.disciplinas.some((d) => d.nome.toLowerCase().includes(termo)) ||
      (digitos.length >= 3 &&
        ((p.cpf ?? "").replace(/\D/g, "").includes(digitos) ||
          (p.telefone ?? "").replace(/\D/g, "").includes(digitos)));
    const correspondeSituacao = filtro.situacao === "Todos" || p.situacao === filtro.situacao;
    return correspondeBusca && correspondeSituacao;
  });
}

/** Linhas da exportação (planilha ou PDF) com a lista já filtrada. */
export function dadosExportacao(lista: Professor[]): DadosExportacao {
  return {
    arquivo: "professores",
    titulo: "Gestão de Professores",
    cabecalho: ["Professor", "Situação", "Disciplinas", "Valor hora/aula", "E-mail", "Telefone"],
    linhas: lista.map((p) => [
      p.nome,
      p.situacao,
      p.disciplinas.map((d) => d.nome).join(", "),
      valorHora(p.valorHoraAula),
      p.email ?? "",
      p.telefone ?? "",
    ]),
  };
}

// ---------------------------------------------------------------------------
// Formulário (cadastro e edição)
// ---------------------------------------------------------------------------

/** Estado do formulário: tudo em texto, como aparece nos campos. */
export interface FormProfessor {
  nome: string;
  email: string;
  telefone: string;
  foto: string;
  cpf: string;
  rg: string;
  dataNascimento: string;
  valorHoraAula: string;
  formacao: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
  disciplinaIds: number[];
  /** Currículo atual (salvo) ou o arquivo novo escolhido (`dados` preenchido). */
  curriculo: CurriculoInfo | CurriculoArquivo | null;
}

export type CampoTexto = Exclude<keyof FormProfessor, "disciplinaIds" | "curriculo">;

export const FORM_VAZIO: FormProfessor = {
  nome: "",
  email: "",
  telefone: "",
  foto: "",
  cpf: "",
  rg: "",
  dataNascimento: "",
  valorHoraAula: "",
  formacao: "",
  cep: "",
  logradouro: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "",
  uf: "",
  disciplinaIds: [],
  curriculo: null,
};

export function paraFormulario(p: ProfessorDetalhe): FormProfessor {
  return {
    nome: p.nome,
    email: p.email ?? "",
    telefone: p.telefone ?? "",
    foto: p.foto ?? "",
    cpf: p.cpf ?? "",
    rg: p.rg ?? "",
    dataNascimento: p.dataNascimento ?? "",
    valorHoraAula:
      p.valorHoraAula === undefined
        ? ""
        : p.valorHoraAula.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    formacao: p.formacao ?? "",
    cep: p.cep ?? "",
    logradouro: p.logradouro ?? "",
    numero: p.numero ?? "",
    complemento: p.complemento ?? "",
    bairro: p.bairro ?? "",
    cidade: p.cidade ?? "",
    uf: p.uf ?? "",
    disciplinaIds: p.disciplinas.map((d) => d.id),
    curriculo: p.curriculo ?? null,
  };
}

/** Mantém só dígitos e uma vírgula com até 2 casas: "85,5" */
export function mascararValor(valor: string): string {
  const limpo = valor.replace(/[^\d,]/g, "");
  const [inteiro, ...resto] = limpo.split(",");
  const centavos = resto.join("").slice(0, 2);
  return resto.length > 0 ? `${inteiro.slice(0, 7)},${centavos}` : inteiro.slice(0, 7);
}

export type ErrosForm = Partial<
  Record<"nome" | "email" | "telefone" | "cpf" | "valorHoraAula" | "dataNascimento", string>
>;

export function validarFormulario(f: FormProfessor): ErrosForm {
  const erros: ErrosForm = {};
  if (!f.nome.trim()) erros.nome = "Informe o nome.";
  if (f.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) erros.email = "E-mail inválido.";
  const tel = f.telefone.replace(/\D/g, "");
  if (tel && tel.length < 10) erros.telefone = "Informe um telefone com DDD.";
  const cpf = f.cpf.replace(/\D/g, "");
  if (cpf && cpf.length !== 11) erros.cpf = "CPF incompleto.";
  if (f.valorHoraAula && Number.isNaN(parseMoeda(f.valorHoraAula))) erros.valorHoraAula = "Valor inválido.";
  if (f.dataNascimento) {
    // Input type="date" entrega "aaaa-mm-dd"; compara como data local para não errar no fuso.
    const [ano, mes, dia] = f.dataNascimento.split("-").map(Number);
    const nascimento = new Date(ano, mes - 1, dia);
    const hoje = new Date();
    if (Number.isNaN(nascimento.getTime())) erros.dataNascimento = "Data de nascimento inválida.";
    else if (nascimento > hoje) erros.dataNascimento = "A data de nascimento não pode estar no futuro.";
    else if (hoje.getFullYear() - ano > 100) erros.dataNascimento = "Confira o ano de nascimento.";
  }
  return erros;
}

/**
 * Converte o formulário no corpo da API. O currículo só vai quando mudou:
 * arquivo novo → objeto; removido → null; igual → não envia.
 */
export function paraInput(f: FormProfessor, curriculoOriginal: CurriculoInfo | null = null): ProfessorInput {
  const { curriculo, valorHoraAula, ...resto } = f;
  const input: ProfessorInput = {
    ...resto,
    valorHoraAula: valorHoraAula ? parseMoeda(valorHoraAula) : null,
  };
  if (curriculo && "dados" in curriculo) input.curriculo = curriculo;
  else if (!curriculo && curriculoOriginal) input.curriculo = null;
  return input;
}

const TIPOS_CURRICULO: Record<string, string> = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};
const TAMANHO_MAXIMO_CURRICULO = 5 * 1024 * 1024;

/** Lê o arquivo escolhido (PDF, DOC ou DOCX até 5 MB) como data URL. */
export async function lerCurriculo(arquivo: File): Promise<CurriculoArquivo> {
  const extensao = arquivo.name.split(".").pop()?.toLowerCase() ?? "";
  const tipo = TIPOS_CURRICULO[extensao];
  if (!tipo) throw new Error("Formato inválido. Use PDF, DOC ou DOCX.");
  if (arquivo.size > TAMANHO_MAXIMO_CURRICULO) throw new Error("O currículo deve ter no máximo 5 MB.");
  const dados = await new Promise<string>((resolve, reject) => {
    const leitor = new FileReader();
    leitor.onload = () => resolve(String(leitor.result));
    leitor.onerror = () => reject(new Error("Não foi possível ler o arquivo."));
    leitor.readAsDataURL(arquivo);
  });
  // O navegador às vezes não informa o tipo de .doc/.docx; padroniza pelo nome do arquivo.
  return { nome: arquivo.name, tipo, dados: `data:${tipo};base64,${dados.slice(dados.indexOf(",") + 1)}` };
}

export function tamanhoArquivo(curriculo: CurriculoInfo | CurriculoArquivo): string {
  if (!("dados" in curriculo)) return "";
  const bytes = Math.round(((curriculo.dados.length - curriculo.dados.indexOf(",") - 1) * 3) / 4);
  return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export function rotuloTipoArquivo(tipo: string): string {
  return tipo === "application/pdf" ? "Documento PDF" : "Documento Word";
}
