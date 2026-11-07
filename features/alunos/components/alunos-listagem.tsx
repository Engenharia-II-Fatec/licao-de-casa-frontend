"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Skeleton } from "@/components/ui/empty-state";
import { FILTRO_PLANO_TODOS } from "../constants";
import { useAlunos } from "../hooks";
import type { Aluno, FiltroStatusAluno } from "../types";
import { ehTitular, filtrarAlunos } from "../utils";
import { AlunoDependenteDialog } from "./aluno-dependente-dialog";
import { AlunoEditarDialog } from "./aluno-editar-dialog";
import { AlunoTitularDialog } from "./aluno-titular-dialog";
import { ExcluirAlunoDialog } from "./excluir-aluno-dialog";
import { FiltrosDialog } from "./filtros-dialog";

const ALUNOS_POR_PAGINA = 10;

/**
 * Números de página a exibir. Com muitas páginas, mostra a primeira, a última e
 * as vizinhas da atual, com "..." no meio (ex.: 1 … 4 5 6 … 12).
 */
function gerarBotoesPagina(atual: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const paginas = new Set([1, total, atual - 1, atual, atual + 1]);
  const ordenadas = [...paginas].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const resultado: (number | "...")[] = [];
  ordenadas.forEach((p, i) => {
    if (i > 0 && p - ordenadas[i - 1] > 1) resultado.push("...");
    resultado.push(p);
  });
  return resultado;
}

/** Tela "Base de Alunos". */
export function AlunosListagem() {
  const { alunos, carregando, erro, recarregar } = useAlunos();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlanFilter, setSelectedPlanFilter] = useState<string>(FILTRO_PLANO_TODOS);
  const [statusFilter, setStatusFilter] = useState<FiltroStatusAluno>("Todos");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [studentDetails, setStudentDetails] = useState<Aluno | null>(null);
  const [editingStudent, setEditingStudent] = useState<Aluno | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Aluno | null>(null);

  const filteredStudents = useMemo(
    () =>
      filtrarAlunos(alunos, {
        busca: searchTerm,
        plano: selectedPlanFilter,
        status: statusFilter,
      }),
    [alunos, searchTerm, selectedPlanFilter, statusFilter],
  );

  // Paginação: volta para a página 1 sempre que a busca ou os filtros mudam.
  const chaveFiltros = `${searchTerm}|${selectedPlanFilter}|${statusFilter}`;
  const [paginacao, setPaginacao] = useState({ chave: chaveFiltros, pagina: 1 });
  const totalPaginas = Math.max(1, Math.ceil(filteredStudents.length / ALUNOS_POR_PAGINA));
  const paginaAtual = Math.min(
    paginacao.chave === chaveFiltros ? paginacao.pagina : 1,
    totalPaginas,
  );
  const irParaPagina = (pagina: number) =>
    setPaginacao({ chave: chaveFiltros, pagina: Math.min(Math.max(1, pagina), totalPaginas) });

  const inicio = (paginaAtual - 1) * ALUNOS_POR_PAGINA;
  const alunosDaPagina = filteredStudents.slice(inicio, inicio + ALUNOS_POR_PAGINA);
  const botoesPagina = gerarBotoesPagina(paginaAtual, totalPaginas);

  // Abre o modal de detalhes: "titular" (aluno é o próprio responsável) ou "dependente".
  const handleStudentNameClick = (student: Aluno) => setStudentDetails({ ...student });

  return (
    <>
                <div className="w-full flex flex-col gap-6 md:gap-8">
                  {/* Page Header Actions */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
                    <div>
                      <h3 className="text-2xl sm:text-3xl font-extrabold text-[#1b1c1c] tracking-tight">
                        Base de Alunos
                      </h3>
                      <p className="text-[#584237] mt-1 text-sm sm:text-base font-normal">
                        Gerencie os estudantes e seus planos educacionais.
                      </p>
                    </div>
                    <Link
        href="/alunos/novo"
        className="bg-gradient-to-r from-[#9e4300] to-[#f2711c] text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-full font-bold shadow-xl shadow-[#9e4300]/25 flex items-center justify-center gap-2.5 hover:translate-y-[-2px] hover:shadow-2xl hover:shadow-[#f2711c]/30 transition-all active:scale-95 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-xl sm:text-2xl">person_add</span>
                      <span>Novo Aluno</span>
      </Link>
                  </div>

                  {/* Search & Filters */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 sm:gap-4 items-center">
                    {/* Search Input */}
                    <div className="sm:col-span-2 lg:col-span-7 relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <span className="material-symbols-outlined text-[#584237]/50 group-focus-within:text-[#9e4300] transition-colors text-2xl">
                          search
                        </span>
                      </div>
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Pesquisar por nome ou responsável..."
                        className="w-full pl-12 pr-10 py-3.5 sm:py-4 bg-[#f5f3f3] border-none rounded-2xl focus:ring-2 focus:ring-[#9e4300]/20 focus:bg-white transition-all text-[#1b1c1c] font-medium placeholder:text-[#584237]/50 outline-none text-sm sm:text-base"
                      />
                      {searchTerm && (
                        <button
                          onClick={() => setSearchTerm('')}
                          className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#584237]/60 hover:text-[#1b1c1c]"
                        >
                          <span className="material-symbols-outlined text-xl">close</span>
                        </button>
                      )}
                    </div>

                    {/* Plans Dropdown */}
                    <div className="sm:col-span-1 lg:col-span-3 relative">
                      <select
                        value={selectedPlanFilter}
                        onChange={(e) => setSelectedPlanFilter(e.target.value)}
                        className="w-full px-4 py-3.5 sm:py-4 bg-[#f5f3f3] border-none rounded-2xl focus:ring-2 focus:ring-[#9e4300]/20 text-[#584237] font-medium appearance-none cursor-pointer outline-none text-sm sm:text-base pr-10"
                      >
                        <option value="Todos os Planos">Todos os Planos</option>
                        <option value="Pacote Mensal">Pacote Mensal</option>
                        <option value="Pacote Trimestral">Pacote Trimestral</option>
                        <option value="Aula Particular">Aula Particular</option>
                        <option value="Atelier">Atelier</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-[#584237]">
                        <span className="material-symbols-outlined text-xl">expand_more</span>
                      </div>
                    </div>

                    {/* Filter Button */}
                    <div className="sm:col-span-1 lg:col-span-2">
                      <button
                        onClick={() => setIsFilterModalOpen(true)}
                        className={`w-full px-4 py-3.5 sm:py-4 bg-[#e4e2e2] text-[#584237] font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-[#dbd9d9] active:scale-98 transition-all cursor-pointer text-sm sm:text-base ${
                          statusFilter !== 'Todos' ? 'ring-2 ring-[#f2711c] text-[#9e4300]' : ''
                        }`}
                      >
                        <span className="material-symbols-outlined text-lg">filter_list</span>
                        <span>Filtros</span>
                        {statusFilter !== 'Todos' && (
                          <span className="w-2 h-2 rounded-full bg-[#f2711c]"></span>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Active Filter Chips */}
                  {(searchTerm || selectedPlanFilter !== 'Todos os Planos' || statusFilter !== 'Todos') && (
                    <div className="flex flex-wrap items-center gap-2 -mt-2">
                      <span className="text-xs text-[#584237] font-semibold uppercase tracking-wider">
                        Filtros ativos:
                      </span>
                      {searchTerm && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#ffdbcb] text-[#783100] rounded-full text-xs font-bold">
                          Busca: &quot;{searchTerm}&quot;
                          <button onClick={() => setSearchTerm('')} className="hover:opacity-75">
                            ×
                          </button>
                        </span>
                      )}
                      {selectedPlanFilter !== 'Todos os Planos' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#ffdbcb] text-[#783100] rounded-full text-xs font-bold">
                          Plano: {selectedPlanFilter}
                          <button
                            onClick={() => setSelectedPlanFilter('Todos os Planos')}
                            className="hover:opacity-75"
                          >
                            ×
                          </button>
                        </span>
                      )}
                      {statusFilter !== 'Todos' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#ffdbcb] text-[#783100] rounded-full text-xs font-bold">
                          Status: {statusFilter}
                          <button onClick={() => setStatusFilter('Todos')} className="hover:opacity-75">
                            ×
                          </button>
                        </span>
                      )}
                      <button
                        onClick={() => {
                          setSearchTerm('');
                          setSelectedPlanFilter('Todos os Planos');
                          setStatusFilter('Todos');
                        }}
                        className="text-xs text-[#9e4300] hover:underline font-semibold ml-2 cursor-pointer"
                      >
                        Limpar todos
                      </button>
                    </div>
                  )}

                  {/* Students Table */}
                  <div className="bg-[#f5f3f3] rounded-3xl p-1 overflow-hidden shadow-sm border border-[#f0eded]">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="text-[#584237] text-xs sm:text-sm font-bold uppercase tracking-widest border-b border-[#eae8e7]">
                            <th className="px-6 py-5">Aluno</th>
                            <th className="px-6 py-5">RESPONSÁVEL FINANCEIRO</th>
                            <th className="px-6 py-5">Plano de Aula</th>
                            <th className="px-6 py-5">Status</th>
                            <th className="px-6 py-5 text-right">Ação</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#f0eded]">
                          {carregando || erro ? (
        <tr>
          <td colSpan={5} className="px-6 py-6 bg-white">
            {erro ? (
              <p className="text-center text-sm font-semibold text-[#ba1a1a]">{erro}</p>
            ) : (
              <div className="flex flex-col gap-3" role="status" aria-label="Carregando alunos">
                <Skeleton className="h-12" />
                <Skeleton className="h-12" />
                <Skeleton className="h-12" />
              </div>
            )}
          </td>
        </tr>
      ) : filteredStudents.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="px-6 py-12 text-center text-[#584237] bg-white">
                                <div className="flex flex-col items-center justify-center gap-2">
                                  <span className="material-symbols-outlined text-4xl text-[#584237]/40">
                                    person_search
                                  </span>
                                  <p className="font-semibold text-base">Nenhum aluno encontrado</p>
                                  <p className="text-sm text-[#584237]/70">
                                    Tente ajustar os filtros ou os termos da busca.
                                  </p>
                                </div>
                              </td>
                            </tr>
                          ) : (
                            alunosDaPagina.map((student, index) => {
                              const isEvenRow = index % 2 === 0;


                              return (
                                <tr
                                  key={student.id}
                                  className={`${
                                    isEvenRow ? 'bg-white' : 'bg-[#fbf9f8]'
                                  } hover:bg-[#fff9f5] transition-colors group`}
                                >
                                  {/* Coluna Aluno */}
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                      <div
                                        className={`w-10 h-10 rounded-full ${student.avatarBg} flex items-center justify-center ${student.avatarText} font-bold text-sm select-none shadow-sm`}
                                      >
                                        {student.initials}
                                      </div>
                                      <div>
                                        <p className="font-bold text-[#1b1c1c] text-left leading-none">
                                          {student.name}
                                        </p>
                                        <p className="text-xs text-[#584237] mt-1 font-medium">
                                          ID: {student.id}
                                        </p>
                                      </div>
                                    </div>
                                  </td>

                                  {/* Coluna Responsável Financeiro */}
                                  <td className="px-6 py-4 text-[#1b1c1c] font-medium text-sm sm:text-base">
                                    {student.guardian || '-'}
                                  </td>

                                  {/* Coluna Plano de Aula */}
                                  <td className="px-6 py-4">
                                    {student.planBadgeType === 'orange' ? (
                                      <span className="inline-block px-3 py-1 bg-[#ffdbcb] text-[#783100] rounded-full text-xs font-bold whitespace-nowrap">
                                        {student.plan}
                                      </span>
                                    ) : (
                                      <span className="inline-block px-3 py-1 bg-[#e4e2e2] text-[#584237] rounded-full text-xs font-bold whitespace-nowrap">
                                        {student.plan}
                                      </span>
                                    )}
                                  </td>

                                  {/* Coluna Status */}
                                  <td className="px-6 py-4">
                                    {student.status === 'Ativo' ? (
                                      <div className="flex items-center gap-1.5 text-[#006a65]">
                                        <span className="w-2 h-2 rounded-full bg-[#00a9a1]"></span>
                                        <span className="text-sm font-bold">Ativo</span>
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-1.5 text-[#584237]/50">
                                        <span className="w-2 h-2 rounded-full bg-[#584237]/40"></span>
                                        <span className="text-sm font-bold">Inativo</span>
                                      </div>
                                    )}
                                  </td>

                                  {/* Coluna Ações */}
                                  <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2 opacity-70 group-hover:opacity-100 transition-opacity">
                                      <button
                                        onClick={() => handleStudentNameClick(student)}
                                        className="p-2 text-[#00629f] bg-[#d0e4ff]/40 hover:bg-[#d0e4ff]/80 rounded-xl transition-all active:scale-95 cursor-pointer"
                                        title="Ver Perfil Detalhado"
                                      >
                                        <span
                                          className="material-symbols-outlined text-[20px]"
                                          style={{ fontVariationSettings: "'FILL' 1" }}
                                        >
                                          account_circle
                                        </span>
                                      </button>
                                      <button
                                        onClick={() => setEditingStudent({ ...student })}
                                        className="p-2 text-[#584237] hover:bg-[#eae8e7] rounded-xl transition-all active:scale-95 cursor-pointer"
                                        title="Editar"
                                      >
                                        <span className="material-symbols-outlined text-[20px]">
                                          edit_note
                                        </span>
                                      </button>
                                      <button
                                        onClick={() => setStudentToDelete(student)}
                                        className="p-2 text-[#ba1a1a] hover:bg-[#ffdad6]/60 rounded-xl transition-all active:scale-95 cursor-pointer"
                                        title="Excluir"
                                      >
                                        <span className="material-symbols-outlined text-[20px]">
                                          delete_outline
                                        </span>
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination & Stats Footer */}
                    <div className="p-4 sm:p-6 bg-white border-t border-[#f0eded] flex flex-col md:flex-row justify-between items-center gap-4">
                      <p className="text-sm text-[#584237]">
                        Exibindo{' '}
                        <span className="font-bold text-[#1b1c1c]">
                          {filteredStudents.length > 0
                            ? `${inicio + 1}-${inicio + alunosDaPagina.length}`
                            : '0'}
                        </span>{' '}
                        de <span className="font-bold text-[#1b1c1c]">{filteredStudents.length}</span>{' '}
                        {filteredStudents.length === 1 ? 'aluno' : 'alunos'}
                      </p>
                      <nav aria-label="Paginação" className="flex items-center gap-1.5 sm:gap-2">
                        <button
                          type="button"
                          onClick={() => irParaPagina(paginaAtual - 1)}
                          disabled={paginaAtual === 1}
                          className="px-3 sm:px-4 py-2 rounded-full bg-[#f5f3f3] text-[#584237] font-bold text-xs sm:text-sm hover:bg-[#eae8e7] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#f5f3f3]"
                        >
                          Anterior
                        </button>
                        {botoesPagina.map((pagina, i) =>
                          pagina === '...' ? (
                            <span
                              key={`reticencias-${i}`}
                              className="w-6 text-center text-[#584237]/60 font-bold text-xs sm:text-sm select-none"
                            >
                              …
                            </span>
                          ) : (
                            <button
                              key={pagina}
                              type="button"
                              onClick={() => irParaPagina(pagina)}
                              aria-current={pagina === paginaAtual ? 'page' : undefined}
                              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full font-bold text-xs sm:text-sm transition-colors cursor-pointer ${
                                pagina === paginaAtual
                                  ? 'bg-[#9e4300] text-white shadow-md shadow-[#9e4300]/20'
                                  : 'hover:bg-[#f5f3f3] text-[#584237]'
                              }`}
                            >
                              {pagina}
                            </button>
                          ),
                        )}
                        <button
                          type="button"
                          onClick={() => irParaPagina(paginaAtual + 1)}
                          disabled={paginaAtual === totalPaginas}
                          className="px-3 sm:px-4 py-2 rounded-full bg-[#f5f3f3] text-[#584237] font-bold text-xs sm:text-sm hover:bg-[#eae8e7] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#f5f3f3]"
                        >
                          Próximo
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>

      {studentDetails &&
        (ehTitular(studentDetails) ? (
          <AlunoTitularDialog
            key={studentDetails.id}
            aluno={studentDetails}
            onClose={() => setStudentDetails(null)}
            onSaved={recarregar}
          />
        ) : (
          <AlunoDependenteDialog
            key={studentDetails.id}
            aluno={studentDetails}
            onClose={() => setStudentDetails(null)}
            onSaved={recarregar}
          />
        ))}

      {editingStudent && (
        <AlunoEditarDialog
          key={editingStudent.id}
          aluno={editingStudent}
          onClose={() => setEditingStudent(null)}
          onSaved={recarregar}
        />
      )}

      {studentToDelete && (
        <ExcluirAlunoDialog
          aluno={studentToDelete}
          onClose={() => setStudentToDelete(null)}
          onDeleted={recarregar}
        />
      )}

      {isFilterModalOpen && (
        <FiltrosDialog
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          selectedPlanFilter={selectedPlanFilter}
          setSelectedPlanFilter={setSelectedPlanFilter}
          onClose={() => setIsFilterModalOpen(false)}
        />
      )}
    </>
  );
}
