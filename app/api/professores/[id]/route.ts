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
} from "../formatar";

interface Params {
  params: Promise<{ id: string }>;
}

function lerId(valor: string): number | null {
  const id = Number(valor);
  return Number.isInteger(id) && id > 0 ? id : null;
}

const naoEncontrado = () => NextResponse.json({ error: "Professor não encontrado." }, { status: 404 });

/** Professor + resumo de atividades (calculado a partir dos agendamentos). */
async function buscarDetalhe(id: number) {
  const professor = await prisma.professor.findUnique({ where: { id }, select: SELECAO_PROFESSOR });
  if (!professor) return null;

  const [emAula, aulasConcluidas, proximasAulas, alunos] = await Promise.all([
    prisma.agendamento.count({ where: { ...filtroEmAulaAgora(), professorId: id } }),
    prisma.agendamento.count({ where: { professorId: id, status: "CONCLUIDO" } }),
    prisma.agendamento.count({ where: { professorId: id, status: "AGENDADO", dataHora: { gt: new Date() } } }),
    prisma.agendamento.findMany({
      where: { professorId: id, alunoId: { not: null }, status: { not: "CANCELADO" } },
      distinct: ["alunoId"],
      select: { alunoId: true },
    }),
  ]);

  return {
    ...formatarProfessor(professor, emAula > 0),
    resumo: { aulasConcluidas, proximasAulas, alunosAtendidos: alunos.length },
  };
}

export async function GET(_request: NextRequest, { params }: Params) {
  const negado = await exigirSessao();
  if (negado) return negado;

  try {
    const id = lerId((await params).id);
    const detalhe = id ? await buscarDetalhe(id) : null;
    return detalhe ? NextResponse.json(detalhe) : naoEncontrado();
  } catch (error) {
    console.error("Erro ao buscar professor:", error);
    return NextResponse.json({ error: "Erro ao buscar professor." }, { status: 500 });
  }
}

/** Atualiza os dados e troca os vínculos com disciplinas pelos que vieram na requisição. */
export async function PUT(request: NextRequest, { params }: Params) {
  const negado = await exigirSessao();
  if (negado) return negado;

  try {
    const id = lerId((await params).id);
    if (!id) return naoEncontrado();

    const lido = lerDadosProfessor(await request.json().catch(() => null));
    if ("erro" in lido) {
      return NextResponse.json({ error: lido.erro }, { status: 400 });
    }
    const { dados, disciplinaIds, curriculo } = lido;

    const atual = await prisma.professor.findUnique({
      where: { id },
      select: { disciplinas: { select: { disciplinaId: true } } },
    });
    if (!atual) return naoEncontrado();

    const disciplinas = await prisma.disciplina.findMany({
      where: { id: { in: disciplinaIds } },
      select: { id: true, nome: true },
    });
    if (disciplinas.length !== disciplinaIds.length) {
      return NextResponse.json({ error: "Uma das disciplinas escolhidas não existe mais." }, { status: 400 });
    }
    const principal = disciplinaIds.length > 0 ? disciplinas.find((d) => d.id === disciplinaIds[0]) : undefined;
    const anteriores = atual.disciplinas.map((d) => d.disciplinaId);

    await prisma.$transaction(async (tx) => {
      await tx.professor.update({
        where: { id },
        data: { ...dados, ...dadosCurriculo(curriculo), especialidade: principal?.nome ?? null },
      });
      // Mantém a data de vínculo das disciplinas que continuam; só remove/cria a diferença.
      await tx.disciplinaProfessor.deleteMany({
        where: { professorId: id, disciplinaId: { notIn: disciplinaIds } },
      });
      await tx.disciplinaProfessor.createMany({
        data: disciplinaIds.map((disciplinaId) => ({ professorId: id, disciplinaId })),
        skipDuplicates: true,
      });
      await atualizarProfessorNomeDasDisciplinas(tx, [...anteriores, ...disciplinaIds]);
    });

    return NextResponse.json(await buscarDetalhe(id));
  } catch (error) {
    if (erroCpfDuplicado(error)) {
      return NextResponse.json({ error: "Já existe um professor com este CPF." }, { status: 409 });
    }
    console.error("Erro ao atualizar professor:", error);
    return NextResponse.json({ error: "Erro ao atualizar professor." }, { status: 500 });
  }
}

/** Inativa ou reativa o professor: `{ "ativo": false }`. Mantém vínculos e histórico de aulas. */
export async function PATCH(request: NextRequest, { params }: Params) {
  const negado = await exigirSessao();
  if (negado) return negado;

  try {
    const id = lerId((await params).id);
    if (!id) return naoEncontrado();
    const body = await request.json().catch(() => null);
    if (!body || typeof body.ativo !== "boolean") {
      return NextResponse.json({ error: "Informe \"ativo\": true ou false." }, { status: 400 });
    }
    const atual = await prisma.professor.findUnique({
      where: { id },
      select: { disciplinas: { select: { disciplinaId: true } } },
    });
    if (!atual) return naoEncontrado();

    await prisma.$transaction(async (tx) => {
      await tx.professor.update({ where: { id }, data: { ativo: body.ativo } });
      // Professor inativo deixa de ser o nome exibido nas disciplinas.
      await atualizarProfessorNomeDasDisciplinas(
        tx,
        atual.disciplinas.map((d) => d.disciplinaId),
      );
    });
    return NextResponse.json(await buscarDetalhe(id));
  } catch (error) {
    console.error("Erro ao alterar status do professor:", error);
    return NextResponse.json({ error: "Erro ao alterar status do professor." }, { status: 500 });
  }
}

/** Só exclui professor sem aulas agendadas ou realizadas, para não perder o histórico. */
export async function DELETE(_request: NextRequest, { params }: Params) {
  const negado = await exigirSessao();
  if (negado) return negado;

  try {
    const id = lerId((await params).id);
    if (!id) return naoEncontrado();
    const professor = await prisma.professor.findUnique({
      where: { id },
      select: {
        disciplinas: { select: { disciplinaId: true } },
        _count: { select: { agendamentos: true } },
      },
    });
    if (!professor) return naoEncontrado();

    const qtd = professor._count.agendamentos;
    if (qtd > 0) {
      return NextResponse.json(
        {
          error: `Não é possível excluir: o professor tem ${qtd} ${
            qtd === 1 ? "aula registrada" : "aulas registradas"
          } na agenda. Use "Inativar Professor" para mantê-lo sem uso.`,
        },
        { status: 409 },
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.professor.delete({ where: { id } }); // vínculos com disciplinas saem em cascata
      await atualizarProfessorNomeDasDisciplinas(
        tx,
        professor.disciplinas.map((d) => d.disciplinaId),
      );
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Erro ao excluir professor:", error);
    return NextResponse.json({ error: "Erro ao excluir professor." }, { status: 500 });
  }
}
