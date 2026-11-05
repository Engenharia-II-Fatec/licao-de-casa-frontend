import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/empty-state";
import { PlanoDetalhe } from "@/features/planos/components/plano-detalhe";

export const metadata: Metadata = { title: "Detalhes do Plano" };

export default function DetalhePlanoPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<Skeleton className="h-96" />}>
      <PlanoDetalhe params={params} />
    </Suspense>
  );
}
