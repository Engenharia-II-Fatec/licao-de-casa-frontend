"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { useToast } from "@/components/ui/toast";
import { usePlano } from "../hooks";
import { paraFormValues } from "../schema";
import { planosService } from "../services";
import { PlanoForm } from "./plano-form";
import { PlanoNaoEncontrado } from "./plano-nao-encontrado";

export function PlanoEditar({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const toast = useToast();
  const { plano, carregando, erro } = usePlano(id);

  if (carregando && !erro) return <Skeleton className="h-96" />;
  if (!plano) return <PlanoNaoEncontrado erro={erro} />;

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Edição de Plano"
        description="Atualize as informações do plano e acompanhe a pré-visualização."
        backHref={`/planos/${plano.id}`}
        backLabel="Voltar para detalhes"
      />
      <PlanoForm
        inicial={paraFormValues(plano)}
        submitLabel="Salvar Alterações"
        onSubmit={async (dados) => {
          const atualizado = await planosService.atualizar(plano.id, dados);
          toast.success(`Plano “${atualizado.nome}” atualizado.`);
          router.push(`/planos/${atualizado.id}`);
        }}
      />
    </div>
  );
}
