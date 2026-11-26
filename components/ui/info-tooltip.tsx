"use client";

import { useId, useState, type ReactNode } from "react";
import { IconHelp } from "./icons";

/**
 * Ícone de ajuda com explicação curta. Abre ao passar o mouse, ao focar com Tab
 * ou ao tocar (telas touch); fecha com Esc ou ao sair.
 */
export function InfoTooltip({ label, children }: { label: string; children: ReactNode }) {
  const id = useId();
  const [aberto, setAberto] = useState(false);

  return (
    <span
      className="relative inline-flex align-middle"
      onMouseEnter={() => setAberto(true)}
      onMouseLeave={() => setAberto(false)}
    >
      <button
        type="button"
        aria-label={label}
        aria-describedby={aberto ? id : undefined}
        aria-expanded={aberto}
        onClick={() => setAberto((v) => !v)}
        onFocus={() => setAberto(true)}
        onBlur={() => setAberto(false)}
        onKeyDown={(e) => {
          if (e.key === "Escape") setAberto(false);
        }}
        className="grid size-5 place-items-center rounded-full text-on-surface-variant hover:text-primary focus-visible:outline-2 focus-visible:outline-primary cursor-help"
      >
        <IconHelp className="size-4" />
      </button>
      {aberto && (
        <span
          id={id}
          role="tooltip"
          className="absolute left-1/2 top-full z-30 mt-2 w-64 -translate-x-1/2 rounded-xl bg-on-surface px-3 py-2 text-left text-[11px] font-medium normal-case tracking-normal leading-relaxed text-surface shadow-ambient"
        >
          {children}
        </span>
      )}
    </span>
  );
}
