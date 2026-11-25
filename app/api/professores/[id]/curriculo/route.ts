import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { exigirSessao } from "@/lib/api-auth";

/** Devolve o arquivo do currículo para visualizar (PDF abre no navegador) ou baixar. */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const negado = await exigirSessao();
  if (negado) return negado;

  try {
    const id = Number((await params).id);
    const professor = Number.isInteger(id)
      ? await prisma.professor.findUnique({
          where: { id },
          select: { curriculoNome: true, curriculoTipo: true, curriculoDados: true },
        })
      : null;
    if (!professor?.curriculoDados || !professor.curriculoTipo) {
      return NextResponse.json({ error: "Currículo não encontrado." }, { status: 404 });
    }

    const base64 = professor.curriculoDados.slice(professor.curriculoDados.indexOf(",") + 1);
    const nome = professor.curriculoNome || "curriculo";
    return new NextResponse(Buffer.from(base64, "base64"), {
      headers: {
        "Content-Type": professor.curriculoTipo,
        "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(nome)}`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("Erro ao abrir currículo:", error);
    return NextResponse.json({ error: "Erro ao abrir o currículo." }, { status: 500 });
  }
}
