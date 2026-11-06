import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Corpo da requisição inválido." },
        { status: 400 }
      );
    }

    const { user, password, remember } = body;

    if (!user || typeof user !== "string" || !user.trim()) {
      return NextResponse.json(
        { error: "Por favor, informe seu e-mail ou usuário." },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { error: "Por favor, informe sua senha." },
        { status: 400 }
      );
    }

    const identifier = user.trim().toLowerCase();

    // Busca por e-mail ou nome de usuário
    const foundUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { username: identifier },
        ],
      },
    });

    if (!foundUser) {
      return NextResponse.json(
        { error: "Credenciais inválidas. Verifique o usuário e a senha." },
        { status: 401 }
      );
    }

    const passwordMatches = await bcrypt.compare(password, foundUser.password);

    if (!passwordMatches) {
      return NextResponse.json(
        { error: "Credenciais inválidas. Verifique o usuário e a senha." },
        { status: 401 }
      );
    }

    const sessionUser = {
      id: foundUser.id,
      name: foundUser.name,
      username: foundUser.username,
      email: foundUser.email,
      role: foundUser.role,
    };

    await createSession(sessionUser, Boolean(remember));

    return NextResponse.json({
      success: true,
      message: "Login realizado com sucesso!",
      user: sessionUser,
    });
  } catch (error) {
    console.error("Erro no endpoint de login:", error);
    return NextResponse.json(
      { error: "Ocorreu um erro interno no servidor ao realizar o login." },
      { status: 500 }
    );
  }
}
