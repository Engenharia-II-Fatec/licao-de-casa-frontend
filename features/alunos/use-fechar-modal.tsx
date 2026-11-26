"use client";

import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

/**
 * Fechamento padrão dos modais de Alunos (feitos com <div> fixo):
 * - Esc e clique no fundo fecham o modal;
 * - se houver alterações não salvas (`sujo`), pede confirmação antes de descartar.
 *
 * Retorna `pedirFechamento` (para o botão X / Cancelar), `onBackdropClick` (para a <div>
 * de fundo) e `dialogoDescarte` (renderizar dentro do modal).
 */
export function useFecharModal({ sujo, onClose }: { sujo: boolean; onClose: () => void }) {
  const [confirmando, setConfirmando] = useState(false);
  const estado = useRef({ sujo, onClose, confirmando });
  useEffect(() => {
    estado.current = { sujo, onClose, confirmando };
  });

  const pedirFechamento = useCallback(() => {
    if (estado.current.sujo) setConfirmando(true);
    else estado.current.onClose();
  }, []);

  useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => {
      // Com o diálogo de descarte aberto, o próprio <dialog> trata o Esc.
      if (e.key !== "Escape" || estado.current.confirmando || e.defaultPrevented) return;
      // Esc dentro de uma lista suspensa aberta só fecha a lista.
      if ((e.target as HTMLElement | null)?.closest?.('[aria-expanded="true"]')) return;
      e.preventDefault();
      pedirFechamento();
    };
    document.addEventListener("keydown", aoTeclar);
    return () => document.removeEventListener("keydown", aoTeclar);
  }, [pedirFechamento]);

  const onBackdropClick = (e: MouseEvent<HTMLElement>) => {
    if (e.target === e.currentTarget) pedirFechamento();
  };

  const dialogoDescarte = (
    <ConfirmDialog
      open={confirmando}
      title="Descartar alterações?"
      description="Existem alterações não salvas neste aluno. Se fechar agora, elas serão perdidas."
      confirmLabel="Descartar"
      cancelLabel="Continuar editando"
      onConfirm={() => {
        setConfirmando(false);
        onClose();
      }}
      onClose={() => setConfirmando(false)}
    />
  );

  return { pedirFechamento, onBackdropClick, dialogoDescarte };
}

/** Compara dois objetos simples (dados do formulário) para saber se houve alteração. */
export function foiAlterado<T>(inicial: T, atual: T): boolean {
  return JSON.stringify(inicial) !== JSON.stringify(atual);
}
