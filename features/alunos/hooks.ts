"use client";

import { useCallback, useEffect, useState } from "react";
import { alunosService, responsaveisService } from "./services";
import type { Aluno, Responsavel } from "./types";

export function useAlunos() {
  const [alunos, setAlunos] = useState<Aluno[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [versao, setVersao] = useState(0);

  useEffect(() => {
    let cancelado = false;
    alunosService
      .listar()
      .then((lista) => {
        if (cancelado) return;
        setErro(null);
        setAlunos(lista);
      })
      .catch(() => {
        if (!cancelado) setErro("Não foi possível carregar os alunos.");
      });
    return () => {
      cancelado = true;
    };
  }, [versao]);

  const recarregar = useCallback(() => setVersao((v) => v + 1), []);

  return { alunos: alunos ?? [], carregando: alunos === null && !erro, erro, recarregar };
}

export function useResponsaveis() {
  const [responsaveis, setResponsaveis] = useState<Responsavel[] | null>(null);

  useEffect(() => {
    let cancelado = false;
    responsaveisService
      .listar()
      .then((lista) => {
        if (!cancelado) setResponsaveis(lista);
      })
      .catch(() => {
        if (!cancelado) setResponsaveis([]);
      });
    return () => {
      cancelado = true;
    };
  }, []);

  return { responsaveis: responsaveis ?? [], carregando: responsaveis === null };
}
