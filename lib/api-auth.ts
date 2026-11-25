import { NextResponse } from "next/server";
import { getSession } from "./auth";

/**
 * Garante que a requisição a uma rota de API vem de um usuário logado.
 * O middleware protege só as páginas; as rotas em /api precisam checar a sessão.
 *
 * Uso: `const negado = await exigirSessao(); if (negado) return negado;`
 */
export async function exigirSessao(): Promise<NextResponse | null> {
  const usuario = await getSession();
  if (!usuario) {
    return NextResponse.json({ error: "Faça login para continuar." }, { status: 401 });
  }
  return null;
}
