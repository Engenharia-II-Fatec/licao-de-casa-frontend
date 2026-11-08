import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const responsaveis = await prisma.responsavel.findMany({
      orderBy: { createdAt: "desc" },
    });

    const formatados = responsaveis.map((r) => ({
      id: r.id,
      name: r.name,
      role: r.role,
      phone: r.phone,
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
    }));

    return NextResponse.json(formatados);
  } catch (error) {
    console.error("Erro ao listar responsáveis:", error);
    return NextResponse.json({ error: "Erro ao listar responsáveis." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || !body.name) {
      return NextResponse.json({ error: "Nome do responsável é obrigatório." }, { status: 400 });
    }

    const criado = await prisma.responsavel.create({
      data: {
        name: body.name,
        role: body.role || "Responsável",
        phone: body.phone || "(11) 98877-6655",
        photo: body.photo || null,
        cpf: body.cpf || null,
        rg: body.rg || null,
        email: body.email || null,
        cep: body.cep || null,
        address: body.address || null,
        number: body.number || null,
        complement: body.complement || null,
        neighborhood: body.neighborhood || null,
        city: body.city || null,
        state: body.state || null,
      },
    });

    return NextResponse.json({
      id: criado.id,
      name: criado.name,
      role: criado.role,
      phone: criado.phone,
      photo: criado.photo || undefined,
      cpf: criado.cpf || undefined,
      rg: criado.rg || undefined,
      email: criado.email || undefined,
      cep: criado.cep || undefined,
      address: criado.address || undefined,
      number: criado.number || undefined,
      complement: criado.complement || undefined,
      neighborhood: criado.neighborhood || undefined,
      city: criado.city || undefined,
      state: criado.state || undefined,
    }, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar responsável:", error);
    return NextResponse.json({ error: "Erro ao criar responsável." }, { status: 500 });
  }
}
