import {
  IconBarChart,
  IconBook,
  IconCalendar,
  IconCap,
  IconClipboard,
  IconUserCheck,
  IconUsers,
  IconWallet,
  type IconComponent,
} from "@/components/ui/icons";

export interface NavItem {
  label: string;
  /** Rota do módulo (prefixo). Itens aninhados (ex.: /planos/novo) também ficam ativos. */
  href: string;
  icon: IconComponent;
  /**
   * `true` quando a rota do módulo já existe.
   * `false` = módulo planejado: o item aparece no menu, mas não navega
   * (evita 404). Ao criar as páginas do módulo, basta trocar para `true`.
   */
  implementado: boolean;
}

/**
 * Navegação central do sistema. Para conectar um novo módulo:
 * 1) crie as rotas em app/(app)/<modulo>/...
 * 2) troque `implementado` para `true` no item correspondente.
 */
export const NAV_ITEMS: NavItem[] = [
  { label: "Alunos", href: "/alunos", icon: IconUsers, implementado: false },
  { label: "Responsáveis", href: "/responsaveis", icon: IconUserCheck, implementado: false },
  { label: "Professores", href: "/professores", icon: IconCap, implementado: false },
  { label: "Disciplinas", href: "/disciplinas", icon: IconBook, implementado: true },
  { label: "Planos de Aula", href: "/planos", icon: IconClipboard, implementado: true },
  { label: "Agendamentos", href: "/agendamentos", icon: IconCalendar, implementado: false },
  { label: "Financeiro", href: "/financeiro", icon: IconWallet, implementado: false },
  { label: "Relatórios", href: "/relatorios", icon: IconBarChart, implementado: false },
];

export function itemAtivo(pathname: string, item: NavItem): boolean {
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function tituloDaRota(pathname: string): string {
  return NAV_ITEMS.find((i) => itemAtivo(pathname, i))?.label ?? "Espaço Lição de Casa";
}
