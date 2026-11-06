"use client";

import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { IconBell, IconHelp, IconMenu, IconUser } from "@/components/ui/icons";
import { tituloDaRota } from "./nav-config";

export function Header({
  onOpenMenu,
  menuOpen,
}: {
  onOpenMenu: () => void;
  menuOpen: boolean;
}) {
  return (
    <header className="sticky top-0 z-20 flex h-20 items-center justify-between bg-surface/80 px-5 shadow-ambient backdrop-blur-[12px] md:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="Abrir menu"
          aria-expanded={menuOpen}
          aria-controls="menu-lateral"
          className="grid size-10 place-items-center rounded-full text-on-surface-variant hover:bg-surface-container-high md:hidden"
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

      <div className="flex items-center gap-1 md:gap-3">
        <button
          type="button"
          aria-label="Notificações"
          className="grid size-10 place-items-center rounded-full text-on-surface-variant hover:bg-surface-container-high"
        >
          <IconBell />
        </button>
        <button
          type="button"
          aria-label="Ajuda"
          className="hidden size-10 place-items-center rounded-full text-on-surface-variant hover:bg-surface-container-high sm:grid"
        >
          <IconHelp />
        </button>
        <div
          aria-label="Usuário"
          className="grid size-10 place-items-center rounded-full bg-primary-fixed text-primary"
        >
          <IconUser />
        </div>
      </div>
    </header>
  );
}

function TituloDaRota() {
  return tituloDaRota(usePathname());
}
