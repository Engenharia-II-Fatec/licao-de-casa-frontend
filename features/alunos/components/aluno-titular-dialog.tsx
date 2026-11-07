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

/** Modal de detalhes do aluno que é o próprio responsável financeiro (titular). */
export function AlunoTitularDialog({ aluno, onClose, onSaved }: Props) {
  const toast = useToast();
  const showToast = toast.success;
  const [selfResponsibleFormData, setSelfResponsibleFormData] = useState<Aluno>({ ...aluno });

  const handleSaveSelfResponsibleChanges = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await alunosService.atualizar(selfResponsibleFormData);
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : "Não foi possível salvar as alterações.");
      return;
    }
    showToast(`Alterações do aluno ${selfResponsibleFormData.name} salvas com sucesso!`);
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-[2rem] max-w-4xl w-full shadow-2xl overflow-hidden border border-[#f0eded] my-auto relative">
        {/* Top Bar Header with Close Button */}
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
                  {selfResponsibleFormData.name}
                </h3>
                <span className="px-2.5 py-0.5 bg-[#e6f4ea] text-[#137333] text-[11px] font-extrabold rounded-full tracking-wider uppercase">
                  {selfResponsibleFormData.status}
                </span>
              </div>
              <div className="flex items-center gap-4 sm:gap-6 mt-1.5 text-xs text-[#584237] font-medium flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base text-[#584237]/70">
                    badge
                  </span>
                  <span>ID: #{selfResponsibleFormData.id}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base text-[#584237]/70">
                    calendar_today
                  </span>
                  <span>Matrícula: {selfResponsibleFormData.joinedDate || '12/01/2024'}</span>
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

        {/* Modal Body: Two columns layout */}
        <form onSubmit={handleSaveSelfResponsibleChanges}>
          <div className="p-6 sm:p-8 pt-2 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
            {/* Left Column: Contato, Endereço, Histórico de Pagamentos com tabela direta */}
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
                      value={selfResponsibleFormData.guardianPhone || ''}
                      onChange={(e) =>
                        setSelfResponsibleFormData({
                          ...selfResponsibleFormData,
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
                      value={selfResponsibleFormData.email || ''}
                      onChange={(e) =>
                        setSelfResponsibleFormData({
                          ...selfResponsibleFormData,
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
                      value={selfResponsibleFormData.address || ''}
                      onChange={(e) =>
                        setSelfResponsibleFormData({
                          ...selfResponsibleFormData,
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
                        value={selfResponsibleFormData.neighborhood || ''}
                        onChange={(e) =>
                          setSelfResponsibleFormData({
                            ...selfResponsibleFormData,
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
                        value={selfResponsibleFormData.city || ''}
                        onChange={(e) =>
                          setSelfResponsibleFormData({
                            ...selfResponsibleFormData,
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

              {/* Seção Histórico de Pagamentos: Tabela Direta */}
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
                    onClick={() => showToast('Exibindo todo o histórico financeiro')}
                    className="text-xs font-bold text-[#00629f] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Ver Todos</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                </div>

                <div className="bg-[#fbf9f8] rounded-2xl border border-[#f0eded] overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-[#584237] font-bold uppercase tracking-wider border-b border-[#f0eded] bg-[#f5f3f3]">
                        <th className="px-4 py-3">Descrição</th>
                        <th className="px-4 py-3">Data</th>
                        <th className="px-4 py-3">Valor</th>
                        <th className="px-4 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f0eded]">
                      {(selfResponsibleFormData.paymentHistory || [
                        {
                          id: '1',
                          description: 'Mensalidade Abril',
                          date: '10/04/2024',
                          amount: 'R$ 890,00',
                          status: 'Pago',
                        },
                        {
                          id: '2',
                          description: 'Mensalidade Maio',
                          date: '10/05/2024',
                          amount: 'R$ 890,00',
                          status: 'Pendente',
                        },
                      ]).map((pay) => (
                        <tr key={pay.id} className="bg-white hover:bg-[#fff9f5] transition-colors">
                          <td className="px-4 py-3.5 font-bold text-[#1b1c1c]">
                            {pay.description}
                          </td>
                          <td className="px-4 py-3.5 text-[#584237]">{pay.date}</td>
                          <td className="px-4 py-3.5 font-bold text-[#1b1c1c]">{pay.amount}</td>
                          <td className="px-4 py-3.5">
                            {pay.status === 'Pago' ? (
                              <div className="flex items-center gap-1.5 text-[#006a65] font-bold">
                                <span className="w-2 h-2 rounded-full bg-[#00a9a1]"></span>
                                <span>Pago</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 text-[#f2711c] font-bold">
                                <span className="w-2 h-2 rounded-full bg-[#f2711c]"></span>
                                <span>Pendente</span>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right Column: Plano Acadêmico & Responsáveis (Nenhum vinculado) */}
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
                      value={selfResponsibleFormData.plan}
                      onChange={(e) =>
                        setSelfResponsibleFormData({
                          ...selfResponsibleFormData,
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
                    <b>{selfResponsibleFormData.renewalDate || '12/04/2024'}</b>. Alterações
                    solicitadas hoje valem para o próximo ciclo.
                  </p>
                </div>
              </div>

              {/* Card Responsáveis: Nenhum Responsável Vinculado */}
              <div className="bg-white rounded-3xl p-6 border border-[#f0eded] shadow-sm flex flex-col items-center text-center">
                <h4 className="text-xs font-black uppercase tracking-wider text-[#584237] w-full text-left mb-6">
                  Responsáveis
                </h4>

                {/* People Circle Icon */}
                <div className="w-16 h-16 rounded-full bg-[#f0eded] flex items-center justify-center text-[#584237]/60 mb-4">
                  <span className="material-symbols-outlined text-3xl">group</span>
                </div>

                <h5 className="font-extrabold text-sm sm:text-base text-[#1b1c1c]">
                  Nenhum responsável vinculado
                </h5>
                <p className="text-xs text-[#584237]/80 mt-1.5 mb-6 max-w-xs leading-relaxed">
                  Este estudante ainda não possui um tutor ou responsável financeiro associado.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    showToast(
                      'Fluxo para vincular um novo tutor ou responsável financeiro.'
                    )
                  }
                  className="bg-[#54a0ff] hover:bg-[#2e86de] text-white px-6 py-3 rounded-full font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-400/25 active:scale-95 transition-all cursor-pointer w-full"
                >
                  <span className="material-symbols-outlined text-lg">person_add</span>
                  <span>Vincular Agora</span>
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
