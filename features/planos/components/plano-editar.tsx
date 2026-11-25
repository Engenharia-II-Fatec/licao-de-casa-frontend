"use client";

import { use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  // Volta para os detalhes só quando a edição foi aberta por lá (?de=detalhes);
  // pelo lápis da listagem, volta para a listagem.
  const veioDosDetalhes = useSearchParams().get("de") === "detalhes";

  if (carregando && !erro) return <Skeleton className="h-96" />;
  if (!plano) return <PlanoNaoEncontrado erro={erro} />;

  const voltarHref = veioDosDetalhes ? `/planos/${plano.id}` : "/planos";

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Edição de Plano"
        description="Atualize as informações do plano e acompanhe a pré-visualização."
        backHref={voltarHref}
        backLabel={veioDosDetalhes ? "Voltar para detalhes" : "Voltar para planos"}
      />
      <PlanoForm
        inicial={paraFormValues(plano)}
        submitLabel="Salvar Alterações"
        cancelarHref={voltarHref}
        onSubmit={async (dados) => {
          const atualizado = await planosService.atualizar(plano.id, dados);
          toast.success(`Plano “${atualizado.nome}” atualizado.`);
          router.push(veioDosDetalhes ? `/planos/${atualizado.id}` : "/planos");
        }}
      />
    </div>
  );
}
