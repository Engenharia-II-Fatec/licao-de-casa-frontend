"use client";

import { useState } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { alunosService } from "../services";
import type { Aluno } from "../types";

interface Props {
  aluno: Aluno;
  onClose: () => void;
  onChanged: () => void;
}

/**
 * Confirmação "Inativar aluno?" / "Reativar aluno?".
 * Regra de negócio: nenhum cadastro é excluído de forma permanente; o aluno inativo
 * mantém dados, responsável e histórico de pagamentos e pode ser reativado.
 */
export function StatusAlunoDialog({ aluno, onClose, onChanged }: Props) {
  const toast = useToast();
  const [salvando, setSalvando] = useState(false);
  const reativar = aluno.status === "Inativo";

  const confirmar = async () => {
    if (salvando) return;
    setSalvando(true);
    try {
      await alunosService.alterarStatus(aluno.id, reativar);
    } catch (erro) {
      toast.error(
        erro instanceof Error
          ? erro.message
          : `Não foi possível ${reativar ? "reativar" : "inativar"} o aluno.`,
      );
      setSalvando(false);
      return;
    }
    toast.success(`Aluno ${aluno.name} ${reativar ? "reativado" : "inativado"}.`);
    onChanged();
    onClose();
  };

  return (
    <ConfirmDialog
      open
      tone={reativar ? "primary" : "danger"}
      title={reativar ? "Reativar aluno?" : "Inativar aluno?"}
      description={
        reativar ? (
          <>
            <strong>{aluno.name}</strong> (matrícula {aluno.id}) volta a aparecer como{" "}
            <strong>Ativo</strong>.
          </>
        ) : (
          <>
            <strong>{aluno.name}</strong> (matrícula {aluno.id}) passa a ficar{" "}
            <strong>Inativo</strong>. Nada é apagado: os dados, o responsável e o histórico de
            pagamentos continuam guardados, e o aluno pode ser reativado depois.
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
