import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/empty-state";
import { ProfessorDetalheTela } from "@/features/professores/components/professor-detalhe";

export const metadata: Metadata = { title: "Edição de Professor" };

export default function DetalheProfessorPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<Skeleton className="h-[32rem]" />}>
      <ProfessorDetalheTela params={params} />
    </Suspense>
  );
}
