"use client";

import { useState, type FormEvent } from "react";
import { useToast } from "@/components/ui/toast";
import { alunosService } from "../services";
import type { Aluno } from "../types";
import { tipoBadgeDoPlano } from "../utils";

interface Props {
  aluno: Aluno;
  onClose: () => void;
  onSaved: () => void;
}

/** Modal "Editar Aluno" (ação rápida da tabela). */
export function AlunoEditarDialog({ aluno, onClose, onSaved }: Props) {
  const toast = useToast();
  const [editingStudent, setEditingStudent] = useState<Aluno>({ ...aluno });

  const handleUpdateStudent = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await alunosService.atualizar({
        ...editingStudent,
        planBadgeType: tipoBadgeDoPlano(editingStudent.plan),
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#f0eded] relative">
        <div className="flex items-center justify-between pb-4 border-b border-[#f0eded]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#ffdbcb] text-[#783100] flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">edit_note</span>
            </div>
            <div>
              <h4 className="text-xl font-extrabold text-[#1b1c1c]">Editar Aluno</h4>
              <p className="text-xs text-[#584237]">Atualize os dados de {editingStudent.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
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
                onClick={() =>
                  setEditingStudent({ ...editingStudent, guardian: editingStudent.name })
                }
                className="text-[11px] font-bold text-[#c2410c] hover:underline cursor-pointer"
              >
                Definir aluno como titular
              </button>
            </div>
            <input
              type="text"
              required
              value={editingStudent.guardian}
              onChange={(e) =>
                setEditingStudent({ ...editingStudent, guardian: e.target.value })
              }
              className="w-full px-4 py-3 bg-[#f5f3f3] border-none rounded-xl focus:ring-2 focus:ring-[#9e4300]/30 outline-none text-sm font-medium"
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
              onClick={onClose}
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
      </div>
    </div>
  );
}
