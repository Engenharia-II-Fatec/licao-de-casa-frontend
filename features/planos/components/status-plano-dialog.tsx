"use client";

import { useState } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { planosService } from "../services";
import type { Plano } from "../types";

/**
 * Confirmação "Inativar plano?" / "Reativar plano?".
 * Regra de negócio: nenhum cadastro é excluído de forma permanente.
 */
export function StatusPlanoDialog({
  plano,
  onClose,
  onAlterado,
}: {
  plano: Plano | null;
  onClose: () => void;
  onAlterado: (plano: Plano) => void;
}) {
  const toast = useToast();
  const [salvando, setSalvando] = useState(false);
  const reativar = plano?.status === "INATIVO";

  async function confirmar() {
    if (!plano) return;
    setSalvando(true);
    try {
      const atualizado = await planosService.alterarStatus(plano.id, reativar);
      toast.success(`Plano “${plano.nome}” ${reativar ? "reativado" : "inativado"}.`);
      onAlterado(atualizado);
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : `Não foi possível ${reativar ? "reativar" : "inativar"} o plano.`,
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <ConfirmDialog
      open={plano !== null}
      tone={reativar ? "primary" : "danger"}
      title={reativar ? "Reativar plano?" : "Inativar plano?"}
      description={
        reativar ? (
          <>
            O plano <strong className="text-on-surface">{plano?.nome}</strong> volta a ficar ativo.
          </>
        ) : (
          <>
            O plano <strong className="text-on-surface">{plano?.nome}</strong> passa a ficar inativo.
            Nada é apagado: os alunos que já usam o plano não mudam, e ele pode ser reativado depois.
          </>
        )
      }
      confirmLabel={reativar ? "Reativar" : "Inativar"}
      loading={salvando}
      onConfirm={confirmar}
      onClose={onClose}
    />
  );
}
