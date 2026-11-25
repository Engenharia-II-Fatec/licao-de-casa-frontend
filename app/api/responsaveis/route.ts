import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { exigirSessao } from "@/lib/api-auth";
import { formatarDependente, formatarResponsavel, lerDadosResponsavel } from "./formatar";

export async function GET() {
  const negado = await exigirSessao();
  if (negado) return negado;

  try {
    const responsaveis = await prisma.responsavel.findMany({
      orderBy: { name: "asc" },
      include: {
        alunos: {
          include: { paymentHistory: { where: { status: "Pendente" }, select: { id: true } } },
          orderBy: { name: "asc" },
        },
      },
    });

    return NextResponse.json(
      responsaveis.map((r) => ({
        ...formatarResponsavel(r),
        dependentes: r.alunos.map(formatarDependente),
        pagamentosPendentes: r.alunos.reduce((total, a) => total + a.paymentHistory.length, 0),
      })),
    );
  } catch (error) {
    console.error("Erro ao listar responsáveis:", error);
    return NextResponse.json({ error: "Erro ao listar responsáveis." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const negado = await exigirSessao();
  if (negado) return negado;

  try {
    const lido = lerDadosResponsavel(await request.json().catch(() => null));
    if ("erro" in lido) {
      return NextResponse.json({ error: lido.erro }, { status: 400 });
    }

    const criado = await prisma.responsavel.create({ data: lido.dados });
    return NextResponse.json(formatarResponsavel(criado), { status: 201 });
  } catch (error) {
    console.error("Erro ao criar responsável:", error);
    return NextResponse.json({ error: "Erro ao criar responsável." }, { status: 500 });
  }
}
