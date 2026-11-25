"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useToast } from "@/components/ui/toast";
import { mascararCpf, mascararEmail, mascararRg, mascararTelefone } from "@/lib/masks";
import { useDisciplinasOpcoes } from "../hooks";
import { professoresService } from "../services";
import {
  FORM_VAZIO,
  mascararValor,
  paraInput,
  validarFormulario,
  type CampoTexto,
  type ErrosForm,
  type FormProfessor,
} from "../utils";
import {
  Campo,
  CampoCurriculo,
  CamposEndereco,
  FotoProfessor,
  SecaoCard,
  SeletorDisciplinas,
  campoClasses,
  rotuloClasses,
} from "./campos-professor";

/** Tela "Cadastro de Novo Professor" (Figura 11). */
export function ProfessorNovo() {
  const router = useRouter();
  const toast = useToast();
  const { disciplinas, carregando, erro: erroDisciplinas } = useDisciplinasOpcoes();
  const [form, setForm] = useState<FormProfessor>(FORM_VAZIO);
  const [erros, setErros] = useState<ErrosForm>({});
  const [salvando, setSalvando] = useState(false);

  const atualizar = (campo: CampoTexto, valor: string) => setForm((f) => ({ ...f, [campo]: valor }));

  async function salvar(e: FormEvent) {
    e.preventDefault();
    const novosErros = validarFormulario(form);
    setErros(novosErros);
    if (Object.keys(novosErros).length > 0) {
      toast.error("Confira os campos destacados.");
      return;
    }
    setSalvando(true);
    try {
      const criado = await professoresService.criar(paraInput(form));
      toast.success(`Professor "${criado.nome}" cadastrado!`);
      router.push(`/professores/${criado.id}`);
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : "Não foi possível cadastrar o professor.");
      setSalvando(false);
    }
  }

  return (
    <form onSubmit={salvar} className="mx-auto flex w-full max-w-5xl flex-col gap-6" noValidate>
      <div className="flex flex-col gap-2">
        <nav aria-label="Trilha" className="flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant/70">
          <Link href="/professores" className="hover:text-primary hover:underline">
            Professores
          </Link>
          <span>›</span>
          <span className="font-bold text-primary">Novo Cadastro</span>
        </nav>
        <h1 className="text-2xl font-extrabold tracking-tight text-on-surface sm:text-3xl">Cadastro de Novo Professor</h1>
      </div>

      <SecaoCard titulo="Dados Pessoais & Foto" cor="bg-primary-container">
        <div className="flex flex-col gap-6 md:flex-row md:items-start">
          <FotoProfessor foto={form.foto} nome={form.nome} onChange={(foto) => atualizar("foto", foto)} />
          <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
            <Campo
              id="prof-nome"
              rotulo="Nome Completo"
              value={form.nome}
              placeholder="Ex: Maria Oliveira Silva"
              onChange={(e) => atualizar("nome", e.target.value)}
              erro={erros.nome}
              className="sm:col-span-2"
              autoFocus
            />
            <Campo
              id="prof-cpf"
              rotulo="CPF"
              value={form.cpf}
              placeholder="000.000.000-00"
              inputMode="numeric"
              onChange={(e) => atualizar("cpf", mascararCpf(e.target.value))}
              erro={erros.cpf}
            />
            <Campo
              id="prof-rg"
              rotulo="RG"
              value={form.rg}
              placeholder="00.000.000-0"
              onChange={(e) => atualizar("rg", mascararRg(e.target.value))}
            />
            <Campo
              id="prof-tel"
              rotulo="Telefone Celular"
              value={form.telefone}
              placeholder="(00) 00000-0000"
              inputMode="tel"
              onChange={(e) => atualizar("telefone", mascararTelefone(e.target.value))}
              erro={erros.telefone}
            />
            <Campo
              id="prof-email"
              rotulo="E-mail"
              type="email"
              value={form.email}
              placeholder="professor@email.com"
              onChange={(e) => atualizar("email", mascararEmail(e.target.value))}
              erro={erros.email}
            />
          </div>
        </div>
      </SecaoCard>

      <SecaoCard titulo="Dados Profissionais" cor="bg-secondary">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div>
            <label htmlFor="prof-valor" className={rotuloClasses}>
              Valor Hora/Aula (R$)
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-sm font-bold text-on-surface-variant">
                R$
              </span>
              <input
                id="prof-valor"
                value={form.valorHoraAula}
                placeholder="0,00"
                inputMode="decimal"
                onChange={(e) => atualizar("valorHoraAula", mascararValor(e.target.value))}
                aria-invalid={!!erros.valorHoraAula}
                className={`${campoClasses} pl-11 ${erros.valorHoraAula ? "ring-2 ring-error/60" : ""}`}
              />
            </div>
            {erros.valorHoraAula && <p className="mt-1 text-xs font-medium text-error">{erros.valorHoraAula}</p>}
          </div>
          <div className="md:col-span-2">
            <span className={rotuloClasses}>Disciplinas</span>
            <SeletorDisciplinas
              opcoes={disciplinas}
              selecionadas={form.disciplinaIds}
              onChange={(ids) => setForm((f) => ({ ...f, disciplinaIds: ids }))}
              carregando={carregando}
              erro={erroDisciplinas}
            />
          </div>
        </div>
      </SecaoCard>

      <SecaoCard titulo="Formação Acadêmica & Documentos" cor="bg-primary">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label htmlFor="prof-formacao" className={rotuloClasses}>
              Formação Acadêmica
            </label>
            <textarea
              id="prof-formacao"
              rows={5}
              value={form.formacao}
              placeholder="Ex: Graduação em Letras (USP), Mestrado em Educação (PUC)..."
              onChange={(e) => atualizar("formacao", e.target.value)}
              className={`${campoClasses} resize-y`}
            />
            <p className="mt-1 text-[11px] text-on-surface-variant/70">Liste suas principais qualificações acadêmicas.</p>
          </div>
          <div>
            <span className={rotuloClasses}>Currículo (PDF/DOC)</span>
            <CampoCurriculo curriculo={form.curriculo} onChange={(c) => setForm((f) => ({ ...f, curriculo: c }))} />
          </div>
        </div>
      </SecaoCard>

      <SecaoCard titulo="Endereço" cor="bg-tertiary">
        <CamposEndereco form={form} atualizar={atualizar} setForm={setForm} prefixo="prof" />
      </SecaoCard>

      <div className="flex items-center justify-end gap-3 pb-4">
        <Link
          href="/professores"
          className="rounded-full px-6 py-3 text-sm font-bold text-on-surface transition hover:bg-surface-container-high"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={salvando}
          className="flex items-center gap-2 rounded-full bg-linear-to-br from-primary to-primary-container px-7 py-3 text-sm font-bold text-white shadow-cta transition hover:shadow-cta-hover active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {salvando ? "Salvando..." : "Salvar Cadastro"}
          <span className="material-symbols-outlined text-lg">save</span>
        </button>
      </div>
    </form>
  );
}
