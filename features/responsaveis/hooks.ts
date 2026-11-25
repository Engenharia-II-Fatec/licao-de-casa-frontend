"use client";

import { useCallback, useEffect, useState } from "react";
import { responsaveisDetalheService } from "./services";
import type { ResponsavelDetalhe, ResponsavelResumo } from "./types";

export function useListaResponsaveis() {
  const [lista, setLista] = useState<ResponsavelResumo[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [versao, setVersao] = useState(0);

  useEffect(() => {
    let cancelado = false;
    responsaveisDetalheService
      .listar()
      .then((dados) => {
        if (cancelado) return;
        setErro(null);
        setLista(dados);
      })
      .catch((e) => {
        if (!cancelado) setErro(e instanceof Error ? e.message : "Erro ao carregar responsáveis.");
      });
    return () => {
      cancelado = true;
    };
  }, [versao]);

  const recarregar = useCallback(() => setVersao((v) => v + 1), []);
  return { responsaveis: lista ?? [], carregando: lista === null && !erro, erro, recarregar };
}

/** `undefined` = carregando; `null` = não encontrado. */
export function useResponsavel(id: string) {
  const [responsavel, setResponsavel] = useState<ResponsavelDetalhe | null | undefined>(undefined);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;
    responsaveisDetalheService
      .buscarPorId(id)
      .then((dados) => {
        if (!cancelado) setResponsavel(dados);
      })
      .catch((e) => {
        if (!cancelado) setErro(e instanceof Error ? e.message : "Erro ao carregar o responsável.");
      });
    return () => {
      cancelado = true;
    };
  }, [id]);

  return { responsavel, setResponsavel, erro };
}
