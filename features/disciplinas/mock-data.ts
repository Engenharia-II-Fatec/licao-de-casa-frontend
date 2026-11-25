/** Dados de exemplo usados só pelo `prisma/seed.ts`. As telas leem tudo da API. */
import type { Disciplina } from "./types";

export const DISCIPLINAS: Disciplina[] = [
  { id: 1, nome: "Matemática", area: "Exatas", descricao: "Desenvolvimento de raciocínio lógico, álgebra, geometria e resolução de problemas do cotidiano escolar.", cargaHoraria: 4, alunos: 28, professor: "Prof. Carlos Mendes", ativa: true },
  { id: 2, nome: "Português", area: "Linguagens", descricao: "Gramática, interpretação de texto, literatura lusófona e oficina de redação.", cargaHoraria: 3, alunos: 34, professor: "Profa. Helena Ramos", ativa: true },
  { id: 3, nome: "Inglês", area: "Idiomas", descricao: "Conversação ativa, gramática aplicada e cultura anglo-saxônica para o dia a dia.", cargaHoraria: 2, alunos: 22, professor: "Prof. Lucas Brown", ativa: true },
  { id: 4, nome: "História", area: "Humanas", descricao: "Estudo das sociedades humanas através do tempo, focando em eventos e processos.", cargaHoraria: 2, alunos: 19, professor: "Profa. Beatriz Lima", ativa: true },
  { id: 5, nome: "Física", area: "Ciências Naturais", descricao: "Mecânica, termodinâmica, óptica e física moderna com laboratório prático.", cargaHoraria: 3, alunos: 16, professor: "Prof. Marcos Rocha", ativa: true },
  { id: 6, nome: "Geografia", area: "Humanas", descricao: "Geopolítica global, cartografia, sustentabilidade ambiental e dinâmica populacional.", cargaHoraria: 2, alunos: 21, professor: "Profa. Fernanda Souza", ativa: true },
  { id: 7, nome: "Química", area: "Ciências Naturais", descricao: "Estrutura da matéria, reações químicas e experimentos de laboratório.", cargaHoraria: 3, alunos: 18, professor: "Profa. Camila Torres", ativa: true },
  { id: 8, nome: "Redação", area: "Linguagens", descricao: "Produção de textos dissertativos, argumentação e preparação para vestibulares.", cargaHoraria: 2, alunos: 25, professor: "Profa. Helena Ramos", ativa: true },
];

export const PROFESSORES = [
  { id: 1, nome: "Prof. Samuel Silva", especialidade: "Matemática" },
  { id: 2, nome: "Profa. Helena Ramos", especialidade: "Português" },
  { id: 3, nome: "Prof. Lucas Teixeira", especialidade: "Inglês" },
  { id: 4, nome: "Profa. Beatriz Lima", especialidade: "História" },
  { id: 5, nome: "Prof. Eduardo Poltronieri", especialidade: "Física" },
  { id: 6, nome: "Profa. Leonardo Campos", especialidade: "Geografia" },
  { id: 7, nome: "Profa. Diego Esquierdo", especialidade: "Química" },
];