"use client";

import Link from "next/link";
import { use, useState } from "react";
import { Button, buttonClasses } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/empty-state";
import { IconBan, IconPencil, IconRestore } from "@/components/ui/icons";
import { PageHeader } from "@/components/ui/page-header";
import { formatarDataHora } from "@/lib/format";
import { usePlano } from "../hooks";
import type { Plano } from "../types";
import { StatusPlanoDialog } from "./status-plano-dialog";
import { PlanoNaoEncontrado } from "./plano-nao-encontrado";
import { PlanoPreviewCard } from "./plano-preview-card";
import { StatusBadge } from "./status-badge";

export function PlanoDetalhe({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { plano: planoCarregado, carregando, erro } = usePlano(id);
  const [alterandoStatus, setAlterandoStatus] = useState(false);
  // Plano devolvido após inativar/reativar (o hook não recarrega sozinho).
  const [planoAlterado, setPlanoAlterado] = useState<Plano | null>(null);
  const plano = planoAlterado?.id === id ? planoAlterado : planoCarregado;

  if (carregando && !erro) return <Skeleton className="h-96" />;
  if (!plano) return <PlanoNaoEncontrado erro={erro} />;
  const inativo = plano.status === "INATIVO";

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
              href={`/planos/${plano.id}/editar?de=detalhes`}
              className={buttonClasses({ variant: "secondary" })}
            >
              <IconPencil className="size-4" />
              Editar
            </Link>
            <Button
              variant={inativo ? "secondary" : "danger"}
              onClick={() => setAlterandoStatus(true)}
            >
              {inativo ? <IconRestore className="size-4" /> : <IconBan className="size-4" />}
              {inativo ? "Reativar" : "Inativar"}
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

      <StatusPlanoDialog
        plano={alterandoStatus ? plano : null}
        onClose={() => setAlterandoStatus(false)}
        onAlterado={(atualizado) => {
          setPlanoAlterado(atualizado);
          setAlterandoStatus(false);
        }}
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
