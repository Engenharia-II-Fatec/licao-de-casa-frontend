import type { Metadata } from "next";
import { AlunoNovo } from "@/features/alunos/components/aluno-novo";

export const metadata: Metadata = { title: "Cadastro de Novo Aluno" };

export default function NovoAlunoPage() {
  return <AlunoNovo />;
}
