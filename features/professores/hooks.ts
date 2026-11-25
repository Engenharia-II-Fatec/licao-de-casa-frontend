"use client";

import { useCallback, useEffect, useState } from "react";
import { professoresService } from "./services";
import type { DisciplinaOpcao, Professor, ProfessorDetalhe } from "./types";

export function useListaProfessores() {
  const [lista, setLista] = useState<Professor[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [versao, setVersao] = useState(0);

  useEffect(() => {
    let cancelado = false;
    professoresService
      .listar()
      .then((dados) => {
        if (cancelado) return;
        setErro(null);
        setLista(dados);
      })
      .catch((e) => {
        if (!cancelado) setErro(e instanceof Error ? e.message : "Erro ao carregar professores.");
      });
    return () => {
      cancelado = true;
    };
  }, [versao]);

  const recarregar = useCallback(() => setVersao((v) => v + 1), []);
  return { professores: lista ?? [], carregando: lista === null && !erro, erro, recarregar };
}

/** `undefined` = carregando; `null` = não encontrado. */
export function useProfessor(id: number) {
  const [professor, setProfessor] = useState<ProfessorDetalhe | null | undefined>(undefined);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;
    professoresService
      .buscarPorId(id)
      .then((dados) => {
        if (!cancelado) setProfessor(dados);
      })
      .catch((e) => {
        if (!cancelado) setErro(e instanceof Error ? e.message : "Erro ao carregar o professor.");
      });
    return () => {
      cancelado = true;
    };
  }, [id]);

  return { professor, setProfessor, erro };
}

/** Disciplinas para os seletores do cadastro e da edição. */
export function useDisciplinasOpcoes() {
  const [disciplinas, setDisciplinas] = useState<DisciplinaOpcao[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;
    professoresService
      .listarDisciplinas()
      .then((dados) => {
        if (!cancelado) setDisciplinas(dados);
      })
      .catch((e) => {
        if (!cancelado) setErro(e instanceof Error ? e.message : "Erro ao carregar as disciplinas.");
      });
    return () => {
      cancelado = true;
    };
  }, []);

  return { disciplinas: disciplinas ?? [], carregando: disciplinas === null && !erro, erro };
}
