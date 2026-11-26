"use client";

import { DropdownSelect } from "@/components/ui/dropdown-select";
import { SEM_RESPONSAVEL } from "../constants";
import { useResponsaveis } from "../hooks";
import type { Aluno } from "../types";
import { ehTitular, tornarTitular, vincularResponsavel } from "../utils";

interface Props {
  aluno: Aluno;
  /** Recebe o aluno com `responsavelId` e os campos `guardian*` já atualizados. */
  onChange: (aluno: Aluno) => void;
  /** Força o estado "titular" (ex.: o nome do aluno está sendo editado). Padrão: `ehTitular(aluno)`. */
  titular?: boolean;
  className?: string;
}

/**
 * Seletor do responsável financeiro de um aluno: um responsável cadastrado
 * ou "o próprio aluno é o titular da conta".
 */
export function ResponsavelSelect({ aluno, onChange, titular, className = "" }: Props) {
  const { responsaveis, carregando } = useResponsaveis();
  const ehTitularDaConta = !aluno.responsavelId && (titular ?? ehTitular(aluno));

  const valor = aluno.responsavelId
    ? aluno.responsavelId
    : ehTitularDaConta
      ? SEM_RESPONSAVEL
      : ""; // texto solto em `guardian` sem vínculo: força escolher

  const opcoes = [
    { value: SEM_RESPONSAVEL, label: "Sem responsável (aluno é o titular da conta)" },
    ...responsaveis.map((r) => ({ value: r.id, label: `${r.name} • ${r.role}` })),
  ];

  const handleChange = (id: string) => {
    if (id === SEM_RESPONSAVEL) {
      onChange(tornarTitular(aluno));
      return;
    }
    const responsavel = responsaveis.find((r) => r.id === id);
    if (responsavel) onChange(vincularResponsavel(aluno, responsavel));
  };

  return (
    <DropdownSelect
      value={valor}
      onChange={handleChange}
      options={opcoes}
      placeholder={
        aluno.guardian && !ehTitularDaConta
          ? `${aluno.guardian} (não vinculado) — selecione um responsável`
          : "Selecione o responsável"
      }
      searchable
      searchPlaceholder="Buscar responsável por nome..."
      loading={carregando}
      className={className}
    />
  );
}
