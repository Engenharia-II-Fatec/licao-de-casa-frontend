import type { Metadata } from "next";
import { AlunosListagem } from "@/features/alunos/components/alunos-listagem";

export const metadata: Metadata = { title: "Base de Alunos" };

export default function AlunosPage() {
  return <AlunosListagem />;
}
