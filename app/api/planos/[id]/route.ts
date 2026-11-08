import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Plano as PrismaPlano } from "@prisma/client";
import type { IconePlanoId, Plano, PlanoStatus } from "@/features/planos/types";

interface Params {
  params: Promise<{ id: string }>;
}

function mapearPlano(p: PrismaPlano): Plano {
  let beneficios: string[] = [];
  try {
    beneficios = typeof p.beneficios === "string" ? JSON.parse(p.beneficios) : [];
  } catch {
    beneficios = [];
  }

  return {
    id: p.id,
    nome: p.nome,
    descricao: p.descricao,
    status: p.status as PlanoStatus,
    valorMensal: p.valorMensal,
    aulasIncluidas: p.aulasIncluidas,
    beneficios,
    icone: p.icone as IconePlanoId,
    capa: p.capaTipo === "imagem"
      ? { tipo: "imagem", dataUrl: p.capaDataUrl || "" }
      : { tipo: "gradiente", de: p.capaDe || "#9e4300", para: p.capaPara || "#f2711c" },
    criadoEm: p.createdAt ? p.createdAt.toISOString() : new Date().toISOString(),
    atualizadoEm: p.updatedAt ? p.updatedAt.toISOString() : new Date().toISOString(),
  };
}

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const plano = await prisma.plano.findUnique({
      where: { id },
    });

    if (!plano) {
      return NextResponse.json({ error: "Plano não encontrado." }, { status: 404 });
    }

    return NextResponse.json(mapearPlano(plano));
  } catch (error) {
    console.error("Erro ao buscar plano:", error);
    return NextResponse.json({ error: "Erro ao buscar plano." }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => null);

    if (!body || !body.nome) {
      return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
    }

    // Verifica se outro plano já usa este nome
    const outro = await prisma.plano.findFirst({
      where: {
        nome: body.nome.trim(),
        NOT: { id },
      },
    });
    if (outro) {
      return NextResponse.json({ error: "Já existe um plano com este nome." }, { status: 409 });
    }

    const atualizado = await prisma.plano.update({
      where: { id },
      data: {
        nome: body.nome.trim(),
        descricao: body.descricao?.trim(),
        status: body.status,
        valorMensal: body.valorMensal ?? null,
        aulasIncluidas: body.aulasIncluidas ?? null,
        beneficios: JSON.stringify(body.beneficios || []),
        icone: body.icone,
        capaTipo: body.capa?.tipo,
        capaDe: body.capa?.tipo === "gradiente" ? body.capa.de : null,
        capaPara: body.capa?.tipo === "gradiente" ? body.capa.para : null,
        capaDataUrl: body.capa?.tipo === "imagem" ? body.capa.dataUrl : null,
      },
    });

    return NextResponse.json(mapearPlano(atualizado));
  } catch (error) {
    console.error("Erro ao atualizar plano:", error);
    return NextResponse.json({ error: "Erro ao atualizar plano." }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    await prisma.plano.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir plano:", error);
    return NextResponse.json({ error: "Erro ao excluir plano." }, { status: 500 });
  }
}
