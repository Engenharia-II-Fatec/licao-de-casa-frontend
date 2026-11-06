import { PlanosLocalStorageService } from "./planos.local-storage";
import type { PlanosService } from "./planos.service";

export {
  PlanoDuplicadoError,
  PlanoNaoEncontradoError,
  type PlanosService,
} from "./planos.service";

/**
 * ÚNICO ponto de troca da fonte de dados.
 * Quando a API REST estiver pronta: `new PlanosApiService()`.
 */
export const planosService: PlanosService = new PlanosLocalStorageService();
