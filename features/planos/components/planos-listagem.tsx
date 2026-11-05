"use client";

import Link from "next/link";
import { useState } from "react";
import { buttonClasses } from "@/components/ui/button";
import { EmptyState, Skeleton } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/form-controls";
import { IconPlus, IconSearch } from "@/components/ui/icons";
import { PageHeader } from "@/components/ui/page-header";
import { usePlanos } from "../hooks";
import type { Plano } from "../types";
import { ExcluirPlanoDialog } from "./excluir-plano-dialog";
import { PlanosTable } from "./planos-table";

export function PlanosListagem() {
  const [busca, setBusca] = useState("");
  const [excluindo, setExcluindo] = useState<Plano | null>(null);
  const { planos, carregando, erro, recarregar } = usePlanos({ busca: busca.trim() });

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Gestão de Planos"
        description="Visualize e gerencie os pacotes de aulas oferecidos aos alunos."
        actions={
          <Link href="/planos/novo" className={buttonClasses({ size: "lg" })}>
            <IconPlus className="size-5" />
            Novo Plano
          </Link>
        }
      />

      <div className="relative w-full max-w-md">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/70">
          <IconSearch />
        </span>
        <Input
          type="search"
          aria-label="Buscar planos"
          placeholder="Buscar planos..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="rounded-full pl-12"
        />
      </div>

      {erro ? (
        <EmptyState title="Algo deu errado" description={erro} />
      ) : carregando ? (
        <div className="flex flex-col gap-3" role="status" aria-label="Carregando planos">
          <Skeleton className="h-14" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
      ) : planos.length === 0 ? (
        busca.trim() ? (
          <EmptyState
            title="Nenhum plano encontrado"
            description={`Nada corresponde a “${busca.trim()}”. Tente outro termo.`}
          />
        ) : (
          <EmptyState
            title="Nenhum plano cadastrado"
            description="Crie o primeiro plano para começar."
            action={
              <Link href="/planos/novo" className={buttonClasses()}>
                <IconPlus className="size-5" />
                Novo Plano
              </Link>
            }
          />
        )
      ) : (
        <PlanosTable planos={planos} onExcluir={setExcluindo} />
      )}

      <ExcluirPlanoDialog
        plano={excluindo}
        onClose={() => setExcluindo(null)}
        onExcluido={() => {
          setExcluindo(null);
          recarregar();
        }}
      />
    </div>
  );
}
