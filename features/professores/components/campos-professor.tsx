"use client";

import { useRef, useState, type ChangeEvent, type InputHTMLAttributes, type ReactNode } from "react";
import { useToast } from "@/components/ui/toast";
import { UFS } from "@/features/alunos/constants";
import { processarImagem } from "@/lib/image";
import { mascararCep } from "@/lib/masks";
import { consultarCep } from "@/lib/viacep";
import type { CurriculoArquivo, CurriculoInfo, DisciplinaOpcao } from "../types";
import {
  iniciaisDe,
  lerCurriculo,
  rotuloTipoArquivo,
  tamanhoArquivo,
  type CampoTexto,
  type FormProfessor,
} from "../utils";

export const campoClasses =
  "w-full rounded-xl bg-surface-container-low px-4 py-3 text-sm font-medium text-on-surface outline-none transition placeholder:text-on-surface-variant/40 focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/40";
export const rotuloClasses = "mb-1.5 block text-xs font-bold text-on-surface-variant";

/** Card de seção com a barrinha colorida antes do título (como no protótipo). */
export function SecaoCard({
  titulo,
  cor,
  children,
  className = "",
}: {
  titulo: string;
  cor: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-3xl bg-surface-container-lowest p-6 shadow-ambient sm:p-8 ${className}`}>
      <h2 className="mb-6 flex items-center gap-3 text-lg font-extrabold text-on-surface">
        <span className={`h-6 w-1.5 rounded-full ${cor}`} aria-hidden />
        {titulo}
      </h2>
      {children}
    </section>
  );
}

export function Campo({
  id,
  rotulo,
  erro,
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { id: string; rotulo: string; erro?: string }) {
  return (
    <div className={className}>
      <label htmlFor={id} className={rotuloClasses}>
        {rotulo}
      </label>
      <input
        id={id}
        aria-invalid={!!erro}
        className={`${campoClasses} ${erro ? "ring-2 ring-error/60" : ""}`}
        {...props}
      />
      {erro && (
        <p role="alert" className="mt-1 text-xs font-medium text-error">
          {erro}
        </p>
      )}
    </div>
  );
}

/** Foto redonda: mostra a imagem, as iniciais ou o convite "Upload foto". */
export function FotoProfessor({
  foto,
  nome,
  onChange,
  tamanho = "size-36",
  variante = "upload",
}: {
  foto: string;
  nome: string;
  onChange: (dataUrl: string) => void;
  tamanho?: string;
  /** "upload" = círculo tracejado do cadastro; "perfil" = foto com botão de câmera da edição. */
  variante?: "upload" | "perfil";
}) {
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  async function escolher(e: ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    e.target.value = "";
    if (!arquivo) return;
    try {
      onChange(await processarImagem(arquivo));
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : "Não foi possível usar esta imagem.");
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        title={foto ? "Trocar foto" : "Escolher foto"}
        className={`relative grid shrink-0 place-items-center rounded-full transition ${tamanho} ${
          variante === "upload" && !foto
            ? "bg-surface-container-low text-on-surface-variant outline-2 outline-dashed outline-outline-variant hover:bg-surface-container"
            : "bg-primary-fixed text-on-primary-fixed-variant"
        }`}
      >
        {foto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={foto} alt={`Foto de ${nome || "professor"}`} className="size-full rounded-full object-cover" />
        ) : variante === "upload" ? (
          <span className="flex flex-col items-center gap-1">
            <span className="material-symbols-outlined text-3xl">add_a_photo</span>
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Upload foto</span>
          </span>
        ) : (
          <span className="text-3xl font-extrabold">{nome ? iniciaisDe(nome) : "?"}</span>
        )}
        {variante === "perfil" && (
          <span className="absolute bottom-1 right-1 grid size-9 place-items-center rounded-full bg-primary-container text-white shadow-cta">
            <span className="material-symbols-outlined text-lg">photo_camera</span>
          </span>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={escolher}
        className="hidden"
        aria-label="Foto do professor"
      />
      {variante === "upload" && (
        <p className="text-center text-[11px] leading-tight text-on-surface-variant/70">
          Formato JPG ou PNG.
          <br />
          Máx. 5 MB
        </p>
      )}
      {foto && (
        <button type="button" onClick={() => onChange("")} className="text-xs font-bold text-on-surface-variant/70 hover:underline">
          Remover foto
        </button>
      )}
    </div>
  );
}

/**
 * Seleção de disciplinas.
 * - "chips": todas as disciplinas como chips que ligam/desligam (cadastro).
 * - "lista": só as vinculadas, com "x" para remover e "+ Adicionar Disciplina" (edição).
 */
export function SeletorDisciplinas({
  opcoes,
  selecionadas,
  onChange,
  carregando,
  erro,
  modo = "chips",
}: {
  opcoes: DisciplinaOpcao[];
  selecionadas: number[];
  onChange: (ids: number[]) => void;
  carregando?: boolean;
  erro?: string | null;
  modo?: "chips" | "lista";
}) {
  const [adicionando, setAdicionando] = useState(false);

  if (erro) return <p className="text-sm font-semibold text-error">{erro}</p>;
  if (carregando) return <p className="text-sm text-on-surface-variant/70">Carregando disciplinas...</p>;

  const alternar = (id: number) =>
    onChange(selecionadas.includes(id) ? selecionadas.filter((x) => x !== id) : [...selecionadas, id]);

  if (modo === "chips") {
    // Disciplinas inativas só aparecem se já estiverem vinculadas.
    const visiveis = opcoes.filter((d) => d.ativa || selecionadas.includes(d.id));
    if (visiveis.length === 0) {
      return <p className="text-sm text-on-surface-variant/70">Nenhuma disciplina cadastrada ainda.</p>;
    }
    return (
      <div className="flex flex-wrap gap-2" role="group" aria-label="Disciplinas">
        {visiveis.map((d) => {
          const ativa = selecionadas.includes(d.id);
          return (
            <button
              key={d.id}
              type="button"
              aria-pressed={ativa}
              onClick={() => alternar(d.id)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition active:scale-95 ${
                ativa
                  ? "bg-secondary text-on-secondary shadow-sm"
                  : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              {d.nome}
            </button>
          );
        })}
      </div>
    );
  }

  const porId = new Map(opcoes.map((d) => [d.id, d]));
  const disponiveis = opcoes.filter((d) => d.ativa && !selecionadas.includes(d.id));
  return (
    <div className="flex min-h-12 flex-wrap items-center gap-2 rounded-xl bg-surface-container-low p-2">
      {selecionadas.map((id) => (
        <span
          key={id}
          className="flex items-center gap-1 rounded-full bg-surface-container-lowest py-1 pl-3 pr-1.5 text-xs font-semibold text-on-surface shadow-sm"
        >
          {porId.get(id)?.nome ?? `Disciplina ${id}`}
          <button
            type="button"
            onClick={() => alternar(id)}
            aria-label={`Remover ${porId.get(id)?.nome ?? "disciplina"}`}
            className="grid size-5 place-items-center rounded-full text-on-surface-variant hover:bg-error-container hover:text-error"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </span>
      ))}
      {adicionando ? (
        <select
          autoFocus
          defaultValue=""
          aria-label="Escolher disciplina"
          onBlur={() => setAdicionando(false)}
          onChange={(e) => {
            if (e.target.value) onChange([...selecionadas, Number(e.target.value)]);
            setAdicionando(false);
          }}
          className="rounded-full bg-surface-container-lowest px-3 py-1 text-xs font-semibold text-on-surface outline-none ring-2 ring-primary/30"
        >
          <option value="" disabled>
            Escolha...
          </option>
          {disponiveis.map((d) => (
            <option key={d.id} value={d.id}>
              {d.nome}
            </option>
          ))}
        </select>
      ) : (
        disponiveis.length > 0 && (
          <button
            type="button"
            onClick={() => setAdicionando(true)}
            className="rounded-full px-3 py-1 text-xs font-bold text-secondary hover:bg-secondary-fixed/50"
          >
            + Adicionar Disciplina
          </button>
        )
      )}
      {selecionadas.length === 0 && disponiveis.length === 0 && (
        <span className="px-2 text-xs text-on-surface-variant/70">Nenhuma disciplina disponível.</span>
      )}
    </div>
  );
}

/** Abre o arquivo ainda não salvo numa nova aba (data URL vira Blob URL). */
function abrirArquivoLocal(curriculo: CurriculoArquivo) {
  const base64 = curriculo.dados.slice(curriculo.dados.indexOf(",") + 1);
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  const url = URL.createObjectURL(new Blob([bytes], { type: curriculo.tipo }));
  window.open(url, "_blank", "noopener");
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

/** Currículo (PDF/DOC): área para anexar ou o arquivo atual com visualizar/trocar/remover. */
export function CampoCurriculo({
  curriculo,
  onChange,
  urlSalvo,
}: {
  curriculo: CurriculoInfo | CurriculoArquivo | null;
  onChange: (c: CurriculoArquivo | null) => void;
  /** URL do arquivo já salvo no servidor (edição). */
  urlSalvo?: string;
}) {
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  async function escolher(e: ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    e.target.value = "";
    if (!arquivo) return;
    try {
      onChange(await lerCurriculo(arquivo));
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : "Não foi possível anexar o arquivo.");
    }
  }

  const input = (
    <input
      ref={inputRef}
      type="file"
      accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      onChange={escolher}
      className="hidden"
      aria-label="Currículo do professor"
    />
  );

  if (!curriculo) {
    return (
      <>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-full min-h-32 w-full flex-col items-center justify-center gap-1 rounded-xl bg-surface-container-low p-4 text-on-surface-variant outline-2 -outline-offset-2 outline-dashed outline-outline-variant transition hover:bg-surface-container"
        >
          <span className="material-symbols-outlined text-2xl text-primary">upload_file</span>
          <span className="text-sm font-bold text-on-surface">Anexar arquivo</span>
          <span className="text-[10px] font-semibold uppercase tracking-wider">Arraste ou clique aqui</span>
        </button>
        <p className="mt-1.5 text-center text-[11px] text-on-surface-variant/70">Formatos aceitos: PDF, DOC, DOCX. Máx. 5 MB</p>
        {input}
      </>
    );
  }

  const novo = "dados" in curriculo;
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl bg-surface-container-low p-4">
      <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-error-container/60 text-error">
        <span className="material-symbols-outlined">{curriculo.tipo === "application/pdf" ? "picture_as_pdf" : "description"}</span>
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-bold text-on-surface">{curriculo.nome}</span>
        <span className="block text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant/80">
          {rotuloTipoArquivo(curriculo.tipo)}
          {novo ? ` • ${tamanhoArquivo(curriculo)} • não salvo` : ""}
        </span>
      </span>
      <span className="flex flex-wrap items-center gap-1">
        {novo ? (
          <button
            type="button"
            onClick={() => abrirArquivoLocal(curriculo)}
            className="flex items-center gap-1.5 rounded-full bg-surface-container-lowest px-3 py-1.5 text-xs font-bold text-on-surface shadow-sm hover:bg-surface-container-high"
          >
            <span className="material-symbols-outlined text-base">visibility</span>
            Visualizar Documento
          </button>
        ) : (
          urlSalvo && (
            <a
              href={urlSalvo}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-full bg-surface-container-lowest px-3 py-1.5 text-xs font-bold text-on-surface shadow-sm hover:bg-surface-container-high"
            >
              <span className="material-symbols-outlined text-base">visibility</span>
              Visualizar Documento
            </a>
          )
        )}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          title="Trocar arquivo"
          className="rounded-full p-1.5 text-on-surface-variant hover:bg-surface-container-high"
        >
          <span className="material-symbols-outlined text-lg">swap_horiz</span>
        </button>
        <button
          type="button"
          onClick={() => onChange(null)}
          title="Remover currículo"
          className="rounded-full p-1.5 text-error hover:bg-error-container/60"
        >
          <span className="material-symbols-outlined text-lg">delete_outline</span>
        </button>
      </span>
      {input}
    </div>
  );
}

/** Campos de endereço com preenchimento automático pelo CEP (ViaCEP). */
export function CamposEndereco({
  form,
  atualizar,
  setForm,
  prefixo,
}: {
  form: FormProfessor;
  atualizar: (campo: CampoTexto, valor: string) => void;
  setForm: (f: (anterior: FormProfessor) => FormProfessor) => void;
  prefixo: string;
}) {
  const toast = useToast();
  const [buscando, setBuscando] = useState(false);
  const ultimoCep = useRef("");
  const numeroRef = useRef<HTMLInputElement>(null);

  async function buscarCep(cep: string, forcar = false) {
    const digitos = cep.replace(/\D/g, "");
    if (digitos.length !== 8 || (!forcar && ultimoCep.current === digitos)) return;
    ultimoCep.current = digitos;
    setBuscando(true);
    try {
      const endereco = await consultarCep(digitos);
      if (!endereco) {
        toast.error("CEP não encontrado.");
        return;
      }
      setForm((f) => ({
        ...f,
        logradouro: endereco.address || f.logradouro,
        bairro: endereco.neighborhood || f.bairro,
        cidade: endereco.city || f.cidade,
        uf: endereco.state || f.uf,
      }));
      setTimeout(() => numeroRef.current?.focus(), 50);
    } catch {
      toast.error("Não foi possível consultar o CEP agora. Preencha os campos manualmente.");
    } finally {
      setBuscando(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
      <div className="sm:col-span-3">
        <label htmlFor={`${prefixo}-cep`} className={rotuloClasses}>
          CEP {buscando && <span className="font-medium text-on-surface-variant/70">· buscando...</span>}
        </label>
        <div className="relative">
          <input
            id={`${prefixo}-cep`}
            value={form.cep}
            placeholder="00000-000"
            inputMode="numeric"
            onChange={(e) => {
              const cep = mascararCep(e.target.value);
              atualizar("cep", cep);
              if (cep.replace(/\D/g, "").length === 8) buscarCep(cep);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                buscarCep(form.cep, true);
              }
            }}
            className={`${campoClasses} pr-10`}
          />
          <button
            type="button"
            onClick={() => buscarCep(form.cep, true)}
            aria-label="Buscar endereço pelo CEP"
            className="absolute inset-y-0 right-2 my-auto grid size-8 place-items-center rounded-full text-secondary hover:bg-secondary-fixed/50"
          >
            <span className="material-symbols-outlined text-lg">search</span>
          </button>
        </div>
      </div>
      <Campo
        id={`${prefixo}-logradouro`}
        rotulo="Logradouro"
        value={form.logradouro}
        placeholder="Rua, Avenida, etc."
        onChange={(e) => atualizar("logradouro", e.target.value)}
        className="sm:col-span-7"
      />
      <div className="sm:col-span-2">
        <label htmlFor={`${prefixo}-numero`} className={rotuloClasses}>
          Número
        </label>
        <input
          ref={numeroRef}
          id={`${prefixo}-numero`}
          value={form.numero}
          placeholder="Nº"
          onChange={(e) => atualizar("numero", e.target.value)}
          className={campoClasses}
        />
      </div>
      <Campo
        id={`${prefixo}-complemento`}
        rotulo="Complemento"
        value={form.complemento}
        placeholder="Apto, Bloco, etc."
        onChange={(e) => atualizar("complemento", e.target.value)}
        className="sm:col-span-4"
      />
      <Campo
        id={`${prefixo}-bairro`}
        rotulo="Bairro"
        value={form.bairro}
        placeholder="Bairro"
        onChange={(e) => atualizar("bairro", e.target.value)}
        className="sm:col-span-3"
      />
      <Campo
        id={`${prefixo}-cidade`}
        rotulo="Cidade"
        value={form.cidade}
        placeholder="Cidade"
        onChange={(e) => atualizar("cidade", e.target.value)}
        className="sm:col-span-3"
      />
      <div className="sm:col-span-2">
        <label htmlFor={`${prefixo}-uf`} className={rotuloClasses}>
          UF
        </label>
        <select
          id={`${prefixo}-uf`}
          value={form.uf}
          onChange={(e) => atualizar("uf", e.target.value)}
          className={`${campoClasses} appearance-none px-3`}
        >
          <option value="">UF</option>
          {UFS.map((uf) => (
            <option key={uf} value={uf}>
              {uf}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
