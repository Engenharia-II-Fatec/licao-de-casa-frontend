import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export function PlanoNaoEncontrado({ erro }: { erro?: string | null }) {
  return (
    <EmptyState
      title={erro ? "Algo deu errado" : "Plano não encontrado"}
      description={erro ?? "O plano que você procura não existe ou foi excluído."}
      action={
        <Link href="/planos" className={buttonClasses()}>
          Voltar para planos
        </Link>
      }
    />
  );
}

export function PlanoCarregando() {
  return null;
}
