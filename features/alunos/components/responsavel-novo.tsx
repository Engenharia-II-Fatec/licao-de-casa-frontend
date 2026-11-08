"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState, type ChangeEvent, type FormEvent, type KeyboardEvent } from "react";
import { DropdownSelect } from "@/components/ui/dropdown-select";
import { useToast } from "@/components/ui/toast";
import { mascararCep, mascararCpf, mascararEmail, mascararRg, mascararTelefone } from "@/lib/masks";
import { consultarCep } from "@/lib/viacep";
import { useCadastroAluno } from "../cadastro-context";
import { CADASTRO_RESPONSAVEL_INICIAL, OPCOES_UF } from "../constants";
import { responsaveisService } from "../services";
import { CidadeSelect } from "./cidade-select";

/** Tela "Cadastro de Responsável", aberta a partir do "Cadastro de Novo Aluno". */
export function ResponsavelNovo() {
  const router = useRouter();
  const toast = useToast();
  const showToast = toast.success;
  const { setForm: setCreateForm } = useCadastroAluno();
  const [newRespForm, setNewRespForm] = useState(CADASTRO_RESPONSAVEL_INICIAL);
  const [buscandoCep, setBuscandoCep] = useState(false);
  const ultimoCepBuscadoRef = useRef("");
  const numeroInputRef = useRef<HTMLInputElement>(null);

  const voltar = () => router.push("/alunos/novo");

  const buscarEnderecoPorCep = useCallback(
    async (cepValor: string, forcar = false) => {
      const digitos = cepValor.replace(/\D/g, "");
      if (digitos.length !== 8) return;
      if (!forcar && ultimoCepBuscadoRef.current === digitos) return;

      ultimoCepBuscadoRef.current = digitos;
      setBuscandoCep(true);

      try {
        const resultado = await consultarCep(digitos);
        if (!resultado) {
          toast.error("CEP não encontrado. Por favor, confira os números digitados.");
          return;
        }

        setNewRespForm((prev) => ({
          ...prev,
          cep: mascararCep(resultado.cep),
          address: resultado.address || prev.address,
          neighborhood: resultado.neighborhood || prev.neighborhood,
          complement: resultado.complement || prev.complement,
          state: resultado.state || prev.state,
          city: resultado.city || prev.city,
        }));

        toast.success("Endereço preenchido automaticamente pelo CEP!");
        setTimeout(() => {
          numeroInputRef.current?.focus();
        }, 50);
      } catch {
        toast.error("Não foi possível consultar o CEP no ViaCEP. Preencha os campos manualmente.");
      } finally {
        setBuscandoCep(false);
      }
    },
    [toast]
  );

  const handleCepChange = (e: ChangeEvent<HTMLInputElement>) => {
    const novoCep = mascararCep(e.target.value);
    setNewRespForm((prev) => ({ ...prev, cep: novoCep }));

    const digitos = novoCep.replace(/\D/g, "");
    if (digitos.length === 8) {
      buscarEnderecoPorCep(novoCep);
    }
  };

  const handleCepBlur = () => {
    const digitos = newRespForm.cep.replace(/\D/g, "");
    if (digitos.length === 8 && ultimoCepBuscadoRef.current !== digitos) {
      buscarEnderecoPorCep(newRespForm.cep);
    }
  };

  const handleCepKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      buscarEnderecoPorCep(newRespForm.cep, true);
    }
  };

  const handleSaveResponsibleCadastro = async (e: FormEvent) => {
    e.preventDefault();
    if (!newRespForm.name.trim()) {
      toast.error("Por favor, informe o nome do responsável.");
      return;
    }

    try {
      const newResp = await responsaveisService.criar({
        name: newRespForm.name.trim(),
        role: "Responsável",
        phone: newRespForm.phone.trim() || "(11) 98877-6655",
        photo: newRespForm.photo || "",
        cpf: newRespForm.cpf,
        rg: newRespForm.rg,
        email: newRespForm.email,
        cep: newRespForm.cep,
        address: newRespForm.address,
        number: newRespForm.number,
        complement: newRespForm.complement,
        neighborhood: newRespForm.neighborhood,
        city: newRespForm.city,
        state: newRespForm.state,
      });

      // Já deixa o novo responsável selecionado no cadastro do aluno.
      setCreateForm((prev) => ({ ...prev, selectedResponsibleId: newResp.id }));
      setNewRespForm(CADASTRO_RESPONSAVEL_INICIAL);
      showToast(`Responsável "${newResp.name}" cadastrado e vinculado!`);
      voltar();
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : "Não foi possível salvar o responsável.");
    }
  };

  return (
              <div className="max-w-4xl mx-auto w-full flex flex-col gap-6 animate-fade-in">
                {/* Breadcrumb Navigation */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#584237]/70">
                    <Link href="/alunos" className="hover:text-[#9e4300] hover:underline cursor-pointer">
      Dashboard
    </Link>
                    <span>›</span>
                    <button
                      type="button"

                      className="hover:text-[#9e4300] hover:underline cursor-pointer"
                    >
                      Responsáveis
                    </button>
                    <span>›</span>
                    <span className="text-[#9e4300] font-bold">Novo Cadastro</span>
                  </div>

                  <button
                    type="button"
                    onClick={voltar}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#584237] hover:text-[#9e4300] bg-white px-3.5 py-1.5 rounded-full border border-[#f0eded] shadow-sm hover:shadow transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">arrow_back</span>
                    <span>Voltar</span>
                  </button>
                </div>

                {/* Formulário de Cadastro de Responsável */}
                <form onSubmit={handleSaveResponsibleCadastro} className="flex flex-col gap-6">
                  {/* CARD 1: Dados Pessoais */}
                  <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#f0eded] shadow-sm flex flex-col gap-6">
                    {/* Cabeçalho do Card */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#ffdbcb] text-[#783100] flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-xl">person</span>
                      </div>
                      <h3 className="font-extrabold text-base sm:text-lg text-[#1b1c1c] leading-tight">
                        Dados Pessoais
                      </h3>
                    </div>

                    {/* Seção Foto / Ícone do Responsável */}
                    <div className="flex items-center gap-4 sm:gap-6">
                      <div className="relative shrink-0">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#ffdbcb] text-[#783100] flex items-center justify-center overflow-hidden shadow-sm">
                          <span className="material-symbols-outlined text-3xl sm:text-4xl">
                            person
                          </span>
                        </div>
                        <div
                          className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-[#9e4300] text-white flex items-center justify-center shadow-md"
                          title="Ícone do perfil"
                        >
                          <span className="material-symbols-outlined text-xs">account_circle</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <p className="text-xs sm:text-sm text-[#584237]/80 leading-relaxed max-w-xl">
                          Ícone de identificação do responsável no sistema.
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 rounded-full bg-[#f0eded] text-[11px] font-bold text-[#584237]">
                            Ícone Padrão
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Nome Completo */}
                    <div>
                      <label className="block text-xs font-bold text-[#1b1c1c] mb-1.5">
                        Nome Completo
                      </label>
                      <input
                        type="text"
                        required
                        value={newRespForm.name}
                        onChange={(e) => setNewRespForm({ ...newRespForm, name: e.target.value })}
                        placeholder="Digite o nome completo"
                        className="w-full px-4 py-3.5 bg-[#f5f3f3] border-none rounded-xl text-sm font-medium text-[#1b1c1c] placeholder:text-[#584237]/40 focus:ring-2 focus:ring-[#9e4300]/25 outline-none"
                      />
                    </div>

                    {/* CPF e RG */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#1b1c1c] mb-1.5">CPF</label>
                        <input
                          type="text"
                          value={newRespForm.cpf}
                          onChange={(e) => setNewRespForm({ ...newRespForm, cpf: mascararCpf(e.target.value) })}
                          placeholder="000.000.000-00"
                          className="w-full px-4 py-3.5 bg-[#f5f3f3] border-none rounded-xl text-sm font-medium text-[#1b1c1c] placeholder:text-[#584237]/40 focus:ring-2 focus:ring-[#9e4300]/25 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#1b1c1c] mb-1.5">RG</label>
                        <input
                          type="text"
                          value={newRespForm.rg}
                          onChange={(e) => setNewRespForm({ ...newRespForm, rg: mascararRg(e.target.value) })}
                          placeholder="00.000.000-0"
                          className="w-full px-4 py-3.5 bg-[#f5f3f3] border-none rounded-xl text-sm font-medium text-[#1b1c1c] placeholder:text-[#584237]/40 focus:ring-2 focus:ring-[#9e4300]/25 outline-none"
                        />
                      </div>
                    </div>

                    {/* E-mail e Telefone Celular */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#1b1c1c] mb-1.5">E-mail</label>
                        <input
                          type="email"
                          value={newRespForm.email}
                          onChange={(e) => setNewRespForm({ ...newRespForm, email: mascararEmail(e.target.value) })}
                          placeholder="email@exemplo.com"
                          className="w-full px-4 py-3.5 bg-[#f5f3f3] border-none rounded-xl text-sm font-medium text-[#1b1c1c] placeholder:text-[#584237]/40 focus:ring-2 focus:ring-[#9e4300]/25 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#1b1c1c] mb-1.5">
                          Telefone Celular
                        </label>
                        <input
                          type="text"
                          required
                          value={newRespForm.phone}
                          onChange={(e) => setNewRespForm({ ...newRespForm, phone: mascararTelefone(e.target.value) })}
                          placeholder="(00) 00000-0000"
                          className="w-full px-4 py-3.5 bg-[#f5f3f3] border-none rounded-xl text-sm font-medium text-[#1b1c1c] placeholder:text-[#584237]/40 focus:ring-2 focus:ring-[#9e4300]/25 outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* CARD 2: Endereço */}
                  <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#f0eded] shadow-sm flex flex-col gap-6">
                    {/* Cabeçalho do Card */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#d0e4ff] text-[#00629f] flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-xl">location_on</span>
                      </div>
                      <h3 className="font-extrabold text-base sm:text-lg text-[#1b1c1c] leading-tight">
                        Endereço
                      </h3>
                    </div>

                    {/* CEP e Logradouro */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                      <div className="sm:col-span-5">
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="block text-xs font-bold text-[#1b1c1c]">CEP</label>
                          {buscandoCep && (
                            <span className="text-[11px] font-bold text-[#9e4300] animate-pulse">
                              Buscando...
                            </span>
                          )}
                        </div>
                        <div className="relative">
                          <input
                            type="text"
                            value={newRespForm.cep}
                            inputMode="numeric"
                            maxLength={9}
                            onChange={handleCepChange}
                            onBlur={handleCepBlur}
                            onKeyDown={handleCepKeyDown}
                            placeholder="00000-000"
                            className="w-full pl-4 pr-11 py-3.5 bg-[#f5f3f3] border-none rounded-xl text-sm font-medium text-[#1b1c1c] placeholder:text-[#584237]/40 focus:ring-2 focus:ring-[#9e4300]/25 outline-none"
                          />
                          <button
                            type="button"
                            disabled={buscandoCep}
                            onClick={() => buscarEnderecoPorCep(newRespForm.cep, true)}
                            title={buscandoCep ? "Consultando CEP no ViaCEP..." : "Buscar endereço pelo CEP"}
                            aria-label="Buscar endereço pelo CEP"
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg text-[#783100] hover:text-[#9e4300] hover:bg-[#ffdbcb]/60 transition-colors cursor-pointer disabled:cursor-not-allowed"
                          >
                            <span
                              className={`material-symbols-outlined text-lg leading-none ${
                                buscandoCep ? "animate-spin text-[#9e4300]" : ""
                              }`}
                            >
                              {buscandoCep ? "progress_activity" : "search"}
                            </span>
                          </button>
                        </div>
                      </div>

                      <div className="sm:col-span-7">
                        <label className="block text-xs font-bold text-[#1b1c1c] mb-1.5">
                          Logradouro
                        </label>
                        <input
                          type="text"
                          value={newRespForm.address}
                          onChange={(e) =>
                            setNewRespForm({ ...newRespForm, address: e.target.value })
                          }
                          placeholder="Rua, Avenida, etc."
                          className="w-full px-4 py-3.5 bg-[#f5f3f3] border-none rounded-xl text-sm font-medium text-[#1b1c1c] placeholder:text-[#584237]/40 focus:ring-2 focus:ring-[#9e4300]/25 outline-none"
                        />
                      </div>
                    </div>

                    {/* Número e Complemento */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#1b1c1c] mb-1.5">Número</label>
                        <input
                          ref={numeroInputRef}
                          type="text"
                          value={newRespForm.number}
                          onChange={(e) =>
                            setNewRespForm({ ...newRespForm, number: e.target.value })
                          }
                          placeholder="S/N"
                          className="w-full px-4 py-3.5 bg-[#f5f3f3] border-none rounded-xl text-sm font-medium text-[#1b1c1c] placeholder:text-[#584237]/40 focus:ring-2 focus:ring-[#9e4300]/25 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#1b1c1c] mb-1.5">
                          Complemento
                        </label>
                        <input
                          type="text"
                          value={newRespForm.complement}
                          onChange={(e) =>
                            setNewRespForm({ ...newRespForm, complement: e.target.value })
                          }
                          placeholder="Apto, Bloco, etc."
                          className="w-full px-4 py-3.5 bg-[#f5f3f3] border-none rounded-xl text-sm font-medium text-[#1b1c1c] placeholder:text-[#584237]/40 focus:ring-2 focus:ring-[#9e4300]/25 outline-none"
                        />
                      </div>
                    </div>

                    {/* Bairro, Cidade e UF */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                      <div className="sm:col-span-5">
                        <label className="block text-xs font-bold text-[#1b1c1c] mb-1.5">Bairro</label>
                        <input
                          type="text"
                          value={newRespForm.neighborhood}
                          onChange={(e) =>
                            setNewRespForm({ ...newRespForm, neighborhood: e.target.value })
                          }
                          placeholder="Nome do bairro"
                          className="w-full px-4 py-3.5 bg-[#f5f3f3] border-none rounded-xl text-sm font-medium text-[#1b1c1c] placeholder:text-[#584237]/40 focus:ring-2 focus:ring-[#9e4300]/25 outline-none"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-[#1b1c1c] mb-1.5">UF</label>
                        <DropdownSelect
                          value={newRespForm.state}
                          onChange={(state) =>
                            setNewRespForm({
                              ...newRespForm,
                              state,
                              // Trocou a UF: a cidade anterior deixa de valer.
                              city: state === newRespForm.state ? newRespForm.city : "",
                            })
                          }
                          options={OPCOES_UF}
                        />
                      </div>

                      <div className="sm:col-span-5">
                        <label className="block text-xs font-bold text-[#1b1c1c] mb-1.5">Cidade</label>
                        <CidadeSelect
                          uf={newRespForm.state}
                          value={newRespForm.city}
                          onChange={(city) => setNewRespForm({ ...newRespForm, city })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Botões do Rodapé: Cancelar e Salvar Cadastro */}
                  <div className="flex items-center justify-end gap-4 pt-2">
                    <button
                      type="button"
                      onClick={voltar}
                      className="px-6 py-3 rounded-full text-sm font-bold text-[#584237] hover:bg-[#f5f3f3] transition-colors cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-8 py-3.5 rounded-full text-sm font-bold bg-[#9e4300] hover:bg-[#7d3500] text-white shadow-xl shadow-[#9e4300]/25 hover:shadow-2xl active:scale-95 transition-all cursor-pointer"
                    >
                      Salvar Cadastro
                    </button>
                  </div>
                </form>
              </div>
  );
}
