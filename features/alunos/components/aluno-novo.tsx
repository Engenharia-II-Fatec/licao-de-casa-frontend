"use client";

import { useRouter } from "next/navigation";
import { useCallback, useRef, useState, useMemo, type ChangeEvent, type FormEvent, type KeyboardEvent } from "react";
import { DropdownSelect } from "@/components/ui/dropdown-select";
import { useToast } from "@/components/ui/toast";
import { OPCOES_UF } from "../constants";
import { mascararCep, mascararCpf, mascararData, mascararRg, mascararTelefone } from "@/lib/masks";
import { consultarCep } from "@/lib/viacep";
import { useCadastroAluno } from "../cadastro-context";
import { useResponsaveis } from "../hooks";
import { alunosService } from "../services";
import { CidadeSelect } from "./cidade-select";
import type { Aluno } from "../types";
import { calcularIniciais, precoDoPlano, tipoBadgeDoPlano } from "../utils";

/** Tela "Cadastro de Novo Aluno". */
export function AlunoNovo() {
  const router = useRouter();
  const toast = useToast();
  const { form: createForm, setForm: setCreateForm, limpar } = useCadastroAluno();
  const { responsaveis: responsibles } = useResponsaveis();

  const [buscandoCep, setBuscandoCep] = useState(false);
  const ultimoCepBuscadoRef = useRef("");
  const numeroInputRef = useRef<HTMLInputElement>(null);

  const voltarParaLista = () => router.push("/alunos");

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

        setCreateForm((prev) => ({
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
    [setCreateForm, toast]
  );

  const handleCepChange = (e: ChangeEvent<HTMLInputElement>) => {
    const novoCep = mascararCep(e.target.value);
    setCreateForm((prev) => ({ ...prev, cep: novoCep }));

    const digitos = novoCep.replace(/\D/g, "");
    if (digitos.length === 8) {
      buscarEnderecoPorCep(novoCep);
    }
  };

  const handleCepBlur = () => {
    const digitos = createForm.cep.replace(/\D/g, "");
    if (digitos.length === 8 && ultimoCepBuscadoRef.current !== digitos) {
      buscarEnderecoPorCep(createForm.cep);
    }
  };

  const handleCepKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      buscarEnderecoPorCep(createForm.cep, true);
    }
  };

  // Responsável selecionado no cadastro (sem seleção explícita, usa o primeiro da lista).
  const selectedResponsible = useMemo(() => {
    if (!createForm.selectedResponsibleId) {
      return responsibles.length > 0 ? responsibles[0] : null;
    }
    return responsibles.find((r) => r.id === createForm.selectedResponsibleId) || null;
  }, [responsibles, createForm.selectedResponsibleId]);

  const selectedPlanPrice = precoDoPlano(createForm.selectedPlan);

  const handleFinalizeCadastro = async (e: FormEvent) => {
    e.preventDefault();

    if (!selectedResponsible && responsibles.length === 0) {
      toast.error(
        'Por favor, cadastre um responsável no botão "Criar Novo Responsável" antes de finalizar.',
      );
      return;
    }

    const finalName = createForm.name.trim() || "Arthur Cavalcanti Silva";
    const valorMensalidade = selectedPlanPrice !== "Consultar" ? selectedPlanPrice : "R$ 890,00";

    const createdStudent: Aluno = {
      id: `2024-0${Math.floor(890 + Math.random() * 100)}`,
      name: finalName,
      initials: calcularIniciais(finalName),
      avatarBg: "bg-[#d0e4ff]",
      avatarText: "text-[#00629f]",
      photo: createForm.photo || undefined,
      guardian: selectedResponsible ? selectedResponsible.name : finalName,
      guardianRole: selectedResponsible
        ? `${selectedResponsible.role} • Principal`
        : "Titular da Conta",
      guardianPhoto: selectedResponsible?.photo,
      guardianPhone: selectedResponsible?.phone || createForm.phone || "(11) 98877-6655",
      email: `${finalName.toLowerCase().replace(/\s+/g, ".")}@email.com`,
      rg: createForm.rg || "00.000.000-0",
      cpf: createForm.cpf || "000.000.000-0",
      birthDate: createForm.birthDate || "10/05/2012",
      schoolGrade: createForm.schoolGrade,
      schoolName: createForm.schoolName || "Escola Estadual São Paulo",
      cep: createForm.cep || "01000-000",
      address:
        createForm.address ||
        (createForm.number ? `Rua das Flores, ${createForm.number}` : "Rua das Flores, 123"),
      number: createForm.number || "123",
      complement: createForm.complement || "Apto 42",
      neighborhood: createForm.neighborhood || "Centro",
      city: createForm.city || (createForm.state && createForm.state !== "SP" ? "" : "São Paulo"),
      state: createForm.state || "SP",
      plan: createForm.selectedPlan,
      planPrice: selectedPlanPrice,
      planBadgeType: tipoBadgeDoPlano(createForm.selectedPlan),
      status: "Ativo",
      grade: createForm.schoolGrade,
      shift: "Tarde (14h - 17h)",
      joinedDate: "12/01/2024",
      renewalDate: "12/04/2024",
      paymentHistory: [
        { id: "1", description: "Mensalidade Abril", date: "10/04/2024", amount: valorMensalidade, status: "Pago" },
        { id: "2", description: "Mensalidade Maio", date: "10/05/2024", amount: valorMensalidade, status: "Pendente" },
      ],
    };

    try {
      await alunosService.criar(createdStudent);
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : "Não foi possível cadastrar o aluno.");
      return;
    }

    limpar();
    toast.success(`Aluno ${createdStudent.name} cadastrado com sucesso!`);
    voltarParaLista();
  };

  return (
    <div className="w-full flex flex-col gap-6 animate-fade-in">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#584237]/70">
          <button
            type="button"
            onClick={voltarParaLista}
            className="hover:text-[#9e4300] hover:underline cursor-pointer"
          >
            Dashboard
          </button>
          <span>›</span>
          <button
            type="button"
            onClick={voltarParaLista}
            className="hover:text-[#9e4300] hover:underline cursor-pointer"
          >
            Alunos
          </button>
          <span>›</span>
          <span className="text-[#9e4300] font-bold">Novo Aluno</span>
        </div>

        <button
          type="button"
          onClick={voltarParaLista}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#584237] hover:text-[#9e4300] bg-white px-3.5 py-1.5 rounded-full border border-[#f0eded] shadow-sm hover:shadow transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          <span>Voltar para Lista de Alunos</span>
        </button>
      </div>

      {/* Layout em 2 colunas: Formulário à esquerda e Resumo à direita */}
      <form onSubmit={handleFinalizeCadastro} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Coluna Esquerda: Os 4 Cards Principais */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* CARD 1: Dados do Aluno */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#f0eded] shadow-sm flex flex-col gap-6">
            {/* Cabeçalho do Card */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#ffdbcb] text-[#783100] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-xl">person_add</span>
              </div>
              <div>
                <h3 className="font-extrabold text-base sm:text-lg text-[#1b1c1c] leading-tight">
                  Dados do Aluno
                </h3>
                <p className="text-xs text-[#584237]/75 font-normal">
                  Informações básicas de identificação
                </p>
              </div>
            </div>

            {/* Foto / Ícone do Aluno */}
            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#ffdbcb] text-[#783100] flex items-center justify-center overflow-hidden shadow-sm">
                  <span className="material-symbols-outlined text-3xl sm:text-4xl">person</span>
                </div>
                <div
                  className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-[#c2410c] text-white flex items-center justify-center shadow-md"
                  title="Ícone do aluno"
                >
                  <span className="material-symbols-outlined text-xs">account_circle</span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <h4 className="font-bold text-xs sm:text-sm text-[#1b1c1c]">Identificação do Aluno</h4>
                <p className="text-[11px] text-[#584237]/70">
                  Ícone padrão do aluno no sistema
                </p>
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
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                placeholder="Ex: Arthur Cavalcanti Silva"
                className="w-full px-4 py-3.5 bg-[#f5f3f3] border-none rounded-xl text-sm font-medium text-[#1b1c1c] placeholder:text-[#584237]/40 focus:ring-2 focus:ring-[#c2410c]/25 outline-none"
              />
            </div>

            {/* Data de Nascimento e RG */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#1b1c1c] mb-1.5">
                  Data de Nascimento
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={createForm.birthDate}
                    inputMode="numeric"
                    onChange={(e) =>
                      setCreateForm({ ...createForm, birthDate: mascararData(e.target.value) })
                    }
                    placeholder="dd/mm/aaaa"
                    className="w-full px-4 py-3.5 bg-[#f5f3f3] border-none rounded-xl text-sm font-medium text-[#1b1c1c] placeholder:text-[#584237]/40 focus:ring-2 focus:ring-[#c2410c]/25 outline-none pr-10"
                  />
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#584237]/60 text-lg pointer-events-none">
                    calendar_today
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1b1c1c] mb-1.5">RG</label>
                <input
                  type="text"
                  value={createForm.rg}
                  onChange={(e) => setCreateForm({ ...createForm, rg: mascararRg(e.target.value) })}
                  placeholder="00.000.000-0"
                  className="w-full px-4 py-3.5 bg-[#f5f3f3] border-none rounded-xl text-sm font-medium text-[#1b1c1c] placeholder:text-[#584237]/40 focus:ring-2 focus:ring-[#c2410c]/25 outline-none"
                />
              </div>
            </div>

            {/* CPF e Telefone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#1b1c1c] mb-1.5">CPF</label>
                <input
                  type="text"
                  value={createForm.cpf}
                  inputMode="numeric"
                  onChange={(e) => setCreateForm({ ...createForm, cpf: mascararCpf(e.target.value) })}
                  placeholder="000.000.000-00"
                  className="w-full px-4 py-3.5 bg-[#f5f3f3] border-none rounded-xl text-sm font-medium text-[#1b1c1c] placeholder:text-[#584237]/40 focus:ring-2 focus:ring-[#c2410c]/25 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1b1c1c] mb-1.5">
                  Telefone
                </label>
                <input
                  type="text"
                  value={createForm.phone}
                  inputMode="tel"
                  onChange={(e) => setCreateForm({ ...createForm, phone: mascararTelefone(e.target.value) })}
                  placeholder="(00) 00000-0000"
                  className="w-full px-4 py-3.5 bg-[#f5f3f3] border-none rounded-xl text-sm font-medium text-[#1b1c1c] placeholder:text-[#584237]/40 focus:ring-2 focus:ring-[#c2410c]/25 outline-none"
                />
              </div>
            </div>

            {/* Nível Escolar */}
            <div>
              <label className="block text-xs font-bold text-[#1b1c1c] mb-1.5">
                Nível Escolar
              </label>
              <div className="relative">
                <select
                  value={createForm.schoolGrade}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, schoolGrade: e.target.value })
                  }
                  className="w-full px-4 py-3.5 bg-[#f5f3f3] border-none rounded-xl text-sm font-medium text-[#1b1c1c] appearance-none focus:ring-2 focus:ring-[#c2410c]/25 outline-none cursor-pointer pr-10"
                >
                  <option value="Ensino Fundamental I">Ensino Fundamental I</option>
                  <option value="Ensino Fundamental II">Ensino Fundamental II</option>
                  <option value="Ensino Médio">Ensino Médio</option>
                  <option value="Educação Infantil">Educação Infantil</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#584237]/60 text-lg pointer-events-none">
                  expand_more
                </span>
              </div>
            </div>

            {/* Instituição de Ensino */}
            <div>
              <label className="block text-xs font-bold text-[#1b1c1c] mb-1.5">
                Instituição de Ensino
              </label>
              <input
                type="text"
                value={createForm.schoolName}
                onChange={(e) =>
                  setCreateForm({ ...createForm, schoolName: e.target.value })
                }
                placeholder="Nome da escola atual"
                className="w-full px-4 py-3.5 bg-[#f5f3f3] border-none rounded-xl text-sm font-medium text-[#1b1c1c] placeholder:text-[#584237]/40 focus:ring-2 focus:ring-[#c2410c]/25 outline-none"
              />
            </div>
          </div>

          {/* CARD 2: Endereço Residencial */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#f0eded] shadow-sm flex flex-col gap-6">
            {/* Cabeçalho do Card */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#ffdbcb] text-[#783100] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-xl">location_on</span>
              </div>
              <div>
                <h3 className="font-extrabold text-base sm:text-lg text-[#1b1c1c] leading-tight">
                  Endereço Residencial
                </h3>
                <p className="text-xs text-[#584237]/75 font-normal">
                  Localização de residência do aluno
                </p>
              </div>
            </div>

            {/* CEP e Logradouro */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              <div className="sm:col-span-4">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-[#1b1c1c]">CEP</label>
                  {buscandoCep && (
                    <span className="text-[11px] font-bold text-[#c2410c] animate-pulse">
                      Buscando...
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={createForm.cep}
                    inputMode="numeric"
                    maxLength={9}
                    onChange={handleCepChange}
                    onBlur={handleCepBlur}
                    onKeyDown={handleCepKeyDown}
                    placeholder="00000-000"
                    className="w-full pl-4 pr-11 py-3.5 bg-[#f5f3f3] border-none rounded-xl text-sm font-medium text-[#1b1c1c] placeholder:text-[#584237]/40 focus:ring-2 focus:ring-[#c2410c]/25 outline-none"
                  />
                  <button
                    type="button"
                    disabled={buscandoCep}
                    onClick={() => buscarEnderecoPorCep(createForm.cep, true)}
                    title={buscandoCep ? "Consultando CEP no ViaCEP..." : "Buscar endereço pelo CEP"}
                    aria-label="Buscar endereço pelo CEP"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg text-[#783100] hover:text-[#c2410c] hover:bg-[#ffdbcb]/60 transition-colors cursor-pointer disabled:cursor-not-allowed"
                  >
                    <span
                      className={`material-symbols-outlined text-lg leading-none ${
                        buscandoCep ? "animate-spin text-[#c2410c]" : ""
                      }`}
                    >
                      {buscandoCep ? "progress_activity" : "search"}
                    </span>
                  </button>
                </div>
              </div>
              <div className="sm:col-span-8">
                <label className="block text-xs font-bold text-[#1b1c1c] mb-1.5">
                  Logradouro
                </label>
                <input
                  type="text"
                  value={createForm.address}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, address: e.target.value })
                  }
                  placeholder="Ex: Rua das Flores"
                  className="w-full px-4 py-3.5 bg-[#f5f3f3] border-none rounded-xl text-sm font-medium text-[#1b1c1c] placeholder:text-[#584237]/40 focus:ring-2 focus:ring-[#c2410c]/25 outline-none"
                />
              </div>
            </div>

            {/* Número, Complemento e Bairro */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#1b1c1c] mb-1.5">
                  Número
                </label>
                <input
                  ref={numeroInputRef}
                  type="text"
                  value={createForm.number}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, number: e.target.value })
                  }
                  placeholder="123"
                  className="w-full px-4 py-3.5 bg-[#f5f3f3] border-none rounded-xl text-sm font-medium text-[#1b1c1c] placeholder:text-[#584237]/40 focus:ring-2 focus:ring-[#c2410c]/25 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#1b1c1c] mb-1.5">
                  Complemento
                </label>
                <input
                  type="text"
                  value={createForm.complement}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, complement: e.target.value })
                  }
                  placeholder="Apto, Bloco, etc."
                  className="w-full px-4 py-3.5 bg-[#f5f3f3] border-none rounded-xl text-sm font-medium text-[#1b1c1c] placeholder:text-[#584237]/40 focus:ring-2 focus:ring-[#c2410c]/25 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#1b1c1c] mb-1.5">
                  Bairro
                </label>
                <input
                  type="text"
                  value={createForm.neighborhood}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, neighborhood: e.target.value })
                  }
                  placeholder="Centro"
                  className="w-full px-4 py-3.5 bg-[#f5f3f3] border-none rounded-xl text-sm font-medium text-[#1b1c1c] placeholder:text-[#584237]/40 focus:ring-2 focus:ring-[#c2410c]/25 outline-none"
                />
              </div>
            </div>

            {/* UF e Cidade */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#1b1c1c] mb-1.5">UF</label>
                <DropdownSelect
                  value={createForm.state}
                  onChange={(state) =>
                    setCreateForm({
                      ...createForm,
                      state,
                      // Trocou a UF: a cidade anterior deixa de valer.
                      city: state === createForm.state ? createForm.city : "",
                    })
                  }
                  options={OPCOES_UF}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1b1c1c] mb-1.5">
                  Cidade
                </label>
                <CidadeSelect
                  uf={createForm.state}
                  value={createForm.city}
                  onChange={(city) => setCreateForm({ ...createForm, city })}
                />
              </div>
            </div>
          </div>

          {/* CARD 3: Vincular Responsável */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#f0eded] shadow-sm flex flex-col gap-5">
            {/* Cabeçalho do Card */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#d0e4ff] text-[#00629f] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-xl">share</span>
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg text-[#1b1c1c] leading-tight">
                    Vincular Responsável
                  </h3>
                  <p className="text-xs text-[#584237]/75 font-normal">
                    Selecione ou crie um novo contato
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => router.push("/alunos/novo/responsavel")}
                className="px-4 py-2 rounded-full bg-[#ffdbcb] text-[#783100] text-xs font-bold hover:bg-[#fed7aa] transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">add_circle</span>
                <span>Criar Novo Responsável</span>
              </button>
            </div>

            {responsibles.length === 0 ? (
              <div className="border-2 border-dashed border-[#dfc0b2]/60 rounded-2xl p-8 flex flex-col items-center justify-center text-center bg-[#fbf9f8]/60">
                <div className="w-12 h-12 rounded-full bg-[#ffdbcb]/60 text-[#783100] flex items-center justify-center mb-3">
                  <span className="material-symbols-outlined text-2xl">person_add</span>
                </div>
                <h4 className="text-sm font-bold text-[#1b1c1c]">Nenhum responsável cadastrado</h4>
                <p className="text-xs text-[#584237]/70 mt-1 max-w-sm leading-relaxed">
                  Nenhuma pré-definição ativa. Utilize o botão &ldquo;Criar Novo Responsável&rdquo; acima para cadastrar e vincular.
                </p>
              </div>
            ) : (
              <>
                {/* Busca de Responsável */}
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#584237]/60 text-lg">
                    search
                  </span>
                  <input
                    type="text"
                    placeholder="Buscar responsável por nome..."
                    value={createForm.responsibleSearch}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, responsibleSearch: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-3 bg-[#f5f3f3] border-none rounded-xl text-xs font-medium text-[#1b1c1c] placeholder:text-[#584237]/40 outline-none"
                  />
                </div>

                {/* Lista de Responsáveis para Seleção */}
                <div className="flex flex-col gap-2.5">
                  {responsibles
                    .filter((r) =>
                      r.name
                        .toLowerCase()
                        .includes(createForm.responsibleSearch.toLowerCase())
                    )
                    .map((resp) => {
                      const isSelected = createForm.selectedResponsibleId === resp.id;

                      return (
                        <div
                          key={resp.id}
                          onClick={() =>
                            setCreateForm((prev) => ({
                              ...prev,
                              selectedResponsibleId: resp.id,
                            }))
                          }
                          className={`p-3 sm:p-4 rounded-2xl flex items-center justify-between cursor-pointer transition-all border ${
                            isSelected
                              ? 'bg-[#f5f3f3] border-[#dfc0b2] shadow-sm'
                              : 'bg-[#fbf9f8] border-transparent hover:bg-[#f5f3f3]'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#ffdbcb] text-[#783100] overflow-hidden shrink-0 flex items-center justify-center font-bold text-xs">
                              <span className="material-symbols-outlined text-lg">person</span>
                            </div>
                            <div>
                              <h5 className="font-extrabold text-xs sm:text-sm text-[#1b1c1c]">
                                {resp.name}
                              </h5>
                              <p className="text-[11px] text-[#584237]/70">
                                {resp.role} • {resp.phone}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {isSelected ? (
                              <div className="flex items-center gap-1.5 text-xs font-bold text-[#c2410c]">
                                <span>Selecionar</span>
                                <span className="material-symbols-outlined text-lg">
                                  check_circle
                                </span>
                              </div>
                            ) : (
                              <div className="w-5 h-5 rounded-full border-2 border-[#dfc0b2] hover:border-[#c2410c] transition-colors"></div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </>
            )}
          </div>

          {/* CARD 4: Plano Inicial */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#f0eded] shadow-sm flex flex-col gap-6">
            {/* Cabeçalho do Card */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#cbfaf6] text-[#006a65] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-xl">stars</span>
              </div>
              <div>
                <h3 className="font-extrabold text-base sm:text-lg text-[#1b1c1c] leading-tight">
                  Plano Inicial
                </h3>
                <p className="text-xs text-[#584237]/75 font-normal">
                  Selecione o pacote de acompanhamento
                </p>
              </div>
            </div>

            {/* 3 Opções de Planos (Cards) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Opção 1: Atelier 2x */}
              <div
                onClick={() =>
                  setCreateForm((prev) => ({ ...prev, selectedPlan: 'Atelier 2×' }))
                }
                className={`rounded-3xl p-5 sm:p-6 flex flex-col justify-between cursor-pointer transition-all border ${
                  createForm.selectedPlan === 'Atelier 2×'
                    ? 'bg-[#fff1e7] border-2 border-[#ea580c] shadow-sm'
                    : 'bg-[#fbf9f8] border-[#f0eded] hover:border-[#dfc0b2]'
                }`}
              >
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#c2410c] block mb-1">
                    Apoio
                  </span>
                  <h4 className="font-extrabold text-base text-[#1b1c1c] mb-2">
                    Atelier 2×
                  </h4>
                  <p className="text-xs text-[#584237]/80 leading-relaxed mb-6">
                    Foco em lição de casa e organização básica.
                  </p>
                </div>
                <div className="pt-2">
                  <span className="text-xl font-black text-[#1b1c1c]">R$ 450</span>
                  <span className="text-xs text-[#584237]/70 font-semibold">/mês</span>
                </div>
              </div>

              {/* Opção 2: Atelier Total (RECOMENDADO) */}
              <div
                onClick={() =>
                  setCreateForm((prev) => ({ ...prev, selectedPlan: 'Atelier Total' }))
                }
                className={`rounded-3xl p-5 sm:p-6 flex flex-col justify-between cursor-pointer transition-all border relative ${
                  createForm.selectedPlan === 'Atelier Total'
                    ? 'bg-[#fff1e7] border-2 border-[#ea580c] shadow-sm'
                    : 'bg-[#fbf9f8] border-[#f0eded] hover:border-[#dfc0b2]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide bg-[#ffdbcb] text-[#783100]">
                      Recomendado
                    </span>
                    {createForm.selectedPlan === 'Atelier Total' && (
                      <span className="material-symbols-outlined text-[#ea580c] text-lg">
                        check_circle
                      </span>
                    )}
                  </div>
                  <h4 className="font-extrabold text-base text-[#1b1c1c] mb-2">
                    Atelier Total
                  </h4>
                  <p className="text-xs text-[#584237]/80 leading-relaxed mb-6">
                    Acompanhamento diário e reforço focado.
                  </p>
                </div>
                <div className="pt-2">
                  <span className="text-xl font-black text-[#1b1c1c]">R$ 890</span>
                  <span className="text-xs text-[#584237]/70 font-semibold">/mês</span>
                </div>
              </div>

              {/* Opção 3: Custom Plus */}
              <div
                onClick={() =>
                  setCreateForm((prev) => ({ ...prev, selectedPlan: 'Custom Plus' }))
                }
                className={`rounded-3xl p-5 sm:p-6 flex flex-col justify-between cursor-pointer transition-all border ${
                  createForm.selectedPlan === 'Custom Plus'
                    ? 'bg-[#fff1e7] border-2 border-[#ea580c] shadow-sm'
                    : 'bg-[#fbf9f8] border-[#f0eded] hover:border-[#dfc0b2]'
                }`}
              >
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#c2410c] block mb-1">
                    Elite
                  </span>
                  <h4 className="font-extrabold text-base text-[#1b1c1c] mb-2">
                    Custom Plus
                  </h4>
                  <p className="text-xs text-[#584237]/80 leading-relaxed mb-6">
                    Plano personalizado com mentor exclusivo.
                  </p>
                </div>
                <div className="pt-2">
                  <span className="text-xl font-black text-[#1b1c1c]">Consultar</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Coluna Direita: Resumo do Cadastro (Sticky) */}
        <div className="lg:col-span-4 sticky top-24">
          <div className="bg-[#fbf9f8] rounded-3xl p-6 border border-[#f0eded] shadow-sm flex flex-col gap-6">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#584237]">
              Resumo do Cadastro
            </h4>

            <div className="flex flex-col gap-5 text-xs">
              {/* Resumo Aluno */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#ffdbcb] text-[#783100] flex items-center justify-center shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-base">person</span>
                </div>
                <div>
                  <p className="text-[11px] text-[#584237]/70 font-semibold">Aluno</p>
                  <p className="font-bold text-sm text-[#1b1c1c]">
                    {createForm.name.trim() || 'Aguardando preenchimento...'}
                  </p>
                </div>
              </div>

              {/* Resumo Responsável */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#d0e4ff] text-[#00629f] flex items-center justify-center shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-base">security</span>
                </div>
                <div>
                  <p className="text-[11px] text-[#584237]/70 font-semibold">Responsável</p>
                  {selectedResponsible ? (
                    <>
                      <p className="font-bold text-sm text-[#1b1c1c]">
                        {selectedResponsible.name}
                      </p>
                      <p className="text-[11px] text-[#584237]/75">
                        {selectedResponsible.phone}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="font-bold text-xs text-[#ba1a1a]">
                        Nenhum vinculado
                      </p>
                      <p className="text-[10px] text-[#584237]/60">
                        Aguardando criação de responsável...
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Resumo Plano */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#cbfaf6] text-[#006a65] flex items-center justify-center shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-base">shopping_bag</span>
                </div>
                <div>
                  <p className="text-[11px] text-[#584237]/70 font-semibold">Plano</p>
                  <p className="font-bold text-sm text-[#1b1c1c]">
                    {createForm.selectedPlan}
                  </p>
                  <p className="font-black text-sm text-[#c2410c]">
                    {selectedPlanPrice}
                  </p>
                </div>
              </div>
            </div>

            {/* Botão Finalizar Cadastro */}
            <div className="flex flex-col gap-3 pt-2">
              <button
                type="submit"
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#9e4300] to-[#f2711c] text-white font-extrabold text-sm sm:text-base shadow-xl shadow-[#9e4300]/25 hover:shadow-2xl hover:translate-y-[-1px] active:scale-95 transition-all text-center cursor-pointer"
              >
                Finalizar Cadastro
              </button>

              <p className="text-[10px] text-[#584237]/70 text-center leading-relaxed">
                Ao finalizar, o contrato será enviado automaticamente para assinatura digital do responsável.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
