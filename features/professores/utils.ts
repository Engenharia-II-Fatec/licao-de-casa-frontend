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

function escaparHtml(texto: string): string {
  return texto.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

/**
 * "Exportar PDF": abre a lista (já filtrada) numa janela pronta para impressão.
 * No diálogo de impressão do navegador, escolha "Salvar como PDF".
 */
export function exportarPdf(lista: Professor[]): boolean {
  const janela = window.open("", "_blank");
  if (!janela) return false;
  const linhas = lista
    .map(
      (p) => `<tr>
        <td>${escaparHtml(p.nome)}</td>
        <td>${escaparHtml(p.situacao)}</td>
        <td>${escaparHtml(p.disciplinas.map((d) => d.nome).join(", ") || "—")}</td>
        <td>${escaparHtml(valorHora(p.valorHoraAula))}</td>
        <td>${escaparHtml(p.email ?? "—")}<br>${escaparHtml(p.telefone ?? "")}</td>
      </tr>`,
    )
    .join("");
  janela.document.write(`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
    <title>Professores — Espaço Lição de Casa</title>
    <style>
      body{font-family:"Plus Jakarta Sans",Arial,sans-serif;color:#1b1c1c;margin:32px}
      h1{font-size:20px;margin:0}p{color:#584237;font-size:12px;margin:4px 0 20px}
      table{width:100%;border-collapse:collapse;font-size:12px}
      th{text-align:left;text-transform:uppercase;font-size:10px;letter-spacing:.08em;color:#584237;background:#f6f3f2;padding:8px}
      td{padding:8px;vertical-align:top}tr:nth-child(even) td{background:#fbf9f8}
    </style></head><body>
    <h1>Gestão de Professores</h1>
    <p>Espaço Lição de Casa · ${lista.length} ${lista.length === 1 ? "professor" : "professores"} · gerado em ${new Date().toLocaleString("pt-BR")}</p>
    <table><thead><tr><th>Professor</th><th>Situação</th><th>Disciplinas</th><th>Valor hora/aula</th><th>Contato</th></tr></thead>
    <tbody>${linhas}</tbody></table></body></html>`);
  janela.document.close();
  janela.focus();
  janela.print();
  return true;
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

export type ErrosForm = Partial<Record<"nome" | "email" | "telefone" | "cpf" | "valorHoraAula", string>>;

export function validarFormulario(f: FormProfessor): ErrosForm {
  const erros: ErrosForm = {};
  if (!f.nome.trim()) erros.nome = "Informe o nome.";
  if (f.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) erros.email = "E-mail inválido.";
  const tel = f.telefone.replace(/\D/g, "");
  if (tel && tel.length < 10) erros.telefone = "Informe um telefone com DDD.";
  const cpf = f.cpf.replace(/\D/g, "");
  if (cpf && cpf.length !== 11) erros.cpf = "CPF incompleto.";
  if (f.valorHoraAula && Number.isNaN(parseMoeda(f.valorHoraAula))) erros.valorHoraAula = "Valor inválido.";
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
