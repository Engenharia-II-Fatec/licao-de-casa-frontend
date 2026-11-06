"use client";

import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { useToast } from "@/components/ui/toast";
import { planosService } from "../services";
import { PlanoForm } from "./plano-form";

export function PlanoNovo() {
  const router = useRouter();
  const toast = useToast();

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Criação de Novo Plano"
        description="Preencha os dados e acompanhe a pré-visualização ao lado."
        backHref="/planos"
        backLabel="Voltar para planos"
      />
      <PlanoForm
        submitLabel="Salvar Novo Plano"
        onSubmit={async (dados) => {
          const plano = await planosService.criar(dados);
          toast.success(`Plano “${plano.nome}” criado com sucesso.`);
          router.push("/planos");
        }}
      />
    </div>
  );
}
