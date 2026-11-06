import { cookies } from "next/headers";
import {
  AUTH_COOKIE_NAME,
  SessionUser,
  signToken,
  verifyToken,
} from "./auth-tokens";

export * from "./auth-tokens";

const DEFAULT_MAX_AGE_SESSION = 60 * 60 * 24; // 24 horas
const REMEMBER_ME_MAX_AGE = 60 * 60 * 24 * 30; // 30 dias

/**
 * Cria a sessão configurando um cookie seguro HttpOnly
 */
export async function createSession(user: SessionUser, remember: boolean = false) {
  const maxAge = remember ? REMEMBER_ME_MAX_AGE : DEFAULT_MAX_AGE_SESSION;
  const token = await signToken(user, maxAge);
  const cookieStore = await cookies();

  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  });
}

/**
 * Recupera o usuário da sessão a partir do cookie da requisição
 */
export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    if (!token) return null;
    return await verifyToken(token);
  } catch {
    return null;
  }
}

/**
 * Destrói a sessão removendo o cookie de autenticação
 */
export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
}
