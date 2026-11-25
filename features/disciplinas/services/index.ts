import { DisciplinasApiService } from "./disciplinas.api";
import type { DisciplinasService } from "./disciplinas.service";

export { DisciplinaNaoEncontradaError, type DisciplinasService } from "./disciplinas.service";

/** ÚNICO ponto de troca da fonte de dados do módulo de Disciplinas. */
export const disciplinasService: DisciplinasService = new DisciplinasApiService();
