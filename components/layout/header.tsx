"use client";

import { usePathname } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { IconBell, IconHelp, IconMenu, IconUser } from "@/components/ui/icons";
import { AjudaDialog } from "./ajuda";
import { tituloDaRota } from "./nav-config";

export function Header({
  onOpenMenu,
  menuOpen,
}: {
  onOpenMenu: () => void;
  menuOpen: boolean;
}) {
  const { user } = useAuth();
  const [ajudaAberta, setAjudaAberta] = useState(false);

  return (
    <header className="sticky top-0 z-20 flex h-20 items-center justify-between bg-surface/80 px-5 shadow-ambient backdrop-blur-[12px] md:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="Abrir menu"
          aria-expanded={menuOpen}
          aria-controls="menu-lateral"
          className="grid size-10 place-items-center rounded-full text-on-surface-variant hover:bg-surface-container-high md:hidden cursor-pointer"
        >
          <IconMenu />
        </button>
        <p className="bg-linear-to-r from-primary to-primary-container bg-clip-text text-xl font-bold text-transparent">
          {/* usePathname() exige Suspense em rotas dinâmicas com cacheComponents. */}
          <Suspense fallback="Espaço Lição de Casa">
            <TituloDaRota />
          </Suspense>
        </p>
      </div>

      <div className="flex items-center gap-1.5 md:gap-3">
        <Notificacoes />
        <button
          type="button"
          aria-label="Ajuda"
          title="Ajuda"
          onClick={() => setAjudaAberta(true)}
          className="hidden size-10 place-items-center rounded-full text-on-surface-variant hover:bg-surface-container-high sm:grid cursor-pointer"
        >
          <IconHelp />
        </button>
        <AjudaDialog topico={ajudaAberta ? "geral" : null} onClose={() => setAjudaAberta(false)} />

        <div className="flex items-center gap-2 pl-1">
          <div
            aria-label={user?.name || "Usuário"}
            title={user ? `${user.name || user.email} (${user.role})` : "Usuário"}
            className="grid size-10 place-items-center rounded-full bg-primary-fixed text-primary font-bold text-xs select-none"
          >
            {user?.name ? (
              user.name
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()
            ) : (
              <IconUser />
            )}
          </div>
          {user && (
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-on-surface leading-tight max-w-[130px] truncate">
                {user.name || user.username || user.email}
              </span>
              <span className="text-[0.625rem] font-bold text-primary uppercase tracking-wider">
                {user.role}
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function TituloDaRota() {
  return tituloDaRota(usePathname());
}

/** Sino de notificações: abre um painel (ainda sem notificações reais no sistema). */
function Notificacoes() {
  const [aberto, setAberto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!aberto) return;
    const fecharFora = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setAberto(false);
    };
    const fecharEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAberto(false);
    };
    document.addEventListener("mousedown", fecharFora);
    document.addEventListener("keydown", fecharEsc);
    return () => {
      document.removeEventListener("mousedown", fecharFora);
      document.removeEventListener("keydown", fecharEsc);
    };
  }, [aberto]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label="Notificações"
        title="Notificações"
        aria-expanded={aberto}
        aria-haspopup="dialog"
        onClick={() => setAberto((v) => !v)}
        className="grid size-10 place-items-center rounded-full text-on-surface-variant hover:bg-surface-container-high cursor-pointer"
      >
        <IconBell />
      </button>
      {aberto && (
        <div
          role="dialog"
          aria-label="Notificações"
          className="absolute right-0 top-12 z-30 w-72 rounded-2xl bg-surface-container-lowest p-5 text-center shadow-ambient"
        >
          <span className="mx-auto mb-3 grid size-10 place-items-center rounded-full bg-surface-container-low text-on-surface-variant">
            <IconBell />
          </span>
          <p className="text-sm font-bold text-on-surface">Você não tem novas notificações</p>
          <p className="mt-1 text-xs text-on-surface-variant">
            Avisos de pagamentos e agendamentos aparecerão aqui.
          </p>
        </div>
      )}
    </div>
  );
}
