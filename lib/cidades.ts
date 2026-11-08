"use client";

import { useEffect, useState } from "react";

/** API pública de localidades do IBGE (gratuita, sem chave, permite CORS). */
const IBGE_URL = (uf: string) =>
  `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios?orderBy=nome`;

// Cache em memória: cada UF é buscada só uma vez por sessão.
const cache = new Map<string, Promise<string[]>>();

export function buscarCidades(uf: string): Promise<string[]> {
  const sigla = uf.toUpperCase();
  let promessa = cache.get(sigla);
  if (!promessa) {
    promessa = fetch(IBGE_URL(sigla))
      .then((res) => {
        if (!res.ok) throw new Error(`IBGE respondeu ${res.status}`);
        return res.json() as Promise<{ nome: string }[]>;
      })
      .then((lista) => lista.map((m) => m.nome))
      .catch((erro) => {
        cache.delete(sigla); // permite tentar de novo depois
        throw erro;
      });
    cache.set(sigla, promessa);
  }
  return promessa;
}

type Estado = { uf: string; cidades: string[]; erro: boolean };

/** Lista de cidades da UF informada. Sem UF, devolve lista vazia. */
export function useCidades(uf: string) {
  const [estado, setEstado] = useState<Estado>({ uf: "", cidades: [], erro: false });

  useEffect(() => {
    if (!uf) return;
    let ativo = true;
    buscarCidades(uf)
      .then((cidades) => ativo && setEstado({ uf, cidades, erro: false }))
      .catch(() => ativo && setEstado({ uf, cidades: [], erro: true }));
    return () => {
      ativo = false;
    };
  }, [uf]);

  const atual = estado.uf === uf;
  return {
    cidades: uf && atual ? estado.cidades : [],
    carregando: Boolean(uf) && !atual,
    erro: Boolean(uf) && atual && estado.erro,
  };
}
