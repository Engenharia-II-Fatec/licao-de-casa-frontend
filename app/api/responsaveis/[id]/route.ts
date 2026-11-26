import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { exigirSessao } from "@/lib/api-auth";
import { formatarResponsavelDetalhe, lerDadosResponsavel } from "../formatar";

interface Params {
  params: Promise<{ id: string }>;
}

const INCLUIR_DETALHE = {
  alunos: {
    orderBy: { name: "asc" as const },
    include: { paymentHistory: { orderBy: { createdAt: "desc" as const } } },
  },
};

function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/);
  return partes.length > 1
    ? `${partes[0][0]}${partes[partes.length - 1][0]}`.toUpperCase()
    : partes[0].slice(0, 2).toUpperCase();
}

export async function GET(_request: NextRequest, { params }: Params) {
  const negado = await exigirSessao();
  if (negado) return negado;

  try {
    const { id } = await params;
    const responsavel = await prisma.responsavel.findUnique({
      where: { id },
      include: INCLUIR_DETALHE,
    });
    if (!responsavel) {
      return NextResponse.json({ error: "Responsável não encontrado." }, { status: 404 });
    }
    return NextResponse.json(formatarResponsavelDetalhe(responsavel));
  } catch (error) {
    console.error("Erro ao buscar responsável:", error);
    return NextResponse.json({ error: "Erro ao buscar responsável." }, { status: 500 });
  }
}

/**
 * Atualiza o responsável e mantém em dia os dados dele copiados nos alunos vinculados
 * (nome, telefone e foto do responsável aparecem na listagem e nos detalhes do aluno).
 * Se o aluno for o próprio titular (nome igual ao do responsável), o nome do aluno também muda.
 */
export async function PUT(request: NextRequest, { params }: Params) {
  const negado = await exigirSessao();
  if (negado) return negado;

  try {
    const { id } = await params;
    const lido = lerDadosResponsavel(await request.json().catch(() => null));
    if ("erro" in lido) {
      return NextResponse.json({ error: lido.erro }, { status: 400 });
    }
    const { dados } = lido;

    const atual = await prisma.responsavel.findUnique({
      where: { id },
      include: { alunos: { select: { id: true, name: true } } },
    });
    if (!atual) {
      return NextResponse.json({ error: "Responsável não encontrado." }, { status: 404 });
    }

    const nomeAntigo = atual.name.trim().toLowerCase();
    const atualizado = await prisma.$transaction(async (tx) => {
      await tx.responsavel.update({ where: { id }, data: dados });
      for (const aluno of atual.alunos) {
        const ehTitular = aluno.name.trim().toLowerCase() === nomeAntigo;
        await tx.aluno.update({
          where: { id: aluno.id },
          data: {
            guardian: dados.name,
            guardianPhone: dados.phone,
            guardianPhoto: dados.photo,
            ...(ehTitular ? { name: dados.name, initials: iniciais(dados.name) } : {}),
          },
        });
      }
      return tx.responsavel.findUniqueOrThrow({ where: { id }, include: INCLUIR_DETALHE });
    });

    return NextResponse.json(formatarResponsavelDetalhe(atualizado));
  } catch (error) {
    console.error("Erro ao atualizar responsável:", error);
    return NextResponse.json({ error: "Erro ao atualizar responsável." }, { status: 500 });
  }
}

/** Inativa ou reativa o responsável: `{ "ativo": false }`. Mantém dependentes e histórico. */
export async function PATCH(request: NextRequest, { params }: Params) {
  const negado = await exigirSessao();
  if (negado) return negado;

  try {
    const { id } = await params;
    const body = await request.json().catch(() => null);
    if (!body || typeof body.ativo !== "boolean") {
      return NextResponse.json({ error: "Informe \"ativo\": true ou false." }, { status: 400 });
    }
    const existe = await prisma.responsavel.findUnique({ where: { id }, select: { id: true } });
    if (!existe) {
      return NextResponse.json({ error: "Responsável não encontrado." }, { status: 404 });
    }
    const atualizado = await prisma.responsavel.update({
      where: { id },
      data: { ativo: body.ativo },
      include: INCLUIR_DETALHE,
    });
    return NextResponse.json(formatarResponsavelDetalhe(atualizado));
  } catch (error) {
    console.error("Erro ao alterar status do responsável:", error);
    return NextResponse.json({ error: "Erro ao alterar status do responsável." }, { status: 500 });
  }
}

/**
 * Regra de negócio: nenhum cadastro é excluído de forma permanente.
 * DELETE só inativa o responsável (o mesmo que PATCH { ativo: false }); dependentes e
 * histórico financeiro continuam vinculados.
 */
export async function DELETE(_request: NextRequest, { params }: Params) {
  const negado = await exigirSessao();
  if (negado) return negado;

  try {
    const { id } = await params;
    const existe = await prisma.responsavel.findUnique({ where: { id }, select: { id: true } });
    if (!existe) {
      return NextResponse.json({ error: "Responsável não encontrado." }, { status: 404 });
    }
    const atualizado = await prisma.responsavel.update({
      where: { id },
      data: { ativo: false },
      include: INCLUIR_DETALHE,
    });
    return NextResponse.json(formatarResponsavelDetalhe(atualizado));
  } catch (error) {
    console.error("Erro ao inativar responsável:", error);
    return NextResponse.json({ error: "Erro ao inativar responsável." }, { status: 500 });
  }
}
