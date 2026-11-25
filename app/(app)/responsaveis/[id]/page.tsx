import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/empty-state";
import { ResponsavelDetalheTela } from "@/features/responsaveis/components/responsavel-detalhe";

export const metadata: Metadata = { title: "Detalhes do Responsável" };

export default function DetalheResponsavelPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<Skeleton className="h-[32rem]" />}>
      <ResponsavelDetalheTela params={params} />
    </Suspense>
  );
}
