import type { ReactNode } from "react";
import { CadastroAlunoProvider } from "@/features/alunos/cadastro-context";

// Fonte de ícones usada pelas telas do módulo de Alunos.
const MATERIAL_SYMBOLS_URL =
  "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200";

export default function AlunosLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {/* React 19 move esta folha de estilo para o <head>. */}
      <link rel="stylesheet" href={MATERIAL_SYMBOLS_URL} precedence="default" />
      <CadastroAlunoProvider>{children}</CadastroAlunoProvider>
    </>
  );
}
