import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Plano as PrismaPlano, Prisma } from "@prisma/client";
import type { IconePlanoId, Plano, PlanoStatus } from "@/features/planos/types";

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const busca = searchParams.get("busca")?.trim();
    const status = searchParams.get("status")?.trim();

    const where: Prisma.PlanoWhereInput = {};
    if (status && (status === "ATIVO" || status === "INATIVO")) {
      where.status = status;
    }
    if (busca) {
      where.OR = [
        { nome: { contains: busca } },
        { descricao: { contains: busca } },
      ];
    }

    const planos = await prisma.plano.findMany({
      where,
      orderBy: { nome: "asc" },
    });

    return NextResponse.json(planos.map(mapearPlano));
  } catch (error) {
    console.error("Erro ao listar planos:", error);
    return NextResponse.json({ error: "Erro ao listar planos." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || !body.nome || !body.descricao) {
      return NextResponse.json({ error: "Nome e descrição são obrigatórios." }, { status: 400 });
    }

    const jaExiste = await prisma.plano.findUnique({
      where: { nome: body.nome.trim() },
    });
    if (jaExiste) {
      return NextResponse.json({ error: "Já existe um plano com este nome." }, { status: 409 });
    }

    const criado = await prisma.plano.create({
      data: {
        nome: body.nome.trim(),
        descricao: body.descricao.trim(),
        status: body.status || "ATIVO",
        valorMensal: body.valorMensal ?? null,
        aulasIncluidas: body.aulasIncluidas ?? null,
        beneficios: JSON.stringify(body.beneficios || []),
        icone: body.icone || "school",
        capaTipo: body.capa?.tipo || "gradiente",
        capaDe: body.capa?.tipo === "gradiente" ? body.capa.de : null,
        capaPara: body.capa?.tipo === "gradiente" ? body.capa.para : null,
        capaDataUrl: body.capa?.tipo === "imagem" ? body.capa.dataUrl : null,
      },
    });

    return NextResponse.json(mapearPlano(criado), { status: 201 });
  } catch (error) {
    console.error("Erro ao criar plano:", error);
    return NextResponse.json({ error: "Erro ao criar plano." }, { status: 500 });
  }
}
