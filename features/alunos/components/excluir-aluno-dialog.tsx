"use client";

import { useState } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { alunosService } from "../services";
import type { Aluno } from "../types";

interface Props {
  aluno: Aluno;
  onClose: () => void;
  onDeleted: () => void;
}

/**
 * Confirmação "Excluir Aluno?". Usa o ConfirmDialog padrão do sistema (Esc, clique fora,
 * botões desabilitados e "Aguarde..." enquanto exclui).
 */
export function ExcluirAlunoDialog({ aluno, onClose, onDeleted }: Props) {
  const toast = useToast();
  const [excluindo, setExcluindo] = useState(false);

  const confirmar = async () => {
    if (excluindo) return;
    setExcluindo(true);
    try {
      await alunosService.excluir(aluno.id);
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : "Não foi possível excluir o aluno.");
      setExcluindo(false);
      return;
    }
    toast.success(`Aluno ${aluno.name} removido.`);
    onDeleted();
    onClose();
  };

  const pagamentos = aluno.paymentHistory?.length ?? 0;

  return (
    <ConfirmDialog
      open
      title="Excluir aluno?"
      description={
        <>
          O cadastro de <strong>{aluno.name}</strong> (matrícula {aluno.id}) será removido
          {pagamentos > 0 && (
            <>
              , junto com <strong>{pagamentos} registro{pagamentos > 1 ? "s" : ""} de pagamento</strong>
            </>
          )}
          . Esta ação não pode ser desfeita.
          {aluno.status === "Ativo" && (
            <>
              <br />
              <span className="mt-2 block">
                Se o aluno só deixou de frequentar, prefira alterar o status para{" "}
                <strong>Inativo</strong> em &ldquo;Editar Aluno&rdquo;.
              </span>
            </>
          )}
        </>
      }
      confirmLabel="Excluir"
      loading={excluindo}
      onConfirm={confirmar}
      onClose={onClose}
    />
  );
}
