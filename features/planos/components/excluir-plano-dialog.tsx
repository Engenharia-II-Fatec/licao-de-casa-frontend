"use client";

import { useState } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { planosService } from "../services";
import type { Plano } from "../types";

export function ExcluirPlanoDialog({
  plano,
  onClose,
  onExcluido,
}: {
  plano: Plano | null;
  onClose: () => void;
  onExcluido: () => void;
}) {
  const toast = useToast();
  const [excluindo, setExcluindo] = useState(false);

  async function confirmar() {
    if (!plano) return;
    setExcluindo(true);
    try {
      await planosService.excluir(plano.id);
      toast.success(`Plano “${plano.nome}” excluído.`);
      onExcluido();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não foi possível excluir o plano.");
    } finally {
      setExcluindo(false);
    }
  }

  return (
    <ConfirmDialog
      open={plano !== null}
      title="Excluir plano?"
      description={
        <>
          O plano <strong className="text-on-surface">{plano?.nome}</strong> será removido e esta
          ação não poderá ser desfeita.
        </>
      }
      confirmLabel="Excluir"
      loading={excluindo}
      onConfirm={confirmar}
      onClose={onClose}
    />
  );
}
