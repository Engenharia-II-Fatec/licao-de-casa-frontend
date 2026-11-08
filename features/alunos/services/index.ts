import { AlunosApiService, ResponsaveisApiService } from "./alunos.api";
import type { AlunosService, ResponsaveisService } from "./alunos.service";

export {
  AlunoNaoEncontradoError,
  type AlunosService,
  type ResponsaveisService,
} from "./alunos.service";

/**
 * Ponto de exportação dos serviços integrados à API (banco de dados via Prisma).
 */
export const alunosService: AlunosService = new AlunosApiService();
export const responsaveisService: ResponsaveisService = new ResponsaveisApiService();
