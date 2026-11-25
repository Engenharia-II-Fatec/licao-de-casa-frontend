import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/empty-state";
import { AlunoNovo } from "@/features/alunos/components/aluno-novo";

export const metadata: Metadata = { title: "Cadastro de Novo Aluno" };

export default function NovoAlunoPage() {
  // Suspense: o cadastro lê "?responsavel=<id>" da URL (useSearchParams).
  return (
    <Suspense fallback={<Skeleton className="h-96" />}>
      <AlunoNovo />
    </Suspense>
  );
}
