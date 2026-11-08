import { PlanosApiService } from "./planos.api";
import type { PlanosService } from "./planos.service";

export {
  PlanoDuplicadoError,
  PlanoNaoEncontradoError,
  type PlanosService,
} from "./planos.service";

/**
 * Ponto de exportação dos serviços integrados à API (banco de dados via Prisma).
 */
export const planosService: PlanosService = new PlanosApiService();
