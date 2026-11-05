import type { Plano } from "./types";

/** Dados iniciais de demonstração, gravados só se o localStorage estiver vazio. */
export function criarSeedPlanos(): Plano[] {
  const agora = new Date().toISOString();
  return [
    {
      id: "seed-atelier-essencial",
      nome: "Atelier Essencial",
      descricao: "O ponto de partida ideal para o sucesso acadêmico.",
      status: "ATIVO",
      valorMensal: 450,
      aulasIncluidas: 8,
      beneficios: ["Acompanhamento Individual", "Relatórios Mensais"],
      icone: "school",
      capa: { tipo: "gradiente", de: "#9e4300", para: "#f2711c" },
      criadoEm: agora,
      atualizadoEm: agora,
    },
    {
      id: "seed-atelier-total",
      nome: "Atelier Total",
      descricao: "Acompanhamento completo, com mais aulas e suporte pedagógico.",
      status: "ATIVO",
      valorMensal: 890,
      aulasIncluidas: 12,
      beneficios: ["Acompanhamento Pedagógico", "Material de Apoio", "Relatórios Semanais"],
      icone: "menu_book",
      capa: { tipo: "gradiente", de: "#00629f", para: "#5cb1ff" },
      criadoEm: agora,
      atualizadoEm: agora,
    },
    {
      id: "seed-custom-plus",
      nome: "Custom Plus",
      descricao: "Plano sob medida, montado de acordo com a necessidade do aluno.",
      status: "ATIVO",
      valorMensal: null,
      aulasIncluidas: null,
      beneficios: ["Plano personalizado"],
      icone: "workspace_premium",
      capa: { tipo: "gradiente", de: "#006a65", para: "#00a9a1" },
      criadoEm: agora,
      atualizadoEm: agora,
    },
  ];
}
