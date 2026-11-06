import { Skeleton } from "@/components/ui/empty-state";

// Cria o limite de <Suspense> exigido por `cacheComponents` para a página
// que lê `params` (id dinâmico), sem alterar o page.tsx do módulo.
export default function CarregandoEdicaoDisciplina() {
  return (
    <div className="mx-auto max-w-3xl">
      <Skeleton className="h-96" />
    </div>
  );
}
