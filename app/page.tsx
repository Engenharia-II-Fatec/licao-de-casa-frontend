"use client";

import { FormEvent, Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

const Icon = ({
  children,
  className = "size-[18px]",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className={className}
  >
    {children}
  </svg>
);

const CapIcon = () => (
  <Icon className="size-6">
    <path d="M22 10 12 5 2 10l10 5 10-5Z" />
    <path d="M6 12v5c3 2.5 9 2.5 12 0v-5" />
    <path d="M22 10v6" />
  </Icon>
);
const UserIcon = () => (
  <Icon>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
  </Icon>
);
const LockIcon = () => (
  <Icon>
    <rect x="4" y="11" width="16" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </Icon>
);
const EyeIcon = ({ off }: { off?: boolean }) => (
  <Icon>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
    <circle cx="12" cy="12" r="3" />
    {off && <path d="M4 4l16 16" />}
  </Icon>
);
const LoginIcon = () => (
  <Icon>
    <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" />
    <path d="M10 8l4 4-4 4" />
    <path d="M14 12H3" />
  </Icon>
);
const HeadsetIcon = () => (
  <Icon className="size-[15px]">
    <path d="M4 14v-2a8 8 0 0 1 16 0v2" />
    <rect x="3" y="14" width="4" height="6" rx="2" />
    <rect x="17" y="14" width="4" height="6" rx="2" />
  </Icon>
);

const labelClass = "text-sm font-semibold text-on-surface";
const inputClass =
  "h-[3.25rem] w-full rounded-2xl bg-surface-container-low px-12 text-[0.9rem] text-on-surface " +
  "outline-none transition placeholder:text-on-surface-variant/50 " +
  "focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/45";
const leadingClass =
  "pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/70";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();

  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user, password, remember }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErrorMessage(
          data.error || "Erro ao realizar login. Por favor, verifique seus dados."
        );
        return;
      }

      await refreshUser();
      const redirectUrl = searchParams.get("from") || "/planos";
      router.push(redirectUrl);
      router.refresh();
    } catch {
      setErrorMessage("Erro de conexão com o servidor. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {errorMessage && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-2xl border border-error/20 bg-error-container/40 p-3.5 text-xs font-semibold text-error"
        >
          <svg
            className="size-4 shrink-0 mt-0.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <label htmlFor="user" className={labelClass}>
          E-mail ou Usuário
        </label>
        <div className="relative">
          <span className={leadingClass}>
            <UserIcon />
          </span>
          <input
            id="user"
            type="text"
            autoComplete="username"
            placeholder="admin ou admin@licao.com"
            value={user}
            onChange={(e) => setUser(e.target.value)}
            className={inputClass}
            required
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="password" className={labelClass}>
          Senha
        </label>
        <div className="relative">
          <span className={leadingClass}>
            <LockIcon />
          </span>
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Sua senha secreta"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            className="absolute right-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full text-on-surface-variant/70 transition hover:bg-surface-container-high focus-visible:outline-2 focus-visible:outline-primary"
          >
            <EyeIcon off={showPassword} />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 text-[0.8rem]">
        <label className="relative inline-flex cursor-pointer items-center gap-2.5 text-on-surface-variant">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="peer absolute size-[1.1rem] opacity-0"
          />
          <span className="grid size-[1.1rem] place-items-center rounded-[0.35rem] bg-surface-container-highest text-white transition peer-checked:bg-primary-container peer-checked:[&>svg]:opacity-100 peer-focus-visible:ring-2 peer-focus-visible:ring-primary/45">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-3 opacity-0 transition"
              aria-hidden="true"
            >
              <path d="M5 12.5l4.5 4.5L19 7.5" />
            </svg>
          </span>
          Lembrar de mim
        </label>
        <Link
          href="/recuperar-senha"
          className="font-semibold text-secondary hover:underline"
        >
          Esqueceu a senha?
        </Link>
      </div>

      {/* CTA: gradiente 135° primary → primary-container */}
      <button
        type="submit"
        disabled={loading}
        className="mt-1 inline-flex h-14 items-center justify-center gap-2.5 rounded-full bg-gradient-to-br from-primary to-primary-container text-[0.95rem] font-bold text-white shadow-cta transition hover:shadow-cta-hover active:scale-[0.99] disabled:cursor-progress disabled:opacity-70 focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-primary-fixed"
      >
        {loading ? "Entrando..." : "Entrar"}
        {!loading && <LoginIcon />}
      </button>

      {/* Dica de demonstração para facilitar avaliação */}
      <div className="rounded-xl bg-surface-container-lowest/80 p-3 text-center text-[0.75rem] text-on-surface-variant/80 border border-surface-container-highest/60">
        <span className="font-semibold text-primary">Acesso Administrador:</span>{" "}
        <span className="font-mono">admin</span> /{" "}
        <span className="font-mono">admin123</span>
      </div>
    </form>
  );
}

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center gap-8 overflow-hidden bg-surface px-5 py-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_0%_100%,rgba(242,113,28,0.1),transparent_70%),radial-gradient(50%_40%_at_100%_0%,rgba(92,177,255,0.08),transparent_70%)]"
      />

      <header className="relative flex flex-col items-center gap-4">
        <div className="grid size-16 place-items-center rounded-[1.25rem] bg-surface-container-lowest text-primary-container shadow-ambient">
          <CapIcon />
        </div>
        <h1 className="text-[1.375rem] font-extrabold tracking-tight text-primary">
          Espaço Lição de Casa
        </h1>
      </header>

      <section className="relative w-full max-w-[25rem] rounded-3xl bg-surface/80 px-5 pb-6 pt-7 shadow-ambient backdrop-blur-[12px] sm:px-8 sm:pb-7 sm:pt-9">
        <Suspense fallback={<div className="h-48 flex items-center justify-center text-sm text-on-surface-variant">Carregando...</div>}>
          <LoginForm />
        </Suspense>

        <div className="mt-8 flex flex-col items-center gap-3 text-xs text-on-surface-variant">
          <p>Precisa de ajuda com seu acesso?</p>
          <Link
            href="/suporte"
            className="inline-flex items-center gap-2 rounded-full bg-secondary-container/15 px-4 py-2 text-xs font-semibold text-secondary transition hover:bg-secondary-container/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
          >
            <HeadsetIcon />
            Falar com o Suporte
          </Link>
        </div>
      </section>

      <footer className="relative flex flex-col items-center gap-2.5">
        <nav
          aria-label="Rodapé"
          className="flex gap-6 text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-on-surface-variant"
        >
          <Link href="/privacidade" className="hover:text-primary">
            Privacidade
          </Link>
          <Link href="/termos" className="hover:text-primary">
            Termos
          </Link>
          <Link href="/contato" className="hover:text-primary">
            Contato
          </Link>
        </nav>
        <p className="text-center text-[0.65rem] text-on-surface-variant/55">
          © 2026 Espaço Lição de Casa. Todos os direitos reservados.
        </p>
      </footer>
    </main>
  );
}
