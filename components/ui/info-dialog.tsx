"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Button } from "./button";
import { IconClose } from "./icons";

/** Diálogo informativo (só leitura) no padrão do ConfirmDialog: <dialog>, Esc e clique fora fecham. */
export function InfoDialog({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby="info-dialog-titulo"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-3xl bg-surface-container-lowest p-0 text-on-surface shadow-ambient backdrop:bg-on-surface/30 backdrop:backdrop-blur-[2px]"
    >
      <div className="flex max-h-[80vh] flex-col gap-5 overflow-y-auto p-7 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <h2 id="info-dialog-titulo" className="text-lg font-extrabold">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="grid size-9 shrink-0 place-items-center rounded-full text-on-surface-variant hover:bg-surface-container-high cursor-pointer"
          >
            <IconClose className="size-5" />
          </button>
        </div>
        <div className="flex flex-col gap-3 text-sm leading-relaxed text-on-surface-variant">
          {children}
        </div>
        <div className="flex justify-end">
          <Button variant="secondary" onClick={onClose}>
            Entendi
          </Button>
        </div>
      </div>
    </dialog>
  );
}
