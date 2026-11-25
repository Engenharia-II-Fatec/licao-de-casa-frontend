import type { Metadata } from "next";
import { ProfessorNovo } from "@/features/professores/components/professor-novo";

export const metadata: Metadata = { title: "Cadastro de Professor" };

export default function NovoProfessorPage() {
  return <ProfessorNovo />;
}
