"use client";

import { useState, type FormEvent } from "react";
import { useToast } from "@/components/ui/toast";
import { alunosService } from "../services";
import { foiAlterado, useFecharModal } from "../use-fechar-modal";
import type { Aluno } from "../types";
import { ehTitular, tipoBadgeDoPlano, tornarTitular } from "../utils";
import { ResponsavelSelect } from "./responsavel-select";

interface Props {
  aluno: Aluno;
  onClose: () => void;
  onSaved: () => void;
}

/** Modal "Editar Aluno" (ação rápida da tabela). */
export function AlunoEditarDialog({ aluno, onClose, onSaved }: Props) {
  const toast = useToast();
  const [editingStudent, setEditingStudent] = useState<Aluno>({ ...aluno });
  const { pedirFechamento, onBackdropClick, dialogoDescarte } = useFecharModal({
    sujo: foiAlterado({ ...aluno }, editingStudent),
    onClose,
  });
  // Titular é decidido pelo vínculo, não pelo texto: guarda se o aluno começou como titular.
  const [eraTitular, setEraTitular] = useState(!aluno.responsavelId && ehTitular(aluno));

  const handleUpdateStudent = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingStudent.responsavelId && !eraTitular) {
      toast.error("Selecione um responsável cadastrado ou defina o aluno como titular.");
      return;
    }
    // Titular renomeado: mantém `guardian` igual ao nome para continuar sendo titular.
    const paraSalvar = eraTitular ? tornarTitular(editingStudent) : editingStudent;
    try {
      await alunosService.atualizar({
        ...paraSalvar,
        planBadgeType: tipoBadgeDoPlano(paraSalvar.plan),
      });
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : "Não foi possível atualizar o aluno.");
      return;
    }
    toast.success(`Dados de ${editingStudent.name} atualizados com sucesso!`);
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onBackdropClick}>
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#f0eded] relative">
        <div className="flex items-center justify-between pb-4 border-b border-[#f0eded]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#ffdbcb] text-[#783100] flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">edit_note</span>
            </div>
            <div>
              <h4 className="text-xl font-extrabold text-[#1b1c1c]">Editar Aluno</h4>
              <p className="text-xs text-[#584237]">Atualize os dados de {aluno.name}</p>
              {/* Contexto para conferir se é o aluno certo sem sair da edição. */}
              <p className="mt-1 text-[11px] text-[#584237]/80">
                Matrícula {aluno.id}
                {aluno.birthDate && <> • Nasc. {aluno.birthDate}</>}
                {(aluno.guardianPhone || aluno.schoolName) && (
                  <> • {aluno.guardianPhone || aluno.schoolName}</>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={pedirFechamento}
            className="p-2 text-[#584237] hover:bg-[#f5f3f3] rounded-full transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleUpdateStudent} className="mt-6 flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#584237] mb-1.5">
              Nome Completo
            </label>
            <input
              type="text"
              required
              value={editingStudent.name}
              onChange={(e) =>
                setEditingStudent({ ...editingStudent, name: e.target.value })
              }
              className="w-full px-4 py-3 bg-[#f5f3f3] border-none rounded-xl focus:ring-2 focus:ring-[#9e4300]/30 outline-none text-sm font-medium"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#584237]">
                Responsável Financeiro
              </label>
              <button
                type="button"
                onClick={() => {
                  setEditingStudent(tornarTitular(editingStudent));
                  setEraTitular(true);
                }}
                className="text-[11px] font-bold text-[#c2410c] hover:underline cursor-pointer"
              >
                Definir aluno como titular
              </button>
            </div>
            <ResponsavelSelect
              aluno={editingStudent}
              titular={eraTitular}
              onChange={(atualizado) => {
                setEditingStudent(atualizado);
                setEraTitular(!atualizado.responsavelId);
              }}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#584237] mb-1.5">
                Plano de Aula
              </label>
              <select
                value={editingStudent.plan}
                onChange={(e) =>
                  setEditingStudent({ ...editingStudent, plan: e.target.value })
                }
                className="w-full px-4 py-3 bg-[#f5f3f3] border-none rounded-xl focus:ring-2 focus:ring-[#9e4300]/30 outline-none text-sm font-medium"
              >
                <option value="Trimestral">Trimestral</option>
                <option value="Trimestral (Atelier)">Trimestral (Atelier)</option>
                <option value="Mensal (Atelier)">Mensal (Atelier)</option>
                <option value="Plano Mensal">Plano Mensal</option>
                <option value="Particular">Particular</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#584237] mb-1.5">
                Status
              </label>
              <select
                value={editingStudent.status}
                onChange={(e) =>
                  setEditingStudent({
                    ...editingStudent,
                    status: e.target.value as 'Ativo' | 'Inativo',
                  })
                }
                className="w-full px-4 py-3 bg-[#f5f3f3] border-none rounded-xl focus:ring-2 focus:ring-[#9e4300]/30 outline-none text-sm font-medium"
              >
                <option value="Ativo">Ativo</option>
                <option value="Inativo">Inativo</option>
              </select>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-[#f0eded]">
            <button
              type="button"
              onClick={pedirFechamento}
              className="px-5 py-2.5 rounded-full text-sm font-bold text-[#584237] hover:bg-[#f5f3f3] transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full text-sm font-bold bg-[#9e4300] hover:bg-[#f2711c] text-white shadow-lg shadow-[#9e4300]/20 transition-all active:scale-95 cursor-pointer"
            >
              Salvar Alterações
            </button>
          </div>
        </form>
        {dialogoDescarte}
      </div>
    </div>
  );
}
