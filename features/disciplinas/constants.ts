import type { Area } from "./types";

export const AREAS = [
  "Exatas",
  "Linguagens",
  "Humanas",
  "Idiomas",
  "Ciências Naturais",
  "Artes & Cultura",
] as const;

export const ESTILO_AREA: Record<Area, { tag: string; icone: string; emoji: string }> = {
  Exatas: { tag: "bg-orange-100 text-orange-700", icone: "bg-orange-100", emoji: "🧮" },
  Linguagens: { tag: "bg-blue-100 text-blue-700", icone: "bg-blue-100", emoji: "📖" },
  Humanas: { tag: "bg-amber-100 text-amber-800", icone: "bg-amber-100", emoji: "🏛️" },
  Idiomas: { tag: "bg-teal-100 text-teal-700", icone: "bg-teal-100", emoji: "🌎" },
  "Ciências Naturais": { tag: "bg-sky-100 text-sky-700", icone: "bg-sky-100", emoji: "🔬" },
  "Artes & Cultura": { tag: "bg-rose-100 text-rose-700", icone: "bg-rose-100", emoji: "🎨" },
};

/** Estilo usado quando a área gravada no banco não é uma das conhecidas. */
export const ESTILO_PADRAO = { tag: "bg-neutral-100 text-neutral-700", icone: "bg-neutral-100", emoji: "📚" };
