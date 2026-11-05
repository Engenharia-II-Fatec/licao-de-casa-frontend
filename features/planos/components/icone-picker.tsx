"use client";

import { ICONES_PLANO } from "../icones";
import type { IconePlanoId } from "../types";

export function IconePicker({
  value,
  onChange,
}: {
  value: IconePlanoId;
  onChange: (id: IconePlanoId) => void;
}) {
  return (
    <div role="radiogroup" aria-label="Ícone do plano" className="flex flex-wrap gap-3 rounded-2xl bg-surface-container-low p-2">
      {ICONES_PLANO.map(({ id, label, Icon }) => {
        const ativo = id === value;
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={ativo}
            aria-label={label}
            title={label}
            onClick={() => onChange(id)}
            className={`grid size-11 place-items-center rounded-xl transition focus-visible:outline-2 focus-visible:outline-primary ${
              ativo
                ? "bg-primary-container text-white shadow-sm"
                : "text-on-surface-variant hover:bg-surface-container-high"
            }`}
          >
            <Icon />
          </button>
        );
      })}
    </div>
  );
}
