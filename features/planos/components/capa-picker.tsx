"use client";

import { useRef, useState } from "react";
import { IconImage, IconUpload } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { processarImagem } from "@/lib/image";
import { GRADIENTES_PREDEFINIDOS } from "../icones";
import type { PlanoCapa } from "../types";

type Gradiente = Extract<PlanoCapa, { tipo: "gradiente" }>;
type Imagem = Extract<PlanoCapa, { tipo: "imagem" }>;

const abaBase =
  "flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-primary";

export function CapaPicker({
  value,
  onChange,
  error,
}: {
  value: PlanoCapa;
  onChange: (capa: PlanoCapa) => void;
  error?: string;
}) {
  const toast = useToast();
  const inputArquivo = useRef<HTMLInputElement>(null);
  const [processando, setProcessando] = useState(false);

  // Guarda a última escolha de cada aba para alternar sem perder o que foi feito.
  const [ultimoGradiente, setUltimoGradiente] = useState<Gradiente>(
    value.tipo === "gradiente"
      ? value
      : { tipo: "gradiente", de: GRADIENTES_PREDEFINIDOS[0].de, para: GRADIENTES_PREDEFINIDOS[0].para },
  );
  const [ultimaImagem, setUltimaImagem] = useState<Imagem>(
    value.tipo === "imagem" ? value : { tipo: "imagem", dataUrl: "" },
  );

  function escolherGradiente(g: Gradiente) {
    setUltimoGradiente(g);
    onChange(g);
  }

  function trocarAba(tipo: PlanoCapa["tipo"]) {
    if (tipo === value.tipo) return;
    onChange(tipo === "gradiente" ? ultimoGradiente : ultimaImagem);
  }

  async function aoEscolherArquivo(arquivo: File | undefined) {
    if (!arquivo) return;
    setProcessando(true);
    try {
      const dataUrl = await processarImagem(arquivo);
      const img: Imagem = { tipo: "imagem", dataUrl };
      setUltimaImagem(img);
      onChange(img);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não foi possível usar esta imagem.");
    } finally {
      setProcessando(false);
      if (inputArquivo.current) inputArquivo.current.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-surface-container-low p-3">
      <div role="tablist" aria-label="Tipo de capa" className="flex gap-1 rounded-2xl bg-surface-container-high p-1">
        {(["gradiente", "imagem"] as const).map((tipo) => (
          <button
            key={tipo}
            type="button"
            role="tab"
            aria-selected={value.tipo === tipo}
            onClick={() => trocarAba(tipo)}
            className={`${abaBase} ${
              value.tipo === tipo
                ? "bg-surface-container-lowest text-primary shadow-sm"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            {tipo === "gradiente" ? "Gradiente" : "Imagem"}
          </button>
        ))}
      </div>

      {value.tipo === "gradiente" ? (
        <div className="flex flex-col gap-4 px-1 pb-1">
          <div role="radiogroup" aria-label="Gradientes sugeridos" className="flex flex-wrap gap-3">
            {GRADIENTES_PREDEFINIDOS.map((g) => {
              const ativo = g.de === value.de && g.para === value.para;
              return (
                <button
                  key={g.nome}
                  type="button"
                  role="radio"
                  aria-checked={ativo}
                  aria-label={g.nome}
                  title={g.nome}
                  onClick={() => escolherGradiente({ tipo: "gradiente", de: g.de, para: g.para })}
                  style={{ backgroundImage: `linear-gradient(135deg, ${g.de}, ${g.para})` }}
                  className={`size-11 rounded-full transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                    ativo ? "ring-2 ring-primary ring-offset-2" : "hover:scale-105"
                  }`}
                />
              );
            })}
          </div>
          <div className="flex flex-wrap gap-6">
            {(
              [
                ["de", "Cor inicial"],
                ["para", "Cor final"],
              ] as const
            ).map(([campo, rotulo]) => (
              <label key={campo} className="flex items-center gap-3 text-sm font-medium text-on-surface-variant">
                <input
                  type="color"
                  value={value[campo]}
                  onChange={(e) => escolherGradiente({ ...value, [campo]: e.target.value })}
                  className="size-10 cursor-pointer rounded-full border-0 bg-transparent p-0"
                />
                {rotulo}
              </label>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3 px-1 pb-1">
          <input
            ref={inputArquivo}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="sr-only"
            aria-label="Selecionar imagem de capa"
            onChange={(e) => aoEscolherArquivo(e.target.files?.[0])}
          />
          {value.dataUrl ? (
            <div
              role="img"
              aria-label="Imagem de capa selecionada"
              className="h-32 w-full rounded-2xl bg-surface-container-high bg-cover bg-center"
              style={{ backgroundImage: `url("${value.dataUrl}")` }}
            />
          ) : (
            <div className="flex h-32 flex-col items-center justify-center gap-2 rounded-2xl bg-surface-container-high text-on-surface-variant">
              <IconImage className="size-7" />
              <span className="text-xs">Nenhuma imagem selecionada</span>
            </div>
          )}
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              onClick={() => inputArquivo.current?.click()}
              disabled={processando}
            >
              <IconUpload className="size-4" />
              {processando ? "Processando..." : value.dataUrl ? "Trocar imagem" : "Escolher imagem"}
            </Button>
            <span className="text-xs text-on-surface-variant/70">PNG, JPEG ou WebP, até 5 MB</span>
          </div>
        </div>
      )}

      {error && (
        <p role="alert" className="px-1 text-xs font-medium text-error">
          {error}
        </p>
      )}
    </div>
  );
}
