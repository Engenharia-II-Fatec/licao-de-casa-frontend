import type { Aluno, RegistroPagamento, Responsavel } from "@prisma/client";

/** Converte o registro do banco no formato usado pelas telas (campos vazios viram undefined). */
export function formatarResponsavel(r: Responsavel) {
  return {
    id: r.id,
    name: r.name,
    role: r.role,
    phone: r.phone,
    ativo: r.ativo,
    createdAt: r.createdAt.toISOString(),
    photo: r.photo || undefined,
    cpf: r.cpf || undefined,
    rg: r.rg || undefined,
    email: r.email || undefined,
    cep: r.cep || undefined,
    address: r.address || undefined,
    number: r.number || undefined,
    complement: r.complement || undefined,
    neighborhood: r.neighborhood || undefined,
    city: r.city || undefined,
    state: r.state || undefined,
  };
}

/** Dados do aluno exibidos junto do responsável (listagem e "Alunos Vinculados"). */
export function formatarDependente(a: Aluno) {
  return {
    id: a.id,
    name: a.name,
    initials: a.initials,
    avatarBg: a.avatarBg,
    avatarText: a.avatarText,
    photo: a.photo || undefined,
    plan: a.plan,
    planPrice: a.planPrice || undefined,
    status: a.status as "Ativo" | "Inativo",
    schoolGrade: a.schoolGrade || a.grade || undefined,
  };
}

/** Responsável + dependentes + todos os pagamentos dos dependentes (perfil financeiro). */
export function formatarResponsavelDetalhe(
  r: Responsavel & { alunos: (Aluno & { paymentHistory: RegistroPagamento[] })[] },
) {
  return {
    ...formatarResponsavel(r),
    dependentes: r.alunos.map(formatarDependente),
    pagamentos: r.alunos.flatMap((a) =>
      a.paymentHistory.map((p) => ({
        id: p.id,
        alunoId: a.id,
        alunoNome: a.name,
        description: p.description,
        date: p.date,
        amount: p.amount,
        status: p.status as "Pago" | "Pendente",
      })),
    ),
  };
}

/** Lê e valida o corpo de criação/edição. Retorna a mensagem de erro ou os dados prontos para o Prisma. */
export function lerDadosResponsavel(body: unknown):
  | { erro: string }
  | {
      dados: {
        name: string;
        role: string;
        phone: string;
        photo: string | null;
        cpf: string | null;
        rg: string | null;
        email: string | null;
        cep: string | null;
        address: string | null;
        number: string | null;
        complement: string | null;
        neighborhood: string | null;
        city: string | null;
        state: string | null;
      };
    } {
  if (!body || typeof body !== "object") return { erro: "Dados inválidos." };
  const b = body as Record<string, unknown>;
  const texto = (campo: string) =>
    typeof b[campo] === "string" && (b[campo] as string).trim() ? (b[campo] as string).trim() : null;

  const name = texto("name");
  const phone = texto("phone");
  const email = texto("email");
  if (!name) return { erro: "Nome do responsável é obrigatório." };
  if (!phone) return { erro: "Telefone do responsável é obrigatório." };
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { erro: "E-mail inválido." };

  return {
    dados: {
      name,
      role: texto("role") || "Responsável",
      phone,
      photo: texto("photo"),
      cpf: texto("cpf"),
      rg: texto("rg"),
      email,
      cep: texto("cep"),
      address: texto("address"),
      number: texto("number"),
      complement: texto("complement"),
      neighborhood: texto("neighborhood"),
      city: texto("city"),
      state: texto("state"),
    },
  };
}
