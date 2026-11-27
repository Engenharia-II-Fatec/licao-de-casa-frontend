import type { Prisma } from "@prisma/client";

/** Colunas da listagem e do detalhe. O arquivo do currículo (`curriculoDados`) só sai pela rota própria. */
export const SELECAO_PROFESSOR = {
  id: true,
  nome: true,
  especialidade: true,
  email: true,
  telefone: true,
  foto: true,
  cpf: true,
  rg: true,
  dataNascimento: true,
  valorHoraAula: true,
  formacao: true,
  curriculoNome: true,
  curriculoTipo: true,
  cep: true,
  logradouro: true,
  numero: true,
  complemento: true,
  bairro: true,
  cidade: true,
  uf: true,
  ativo: true,
  createdAt: true,
  disciplinas: {
    select: { disciplina: { select: { id: true, nome: true, area: true } } },
    orderBy: { disciplina: { nome: "asc" as const } },
  },
} satisfies Prisma.ProfessorSelect;

export type ProfessorSelecionado = Prisma.ProfessorGetPayload<{ select: typeof SELECAO_PROFESSOR }>;

/** Duração considerada para uma aula agendada ao calcular se o professor está "Em aula". */
const DURACAO_AULA_MS = 60 * 60 * 1000;

/** Filtro dos agendamentos que estão acontecendo agora. */
export function filtroEmAulaAgora(): Prisma.AgendamentoWhereInput {
  const agora = new Date();
  return {
    status: "AGENDADO",
    dataHora: { lte: agora, gt: new Date(agora.getTime() - DURACAO_AULA_MS) },
  };
}

export type SituacaoProfessor = "Disponível" | "Em aula" | "Inativo";

export function formatarProfessor(p: ProfessorSelecionado, emAula = false) {
  const situacao: SituacaoProfessor = !p.ativo ? "Inativo" : emAula ? "Em aula" : "Disponível";
  return {
    id: p.id,
    nome: p.nome,
    especialidade: p.especialidade || p.disciplinas[0]?.disciplina.nome || undefined,
    email: p.email || undefined,
    telefone: p.telefone || undefined,
    foto: p.foto || undefined,
    cpf: p.cpf || undefined,
    rg: p.rg || undefined,
    dataNascimento: p.dataNascimento ? p.dataNascimento.toISOString().slice(0, 10) : undefined,
    valorHoraAula: p.valorHoraAula === null ? undefined : Number(p.valorHoraAula),
    formacao: p.formacao || undefined,
    curriculo: p.curriculoNome ? { nome: p.curriculoNome, tipo: p.curriculoTipo || "" } : undefined,
    cep: p.cep || undefined,
    logradouro: p.logradouro || undefined,
    numero: p.numero || undefined,
    complemento: p.complemento || undefined,
    bairro: p.bairro || undefined,
    cidade: p.cidade || undefined,
    uf: p.uf || undefined,
    ativo: p.ativo,
    situacao,
    createdAt: p.createdAt.toISOString(),
    // A disciplina principal (especialidade) vem primeiro; as demais em ordem alfabética.
    disciplinas: p.disciplinas
      .map((d) => d.disciplina)
      .sort((a, b) => Number(b.nome === p.especialidade) - Number(a.nome === p.especialidade)),
  };
}

const TIPOS_CURRICULO = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
/** 5 MB de arquivo viram ~6,7 MB em base64. */
const TAMANHO_MAXIMO_CURRICULO = Math.ceil((5 * 1024 * 1024 * 4) / 3) + 100;

export interface DadosProfessor {
  nome: string;
  email: string | null;
  telefone: string | null;
  foto: string | null;
  cpf: string | null;
  rg: string | null;
  dataNascimento: Date | null;
  valorHoraAula: number | null;
  formacao: string | null;
  cep: string | null;
  logradouro: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  cidade: string | null;
  uf: string | null;
}

/** `undefined` = manter o currículo atual; `null` = remover; objeto = substituir. */
export type CurriculoRecebido = { nome: string; tipo: string; dados: string } | null | undefined;

function cpfValido(cpf: string): boolean {
  const d = cpf.replace(/\D/g, "");
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
  const digito = (n: number) => {
    let soma = 0;
    for (let i = 0; i < n; i++) soma += Number(d[i]) * (n + 1 - i);
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };
  return digito(9) === Number(d[9]) && digito(10) === Number(d[10]);
}

/** Lê e valida o corpo de criação/edição. Retorna a mensagem de erro ou os dados prontos para o Prisma. */
export function lerDadosProfessor(
  body: unknown,
): { erro: string } | { dados: DadosProfessor; disciplinaIds: number[]; curriculo: CurriculoRecebido } {
  if (!body || typeof body !== "object") return { erro: "Dados inválidos." };
  const b = body as Record<string, unknown>;
  const texto = (campo: string) =>
    typeof b[campo] === "string" && (b[campo] as string).trim() ? (b[campo] as string).trim() : null;

  const nome = texto("nome");
  const email = texto("email");
  const cpf = texto("cpf");
  const uf = texto("uf");
  if (!nome) return { erro: "Nome do professor é obrigatório." };
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { erro: "E-mail inválido." };
  if (cpf && !cpfValido(cpf)) return { erro: "CPF inválido." };
  if (uf && !/^[A-Z]{2}$/.test(uf)) return { erro: "UF inválida." };

  let valorHoraAula: number | null = null;
  if (b.valorHoraAula !== undefined && b.valorHoraAula !== null && b.valorHoraAula !== "") {
    valorHoraAula = Number(b.valorHoraAula);
    if (!Number.isFinite(valorHoraAula) || valorHoraAula < 0) return { erro: "Valor da hora/aula inválido." };
    valorHoraAula = Math.round(valorHoraAula * 100) / 100;
  }

  let dataNascimento: Date | null = null;
  const nascimento = texto("dataNascimento");
  if (nascimento) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(nascimento)) return { erro: "Data de nascimento inválida." };
    dataNascimento = new Date(`${nascimento}T00:00:00Z`);
    if (Number.isNaN(dataNascimento.getTime())) return { erro: "Data de nascimento inválida." };
    if (dataNascimento > new Date()) {
      return { erro: "A data de nascimento não pode estar no futuro." };
    }
  }

  const disciplinaIds = Array.isArray(b.disciplinaIds)
    ? [...new Set(b.disciplinaIds.map(Number).filter((n) => Number.isInteger(n) && n > 0))]
    : [];

  let curriculo: CurriculoRecebido = undefined;
  if (b.curriculo === null) curriculo = null;
  else if (b.curriculo && typeof b.curriculo === "object") {
    const c = b.curriculo as Record<string, unknown>;
    if (typeof c.nome !== "string" || typeof c.tipo !== "string" || typeof c.dados !== "string") {
      return { erro: "Arquivo do currículo inválido." };
    }
    if (!TIPOS_CURRICULO.includes(c.tipo) || !c.dados.startsWith(`data:${c.tipo};base64,`)) {
      return { erro: "O currículo deve ser PDF, DOC ou DOCX." };
    }
    if (c.dados.length > TAMANHO_MAXIMO_CURRICULO) return { erro: "O currículo deve ter no máximo 5 MB." };
    curriculo = { nome: c.nome.slice(0, 200), tipo: c.tipo, dados: c.dados };
  }

  return {
    dados: {
      nome,
      email,
      telefone: texto("telefone"),
      foto: texto("foto"),
      cpf,
      rg: texto("rg"),
      dataNascimento,
      valorHoraAula,
      formacao: texto("formacao"),
      cep: texto("cep"),
      logradouro: texto("logradouro"),
      numero: texto("numero"),
      complemento: texto("complemento"),
      bairro: texto("bairro"),
      cidade: texto("cidade"),
      uf,
    },
    disciplinaIds,
    curriculo,
  };
}

/** Campos do currículo para o Prisma, conforme o que veio na requisição. */
export function dadosCurriculo(curriculo: CurriculoRecebido) {
  if (curriculo === undefined) return {};
  if (curriculo === null) return { curriculoNome: null, curriculoTipo: null, curriculoDados: null };
  return { curriculoNome: curriculo.nome, curriculoTipo: curriculo.tipo, curriculoDados: curriculo.dados };
}

/**
 * `Disciplina.professorNome` é o nome exibido na listagem de disciplinas (campo derivado).
 * Depois de mudar os vínculos ou o nome de um professor, recalcula esse campo nas disciplinas afetadas.
 */
export async function atualizarProfessorNomeDasDisciplinas(
  tx: Prisma.TransactionClient,
  disciplinaIds: number[],
): Promise<void> {
  for (const id of new Set(disciplinaIds)) {
    const primeiro = await tx.disciplinaProfessor.findFirst({
      where: { disciplinaId: id, professor: { ativo: true } },
      orderBy: { createdAt: "asc" },
      select: { professor: { select: { nome: true } } },
    });
    await tx.disciplina.update({
      where: { id },
      data: { professorNome: primeiro?.professor.nome ?? "A definir" },
    });
  }
}

/** CPF repetido (violação do UNIQUE de `Professor.cpf`), para devolver uma mensagem amigável. */
export function erroCpfDuplicado(error: unknown): boolean {
  if (typeof error !== "object" || error === null || (error as { code?: string }).code !== "P2002") return false;
  const alvo = (error as { meta?: { target?: unknown } }).meta?.target;
  return Array.isArray(alvo) ? alvo.includes("cpf") : String(alvo ?? "").includes("cpf");
}
