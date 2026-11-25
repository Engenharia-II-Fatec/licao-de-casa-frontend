import type { ReactNode } from "react";

// Fonte de ícones usada pelas telas do módulo (mesma dos módulos de Alunos e Responsáveis).
const MATERIAL_SYMBOLS_URL =
  "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200";

export default function ProfessoresLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {/* React 19 move esta folha de estilo para o <head>. */}
      <link rel="stylesheet" href={MATERIAL_SYMBOLS_URL} precedence="default" />
      {children}
    </>
  );
}
