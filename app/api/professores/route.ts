import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { exigirSessao } from "@/lib/api-auth";
import {
  SELECAO_PROFESSOR,
  atualizarProfessorNomeDasDisciplinas,
  dadosCurriculo,
  erroCpfDuplicado,
  filtroEmAulaAgora,
  formatarProfessor,
  lerDadosProfessor,
} from "./formatar";

/** Lista os professores (ativos e inativos). `?ativos=1` devolve só os ativos. */
export async function GET(request: NextRequest) {
  const negado = await exigirSessao();
  if (negado) return negado;

  try {
    const soAtivos = request.nextUrl.searchParams.get("ativos") === "1";
    const [professores, emAula] = await Promise.all([
      prisma.professor.findMany({
        where: soAtivos ? { ativo: true } : undefined,
        orderBy: { nome: "asc" },
        select: SELECAO_PROFESSOR,
      }),
      prisma.agendamento.findMany({
        where: { ...filtroEmAulaAgora(), professorId: { not: null } },
        select: { professorId: true },
      }),
    ]);
    const idsEmAula = new Set(emAula.map((a) => a.professorId));
    return NextResponse.json(professores.map((p) => formatarProfessor(p, idsEmAula.has(p.id))));
  } catch (error) {
    console.error("Erro ao listar professores:", error);
    return NextResponse.json({ error: "Erro ao listar professores." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const negado = await exigirSessao();
  if (negado) return negado;

  try {
    const lido = lerDadosProfessor(await request.json().catch(() => null));
    if ("erro" in lido) {
      return NextResponse.json({ error: lido.erro }, { status: 400 });
    }
    const { dados, disciplinaIds, curriculo } = lido;

    const disciplinas = await prisma.disciplina.findMany({
      where: { id: { in: disciplinaIds } },
      select: { id: true, nome: true },
    });
    if (disciplinas.length !== disciplinaIds.length) {
      return NextResponse.json({ error: "Uma das disciplinas escolhidas não existe mais." }, { status: 400 });
    }
    const principal = disciplinaIds.length > 0 ? disciplinas.find((d) => d.id === disciplinaIds[0]) : undefined;

    const criado = await prisma.$transaction(async (tx) => {
      const professor = await tx.professor.create({
        data: {
          ...dados,
          ...dadosCurriculo(curriculo),
          especialidade: principal?.nome ?? null,
          disciplinas: { create: disciplinaIds.map((disciplinaId) => ({ disciplinaId })) },
        },
        select: { id: true },
      });
      await atualizarProfessorNomeDasDisciplinas(tx, disciplinaIds);
      return tx.professor.findUniqueOrThrow({ where: { id: professor.id }, select: SELECAO_PROFESSOR });
    });

    return NextResponse.json(formatarProfessor(criado), { status: 201 });
  } catch (error) {
    if (erroCpfDuplicado(error)) {
      return NextResponse.json({ error: "Já existe um professor com este CPF." }, { status: 409 });
    }
    console.error("Erro ao criar professor:", error);
    return NextResponse.json({ error: "Erro ao criar professor." }, { status: 500 });
  }
}
