"use client";

import { useToast } from "@/components/ui/toast";
import { alunosService } from "../services";
import type { Aluno } from "../types";

interface Props {
  aluno: Aluno;
  onClose: () => void;
  onDeleted: () => void;
}

/** Modal de confirmação "Excluir Aluno?". */
export function ExcluirAlunoDialog({ aluno: studentToDelete, onClose, onDeleted }: Props) {
  const toast = useToast();

  const confirmDeleteStudent = async () => {
    try {
      await alunosService.excluir(studentToDelete.id);
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : "Não foi possível excluir o aluno.");
      return;
    }
    toast.success(`Aluno ${studentToDelete.name} removido.`);
    onDeleted();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl border border-[#f0eded]">
        <div className="w-14 h-14 rounded-full bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-3xl">delete_forever</span>
        </div>
        <h4 className="text-xl font-black text-[#1b1c1c]">Excluir Aluno?</h4>
        <p className="text-sm text-[#584237] mt-2">
          Tem certeza que deseja remover <b>{studentToDelete.name}</b> (ID: {studentToDelete.id})
          da base de dados?
        </p>
        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-full text-sm font-bold bg-[#f5f3f3] text-[#584237] hover:bg-[#eae8e7] transition-all cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={confirmDeleteStudent}
            className="flex-1 py-2.5 rounded-full text-sm font-bold bg-[#ba1a1a] hover:bg-red-700 text-white shadow-lg shadow-[#ba1a1a]/25 transition-all active:scale-95 cursor-pointer"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
