import { buscarCidades } from "./cidades";

export interface ViaCepEndereco {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge?: string;
  gia?: string;
  ddd?: string;
  siafi?: string;
  erro?: boolean | string;
}

export interface EnderecoPreenchido {
  cep: string;
  address: string;
  neighborhood: string;
  complement: string;
  state: string;
  city: string;
}

/**
 * Consulta a API do ViaCEP (https://viacep.com.br) para obter dados de endereço
 * a partir de um CEP com 8 dígitos.
 *
 * Retorna null se o CEP não for encontrado ou tiver formato inválido.
 */
export async function consultarCep(cep: string): Promise<EnderecoPreenchido | null> {
  const digitos = cep.replace(/\D/g, "");
  if (digitos.length !== 8) {
    return null;
  }

  const resposta = await fetch(`https://viacep.com.br/ws/${digitos}/json/`);
  if (!resposta.ok) {
    throw new Error(`Erro na consulta ao ViaCEP: status ${resposta.status}`);
  }

  const dados = (await resposta.json()) as ViaCepEndereco;
  if (dados.erro === true || dados.erro === "true") {
    return null;
  }

  const uf = (dados.uf || "").toUpperCase().trim();
  let cidade = (dados.localidade || "").trim();

  // Se tivermos UF e cidade, tentamos sincronizar com o nome oficial do IBGE e pré-aquecer o cache de cidades
  if (uf && cidade) {
    try {
      const cidades = await buscarCidades(uf);
      const correspondente = cidades.find(
        (c) => c.toLowerCase() === cidade.toLowerCase()
      );
      if (correspondente) {
        cidade = correspondente;
      }
    } catch {
      // Caso a API do IBGE falhe, mantém a cidade retornada pelo ViaCEP
    }
  }

  return {
    cep: dados.cep || cep,
    address: (dados.logradouro || "").trim(),
    neighborhood: (dados.bairro || "").trim(),
    complement: (dados.complemento || "").trim(),
    state: uf,
    city: cidade,
  };
}
