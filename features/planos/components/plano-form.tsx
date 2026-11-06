"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/form-controls";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/toast";
import { parseMoeda } from "@/lib/format";
import {
  formularioVazio,
  LIMITES,
  paraInput,
  validarPlano,
  type PlanoErrors,
  type PlanoFormValues,
} from "../schema";
import { PlanoDuplicadoError } from "../services";
import type { PlanoInput } from "../types";
import { BeneficiosInput } from "./beneficios-input";
import { CapaPicker } from "./capa-picker";
import { IconePicker } from "./icone-picker";
import { PlanoPreviewCard } from "./plano-preview-card";

const checkboxClass =
  "size-4 rounded accent-primary-container focus-visible:outline-2 focus-visible:outline-primary";

export function PlanoForm({
  inicial,
  submitLabel,
  onSubmit,
}: {
  inicial?: PlanoFormValues;
  submitLabel: string;
  onSubmit: (dados: PlanoInput) => Promise<void>;
}) {
  const router = useRouter();
  const toast = useToast();
  const [values, setValues] = useState<PlanoFormValues>(() => inicial ?? formularioVazio());
  const [errors, setErrors] = useState<PlanoErrors>({});
  const [salvando, setSalvando] = useState(false);

  function atualizar<K extends keyof PlanoFormValues>(campo: K, valor: PlanoFormValues[K]) {
    setValues((v) => ({ ...v, [campo]: valor }));
    if (campo in errors) setErrors((e) => ({ ...e, [campo]: undefined }));
  }

  async function aoEnviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const erros = validarPlano(values);
    setErrors(erros);
    if (Object.values(erros).some(Boolean)) {
      requestAnimationFrame(() =>
        document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(),
      );
      return;
    }
    setSalvando(true);
    try {
      await onSubmit(paraInput(values));
    } catch (err) {
      if (err instanceof PlanoDuplicadoError) {
        setErrors({ nome: err.message });
        document.getElementById("nome")?.focus();
      } else {
        toast.error(err instanceof Error ? err.message : "Não foi possível salvar o plano.");
      }
      setSalvando(false);
    }
  }

  const valorPreview = values.valorSobConsulta
    ? null
    : (() => {
        const n = parseMoeda(values.valorMensal);
        return Number.isNaN(n) ? 0 : n;
      })();
  const aulasPreview = values.aulasPersonalizadas
    ? null
    : (() => {
        const n = Number(values.aulasIncluidas);
        return Number.isInteger(n) && n > 0 ? n : 0;
      })();

  return (
    <form
      onSubmit={aoEnviar}
      noValidate
      className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_24rem]"
    >
      <div className="flex flex-col gap-8">
        <section className="rounded-[2rem] bg-surface-container-lowest p-6 shadow-ambient sm:p-8">
          <h2 className="mb-6 text-lg font-bold text-on-surface">Detalhes do Plano</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            <Field label="Nome do Plano" htmlFor="nome" error={errors.nome}>
              <Input
                id="nome"
                value={values.nome}
                maxLength={LIMITES.nomeMax}
                placeholder="Ex: Atelier Essencial"
                autoComplete="off"
                invalid={!!errors.nome}
                onChange={(e) => atualizar("nome", e.target.value)}
              />
            </Field>

            <div className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-on-surface">Status do Plano</span>
              <Switch
                label={values.status === "ATIVO" ? "Ativo" : "Inativo"}
                checked={values.status === "ATIVO"}
                onChange={(on) => atualizar("status", on ? "ATIVO" : "INATIVO")}
              />
            </div>

            <Field
              label="Breve Descrição"
              htmlFor="descricao"
              error={errors.descricao}
              className="sm:col-span-2"
            >
              <Textarea
                id="descricao"
                rows={3}
                value={values.descricao}
                placeholder="Descreva os objetivos principais deste plano..."
                invalid={!!errors.descricao}
                onChange={(e) => atualizar("descricao", e.target.value)}
              />
              <span className="text-right text-xs text-on-surface-variant/60">
                {values.descricao.length}/{LIMITES.descricaoMax}
              </span>
            </Field>

            <Field label="Valor Mensal (R$)" htmlFor="valor" error={errors.valorMensal}>
              <Input
                id="valor"
                prefixo="R$"
                inputMode="decimal"
                placeholder="0,00"
                value={values.valorSobConsulta ? "" : values.valorMensal}
                disabled={values.valorSobConsulta}
                invalid={!!errors.valorMensal}
                onChange={(e) => atualizar("valorMensal", e.target.value)}
              />
              <label className="flex w-fit items-center gap-2 text-xs font-medium text-on-surface-variant">
                <input
                  type="checkbox"
                  className={checkboxClass}
                  checked={values.valorSobConsulta}
                  onChange={(e) => atualizar("valorSobConsulta", e.target.checked)}
                />
                Valor sob consulta
              </label>
            </Field>

            <Field label="Aulas Incluídas" htmlFor="aulas" error={errors.aulasIncluidas}>
              <Input
                id="aulas"
                type="number"
                min={1}
                step={1}
                inputMode="numeric"
                placeholder="Ex: 8"
                value={values.aulasPersonalizadas ? "" : values.aulasIncluidas}
                disabled={values.aulasPersonalizadas}
                invalid={!!errors.aulasIncluidas}
                onChange={(e) => atualizar("aulasIncluidas", e.target.value)}
              />
              <label className="flex w-fit items-center gap-2 text-xs font-medium text-on-surface-variant">
                <input
                  type="checkbox"
                  className={checkboxClass}
                  checked={values.aulasPersonalizadas}
                  onChange={(e) => atualizar("aulasPersonalizadas", e.target.checked)}
                />
                Aulas personalizadas
              </label>
            </Field>

            <div className="flex flex-col gap-2 sm:col-span-2">
              <label htmlFor="beneficio" className="text-sm font-semibold text-on-surface">
                Benefícios e Funcionalidades
              </label>
              <BeneficiosInput
                value={values.beneficios}
                onChange={(b) => atualizar("beneficios", b)}
                error={errors.beneficios}
              />
            </div>

            <div className="flex flex-col gap-2 sm:col-span-2">
              <span className="text-sm font-semibold text-on-surface">Ícone Representativo</span>
              <IconePicker value={values.icone} onChange={(i) => atualizar("icone", i)} />
            </div>

            <div className="flex flex-col gap-2 sm:col-span-2">
              <span className="text-sm font-semibold text-on-surface">Capa do Card</span>
              <CapaPicker
                value={values.capa}
                onChange={(c) => atualizar("capa", c)}
                error={errors.capa}
              />
            </div>
          </div>
        </section>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end sm:gap-4">
          <Button
            variant="tertiary"
            size="lg"
            onClick={() => router.push("/planos")}
            disabled={salvando}
          >
            Descartar
          </Button>
          <Button type="submit" size="lg" disabled={salvando}>
            {salvando ? "Salvando..." : submitLabel}
          </Button>
        </div>
      </div>

      <aside aria-label="Pré-visualização" className="flex flex-col gap-4 lg:sticky lg:top-28">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black uppercase tracking-widest text-outline">
            Pré-visualização
          </h2>
          <span className="rounded bg-tertiary-container px-2 py-1 text-[0.625rem] font-bold text-white">
            VISTA DO CLIENTE
          </span>
        </div>
        <PlanoPreviewCard
          dados={{
            nome: values.nome,
            descricao: values.descricao,
            valorMensal: valorPreview,
            aulasIncluidas: aulasPreview,
            beneficios: values.beneficios,
            icone: values.icone,
            capa: values.capa,
          }}
        />
      </aside>
    </form>
  );
}
