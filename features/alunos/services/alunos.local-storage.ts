import { gravarJson, lerJson } from "@/lib/storage/local-storage";
import { criarAlunosExtras, criarSeedAlunos } from "../mock-data";
import type { Aluno, Responsavel, ResponsavelInput } from "../types";
import {
  AlunoNaoEncontradoError,
  type AlunosService,
  type ResponsaveisService,
} from "./alunos.service";

const CHAVE_ALUNOS = "licao:alunos:v1";
const CHAVE_RESPONSAVEIS = "licao:alunos:responsaveis:v1";

// Marca que os alunos extras de demonstração já foram incluídos neste navegador.
const CHAVE_EXTRAS_INCLUIDOS = "licao:alunos:extras-demo:v1";

function carregarAlunos(): Aluno[] {
  const salvos = lerJson<Aluno[]>(CHAVE_ALUNOS);
  if (Array.isArray(salvos)) {
    // Navegador que já tinha dados: inclui os alunos extras uma única vez,
    // sem apagar nada e sem recriar depois os que o usuário excluir.
    if (!lerJson<boolean>(CHAVE_EXTRAS_INCLUIDOS)) {
      const idsSalvos = new Set(salvos.map((a) => a.id));
      const novos = criarAlunosExtras().filter((a) => !idsSalvos.has(a.id));
      const atualizados = [...salvos, ...novos];
      gravarJson(CHAVE_ALUNOS, atualizados);
      gravarJson(CHAVE_EXTRAS_INCLUIDOS, true);
      return atualizados;
    }
    return salvos;
  }
  gravarJson(CHAVE_EXTRAS_INCLUIDOS, true); // a seed já traz os extras
  const seed = criarSeedAlunos();
  gravarJson(CHAVE_ALUNOS, seed);
  return seed;
}

function carregarResponsaveis(): Responsavel[] {
  const salvos = lerJson<Responsavel[]>(CHAVE_RESPONSAVEIS);
  // A lista de responsáveis começa vazia: só entram os cadastrados pelo usuário.
  return Array.isArray(salvos) ? salvos : [];
}

export class AlunosLocalStorageService implements AlunosService {
  async listar(): Promise<Aluno[]> {
    return carregarAlunos();
  }

  async criar(aluno: Aluno): Promise<Aluno> {
    gravarJson(CHAVE_ALUNOS, [aluno, ...carregarAlunos()]);
    return aluno;
  }

  async atualizar(aluno: Aluno): Promise<Aluno> {
    const alunos = carregarAlunos();
    if (!alunos.some((a) => a.id === aluno.id)) throw new AlunoNaoEncontradoError();
    gravarJson(
      CHAVE_ALUNOS,
      alunos.map((a) => (a.id === aluno.id ? aluno : a)),
    );
    return aluno;
  }

  async excluir(id: string): Promise<void> {
    const alunos = carregarAlunos();
    if (!alunos.some((a) => a.id === id)) throw new AlunoNaoEncontradoError();
    gravarJson(
      CHAVE_ALUNOS,
      alunos.filter((a) => a.id !== id),
    );
  }
}

export class ResponsaveisLocalStorageService implements ResponsaveisService {
  async listar(): Promise<Responsavel[]> {
    return carregarResponsaveis();
  }

  async criar(dados: ResponsavelInput): Promise<Responsavel> {
    const novo: Responsavel = { ...dados, id: `resp-${Date.now()}` };
    gravarJson(CHAVE_RESPONSAVEIS, [novo, ...carregarResponsaveis()]);
    return novo;
  }
}
