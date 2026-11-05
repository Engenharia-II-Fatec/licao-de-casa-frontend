import {
  IconAward,
  IconBook,
  IconCap,
  IconPencil,
  IconPsychology,
  IconStories,
  type IconComponent,
} from "@/components/ui/icons";
import type { IconePlanoId } from "./types";

export const ICONES_PLANO: { id: IconePlanoId; label: string; Icon: IconComponent }[] = [
  { id: "school", label: "Formatura", Icon: IconCap },
  { id: "menu_book", label: "Livro aberto", Icon: IconBook },
  { id: "draw", label: "Escrita", Icon: IconPencil },
  { id: "auto_stories", label: "Histórias", Icon: IconStories },
  { id: "psychology", label: "Raciocínio", Icon: IconPsychology },
  { id: "workspace_premium", label: "Destaque", Icon: IconAward },
];

export function iconeDoPlano(id: IconePlanoId): IconComponent {
  return ICONES_PLANO.find((i) => i.id === id)?.Icon ?? IconCap;
}

export const GRADIENTES_PREDEFINIDOS: { de: string; para: string; nome: string }[] = [
  { de: "#9e4300", para: "#f2711c", nome: "Laranja" },
  { de: "#00629f", para: "#5cb1ff", nome: "Azul" },
  { de: "#006a65", para: "#00a9a1", nome: "Turquesa" },
  { de: "#5b2a86", para: "#c06ce0", nome: "Roxo" },
  { de: "#b3261e", para: "#f28b82", nome: "Coral" },
  { de: "#303030", para: "#6b6b6b", nome: "Grafite" },
];
