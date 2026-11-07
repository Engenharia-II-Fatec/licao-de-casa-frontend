import { AlunosLocalStorageService, ResponsaveisLocalStorageService } from "./alunos.local-storage";
import type { AlunosService, ResponsaveisService } from "./alunos.service";

export {
  AlunoNaoEncontradoError,
  type AlunosService,
  type ResponsaveisService,
} from "./alunos.service";

/**
 * ÚNICO ponto de troca da fonte de dados.
 * Quando a API REST estiver pronta: `new AlunosApiService()` / `new ResponsaveisApiService()`.
 */
export const alunosService: AlunosService = new AlunosLocalStorageService();
export const responsaveisService: ResponsaveisService = new ResponsaveisLocalStorageService();
