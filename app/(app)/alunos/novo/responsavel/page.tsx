import type { Metadata } from "next";
import { ResponsavelNovo } from "@/features/alunos/components/responsavel-novo";

export const metadata: Metadata = { title: "Cadastro de Responsável" };

export default function NovoResponsavelPage() {
  return <ResponsavelNovo />;
}
