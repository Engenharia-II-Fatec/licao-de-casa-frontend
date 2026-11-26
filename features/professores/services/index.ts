import { ProfessoresApiService } from "./professores.api";
import type { ProfessoresService } from "./professores.service";

export {
  ProfessorNaoEncontradoError,
  type ProfessoresService,
} from "./professores.service";

/** ÚNICO ponto de troca da fonte de dados do módulo de Professores. */
export const professoresService: ProfessoresService = new ProfessoresApiService();
