"use client";

import { useMemo } from "react";
import { DropdownSelect } from "@/components/ui/dropdown-select";
import { useCidades } from "@/lib/cidades";

type CidadeSelectProps = {
  /** Sigla da UF selecionada (ex.: "SP"). */
  uf: string;
  value: string;
  onChange: (cidade: string) => void;
};

/** Lista de cidades da UF escolhida, com busca. Se o IBGE falhar, vira campo de texto. */
export function CidadeSelect({ uf, value, onChange }: CidadeSelectProps) {
  const { cidades, carregando, erro } = useCidades(uf);
  const options = useMemo(() => {
    const list = cidades.map((c) => ({ value: c, label: c }));
    if (value && !cidades.some((c) => c.toLowerCase() === value.toLowerCase())) {
      return [{ value, label: value }, ...list];
    }
    return list;
  }, [cidades, value]);

  if (erro) {
    return (
      <div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Digite a cidade"
          className="w-full px-4 py-3.5 bg-[#f5f3f3] border-none rounded-xl text-sm font-medium text-[#1b1c1c] placeholder:text-[#584237]/40 focus:ring-2 focus:ring-[#9e4300]/25 outline-none"
        />
        <p className="mt-1 text-[11px] font-medium text-[#584237]/70">
          Não foi possível carregar a lista de cidades. Digite manualmente.
        </p>
      </div>
    );
  }

  return (
    <DropdownSelect
      value={value}
      onChange={onChange}
      options={options}
      searchable
      searchPlaceholder="Buscar cidade..."
      disabled={!uf}
      loading={carregando}
      placeholder={uf ? "Selecione" : "Selecione a UF"}
    />
  );
}
