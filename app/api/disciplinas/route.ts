import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { Area, Disciplina } from "@/app/(app)/disciplinas/_components/dados";

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const busca = searchParams.get("busca")?.trim();
    const area = searchParams.get("area")?.trim();

    const where: Prisma.DisciplinaWhereInput = {};
    if (area && area !== "todas") {
      where.area = area;
    }
    if (busca) {
      where.OR = [
        { nome: { contains: busca } },
        { descricao: { contains: busca } },
      ];
    }

    const disciplinas = await prisma.disciplina.findMany({
      where,
      include: {
        professores: {
          include: { professor: true },
        },
        alunos: true,
      },
      orderBy: { nome: "asc" },
    });

    return NextResponse.json(disciplinas.map(mapearDisciplina));
  } catch (error) {
    console.error("Erro ao listar disciplinas:", error);
    return NextResponse.json({ error: "Erro ao listar disciplinas." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || !body.nome || !body.area) {
      return NextResponse.json({ error: "Nome e área são obrigatórios." }, { status: 400 });
    }

    const professoresIds: number[] = Array.isArray(body.professores) ? body.professores : [];

    // Busca nome do primeiro professor para o campo de exibição rápida
    let professorNome = body.professorNome;
    if (!professorNome && professoresIds.length > 0) {
      const primeiroProf = await prisma.professor.findUnique({
        where: { id: professoresIds[0] },
      });
      if (primeiroProf) professorNome = primeiroProf.nome;
    }

    const criada = await prisma.disciplina.create({
      data: {
        nome: body.nome.trim(),
        area: body.area,
        descricao: body.descricao?.trim() || body.ementa?.trim() || "",
        ementa: body.ementa?.trim() || null,
        cargaHoraria: Number(body.cargaHoraria) || 2,
        alunosQtd: Number(body.alunos) || 0,
        professorNome: professorNome || "A definir",
        ativa: body.ativa !== false,
        professores: {
          create: professoresIds.map((pId) => ({
            professorId: pId,
          })),
        },
      },
      include: {
        professores: {
          include: { professor: true },
        },
        alunos: true,
      },
    });

    return NextResponse.json(mapearDisciplina(criada), { status: 201 });
  } catch (error) {
    console.error("Erro ao criar disciplina:", error);
    return NextResponse.json({ error: "Erro ao criar disciplina." }, { status: 500 });
  }
}
