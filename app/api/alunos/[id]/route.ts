import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const aluno = await prisma.aluno.findUnique({
      where: { id },
      include: { paymentHistory: true },
    });

    if (!aluno) {
      return NextResponse.json({ error: "Aluno não encontrado." }, { status: 404 });
    }

    return NextResponse.json({
      ...aluno,
      photo: aluno.photo || undefined,
      guardianRole: aluno.guardianRole || undefined,
      guardianPhone: aluno.guardianPhone || undefined,
      guardianPhoto: aluno.guardianPhoto || undefined,
      email: aluno.email || undefined,
      rg: aluno.rg || undefined,
      cpf: aluno.cpf || undefined,
      birthDate: aluno.birthDate || undefined,
      schoolGrade: aluno.schoolGrade || undefined,
      schoolName: aluno.schoolName || undefined,
      cep: aluno.cep || undefined,
      address: aluno.address || undefined,
      number: aluno.number || undefined,
      complement: aluno.complement || undefined,
      neighborhood: aluno.neighborhood || undefined,
      city: aluno.city || undefined,
      state: aluno.state || undefined,
      planPrice: aluno.planPrice || undefined,
      grade: aluno.grade || undefined,
      shift: aluno.shift || undefined,
      joinedDate: aluno.joinedDate || undefined,
      renewalDate: aluno.renewalDate || undefined,
      paymentHistory: aluno.paymentHistory.map((p) => ({
        id: p.id,
        description: p.description,
        date: p.date,
        amount: p.amount,
        status: p.status,
      })),
    });
  } catch (error) {
    console.error("Erro ao buscar aluno:", error);
    return NextResponse.json({ error: "Erro ao buscar aluno." }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => null);

    if (!body) {
      return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
    }

    const atualizado = await prisma.aluno.update({
      where: { id },
      data: {
        name: body.name,
        initials: body.initials,
        avatarBg: body.avatarBg,
        avatarText: body.avatarText,
        photo: body.photo || null,
        guardian: body.guardian,
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
        plan: body.plan,
        planPrice: body.planPrice || null,
        planBadgeType: body.planBadgeType,
        status: body.status,
        grade: body.grade || null,
        shift: body.shift || null,
        joinedDate: body.joinedDate || null,
        renewalDate: body.renewalDate || null,
      },
      include: {
        paymentHistory: true,
      },
    });

    return NextResponse.json({
      ...atualizado,
      photo: atualizado.photo || undefined,
      guardianRole: atualizado.guardianRole || undefined,
      guardianPhone: atualizado.guardianPhone || undefined,
      guardianPhoto: atualizado.guardianPhoto || undefined,
      email: atualizado.email || undefined,
      rg: atualizado.rg || undefined,
      cpf: atualizado.cpf || undefined,
      birthDate: atualizado.birthDate || undefined,
      schoolGrade: atualizado.schoolGrade || undefined,
      schoolName: atualizado.schoolName || undefined,
      cep: atualizado.cep || undefined,
      address: atualizado.address || undefined,
      number: atualizado.number || undefined,
      complement: atualizado.complement || undefined,
      neighborhood: atualizado.neighborhood || undefined,
      city: atualizado.city || undefined,
      state: atualizado.state || undefined,
      planPrice: atualizado.planPrice || undefined,
      grade: atualizado.grade || undefined,
      shift: atualizado.shift || undefined,
      joinedDate: atualizado.joinedDate || undefined,
      renewalDate: atualizado.renewalDate || undefined,
      paymentHistory: atualizado.paymentHistory.map((p) => ({
        id: p.id,
        description: p.description,
        date: p.date,
        amount: p.amount,
        status: p.status,
      })),
    });
  } catch (error) {
    console.error("Erro ao atualizar aluno:", error);
    return NextResponse.json({ error: "Erro ao atualizar aluno." }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    await prisma.aluno.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir aluno:", error);
    return NextResponse.json({ error: "Erro ao excluir aluno." }, { status: 500 });
  }
}
