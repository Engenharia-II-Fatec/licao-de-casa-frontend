"use client";

import { useCallback, useEffect, useState } from "react";
import { planosService } from "./services";
import type { Plano, PlanoFiltro } from "./types";

export function usePlanos(filtro: PlanoFiltro) {
  const chave = JSON.stringify(filtro);
  const [resultado, setResultado] = useState<{ chave: string; planos: Plano[] } | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [versao, setVersao] = useState(0);

  useEffect(() => {
    let cancelado = false;
    planosService
      .listar(JSON.parse(chave) as PlanoFiltro)
      .then((planos) => {
        if (cancelado) return;
        setErro(null);
        setResultado({ chave, planos });
      })
      .catch(() => {
        if (!cancelado) setErro("Não foi possível carregar os planos.");
      });
    return () => {
      cancelado = true;
    };
  }, [chave, versao]);

  const recarregar = useCallback(() => setVersao((v) => v + 1), []);

  return {
    planos: resultado?.planos ?? [],
    carregando: resultado === null || resultado.chave !== chave,
    erro,
    recarregar,
  };
}

export function usePlano(id: string) {
  const [resultado, setResultado] = useState<{ id: string; plano: Plano | null } | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;
    planosService
      .buscarPorId(id)
      .then((plano) => {
        if (cancelado) return;
        setErro(null);
        setResultado({ id, plano });
      })
      .catch(() => {
        if (!cancelado) setErro("Não foi possível carregar o plano.");
      });
    return () => {
      cancelado = true;
    };
  }, [id]);

  return {
    plano: resultado?.plano ?? null,
    carregando: resultado === null || resultado.id !== id,
    erro,
  };
}
