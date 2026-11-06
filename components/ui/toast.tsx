"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { IconAlert, IconCheckCircle, IconClose } from "./icons";

type ToastTipo = "success" | "error";
interface ToastItem {
  id: number;
  tipo: ToastTipo;
  mensagem: string;
}

interface ToastApi {
  success: (mensagem: string) => void;
  error: (mensagem: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);
let contador = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const remover = useCallback((id: number) => {
    setToasts((atuais) => atuais.filter((t) => t.id !== id));
  }, []);

  const adicionar = useCallback(
    (tipo: ToastTipo, mensagem: string) => {
      const id = ++contador;
      setToasts((atuais) => [...atuais, { id, tipo, mensagem }]);
      window.setTimeout(() => remover(id), tipo === "error" ? 6000 : 4000);
    },
    [remover],
  );

  const api = useMemo<ToastApi>(
    () => ({
      success: (m) => adicionar("success", m),
      error: (m) => adicionar("error", m),
    }),
    [adicionar],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 bottom-4 z-[60] flex flex-col items-end gap-3 sm:inset-x-auto sm:right-6 sm:bottom-6"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role={t.tipo === "error" ? "alert" : "status"}
            className="pointer-events-auto flex w-full max-w-sm animate-toast-in items-start gap-3 rounded-2xl bg-surface/80 p-4 text-sm shadow-ambient backdrop-blur-[12px] sm:w-auto"
          >
            <span className={t.tipo === "error" ? "text-error" : "text-tertiary"}>
              {t.tipo === "error" ? <IconAlert /> : <IconCheckCircle />}
            </span>
            <p className="flex-1 pt-0.5 font-medium text-on-surface">{t.mensagem}</p>
            <button
              type="button"
              onClick={() => remover(t.id)}
              aria-label="Fechar notificação"
              className="grid size-6 place-items-center rounded-full text-on-surface-variant hover:bg-surface-container-high"
            >
              <IconClose className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast deve ser usado dentro de <ToastProvider>.");
  return ctx;
}
