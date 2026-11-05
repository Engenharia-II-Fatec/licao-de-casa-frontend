"use client";

import { useState } from "react";
import { Chip } from "@/components/ui/chip";
import { IconPlus } from "@/components/ui/icons";
import { Input } from "@/components/ui/form-controls";
import { LIMITES } from "../schema";

export function BeneficiosInput({
  value,
  onChange,
  error,
}: {
  value: string[];
  onChange: (itens: string[]) => void;
  error?: string;
}) {
  const [texto, setTexto] = useState("");
  const [aviso, setAviso] = useState<string | null>(null);

  function adicionar() {
    const novo = texto.trim();
    if (!novo) return;
    if (value.some((b) => b.toLowerCase() === novo.toLowerCase())) {
      setAviso("Este benefício já foi adicionado.");
      return;
    }
    if (value.length >= LIMITES.beneficiosQtd) {
      setAviso(`Máximo de ${LIMITES.beneficiosQtd} benefícios.`);
      return;
    }
    onChange([...value, novo.slice(0, LIMITES.beneficioMax)]);
    setTexto("");
    setAviso(null);
  }

  const mensagem = error ?? aviso;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <Input
          id="beneficio"
          value={texto}
          maxLength={LIMITES.beneficioMax}
          placeholder="Adicione um benefício (ex: Material didático incluso)"
          onChange={(e) => {
            setTexto(e.target.value);
            setAviso(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              adicionar();
            }
          }}
          invalid={!!mensagem}
        />
        <button
          type="button"
          onClick={adicionar}
          aria-label="Adicionar benefício"
          className="grid h-[3.25rem] w-[3.25rem] shrink-0 place-items-center rounded-full bg-secondary text-on-secondary transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
        >
          <IconPlus />
        </button>
      </div>
      {mensagem && (
        <p role="alert" className="text-xs font-medium text-error">
          {mensagem}
        </p>
      )}
      {value.length > 0 && (
        <ul className="flex flex-wrap gap-2" aria-label="Benefícios adicionados">
          {value.map((b) => (
            <li key={b}>
              <Chip onRemove={() => onChange(value.filter((x) => x !== b))}>{b}</Chip>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
