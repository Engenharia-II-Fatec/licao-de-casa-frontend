"use client";

import { useState, type FormEvent } from "react";
import { useToast } from "@/components/ui/toast";
import { mascararEmail, mascararTelefone } from "@/lib/masks";
import { alunosService } from "../services";
import type { Aluno } from "../types";

interface Props {
  aluno: Aluno;
  onClose: () => void;
  onSaved: () => void;
}

/** Modal de detalhes do aluno que NÃO é o responsável financeiro. */
export function AlunoDependenteDialog({ aluno, onClose, onSaved }: Props) {
  const toast = useToast();
  const showToast = toast.success;
  const [dependentFormData, setDependentFormData] = useState<Aluno>({ ...aluno });

  const handleSaveDependentChanges = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await alunosService.atualizar(dependentFormData);
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : "Não foi possível salvar as alterações.");
      return;
    }
    showToast(`Alterações do aluno ${dependentFormData.name} salvas com sucesso!`);
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-[2rem] max-w-4xl w-full shadow-2xl overflow-hidden border border-[#f0eded] my-auto relative">
        {/* Header: Foto do aluno, Nome, ATIVO, ID, Matrícula e botão Fechar */}
        <div className="p-6 sm:p-8 pb-4 flex items-start justify-between">
          <div className="flex items-center gap-4 sm:gap-5">
            {/* Avatar icon */}
            <div className="relative">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#ffdbcb] text-[#783100] flex items-center justify-center font-bold text-xl ring-2 ring-[#ffdbcb] shadow-sm">
                <span className="material-symbols-outlined text-3xl sm:text-4xl text-[#783100]">
                  person
                </span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-xl sm:text-2xl font-black text-[#1b1c1c] tracking-tight">
                  {dependentFormData.name}
                </h3>
                <span className="px-2.5 py-0.5 bg-[#e6f4ea] text-[#137333] text-[11px] font-extrabold rounded-full tracking-wider uppercase">
                  {dependentFormData.status}
                </span>
              </div>
              <div className="flex items-center gap-4 sm:gap-6 mt-1.5 text-xs text-[#584237] font-medium flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base text-[#584237]/70">
                    badge
                  </span>
                  <span>ID: #{dependentFormData.id}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base text-[#584237]/70">
                    calendar_today
                  </span>
                  <span>Matrícula: {dependentFormData.joinedDate || '12/01/2024'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="text-[#584237]/70 hover:text-[#1b1c1c] p-2 hover:bg-[#f5f3f3] rounded-full transition-colors cursor-pointer"
            title="Fechar"
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSaveDependentChanges}>
          <div className="p-6 sm:p-8 pt-2 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
            {/* Left Column: Contato, Endereço, Histórico de Pagamentos (com Financeiro via Responsável) */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              {/* Seção Contato */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full bg-[#c2410c]"></span>
                  <h4 className="text-xs font-black uppercase tracking-wider text-[#584237]">
                    Contato
                  </h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[11px] font-bold text-[#584237]/80 uppercase tracking-wide mb-1">
                      Telefone
                    </label>
                    <input
                      type="text"
                      value={dependentFormData.guardianPhone || ''}
                      onChange={(e) =>
                        setDependentFormData({
                          ...dependentFormData,
                          guardianPhone: mascararTelefone(e.target.value),
                        })
                      }
                      placeholder="(11) 98765-4321"
                      className="w-full px-4 py-3 bg-[#f5f3f3] border-none rounded-xl text-sm font-medium text-[#1b1c1c] focus:ring-2 focus:ring-[#c2410c]/25 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#584237]/80 uppercase tracking-wide mb-1">
                      E-mail
                    </label>
                    <input
                      type="email"
                      value={dependentFormData.email || ''}
                      onChange={(e) =>
                        setDependentFormData({
                          ...dependentFormData,
                          email: mascararEmail(e.target.value),
                        })
                      }
                      placeholder="aluno@email.com"
                      className="w-full px-4 py-3 bg-[#f5f3f3] border-none rounded-xl text-sm font-medium text-[#1b1c1c] focus:ring-2 focus:ring-[#c2410c]/25 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Seção Endereço */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full bg-[#00629f]"></span>
                  <h4 className="text-xs font-black uppercase tracking-wider text-[#584237]">
                    Endereço
                  </h4>
                </div>
                <div className="flex flex-col gap-3.5">
                  <div>
                    <label className="block text-[11px] font-bold text-[#584237]/80 uppercase tracking-wide mb-1">
                      Rua / Apto
                    </label>
                    <input
                      type="text"
                      value={dependentFormData.address || ''}
                      onChange={(e) =>
                        setDependentFormData({
                          ...dependentFormData,
                          address: e.target.value,
                        })
                      }
                      placeholder="Rua das Palmeiras, 150 - 42"
                      className="w-full px-4 py-3 bg-[#f5f3f3] border-none rounded-xl text-sm font-medium text-[#1b1c1c] focus:ring-2 focus:ring-[#c2410c]/25 outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[11px] font-bold text-[#584237]/80 uppercase tracking-wide mb-1">
                        Bairro
                      </label>
                      <input
                        type="text"
                        value={dependentFormData.neighborhood || ''}
                        onChange={(e) =>
                          setDependentFormData({
                            ...dependentFormData,
                            neighborhood: e.target.value,
                          })
                        }
                        placeholder="Vila Mariana"
                        className="w-full px-4 py-3 bg-[#f5f3f3] border-none rounded-xl text-sm font-medium text-[#1b1c1c] focus:ring-2 focus:ring-[#c2410c]/25 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#584237]/80 uppercase tracking-wide mb-1">
                        Cidade
                      </label>
                      <input
                        type="text"
                        value={dependentFormData.city || ''}
                        onChange={(e) =>
                          setDependentFormData({
                            ...dependentFormData,
                            city: e.target.value,
                          })
                        }
                        placeholder="São Paulo"
                        className="w-full px-4 py-3 bg-[#f5f3f3] border-none rounded-xl text-sm font-medium text-[#1b1c1c] focus:ring-2 focus:ring-[#c2410c]/25 outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Seção Histórico de Pagamentos: Financeiro via Responsável */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#00a9a1]"></span>
                    <h4 className="text-xs font-black uppercase tracking-wider text-[#584237]">
                      Histórico de Pagamentos
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      showToast(`Exibindo histórico de pagamentos de ${dependentFormData.name}`)
                    }
                    className="text-xs font-bold text-[#00629f] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Ver Todos</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                </div>

                {/* Card "Financeiro via Responsável" */}
                <div className="bg-[#eaf3fc] rounded-2xl p-4 sm:p-5 border border-[#d0e4ff] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-[0_4px_20px_-4px_rgba(0,98,159,0.06)]">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-[#d0e4ff] text-[#00629f] flex items-center justify-center shrink-0 shadow-sm">
                      <span className="material-symbols-outlined text-2xl">
                        account_balance_wallet
                      </span>
                    </div>
                    <div>
                      <h5 className="font-bold text-sm sm:text-base text-[#1b1c1c]">
                        Financeiro via Responsável
                      </h5>
                      <p className="text-xs text-[#584237]/80 mt-0.5">
                        Pagamentos gerenciados por:{' '}
                        <span className="font-bold text-[#1b1c1c]">
                          {dependentFormData.guardian}
                        </span>
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      showToast(
                        `Abrindo painel financeiro do responsável: ${dependentFormData.guardian}`
                      )
                    }
                    className="bg-white hover:bg-[#f0f7ff] text-[#00629f] px-4 py-2.5 rounded-full font-bold text-xs shadow-sm border border-[#d0e4ff]/70 flex items-center gap-1.5 transition-all active:scale-95 shrink-0 cursor-pointer"
                  >
                    <span>Ver Perfil Financeiro</span>
                    <span className="material-symbols-outlined text-sm">open_in_new</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Plano Acadêmico & Responsáveis Vinculados */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              {/* Card Plano Acadêmico */}
              <div className="bg-[#fff7f2] rounded-3xl p-5 sm:p-6 border border-[#ffdbcb]/60 flex flex-col gap-4">
                <div className="flex items-center gap-2 text-[#9e4300]">
                  <span className="material-symbols-outlined text-xl">school</span>
                  <h4 className="text-xs font-black uppercase tracking-wider">
                    Plano Acadêmico
                  </h4>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#584237]/80 uppercase tracking-wider mb-1.5">
                    Plano Selecionado
                  </label>
                  <div className="relative">
                    <select
                      value={dependentFormData.plan}
                      onChange={(e) =>
                        setDependentFormData({
                          ...dependentFormData,
                          plan: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3.5 bg-white border border-[#dfc0b2]/40 rounded-xl text-sm font-bold text-[#1b1c1c] appearance-none cursor-pointer focus:ring-2 focus:ring-[#9e4300]/25 outline-none shadow-sm pr-10"
                    >
                      <option value="Trimestral">Trimestral</option>
                      <option value="Trimestral (Atelier)">Trimestral (Atelier)</option>
                      <option value="Mensal (Atelier)">Mensal (Atelier)</option>
                      <option value="Plano Mensal">Plano Mensal</option>
                      <option value="Particular">Particular</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-[#584237]">
                      <span className="material-symbols-outlined text-lg">unfold_more</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/80 rounded-2xl p-3.5 flex items-start gap-2.5 text-xs text-[#584237] border border-[#ffdbcb]/40">
                  <span className="material-symbols-outlined text-[#9e4300] text-base mt-0.5">
                    info
                  </span>
                  <p className="leading-relaxed">
                    Renovação automática em{' '}
                    <b>{dependentFormData.renewalDate || '12/04/2024'}</b>. Alterações
                    solicitadas hoje valem para o próximo ciclo.
                  </p>
                </div>
              </div>

              {/* Card Responsáveis Vinculados */}
              <div className="bg-white rounded-3xl p-6 border border-[#f0eded] shadow-sm flex flex-col">
                <h4 className="text-xs font-black uppercase tracking-wider text-[#584237] mb-4">
                  Responsáveis
                </h4>

                {/* Item do Responsável Vinculado */}
                <div className="flex items-center justify-between p-2 rounded-2xl hover:bg-[#fbf9f8] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#ffdbcb] text-[#783100] flex items-center justify-center ring-2 ring-[#ffdbcb] shadow-sm font-bold text-sm">
                      <span className="material-symbols-outlined text-2xl">person</span>
                    </div>
                    <div>
                      <h5 className="font-bold text-sm text-[#1b1c1c]">
                        {dependentFormData.guardian}
                      </h5>
                      <p className="text-xs text-[#584237]/75 font-medium mt-0.5">
                        {dependentFormData.guardianRole || 'Mãe • Principal'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      showToast(
                        `Editar dados do responsável: ${dependentFormData.guardian}`
                      )
                    }
                    className="p-2 text-[#584237]/70 hover:text-[#1b1c1c] hover:bg-[#f5f3f3] rounded-xl transition-all cursor-pointer"
                    title="Editar Responsável"
                  >
                    <span className="material-symbols-outlined text-lg">edit_note</span>
                  </button>
                </div>

                {/* Botão com Borda Tracejada: + Vincular Novo */}
                <button
                  type="button"
                  onClick={() =>
                    showToast(
                      `Vincular novo tutor ou responsável secundário para ${dependentFormData.name}`
                    )
                  }
                  className="w-full mt-4 border-2 border-dashed border-[#dfc0b2]/60 hover:border-[#9e4300] bg-transparent rounded-2xl py-3 px-4 flex items-center justify-center gap-1.5 text-xs font-bold text-[#1b1c1c] hover:bg-[#fff9f5] transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">add</span>
                  <span>Vincular Novo</span>
                </button>
              </div>
            </div>
          </div>

          {/* Modal Footer Actions: Descartar / Salvar Alterações */}
          <div className="p-6 sm:p-8 pt-4 border-t border-[#f0eded] flex justify-end items-center gap-4 bg-white">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-full text-sm font-bold text-[#584237] hover:bg-[#f5f3f3] transition-colors cursor-pointer"
            >
              Descartar
            </button>
            <button
              type="submit"
              className="px-8 py-3 rounded-full text-sm font-bold bg-[#c2410c] hover:bg-[#ea580c] text-white shadow-xl shadow-[#c2410c]/25 hover:shadow-2xl active:scale-95 transition-all cursor-pointer"
            >
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
