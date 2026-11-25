"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Skeleton } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";
import { alunosService } from "@/features/alunos/services";
import type { Aluno } from "@/features/alunos/types";
import { responsaveisDetalheService } from "../services";
import type { ResponsavelDetalhe } from "../types";

/**
 * Lista os alunos cadastrados para vincular a este responsável,
 * com atalho para cadastrar um aluno novo já ligado a ele.
 */
export function VincularAlunoDialog({
  responsavel,
  onClose,
  onVinculado,
}: {
  responsavel: ResponsavelDetalhe;
  onClose: () => void;
  onVinculado: (r: ResponsavelDetalhe) => void;
}) {
  const toast = useToast();
  const [alunos, setAlunos] = useState<Aluno[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [selecionadoId, setSelecionadoId] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    let cancelado = false;
    alunosService
      .listar()
      .then((lista) => {
        if (!cancelado) setAlunos(lista);
      })
      .catch(() => {
        if (!cancelado) setErro("Não foi possível carregar os alunos.");
      });
    return () => {
      cancelado = true;
    };
  }, []);

  // Fecha com Esc.
  useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !salvando) onClose();
    };
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [onClose, salvando]);

  const jaVinculados = useMemo(() => new Set(responsavel.dependentes.map((d) => d.id)), [responsavel]);
  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return (alunos ?? [])
      .filter((a) => !termo || a.name.toLowerCase().includes(termo) || a.id.includes(termo) || a.guardian.toLowerCase().includes(termo))
      .sort((a, b) => Number(jaVinculados.has(a.id)) - Number(jaVinculados.has(b.id)) || a.name.localeCompare(b.name, "pt-BR"));
  }, [alunos, busca, jaVinculados]);

  const selecionado = alunos?.find((a) => a.id === selecionadoId);
  const trocaResponsavel = selecionado && selecionado.responsavelId && selecionado.responsavelId !== responsavel.id;

  async function vincular() {
    if (!selecionado) return;
    setSalvando(true);
    try {
      const atualizado = await responsaveisDetalheService.vincularAluno(responsavel.id, selecionado.id);
      toast.success(`${selecionado.name} vinculado a ${responsavel.name}.`);
      onVinculado(atualizado);
      onClose();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não foi possível vincular o aluno.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex animate-fade-in items-center justify-center bg-on-surface/40 p-3 backdrop-blur-sm sm:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget && !salvando) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="vincular-titulo"
        className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-[2rem] bg-surface-container-lowest shadow-ambient"
      >
        <div className="flex items-start justify-between gap-4 p-6 pb-4 sm:p-7 sm:pb-4">
          <div>
            <h2 id="vincular-titulo" className="text-xl font-black text-on-surface">Vincular aluno</h2>
            <p className="mt-1 text-sm text-on-surface-variant">
              Escolha um aluno cadastrado para ficar sob a responsabilidade de <b>{responsavel.name}</b>.
            </p>
          </div>
          <button type="button" onClick={onClose} title="Fechar" className="rounded-full p-2 text-on-surface-variant hover:bg-surface-container-low">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="flex flex-col gap-3 px-6 sm:px-7">
          <Link
            href={`/alunos/novo?responsavel=${encodeURIComponent(responsavel.id)}`}
            className="flex items-center gap-3 rounded-2xl bg-primary-fixed/40 p-3 text-sm font-bold text-on-primary-fixed-variant transition hover:bg-primary-fixed/70"
          >
            <span className="grid size-10 place-items-center rounded-full bg-primary-container text-white">
              <span className="material-symbols-outlined">person_add</span>
            </span>
            <span>
              Cadastrar novo aluno
              <span className="block text-xs font-medium text-on-surface-variant">
                Abre o cadastro com {responsavel.name} já selecionado como responsável
              </span>
            </span>
          </Link>
          <div className="group relative">
            <span className="material-symbols-outlined pointer-events-none absolute inset-y-0 left-3.5 my-auto h-fit text-xl text-on-surface-variant/50 group-focus-within:text-primary">
              search
            </span>
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar aluno por nome ou matrícula..."
              aria-label="Buscar aluno"
              autoFocus
              className="w-full rounded-2xl bg-surface-container-low py-3 pl-11 pr-4 text-sm font-medium text-on-surface outline-none placeholder:text-on-surface-variant/50 focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        <ul className="mt-3 flex-1 overflow-y-auto px-6 sm:px-7" aria-label="Alunos cadastrados">
          {erro ? (
            <li className="py-6 text-center text-sm font-semibold text-error">{erro}</li>
          ) : alunos === null ? (
            <li className="flex flex-col gap-2 py-2">
              <Skeleton className="h-14" />
              <Skeleton className="h-14" />
              <Skeleton className="h-14" />
            </li>
          ) : filtrados.length === 0 ? (
            <li className="py-6 text-center text-sm text-on-surface-variant">Nenhum aluno encontrado.</li>
          ) : (
            filtrados.map((a) => {
              const vinculado = jaVinculados.has(a.id);
              const ativo = selecionadoId === a.id;
              return (
                <li key={a.id} className="py-1">
                  <button
                    type="button"
                    disabled={vinculado}
                    onClick={() => setSelecionadoId(a.id)}
                    aria-pressed={ativo}
                    className={`flex w-full items-center gap-3 rounded-2xl p-3 text-left transition ${
                      ativo ? "bg-secondary-fixed/60 ring-2 ring-secondary" : "hover:bg-surface-container-low"
                    } disabled:cursor-not-allowed disabled:opacity-50`}
                  >
                    <span className={`grid size-10 shrink-0 place-items-center overflow-hidden rounded-full text-xs font-bold ${a.avatarBg} ${a.avatarText}`}>
                      {a.photo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={a.photo} alt="" className="size-full object-cover" />
                      ) : (
                        a.initials
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold text-on-surface">{a.name}</span>
                      <span className="block truncate text-xs text-on-surface-variant">
                        {vinculado ? "Já vinculado a este responsável" : `Responsável atual: ${a.guardian || "nenhum"}`}
                      </span>
                    </span>
                    {ativo && <span className="material-symbols-outlined text-secondary">check_circle</span>}
                  </button>
                </li>
              );
            })
          )}
        </ul>

        <div className="flex flex-col gap-3 p-6 sm:p-7">
          {trocaResponsavel && (
            <p className="flex items-start gap-2 rounded-2xl bg-primary-fixed/40 p-3 text-xs text-on-surface-variant">
              <span className="material-symbols-outlined text-base text-primary">info</span>
              <span>
                <b>{selecionado.name}</b> hoje está com <b>{selecionado.guardian}</b>. Ao vincular, {responsavel.name}{" "}
                passa a ser o responsável financeiro.
              </span>
            </p>
          )}
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} disabled={salvando} className="rounded-full px-6 py-3 text-sm font-bold text-on-surface-variant transition hover:bg-surface-container-low">
              Cancelar
            </button>
            <button
              type="button"
              onClick={vincular}
              disabled={!selecionado || salvando}
              className="rounded-full bg-linear-to-br from-primary to-primary-container px-7 py-3 text-sm font-bold text-white shadow-cta transition hover:shadow-cta-hover active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
            >
              {salvando ? "Vinculando..." : "Vincular aluno"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
