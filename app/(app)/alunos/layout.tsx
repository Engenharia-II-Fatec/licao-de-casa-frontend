import type { ReactNode } from "react";
import { CadastroAlunoProvider } from "@/features/alunos/cadastro-context";

// A fonte de ícones é carregada em app/(app)/layout.tsx para toda a área logada.
export default function AlunosLayout({ children }: { children: ReactNode }) {
  return <CadastroAlunoProvider>{children}</CadastroAlunoProvider>;
}
