"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Button } from "./button";
import { IconAlert } from "./icons";

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  tone = "danger",
  loading = false,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "primary";
  loading?: boolean;
  onConfirm: () => void;
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
      aria-labelledby="confirm-titulo"
      onCancel={(e) => {
        e.preventDefault();
        if (!loading) onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current && !loading) onClose();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-3xl bg-surface-container-lowest p-0 text-on-surface shadow-ambient backdrop:bg-on-surface/30 backdrop:backdrop-blur-[2px]"
    >
      <div className="flex flex-col gap-6 p-7 sm:p-8">
        <div className="flex items-start gap-4">
          <span
            className={`grid size-12 shrink-0 place-items-center rounded-2xl ${
              tone === "danger" ? "bg-error-container text-error" : "bg-primary-fixed text-primary"
            }`}
          >
            <IconAlert />
          </span>
          <div className="flex flex-col gap-2">
            <h2 id="confirm-titulo" className="text-lg font-extrabold">
              {title}
            </h2>
            <div className="text-sm leading-relaxed text-on-surface-variant">{description}</div>
          </div>
        </div>
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="tertiary" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={tone === "danger" ? "danger" : "primary"}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Aguarde..." : confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  );
}
