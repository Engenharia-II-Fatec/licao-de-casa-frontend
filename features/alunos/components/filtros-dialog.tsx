"use client";

import type { FiltroStatusAluno } from "../types";

interface Props {
  statusFilter: FiltroStatusAluno;
  setStatusFilter: (status: FiltroStatusAluno) => void;
  selectedPlanFilter: string;
  setSelectedPlanFilter: (plano: string) => void;
  onClose: () => void;
}

/** Modal "Filtros Avançados" da listagem de alunos. */
export function FiltrosDialog({
  statusFilter,
  setStatusFilter,
  selectedPlanFilter,
  setSelectedPlanFilter,
  onClose,
}: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#f0eded]">
        <div className="flex items-center justify-between pb-4 border-b border-[#f0eded]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#9e4300]">tune</span>
            <h4 className="text-lg font-extrabold text-[#1b1c1c]">Filtros Avançados</h4>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#584237] hover:bg-[#f5f3f3] rounded-full transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="mt-5 flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#584237] mb-2">
              Status de Matrícula
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Todos', 'Ativo', 'Inativo'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    statusFilter === st
                      ? 'bg-[#9e4300] text-white shadow-md'
                      : 'bg-[#f5f3f3] text-[#584237] hover:bg-[#eae8e7]'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#584237] mb-2">
              Tipo de Plano
            </label>
            <select
              value={selectedPlanFilter}
              onChange={(e) => setSelectedPlanFilter(e.target.value)}
              className="w-full px-4 py-3 bg-[#f5f3f3] border-none rounded-xl text-sm font-medium text-[#584237] outline-none cursor-pointer"
            >
              <option value="Todos os Planos">Todos os Planos</option>
              <option value="Pacote Mensal">Pacote Mensal</option>
              <option value="Pacote Trimestral">Pacote Trimestral</option>
              <option value="Aula Particular">Aula Particular</option>
              <option value="Atelier">Atelier</option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex justify-between items-center pt-4 border-t border-[#f0eded]">
          <button
            type="button"
            onClick={() => {
              setStatusFilter('Todos');
              setSelectedPlanFilter('Todos os Planos');
            }}
            className="text-xs text-[#9e4300] font-bold hover:underline cursor-pointer"
          >
            Resetar Filtros
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-full text-sm font-bold bg-[#9e4300] text-white hover:bg-[#f2711c] shadow-lg transition-all cursor-pointer"
          >
            Aplicar
          </button>
        </div>
      </div>
    </div>
  );
}
