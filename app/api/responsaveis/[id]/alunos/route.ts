import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { exigirSessao } from "@/lib/api-auth";
import { formatarResponsavelDetalhe } from "../../formatar";

interface Params {
  params: Promise<{ id: string }>;
}

/**
 * Vincula um aluno já cadastrado a este responsável: `{ "alunoId": "2024-0891" }`.
 * Se o aluno tinha outro responsável, passa a ser deste. Os dados do responsável copiados
 * no aluno (nome, telefone, foto e vínculo) são atualizados junto.
 */
export async function POST(request: NextRequest, { params }: Params) {
  const negado = await exigirSessao();
  if (negado) return negado;

  try {
    const { id } = await params;
    const body = await request.json().catch(() => null);
    const alunoId = body && typeof body.alunoId === "string" ? body.alunoId : null;
    if (!alunoId) {
      return NextResponse.json({ error: "Informe o aluno a vincular." }, { status: 400 });
    }

    const [responsavel, aluno] = await Promise.all([
      prisma.responsavel.findUnique({ where: { id } }),
      prisma.aluno.findUnique({ where: { id: alunoId }, select: { id: true } }),
    ]);
    if (!responsavel) {
      return NextResponse.json({ error: "Responsável não encontrado." }, { status: 404 });
    }
    if (!aluno) {
      return NextResponse.json({ error: "Aluno não encontrado." }, { status: 404 });
    }

    await prisma.aluno.update({
      where: { id: alunoId },
      data: {
        responsavelId: id,
        guardian: responsavel.name,
        guardianPhone: responsavel.phone,
        guardianPhoto: responsavel.photo,
        guardianRole: `${responsavel.role} • Principal`,
      },
    });

    const atualizado = await prisma.responsavel.findUniqueOrThrow({
      where: { id },
      include: {
        alunos: {
          orderBy: { name: "asc" },
          include: { paymentHistory: { orderBy: { createdAt: "desc" } } },
        },
      },
    });
    return NextResponse.json(formatarResponsavelDetalhe(atualizado));
  } catch (error) {
    console.error("Erro ao vincular aluno:", error);
    return NextResponse.json({ error: "Erro ao vincular aluno." }, { status: 500 });
  }
}
