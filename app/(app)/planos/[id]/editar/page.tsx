import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/empty-state";
import { PlanoEditar } from "@/features/planos/components/plano-editar";

export const metadata: Metadata = { title: "Editar Plano" };

export default function EditarPlanoPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<Skeleton className="h-96" />}>
      <PlanoEditar params={params} />
    </Suspense>
  );
}
