import { ResponsaveisApiService } from "./responsaveis.api";
import type { ResponsaveisDetalheService } from "./responsaveis.service";

export {
  ResponsavelNaoEncontradoError,
  type ResponsaveisDetalheService,
} from "./responsaveis.service";

/** ÚNICO ponto de troca da fonte de dados do módulo de Responsáveis. */
export const responsaveisDetalheService: ResponsaveisDetalheService = new ResponsaveisApiService();
