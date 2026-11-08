import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { Area, Disciplina } from "@/app/(app)/disciplinas/_components/dados";

interface Params {
  params: Promise<{ id: string }>;
}

type DisciplinaComRelacoes = Prisma.DisciplinaGetPayload<{
  include: {
    professores: {
      include: { professor: true };
    };
    alunos: true;
  };
}>;

function mapearDisciplina(d: DisciplinaComRelacoes): Disciplina {
  const primeiroProf = d.professores?.[0]?.professor?.nome;
  return {
    id: d.id,
    nome: d.nome,
    area: d.area as Area,
    descricao: d.descricao,
    cargaHoraria: d.cargaHoraria,
    alunos: d.alunosQtd || (d.alunos ? d.alunos.length : 0),
    professor: d.professorNome || primeiroProf || "A definir",
    ativa: d.ativa,
  };
}

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const numId = Number(id);

    const disciplina = await prisma.disciplina.findUnique({
      where: { id: numId },
      include: {
        professores: {
          include: { professor: true },
        },
        alunos: true,
      },
    });

    if (!disciplina) {
      return NextResponse.json({ error: "Disciplina não encontrada." }, { status: 404 });
    }

    return NextResponse.json({
      ...mapearDisciplina(disciplina),
      ementa: disciplina.ementa,
      professoresIds: disciplina.professores.map((p) => p.professorId),
    });
  } catch (error) {
    console.error("Erro ao buscar disciplina:", error);
    return NextResponse.json({ error: "Erro ao buscar disciplina." }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const numId = Number(id);
    const body = await request.json().catch(() => null);

    if (!body) {
      return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
    }

    const professoresIds: number[] | undefined = Array.isArray(body.professores)
      ? body.professores
      : undefined;

    let professorNome = body.professorNome || body.professor;
    if (!professorNome && professoresIds && professoresIds.length > 0) {
      const primeiroProf = await prisma.professor.findUnique({
        where: { id: professoresIds[0] },
      });
      if (primeiroProf) professorNome = primeiroProf.nome;
    }

    // Se professores forem informados, recria as relações N:N
    if (professoresIds) {
      await prisma.disciplinaProfessor.deleteMany({
        where: { disciplinaId: numId },
      });
    }

    const atualizada = await prisma.disciplina.update({
      where: { id: numId },
      data: {
        nome: body.nome?.trim(),
        area: body.area,
        descricao: body.descricao?.trim(),
        ementa: body.ementa?.trim(),
        cargaHoraria: body.cargaHoraria !== undefined ? Number(body.cargaHoraria) : undefined,
        alunosQtd: body.alunos !== undefined ? Number(body.alunos) : undefined,
        professorNome: professorNome || undefined,
        ativa: body.ativa !== undefined ? Boolean(body.ativa) : undefined,
        professores: professoresIds
          ? {
              create: professoresIds.map((pId) => ({
                professorId: pId,
              })),
            }
          : undefined,
      },
      include: {
        professores: {
          include: { professor: true },
        },
        alunos: true,
      },
    });

    return NextResponse.json(mapearDisciplina(atualizada));
  } catch (error) {
    console.error("Erro ao atualizar disciplina:", error);
    return NextResponse.json({ error: "Erro ao atualizar disciplina." }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const numId = Number(id);

    await prisma.disciplina.delete({
      where: { id: numId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir disciplina:", error);
    return NextResponse.json({ error: "Erro ao excluir disciplina." }, { status: 500 });
  }
}
