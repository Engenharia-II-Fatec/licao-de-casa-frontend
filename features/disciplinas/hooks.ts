"use client";

import { useCallback, useEffect, useState } from "react";
import { disciplinasService } from "./services";
import type { Disciplina, DisciplinaDetalhe, ProfessorOpcao } from "./types";

export function useListaDisciplinas() {
  const [lista, setLista] = useState<Disciplina[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [versao, setVersao] = useState(0);

  useEffect(() => {
    let cancelado = false;
    disciplinasService
      .listar()
      .then((dados) => {
        if (cancelado) return;
        setErro(null);
        setLista(dados);
      })
      .catch((e) => {
        if (!cancelado) setErro(e instanceof Error ? e.message : "Erro ao carregar as disciplinas.");
      });
    return () => {
      cancelado = true;
    };
  }, [versao]);

  const recarregar = useCallback(() => {
    setErro(null);
    setLista(null);
    setVersao((v) => v + 1);
  }, []);

  return {
    disciplinas: lista ?? [],
    setDisciplinas: setLista,
    carregando: lista === null && !erro,
    erro,
    recarregar,
  };
}

/** `undefined` = carregando; `null` = não encontrada. */
export function useDisciplina(id: number) {
  const [disciplina, setDisciplina] = useState<DisciplinaDetalhe | null | undefined>(undefined);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;
    disciplinasService
      .buscarPorId(id)
      .then((dados) => {
        if (!cancelado) setDisciplina(dados);
      })
      .catch((e) => {
        if (!cancelado) setErro(e instanceof Error ? e.message : "Erro ao carregar a disciplina.");
      });
    return () => {
      cancelado = true;
    };
  }, [id]);

  return { disciplina, erro };
}

/** Professores para os seletores do cadastro e da edição. */
export function useProfessoresOpcoes() {
  const [professores, setProfessores] = useState<ProfessorOpcao[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;
    disciplinasService
      .listarProfessores()
      .then((dados) => {
        if (!cancelado) setProfessores(dados);
      })
      .catch((e) => {
        if (!cancelado) setErro(e instanceof Error ? e.message : "Erro ao carregar os professores.");
      });
    return () => {
      cancelado = true;
    };
  }, []);

  return { professores: professores ?? [], carregando: professores === null && !erro, erro };
}
