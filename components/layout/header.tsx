"use client";

import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { useAuth } from "@/lib/auth-context";
import { IconBell, IconHelp, IconMenu, IconUser } from "@/components/ui/icons";
import { tituloDaRota } from "./nav-config";

export function Header({
  onOpenMenu,
  menuOpen,
}: {
  onOpenMenu: () => void;
  menuOpen: boolean;
}) {
  const { user } = useAuth();

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
        <button
          type="button"
          aria-label="Notificações"
          className="grid size-10 place-items-center rounded-full text-on-surface-variant hover:bg-surface-container-high cursor-pointer"
        >
          <IconBell />
        </button>
        <button
          type="button"
          aria-label="Ajuda"
          className="hidden size-10 place-items-center rounded-full text-on-surface-variant hover:bg-surface-container-high sm:grid cursor-pointer"
        >
          <IconHelp />
        </button>

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
