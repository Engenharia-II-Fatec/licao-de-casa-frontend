export type PlanoStatus = "ATIVO" | "INATIVO";

export const ICONES_PLANO_IDS = [
  "school",
  "menu_book",
  "draw",
  "auto_stories",
  "psychology",
  "workspace_premium",
] as const;
export type IconePlanoId = (typeof ICONES_PLANO_IDS)[number];

export type PlanoCapa =
  | { tipo: "gradiente"; de: string; para: string }
  | { tipo: "imagem"; dataUrl: string };

export interface Plano {
  id: string;
  nome: string;
  descricao: string;
  status: PlanoStatus;
  /** null = "Consultar" */
  valorMensal: number | null;
  /** null = "Personalizado" */
  aulasIncluidas: number | null;
  beneficios: string[];
  icone: IconePlanoId;
  capa: PlanoCapa;
  criadoEm: string;
  atualizadoEm: string;
}

export type PlanoInput = Omit<Plano, "id" | "criadoEm" | "atualizadoEm">;

export interface PlanoFiltro {
  busca?: string;
  status?: PlanoStatus;
}
