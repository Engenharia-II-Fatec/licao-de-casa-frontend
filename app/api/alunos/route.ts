import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const alunos = await prisma.aluno.findMany({
      include: {
        paymentHistory: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const formatados = alunos.map((a) => ({
      id: a.id,
      name: a.name,
      initials: a.initials,
      avatarBg: a.avatarBg,
      avatarText: a.avatarText,
      photo: a.photo || undefined,
      guardian: a.guardian,
      guardianRole: a.guardianRole || undefined,
      guardianPhone: a.guardianPhone || undefined,
      guardianPhoto: a.guardianPhoto || undefined,
      email: a.email || undefined,
      rg: a.rg || undefined,
      cpf: a.cpf || undefined,
      birthDate: a.birthDate || undefined,
      schoolGrade: a.schoolGrade || undefined,
      schoolName: a.schoolName || undefined,
      cep: a.cep || undefined,
      address: a.address || undefined,
      number: a.number || undefined,
      complement: a.complement || undefined,
      neighborhood: a.neighborhood || undefined,
      city: a.city || undefined,
      state: a.state || undefined,
      plan: a.plan,
      planPrice: a.planPrice || undefined,
      planBadgeType: (a.planBadgeType as "orange" | "gray") || "orange",
      status: (a.status as "Ativo" | "Inativo") || "Ativo",
      grade: a.grade || undefined,
      shift: a.shift || undefined,
      joinedDate: a.joinedDate || undefined,
      renewalDate: a.renewalDate || undefined,
      paymentHistory: a.paymentHistory.map((p) => ({
        id: p.id,
        description: p.description,
        date: p.date,
        amount: p.amount,
        status: p.status as "Pago" | "Pendente",
      })),
    }));

    return NextResponse.json(formatados);
  } catch (error) {
    console.error("Erro ao listar alunos:", error);
    return NextResponse.json({ error: "Erro ao listar alunos." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || !body.name) {
      return NextResponse.json({ error: "Nome do aluno é obrigatório." }, { status: 400 });
    }

    const alunoId = body.id || `2024-0${Math.floor(890 + Math.random() * 100)}`;

    const criado = await prisma.aluno.create({
      data: {
        id: alunoId,
        name: body.name,
        initials: body.initials || body.name.slice(0, 2).toUpperCase(),
        avatarBg: body.avatarBg || "bg-[#d0e4ff]",
        avatarText: body.avatarText || "text-[#00629f]",
        photo: body.photo || null,
        guardian: body.guardian || body.name,
        guardianRole: body.guardianRole || null,
        guardianPhone: body.guardianPhone || null,
        guardianPhoto: body.guardianPhoto || null,
        email: body.email || null,
        rg: body.rg || null,
        cpf: body.cpf || null,
        birthDate: body.birthDate || null,
        schoolGrade: body.schoolGrade || null,
        schoolName: body.schoolName || null,
        cep: body.cep || null,
        address: body.address || null,
        number: body.number || null,
        complement: body.complement || null,
        neighborhood: body.neighborhood || null,
        city: body.city || null,
        state: body.state || null,
        plan: body.plan || "Atelier Total",
        planPrice: body.planPrice || null,
        planBadgeType: body.planBadgeType || "orange",
        status: body.status || "Ativo",
        grade: body.grade || null,
        shift: body.shift || null,
        joinedDate: body.joinedDate || null,
        renewalDate: body.renewalDate || null,
        paymentHistory: body.paymentHistory && Array.isArray(body.paymentHistory)
          ? {
              create: body.paymentHistory.map((p: { id?: string; description: string; date: string; amount: string; status?: string }) => ({
                id: p.id ? `pag-${alunoId}-${p.id}` : undefined,
                description: p.description,
                date: p.date,
                amount: p.amount,
                status: p.status || "Pendente",
              })),
            }
          : undefined,
      },
      include: {
        paymentHistory: true,
      },
    });

    const formatado = {
      ...criado,
      photo: criado.photo || undefined,
      guardianRole: criado.guardianRole || undefined,
      guardianPhone: criado.guardianPhone || undefined,
      guardianPhoto: criado.guardianPhoto || undefined,
      email: criado.email || undefined,
      rg: criado.rg || undefined,
      cpf: criado.cpf || undefined,
      birthDate: criado.birthDate || undefined,
      schoolGrade: criado.schoolGrade || undefined,
      schoolName: criado.schoolName || undefined,
      cep: criado.cep || undefined,
      address: criado.address || undefined,
      number: criado.number || undefined,
      complement: criado.complement || undefined,
      neighborhood: criado.neighborhood || undefined,
      city: criado.city || undefined,
      state: criado.state || undefined,
      planPrice: criado.planPrice || undefined,
      grade: criado.grade || undefined,
      shift: criado.shift || undefined,
      joinedDate: criado.joinedDate || undefined,
      renewalDate: criado.renewalDate || undefined,
      paymentHistory: criado.paymentHistory.map((p) => ({
        id: p.id,
        description: p.description,
        date: p.date,
        amount: p.amount,
        status: p.status as "Pago" | "Pendente",
      })),
    };

    return NextResponse.json(formatado, { status: 201 });
  } catch (error) {
    console.error("Erro ao cadastrar aluno:", error);
    return NextResponse.json({ error: "Erro ao cadastrar aluno." }, { status: 500 });
  }
}
