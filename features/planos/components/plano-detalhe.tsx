"use client";

import Link from "next/link";
import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, buttonClasses } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/empty-state";
import { IconPencil, IconTrash } from "@/components/ui/icons";
import { PageHeader } from "@/components/ui/page-header";
import { formatarDataHora } from "@/lib/format";
import { usePlano } from "../hooks";
import { ExcluirPlanoDialog } from "./excluir-plano-dialog";
import { PlanoNaoEncontrado } from "./plano-nao-encontrado";
import { PlanoPreviewCard } from "./plano-preview-card";
import { StatusBadge } from "./status-badge";

export function PlanoDetalhe({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { plano, carregando, erro } = usePlano(id);
  const [excluindo, setExcluindo] = useState(false);

  if (carregando && !erro) return <Skeleton className="h-96" />;
  if (!plano) return <PlanoNaoEncontrado erro={erro} />;

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={plano.nome}
        description={plano.descricao || undefined}
        backHref="/planos"
        backLabel="Voltar para planos"
        actions={
          <>
            <Link
              href={`/planos/${plano.id}/editar`}
              className={buttonClasses({ variant: "secondary" })}
            >
              <IconPencil className="size-4" />
              Editar
            </Link>
            <Button variant="danger" onClick={() => setExcluindo(true)}>
              <IconTrash className="size-4" />
              Excluir
            </Button>
          </>
        }
      />

      <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <section className="rounded-[2rem] bg-surface-container-lowest p-6 shadow-ambient sm:p-8">
          <h2 className="mb-6 text-lg font-bold text-on-surface">Informações do Plano</h2>
          <dl className="grid gap-6 sm:grid-cols-2">
            <Info label="Status">
              <StatusBadge status={plano.status} />
            </Info>
            <Info label="Valor mensal">
              {plano.valorMensal === null ? (
                <span className="italic">Consultar</span>
              ) : (
                new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
                  plano.valorMensal,
                )
              )}
            </Info>
            <Info label="Aulas incluídas">
              {plano.aulasIncluidas === null ? "Personalizado" : plano.aulasIncluidas}
            </Info>
            <Info label="Última atualização">{formatarDataHora(plano.atualizadoEm)}</Info>
            <Info label="Benefícios e funcionalidades" className="sm:col-span-2">
              {plano.beneficios.length === 0 ? (
                <span className="text-on-surface-variant/70">Nenhum benefício cadastrado.</span>
              ) : (
                <ul className="flex flex-wrap gap-2">
                  {plano.beneficios.map((b) => (
                    <li
                      key={b}
                      className="rounded-full bg-secondary-fixed px-4 py-2 text-xs font-bold text-on-secondary-fixed"
                    >
                      {b}
                    </li>
                  ))}
                </ul>
              )}
            </Info>
          </dl>
        </section>

        <aside aria-label="Visão do cliente" className="flex flex-col gap-4 lg:sticky lg:top-28">
          <h2 className="text-sm font-black uppercase tracking-widest text-outline">
            Visão do cliente
          </h2>
          <PlanoPreviewCard dados={plano} />
        </aside>
      </div>

      <ExcluirPlanoDialog
        plano={excluindo ? plano : null}
        onClose={() => setExcluindo(false)}
        onExcluido={() => router.push("/planos")}
      />
    </div>
  );
}

function Info({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <dt className="text-sm font-semibold text-on-surface-variant">{label}</dt>
      <dd className="text-base font-medium text-on-surface">{children}</dd>
    </div>
  );
}
