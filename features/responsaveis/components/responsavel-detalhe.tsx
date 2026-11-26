"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { use, useState, type FormEvent, type ReactNode } from "react";
import { buttonClasses } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState, Skeleton } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";
import { UFS } from "@/features/alunos/constants";
import { mascararCep, mascararCpf, mascararEmail, mascararRg, mascararTelefone } from "@/lib/masks";
import { consultarCep } from "@/lib/viacep";
import { useResponsavel } from "../hooks";
import { responsaveisDetalheService } from "../services";
import type { PagamentoResponsavel, ResponsavelDetalhe, ResponsavelInput } from "../types";
import { diaMes } from "../utils";
import { AvatarResponsavel } from "./avatar-responsavel";
import { VincularAlunoDialog } from "./vincular-aluno-dialog";

const PARENTESCOS = ["Mãe", "Pai", "Avó", "Avô", "Tia", "Tio", "Responsável", "Titular da Conta"];
const PAGAMENTOS_VISIVEIS = 3;

const campoClasses =
  "w-full rounded-xl bg-surface-container-low px-4 py-3 text-sm font-medium text-on-surface outline-none transition placeholder:text-on-surface-variant/40 focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/40";
const rotuloClasses = "mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/80";

function paraFormulario(r: ResponsavelDetalhe): ResponsavelInput {
  return {
    name: r.name,
    role: r.role,
    phone: r.phone,
    photo: r.photo,
    cpf: r.cpf ?? "",
    rg: r.rg ?? "",
    email: r.email ?? "",
    cep: r.cep ?? "",
    address: r.address ?? "",
    number: r.number ?? "",
    complement: r.complement ?? "",
    neighborhood: r.neighborhood ?? "",
    city: r.city ?? "",
    state: r.state ?? "",
  };
}

/** "Rua das Palmeiras, 450 - Apto 12 - São Paulo, SP" */
function enderecoCompleto(f: ResponsavelInput): string {
  const rua = [f.address, f.number].filter(Boolean).join(", ");
  const cidade = [f.city, f.state].filter(Boolean).join(", ");
  return [rua, f.complement, f.neighborhood, cidade].filter(Boolean).join(" - ");
}

function TituloSecao({ cor, children, acao }: { cor: string; children: ReactNode; acao?: ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <h2 className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-on-surface-variant">
        <span className={`size-2 rounded-full ${cor}`} />
        {children}
      </h2>
      {acao}
    </div>
  );
}

/** Tela "Editar Responsável" (Figura 10). */
export function ResponsavelDetalheTela({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { responsavel, setResponsavel, erro } = useResponsavel(id);

  const voltar = (
    <Link href="/responsaveis" className={buttonClasses({ variant: "secondary" })}>
      Voltar para Responsáveis
    </Link>
  );
  if (erro) return <EmptyState title="Não foi possível carregar o responsável" description={erro} action={voltar} />;
  if (responsavel === undefined) return <Skeleton className="h-[32rem]" />;
  if (responsavel === null) {
    return (
      <EmptyState
        title="Responsável não encontrado"
        description="O cadastro não foi encontrado. Confira se o link está correto."
        action={voltar}
      />
    );
  }

  // `key` reinicia o formulário quando os dados salvos mudam.
  return (
    <FormularioResponsavel
      key={JSON.stringify(paraFormulario(responsavel))}
      responsavel={responsavel}
      onSalvo={setResponsavel}
    />
  );
}

function FormularioResponsavel({
  responsavel,
  onSalvo,
}: {
  responsavel: ResponsavelDetalhe;
  onSalvo: (r: ResponsavelDetalhe) => void;
}) {
  const toast = useToast();
  const searchParams = useSearchParams();
  const [form, setForm] = useState<ResponsavelInput>(() => paraFormulario(responsavel));
  const [erros, setErros] = useState<{ name?: string; phone?: string; email?: string }>({});
  const [salvando, setSalvando] = useState(false);
  const [editandoEndereco, setEditandoEndereco] = useState(false);
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [verTodos, setVerTodos] = useState(false);
  const [confirmarStatus, setConfirmarStatus] = useState(false);
  const [alterandoStatus, setAlterandoStatus] = useState(false);
  const [vinculando, setVinculando] = useState(false);

  // Veio do "Perfil Financeiro via Responsável" de um aluno: oferece o caminho de volta.
  const alunoOrigemId = searchParams.get("voltarAluno");
  const alunoOrigem = alunoOrigemId ? responsavel.dependentes.find((d) => d.id === alunoOrigemId) : undefined;

  const original = paraFormulario(responsavel);
  const alterado = JSON.stringify(form) !== JSON.stringify(original);
  const atualizar = (campo: keyof ResponsavelInput, valor: string) => setForm((f) => ({ ...f, [campo]: valor }));
  const pendentes = responsavel.pagamentos.filter((p) => p.status === "Pendente");
  const pagamentosVisiveis = verTodos ? responsavel.pagamentos : responsavel.pagamentos.slice(0, PAGAMENTOS_VISIVEIS);
  const digitosTelefone = form.phone.replace(/\D/g, "");

  async function preencherCep() {
    if ((form.cep ?? "").replace(/\D/g, "").length !== 8) return;
    setBuscandoCep(true);
    try {
      const endereco = await consultarCep(form.cep ?? "");
      if (!endereco) {
        toast.error("CEP não encontrado.");
        return;
      }
      setForm((f) => ({
        ...f,
        address: endereco.address || f.address,
        neighborhood: endereco.neighborhood || f.neighborhood,
        city: endereco.city || f.city,
        state: endereco.state || f.state,
      }));
    } catch {
      toast.error("Não foi possível consultar o CEP agora.");
    } finally {
      setBuscandoCep(false);
    }
  }

  async function salvar(e?: FormEvent) {
    e?.preventDefault();
    const novosErros: typeof erros = {};
    if (!form.name.trim()) novosErros.name = "Informe o nome.";
    if (digitosTelefone.length < 10) novosErros.phone = "Informe um telefone com DDD.";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) novosErros.email = "E-mail inválido.";
    setErros(novosErros);
    if (Object.keys(novosErros).length > 0) return;

    setSalvando(true);
    try {
      const salvo = await responsaveisDetalheService.atualizar(responsavel.id, form);
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
      const salvo = await responsaveisDetalheService.alterarStatus(responsavel.id, !responsavel.ativo);
      toast.success(salvo.ativo ? "Responsável reativado." : "Responsável inativado.");
      onSalvo(salvo);
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : "Não foi possível alterar o status.");
    } finally {
      setAlterandoStatus(false);
      setConfirmarStatus(false);
    }
  }

  function linkEmailCobranca(): string {
    const linhas = pendentes.map((p) => `- ${p.description} (${p.alunoNome}): ${p.amount}, vencimento ${p.date}`);
    const corpo = [
      `Olá, ${responsavel.name}!`,
      "",
      pendentes.length > 0
        ? "Seguem os pagamentos em aberto no Espaço Lição de Casa:"
        : "Não há pagamentos em aberto no momento.",
      ...linhas,
      "",
      "Atenciosamente,",
      "Espaço Lição de Casa",
    ].join("\n");
    const assunto = pendentes.length > 0 ? "Pagamentos em aberto — Espaço Lição de Casa" : "Espaço Lição de Casa";
    return `mailto:${form.email}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`;
  }

  const acaoRapida =
    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition hover:bg-surface-container-low";

  return (
    <form onSubmit={salvar} className="flex flex-col gap-6">
      {/* Volta para o aluno de onde o usuário veio, ou para a listagem de responsáveis */}
      <Link
        href={alunoOrigem ? `/alunos?aluno=${encodeURIComponent(alunoOrigem.id)}` : "/responsaveis"}
        title={alunoOrigem ? `Voltar para os detalhes de ${alunoOrigem.name}` : undefined}
        className="flex w-fit items-center gap-2 rounded-full bg-secondary-fixed px-4 py-2 text-sm font-bold text-on-secondary-fixed transition hover:bg-secondary-fixed/70"
      >
        <span className="material-symbols-outlined text-lg">arrow_back</span>
        {alunoOrigem ? "Voltar para Aluno" : "Voltar para Responsáveis"}
      </Link>

      {/* Cabeçalho: trilha, título e ações */}
      <div className="flex flex-col gap-3">
        <nav aria-label="Trilha" className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-on-surface-variant/70">
          {alunoOrigem ? (
            <>
              <Link href="/alunos" className="hover:text-primary hover:underline">Alunos</Link>
              <span>›</span>
              <Link href={`/alunos?aluno=${encodeURIComponent(alunoOrigem.id)}`} className="hover:text-primary hover:underline">
                {alunoOrigem.name}
              </Link>
            </>
          ) : (
            <Link href="/responsaveis" className="hover:text-primary hover:underline">Responsáveis</Link>
          )}
          <span>›</span>
          <span className="font-bold text-primary">Editar: {responsavel.name}</span>
        </nav>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black tracking-tight text-on-surface sm:text-3xl">Editar Responsável</h1>
            {!responsavel.ativo && (
              <span className="rounded-full bg-surface-container-high px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide text-on-surface-variant">
                Inativo
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!alterado || salvando}
              onClick={() => {
                setForm(original);
                setErros({});
              }}
              className="rounded-full px-5 py-3 text-sm font-bold text-on-surface transition hover:bg-surface-container-high disabled:cursor-not-allowed disabled:opacity-40"
            >
              Descartar
            </button>
            <button
              type="submit"
              disabled={!alterado || salvando}
              className="rounded-full bg-linear-to-br from-primary to-primary-container px-6 py-3 text-sm font-bold text-white shadow-cta transition hover:shadow-cta-hover active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
            >
              {salvando ? "Salvando..." : "Salvar Alterações"}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        {/* Coluna esquerda */}
        <div className="flex flex-col gap-6 xl:col-span-7">
          <section>
            <TituloSecao cor="bg-primary-container">Informações Básicas</TituloSecao>
            <div className="grid grid-cols-1 gap-4 rounded-3xl bg-surface-container-lowest p-6 shadow-ambient sm:grid-cols-2">
              <div>
                <label htmlFor="resp-nome" className={rotuloClasses}>Nome completo</label>
                <input id="resp-nome" value={form.name} onChange={(e) => atualizar("name", e.target.value)} aria-invalid={!!erros.name} className={`${campoClasses} ${erros.name ? "ring-2 ring-error/60" : ""}`} />
                {erros.name && <p role="alert" className="mt-1 text-xs font-medium text-error">{erros.name}</p>}
              </div>
              <div>
                <label htmlFor="resp-cpf" className={rotuloClasses}>CPF</label>
                <input id="resp-cpf" value={form.cpf} placeholder="000.000.000-00" onChange={(e) => atualizar("cpf", mascararCpf(e.target.value))} className={campoClasses} />
              </div>
              <div>
                <label htmlFor="resp-email" className={rotuloClasses}>E-mail de contato</label>
                <input id="resp-email" type="email" value={form.email} placeholder="nome@email.com" onChange={(e) => atualizar("email", mascararEmail(e.target.value))} aria-invalid={!!erros.email} className={`${campoClasses} ${erros.email ? "ring-2 ring-error/60" : ""}`} />
                {erros.email && <p role="alert" className="mt-1 text-xs font-medium text-error">{erros.email}</p>}
              </div>
              <div>
                <label htmlFor="resp-tel" className={rotuloClasses}>Telefone / WhatsApp</label>
                <input id="resp-tel" value={form.phone} placeholder="(15) 99999-9999" onChange={(e) => atualizar("phone", mascararTelefone(e.target.value))} aria-invalid={!!erros.phone} className={`${campoClasses} ${erros.phone ? "ring-2 ring-error/60" : ""}`} />
                {erros.phone && <p role="alert" className="mt-1 text-xs font-medium text-error">{erros.phone}</p>}
              </div>
              <div>
                <label htmlFor="resp-rg" className={rotuloClasses}>RG</label>
                <input id="resp-rg" value={form.rg} placeholder="00.000.000-0" onChange={(e) => atualizar("rg", mascararRg(e.target.value))} className={campoClasses} />
              </div>
              <div>
                <label htmlFor="resp-role" className={rotuloClasses}>Vínculo com o aluno</label>
                <select id="resp-role" value={form.role} onChange={(e) => atualizar("role", e.target.value)} className={`${campoClasses} appearance-none`}>
                  {[...new Set([form.role, ...PARENTESCOS])].map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <span className={rotuloClasses}>Endereço residencial</span>
                <button
                  type="button"
                  onClick={() => setEditandoEndereco((v) => !v)}
                  aria-expanded={editandoEndereco}
                  className={`${campoClasses} flex items-center justify-between gap-3 text-left`}
                >
                  <span className={enderecoCompleto(form) ? "" : "text-on-surface-variant/50"}>
                    {enderecoCompleto(form) || "Adicionar endereço"}
                  </span>
                  <span className="material-symbols-outlined text-lg text-on-surface-variant">
                    {editandoEndereco ? "expand_less" : "edit"}
                  </span>
                </button>
                {editandoEndereco && (
                  <div className="mt-3 grid grid-cols-1 gap-3 rounded-2xl bg-surface p-4 sm:grid-cols-6">
                    <div className="sm:col-span-2">
                      <label htmlFor="resp-cep" className={rotuloClasses}>CEP {buscandoCep && "· buscando..."}</label>
                      <input id="resp-cep" value={form.cep} placeholder="00000-000" onChange={(e) => atualizar("cep", mascararCep(e.target.value))} onBlur={preencherCep} className={campoClasses} />
                    </div>
                    <div className="sm:col-span-4">
                      <label htmlFor="resp-rua" className={rotuloClasses}>Logradouro</label>
                      <input id="resp-rua" value={form.address} placeholder="Rua, Avenida, etc." onChange={(e) => atualizar("address", e.target.value)} className={campoClasses} />
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="resp-num" className={rotuloClasses}>Número</label>
                      <input id="resp-num" value={form.number} placeholder="S/N" onChange={(e) => atualizar("number", e.target.value)} className={campoClasses} />
                    </div>
                    <div className="sm:col-span-4">
                      <label htmlFor="resp-comp" className={rotuloClasses}>Complemento</label>
                      <input id="resp-comp" value={form.complement} placeholder="Apto, Bloco, etc." onChange={(e) => atualizar("complement", e.target.value)} className={campoClasses} />
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="resp-bairro" className={rotuloClasses}>Bairro</label>
                      <input id="resp-bairro" value={form.neighborhood} onChange={(e) => atualizar("neighborhood", e.target.value)} className={campoClasses} />
                    </div>
                    <div className="sm:col-span-3">
                      <label htmlFor="resp-cidade" className={rotuloClasses}>Cidade</label>
                      <input id="resp-cidade" value={form.city} onChange={(e) => atualizar("city", e.target.value)} className={campoClasses} />
                    </div>
                    <div className="sm:col-span-1">
                      <label htmlFor="resp-uf" className={rotuloClasses}>UF</label>
                      <select id="resp-uf" value={form.state} onChange={(e) => atualizar("state", e.target.value)} className={`${campoClasses} appearance-none px-3`}>
                        <option value="">—</option>
                        {UFS.map((uf) => (
                          <option key={uf} value={uf}>{uf}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          <section>
            <TituloSecao
              cor="bg-secondary"
              acao={
                <button type="button" onClick={() => setVinculando(true)} className="flex items-center gap-1 text-xs font-bold text-secondary hover:underline">
                  <span className="material-symbols-outlined text-base">add_circle</span>
                  Vincular novo aluno
                </button>
              }
            >
              Alunos Vinculados
            </TituloSecao>
            <div className="rounded-3xl bg-surface-container-lowest p-6 shadow-ambient">
              {responsavel.dependentes.length === 0 ? (
                <p className="text-sm text-on-surface-variant/70">Nenhum aluno vinculado a este responsável.</p>
              ) : (
                <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {responsavel.dependentes.map((d) => (
                    <li key={d.id}>
                      <Link
                        href={`/alunos?aluno=${encodeURIComponent(d.id)}`}
                        title={`Ver detalhes de ${d.name}`}
                        className={`flex items-center gap-3 rounded-2xl p-3 transition hover:bg-primary-fixed/30 ${
                          d.id === alunoOrigemId ? "bg-secondary-fixed/50" : "bg-surface-container-low"
                        }`}
                      >
                        <span className={`grid size-11 shrink-0 place-items-center overflow-hidden rounded-full text-sm font-bold ${d.avatarBg} ${d.avatarText}`}>
                          {d.photo ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={d.photo} alt="" className="size-full object-cover" />
                          ) : (
                            d.initials
                          )}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-bold text-on-surface">{d.name}</span>
                          <span className="block truncate text-xs text-on-surface-variant">
                            {d.schoolGrade || d.plan}
                            {d.status === "Inativo" ? " • Inativo" : ""}
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </div>

        {/* Coluna direita */}
        <div className="flex flex-col gap-6 xl:col-span-5">
          <section>
            <TituloSecao cor="bg-tertiary-container">Histórico Financeiro</TituloSecao>
            <div className="flex flex-col gap-3 rounded-3xl bg-surface-container-lowest p-5 shadow-ambient">
              {responsavel.pagamentos.length === 0 ? (
                <p className="text-sm text-on-surface-variant/70">Nenhum pagamento registrado.</p>
              ) : (
                pagamentosVisiveis.map((p) => <ItemPagamento key={p.id} pagamento={p} />)
              )}
              {responsavel.pagamentos.length > PAGAMENTOS_VISIVEIS && (
                <button
                  type="button"
                  onClick={() => setVerTodos((v) => !v)}
                  className="mt-1 flex items-center justify-center gap-2 rounded-full bg-surface-container-low px-4 py-2.5 text-sm font-bold text-on-surface transition hover:bg-surface-container-high"
                >
                  <span className="material-symbols-outlined text-lg">receipt_long</span>
                  {verTodos ? "Ver menos" : `Ver Fatura Completa (${responsavel.pagamentos.length})`}
                </button>
              )}
            </div>
          </section>

          <section>
            <TituloSecao cor="bg-on-surface-variant">Ações Rápidas</TituloSecao>
            <div className="flex flex-col gap-1 rounded-3xl bg-surface-container-lowest p-3 shadow-ambient">
              {form.email ? (
                <a href={linkEmailCobranca()} className={`${acaoRapida} text-secondary`}>
                  <span className="material-symbols-outlined text-xl">mail</span>
                  {pendentes.length > 0 ? "Enviar cobrança por e-mail" : "Enviar e-mail"}
                </a>
              ) : (
                <span className={`${acaoRapida} cursor-not-allowed text-on-surface-variant/50 hover:bg-transparent`} title="Cadastre um e-mail para usar esta ação">
                  <span className="material-symbols-outlined text-xl">mail</span>
                  Enviar e-mail (sem e-mail cadastrado)
                </span>
              )}
              {digitosTelefone.length >= 10 ? (
                <a href={`https://wa.me/55${digitosTelefone}`} target="_blank" rel="noopener noreferrer" className={`${acaoRapida} text-secondary`}>
                  <span className="material-symbols-outlined text-xl">chat</span>
                  Enviar mensagem WhatsApp
                </a>
              ) : (
                <span className={`${acaoRapida} cursor-not-allowed text-on-surface-variant/50 hover:bg-transparent`}>
                  <span className="material-symbols-outlined text-xl">chat</span>
                  Enviar mensagem WhatsApp (sem telefone)
                </span>
              )}
              <button
                type="button"
                onClick={() => setConfirmarStatus(true)}
                className={`${acaoRapida} ${responsavel.ativo ? "text-error" : "text-tertiary"}`}
              >
                <span className="material-symbols-outlined text-xl">{responsavel.ativo ? "person_off" : "person_check"}</span>
                {responsavel.ativo ? "Inativar Responsável" : "Reativar Responsável"}
              </button>
            </div>
          </section>

          <div className="flex items-center gap-3 rounded-3xl bg-surface-container-low p-4">
            <AvatarResponsavel nome={responsavel.name} foto={responsavel.photo} tamanho="size-12 text-base" />
            <p className="text-xs leading-relaxed text-on-surface-variant">
              <b className="text-on-surface">{responsavel.role}</b> de {responsavel.dependentes.length}{" "}
              {responsavel.dependentes.length === 1 ? "aluno" : "alunos"}
              {pendentes.length > 0 ? (
                <> • <b className="text-error">{pendentes.length} {pendentes.length === 1 ? "pagamento pendente" : "pagamentos pendentes"}</b></>
              ) : (
                <> • pagamentos em dia</>
              )}
            </p>
          </div>
        </div>
      </div>

      {vinculando && (
        <VincularAlunoDialog responsavel={responsavel} onClose={() => setVinculando(false)} onVinculado={onSalvo} />
      )}

      <ConfirmDialog
        open={confirmarStatus}
        title={responsavel.ativo ? "Inativar responsável?" : "Reativar responsável?"}
        description={
          responsavel.ativo ? (
            <>
              <b>{responsavel.name}</b> ficará marcado como inativo. Os alunos vinculados e o histórico financeiro
              continuam guardados, e você pode reativar depois.
            </>
          ) : (
            <>
              <b>{responsavel.name}</b> voltará a aparecer como ativo.
            </>
          )
        }
        confirmLabel={responsavel.ativo ? "Inativar" : "Reativar"}
        tone={responsavel.ativo ? "danger" : "primary"}
        loading={alterandoStatus}
        onConfirm={alternarStatus}
        onClose={() => setConfirmarStatus(false)}
      />
    </form>
  );
}

function ItemPagamento({ pagamento: p }: { pagamento: PagamentoResponsavel }) {
  const pendente = p.status === "Pendente";
  return (
    <div className={`flex items-start justify-between gap-3 rounded-2xl p-4 ${pendente ? "bg-primary-fixed/40" : "bg-surface"}`}>
      <div className="min-w-0">
        <p className="truncate text-[11px] font-black uppercase tracking-wide text-on-surface-variant">{p.description}</p>
        <p className="mt-0.5 text-lg font-extrabold text-on-surface">{p.amount}</p>
        <p className="truncate text-xs text-on-surface-variant/80">{p.alunoNome}</p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1.5">
        <span
          className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide ${
            pendente ? "bg-primary-container text-white" : "bg-tertiary-fixed/40 text-on-tertiary-fixed-variant"
          }`}
        >
          {p.status}
        </span>
        <span className="text-[11px] text-on-surface-variant/80">
          {pendente ? "Vencimento" : "Pagamento"} {diaMes(p.date)}
        </span>
      </div>
    </div>
  );
}
