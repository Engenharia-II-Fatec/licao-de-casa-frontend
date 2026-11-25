import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/empty-state";
import { AlunosListagem } from "@/features/alunos/components/alunos-listagem";

export const metadata: Metadata = { title: "Base de Alunos" };

export default function AlunosPage() {
  // Suspense: a listagem lê "?aluno=<id>" da URL (useSearchParams).
  return (
    <Suspense fallback={<Skeleton className="h-96" />}>
      <AlunosListagem />
    </Suspense>
  );
}
