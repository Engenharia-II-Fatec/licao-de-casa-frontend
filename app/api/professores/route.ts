import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const professores = await prisma.professor.findMany({
      where: { ativo: true },
      orderBy: { nome: "asc" },
    });

    return NextResponse.json(
      professores.map((p) => ({
        id: p.id,
        nome: p.nome,
        especialidade: p.especialidade,
        email: p.email || undefined,
        telefone: p.telefone || undefined,
      }))
    );
  } catch (error) {
    console.error("Erro ao listar professores:", error);
    return NextResponse.json({ error: "Erro ao listar professores." }, { status: 500 });
  }
}
