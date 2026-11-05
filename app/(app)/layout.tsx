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

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <AppShell>{children}</AppShell>
    </ToastProvider>
  );
}
