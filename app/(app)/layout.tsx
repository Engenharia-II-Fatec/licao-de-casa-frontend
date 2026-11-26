import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { ToastProvider } from "@/components/ui/toast";

// Aplica-se somente às rotas deste grupo. O título do login (app/layout.tsx) não muda.
export const metadata: Metadata = {
  title: {
    default: "Espaço Lição de Casa",
    template: "%s | Espaço Lição de Casa",
  },
};

// Fonte de ícones Material Symbols, usada por componentes compartilhados (ex.: DropdownSelect)
// e pelos módulos de Alunos, Responsáveis e Professores. Carregada aqui para valer em toda a
// área logada; antes ficava só em alguns módulos e os ícones viravam texto ("expand_more") nos outros.
const MATERIAL_SYMBOLS_URL =
  "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      {/* React 19 move esta folha de estilo para o <head>. */}
      <link rel="stylesheet" href={MATERIAL_SYMBOLS_URL} precedence="default" />
      <AppShell>{children}</AppShell>
    </ToastProvider>
  );
}
