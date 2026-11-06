"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { IconCap, IconClose, IconLogout } from "@/components/ui/icons";
import { itemAtivo, NAV_ITEMS } from "./nav-config";

const itemBase =
  "flex items-center gap-3 rounded-full px-4 py-3 text-sm font-medium transition duration-150";

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <>
      {/* Overlay (somente mobile) */}
      {open && (
        <div
          aria-hidden="true"
          onClick={onClose}
          className="fixed inset-0 z-40 animate-fade-in bg-on-surface/30 backdrop-blur-[2px] md:hidden"
        />
      )}

      <aside
        id="menu-lateral"
        aria-label="Menu principal"
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col gap-2 bg-surface-container-low p-4 transition-transform duration-200 md:z-30 md:translate-x-0 ${
          open ? "translate-x-0 shadow-ambient" : "max-md:invisible -translate-x-full"
        }`}
      >
        <div className="mb-6 mt-2 flex items-center justify-between gap-3 px-2">
          <div className="flex items-center gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-container text-on-primary">
              <IconCap />
            </div>
            <div>
              <p className="text-base font-extrabold leading-tight tracking-tight text-primary">
                Espaço Lição de Casa
              </p>
              <p className="text-[0.625rem] font-bold uppercase tracking-widest text-on-surface-variant">
                Reforço Escolar
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar menu"
            className="grid size-9 shrink-0 place-items-center rounded-full text-on-surface-variant hover:bg-surface-container-high md:hidden"
          >
            <IconClose />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
          {/* usePathname() exige Suspense em rotas dinâmicas com cacheComponents.
              O fallback renderiza os mesmos itens, sem destaque de item ativo. */}
          <Suspense fallback={<NavItens pathname="" onClose={onClose} />}>
            <NavItensComRota onClose={onClose} />
          </Suspense>
        </nav>

        <div className="mt-2 pt-4">
          <Link
            href="/"
            className={`${itemBase} text-error hover:bg-error-container`}
          >
            <IconLogout />
            Sair
          </Link>
        </div>
      </aside>
    </>
  );
}

function NavItensComRota({ onClose }: { onClose: () => void }) {
  const pathname = usePathname();
  return <NavItens pathname={pathname} onClose={onClose} />;
}

function NavItens({ pathname, onClose }: { pathname: string; onClose: () => void }) {
  return (
    <>
          {NAV_ITEMS.map((item) => {
            const ativo = itemAtivo(pathname, item);
            const Icon = item.icon;
            if (!item.implementado) {
              return (
                <span
                  key={item.href}
                  aria-disabled="true"
                  className={`${itemBase} cursor-default text-on-surface-variant`}
                >
                  <Icon />
                  {item.label}
                </span>
              );
            }
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                aria-current={ativo ? "page" : undefined}
                className={`${itemBase} ${
                  ativo
                    ? "bg-surface-container-lowest font-bold text-primary-container shadow-sm"
                    : "text-on-surface-variant hover:bg-surface-container-highest"
                }`}
              >
                <Icon />
                {item.label}
              </Link>
            );
          })}
    </>
  );
}
