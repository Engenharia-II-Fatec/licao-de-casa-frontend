"use client";

import Link from "next/link";
import { use, useState, type FormEvent } from "react";
import { buttonClasses } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState, Skeleton } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";
import { mascararCpf, mascararEmail, mascararRg, mascararTelefone } from "@/lib/masks";
import { useDisciplinasOpcoes, useProfessor } from "../hooks";
import { professoresService } from "../services";
import type { ProfessorDetalhe } from "../types";
import {
  codigoProfessor,
  mascararValor,
  paraFormulario,
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

/** Tela "Edição de Professor" — detalhes e edição (Figura 13). */
export function ProfessorDetalheTela({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const numId = Number(id);
  const { professor, setProfessor, erro } = useProfessor(numId);

  const voltar = (
    <Link href="/professores" className={buttonClasses({ variant: "secondary" })}>
      Voltar para Professores
    </Link>
  );
  if (erro) return <EmptyState title="Não foi possível carregar o professor" description={erro} action={voltar} />;
  if (professor === undefined) return <Skeleton className="h-[32rem]" />;
  if (professor === null) {
    return (
      <EmptyState
        title="Professor não encontrado"
        description="O cadastro pode ter sido excluído ou o link está incorreto."
        action={voltar}
      />
    );
  }

  // `key` reinicia o formulário quando os dados salvos mudam.
  return (
    <FormularioProfessor
      key={JSON.stringify(paraFormulario(professor))}
      professor={professor}
      onSalvo={setProfessor}
    />
  );
}

function FormularioProfessor({
  professor,
  onSalvo,
}: {
  professor: ProfessorDetalhe;
  onSalvo: (p: ProfessorDetalhe) => void;
}) {
  const toast = useToast();
  const { disciplinas, carregando, erro: erroDisciplinas } = useDisciplinasOpcoes();
  const [form, setForm] = useState<FormProfessor>(() => paraFormulario(professor));
  const [erros, setErros] = useState<ErrosForm>({});
  const [salvando, setSalvando] = useState(false);
  const [confirmarStatus, setConfirmarStatus] = useState(false);
  const [alterandoStatus, setAlterandoStatus] = useState(false);

  const original = paraFormulario(professor);
  const alterado = JSON.stringify(form) !== JSON.stringify(original);
  const atualizar = (campo: CampoTexto, valor: string) => setForm((f) => ({ ...f, [campo]: valor }));
  const digitosTelefone = form.telefone.replace(/\D/g, "");
  const nomesDisciplinas = new Map(disciplinas.map((d) => [d.id, d.nome]));
  const disciplinasDoForm = form.disciplinaIds.map(
    (id) => nomesDisciplinas.get(id) ?? professor.disciplinas.find((d) => d.id === id)?.nome ?? "",
  );

  async function salvar(e?: FormEvent) {
    e?.preventDefault();
    const novosErros = validarFormulario(form);
    setErros(novosErros);
    if (Object.keys(novosErros).length > 0) {
      toast.error("Confira os campos destacados.");
      return;
    }
    setSalvando(true);
    try {
      const salvo = await professoresService.atualizar(professor.id, paraInput(form, professor.curriculo ?? null));
      toast.success("Alterações salvas.");
      onSalvo(salvo);
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : "Não foi possível salvar.");
    } finally {
      setSalvando(false);
    }
  }

  async function alternarStatus() {
    setAlterandoStatus(true);
    try {
      const salvo = await professoresService.alterarStatus(professor.id, !professor.ativo);
      toast.success(salvo.ativo ? "Professor reativado." : "Professor inativado.");
      onSalvo(salvo);
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : "Não foi possível alterar o status.");
    } finally {
      setAlterandoStatus(false);
      setConfirmarStatus(false);
    }
  }

  const acaoRapida =
    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition hover:bg-surface-container-low";

  return (
    <form onSubmit={salvar} className="flex flex-col gap-6" noValidate>
      {/* Cabeçalho: voltar para a listagem */}
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/professores"
          aria-label="Voltar para Professores"
          title="Voltar para Professores"
          className="grid size-10 place-items-center rounded-full text-primary transition hover:bg-primary-fixed/50"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <h1 className="text-xl font-extrabold tracking-tight text-on-surface sm:text-2xl">Edição de Professor</h1>
        {!professor.ativo && (
          <span className="rounded-full bg-surface-container-high px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide text-on-surface-variant">
            Inativo
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Coluna esquerda: perfil, resumo e ações */}
        <aside className="flex flex-col gap-6 lg:col-span-4 xl:col-span-3">
          <div className="flex flex-col items-center gap-3 rounded-3xl bg-surface-container-low p-6 text-center">
            <FotoProfessor
              foto={form.foto}
              nome={form.nome}
              onChange={(foto) => atualizar("foto", foto)}
              tamanho="size-32"
              variante="perfil"
            />
            <div>
              <p className="text-lg font-extrabold leading-tight text-on-surface">{form.nome || professor.nome}</p>
              <p className="text-xs font-semibold text-on-surface-variant/80">ID: {codigoProfessor(professor)}</p>
            </div>
            {disciplinasDoForm[0] && (
              <p className="text-xs font-bold text-on-surface-variant">{disciplinasDoForm[0]}</p>
            )}
            {disciplinasDoForm.length > 1 && (
              <div className="flex flex-wrap justify-center gap-1.5">
                {disciplinasDoForm.slice(1).map((nome, i) => (
                  <span
                    key={`${nome}-${i}`}
                    className="rounded-md bg-secondary-fixed px-2 py-0.5 text-[11px] font-semibold text-on-secondary-fixed"
                  >
                    {nome}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-3xl bg-surface-container-low p-5">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-extrabold text-on-surface">
              <span className="material-symbols-outlined text-lg text-primary">insights</span>
              Resumo de Atividades
            </h2>
            <dl className="flex flex-col gap-2 text-xs">
              <div className="flex justify-between gap-2">
                <dt className="text-on-surface-variant">Aulas concluídas</dt>
                <dd className="font-extrabold text-on-surface">{professor.resumo.aulasConcluidas}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-on-surface-variant">Próximas aulas</dt>
                <dd className="font-extrabold text-on-surface">{professor.resumo.proximasAulas}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-on-surface-variant">Alunos atendidos</dt>
                <dd className="font-extrabold text-on-surface">{professor.resumo.alunosAtendidos}</dd>
              </div>
            </dl>
          </div>

          <div className="flex flex-col gap-1 rounded-3xl bg-surface-container-lowest p-3 shadow-ambient">
            <h2 className="px-3 pb-1 pt-2 text-xs font-black uppercase tracking-wider text-on-surface-variant">
              Ações Rápidas
            </h2>
            {form.email ? (
              <a href={`mailto:${form.email}`} className={`${acaoRapida} text-secondary`}>
                <span className="material-symbols-outlined text-xl">mail</span>
                Enviar e-mail
              </a>
            ) : (
              <span
                className={`${acaoRapida} cursor-not-allowed text-on-surface-variant/50 hover:bg-transparent`}
                title="Cadastre um e-mail para usar esta ação"
              >
                <span className="material-symbols-outlined text-xl">mail</span>
                Enviar e-mail (sem e-mail)
              </span>
            )}
            {digitosTelefone.length >= 10 ? (
              <a
                href={`https://wa.me/55${digitosTelefone}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`${acaoRapida} text-secondary`}
              >
                <span className="material-symbols-outlined text-xl">chat</span>
                Enviar mensagem WhatsApp
              </a>
            ) : (
              <span className={`${acaoRapida} cursor-not-allowed text-on-surface-variant/50 hover:bg-transparent`}>
                <span className="material-symbols-outlined text-xl">chat</span>
                Enviar WhatsApp (sem telefone)
              </span>
            )}
            <button
              type="button"
              onClick={() => setConfirmarStatus(true)}
              className={`${acaoRapida} ${professor.ativo ? "text-error" : "text-tertiary"}`}
            >
              <span className="material-symbols-outlined text-xl">{professor.ativo ? "person_off" : "person_check"}</span>
              {professor.ativo ? "Inativar Professor" : "Reativar Professor"}
            </button>
          </div>
        </aside>

        {/* Coluna direita: formulário */}
        <div className="flex flex-col gap-6 lg:col-span-8 xl:col-span-9">
          <SecaoCard titulo="Dados Pessoais" cor="bg-primary-container">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
              <Campo
                id="ed-nome"
                rotulo="Nome Completo"
                value={form.nome}
                onChange={(e) => atualizar("nome", e.target.value)}
                erro={erros.nome}
                className="sm:col-span-3"
              />
              <Campo
                id="ed-email"
                rotulo="E-mail Profissional"
                type="email"
                value={form.email}
                placeholder="professor@email.com"
                onChange={(e) => atualizar("email", mascararEmail(e.target.value))}
                erro={erros.email}
                className="sm:col-span-3"
              />
              <Campo
                id="ed-cpf"
                rotulo="CPF"
                value={form.cpf}
                placeholder="000.000.000-00"
                inputMode="numeric"
                onChange={(e) => atualizar("cpf", mascararCpf(e.target.value))}
                erro={erros.cpf}
                className="sm:col-span-2"
              />
              <Campo
                id="ed-rg"
                rotulo="RG"
                value={form.rg}
                placeholder="00.000.000-0"
                onChange={(e) => atualizar("rg", mascararRg(e.target.value))}
                className="sm:col-span-2"
              />
              <Campo
                id="ed-tel"
                rotulo="Telefone / WhatsApp"
                value={form.telefone}
                placeholder="(00) 00000-0000"
                inputMode="tel"
                onChange={(e) => atualizar("telefone", mascararTelefone(e.target.value))}
                erro={erros.telefone}
                className="sm:col-span-2"
              />
              <Campo
                id="ed-nascimento"
                rotulo="Data de Nascimento"
                type="date"
                value={form.dataNascimento}
                max={new Date().toISOString().slice(0, 10)}
                onChange={(e) => atualizar("dataNascimento", e.target.value)}
                className="sm:col-span-2"
              />
            </div>
          </SecaoCard>

          <SecaoCard titulo="Dados Profissionais" cor="bg-secondary">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div className="md:col-span-3">
                <span className={rotuloClasses}>Disciplinas Ministradas</span>
                <SeletorDisciplinas
                  modo="lista"
                  opcoes={disciplinas}
                  selecionadas={form.disciplinaIds}
                  onChange={(ids) => setForm((f) => ({ ...f, disciplinaIds: ids }))}
                  carregando={carregando}
                  erro={erroDisciplinas}
                />
              </div>
              <div>
                <label htmlFor="ed-valor" className={rotuloClasses}>
                  Valor Hora/Aula (R$)
                </label>
                <input
                  id="ed-valor"
                  value={form.valorHoraAula}
                  placeholder="0,00"
                  inputMode="decimal"
                  onChange={(e) => atualizar("valorHoraAula", mascararValor(e.target.value))}
                  aria-invalid={!!erros.valorHoraAula}
                  className={`${campoClasses} ${erros.valorHoraAula ? "ring-2 ring-error/60" : ""}`}
                />
                {erros.valorHoraAula && <p className="mt-1 text-xs font-medium text-error">{erros.valorHoraAula}</p>}
              </div>
            </div>
          </SecaoCard>

          <SecaoCard titulo="Formação Acadêmica" cor="bg-primary">
            <div className="flex flex-col gap-5">
              <div>
                <label htmlFor="ed-formacao" className={rotuloClasses}>
                  Qualificações e Formação
                </label>
                <textarea
                  id="ed-formacao"
                  rows={4}
                  value={form.formacao}
                  placeholder="Ex: Graduação em Letras (USP), Mestrado em Educação (PUC)..."
                  onChange={(e) => atualizar("formacao", e.target.value)}
                  className={`${campoClasses} resize-y`}
                />
              </div>
              <div>
                <span className={rotuloClasses}>Currículo Vinculado</span>
                <CampoCurriculo
                  curriculo={form.curriculo}
                  onChange={(c) => setForm((f) => ({ ...f, curriculo: c }))}
                  urlSalvo={professor.curriculo ? professoresService.urlCurriculo(professor.id) : undefined}
                />
              </div>
            </div>
          </SecaoCard>

          <SecaoCard titulo="Endereço Residencial" cor="bg-tertiary">
            <CamposEndereco form={form} atualizar={atualizar} setForm={setForm} prefixo="ed" />
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
              disabled={!alterado || salvando}
              className="rounded-full bg-linear-to-br from-primary to-primary-container px-7 py-3 text-sm font-bold text-white shadow-cta transition hover:shadow-cta-hover active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
            >
              {salvando ? "Salvando..." : "Salvar Alterações"}
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmarStatus}
        title={professor.ativo ? "Inativar professor?" : "Reativar professor?"}
        description={
          professor.ativo ? (
            <>
              <b>{professor.nome}</b> ficará marcado como inativo e deixa de aparecer como responsável pelas
              disciplinas. Os vínculos e o histórico de aulas continuam guardados, e você pode reativar depois.
            </>
          ) : (
            <>
              <b>{professor.nome}</b> voltará a aparecer como ativo.
            </>
          )
        }
        confirmLabel={professor.ativo ? "Inativar" : "Reativar"}
        tone={professor.ativo ? "danger" : "primary"}
        loading={alterandoStatus}
        onConfirm={alternarStatus}
        onClose={() => setConfirmarStatus(false)}
      />
    </form>
  );
}
