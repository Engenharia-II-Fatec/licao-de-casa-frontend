import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE_NAME, verifyToken } from "./lib/auth-tokens";

const PROTECTED_PREFIXES = [
  "/disciplinas",
  "/planos",
  "/alunos",
  "/responsaveis",
  "/professores",
  "/agendamentos",
  "/financeiro",
  "/relatorios",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const user = token ? await verifyToken(token) : null;
  const isAuthenticated = Boolean(user);

  const isProtectedRoute = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  // Se acessar rota protegida sem estar logado, redireciona para login
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL("/", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Se já estiver logado e tentar acessar a página de login (/), redireciona para a aplicação
  if (pathname === "/" && isAuthenticated) {
    return NextResponse.redirect(new URL("/planos", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt, etc.
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
