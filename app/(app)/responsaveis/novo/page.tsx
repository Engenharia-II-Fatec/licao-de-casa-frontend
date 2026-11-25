import type { Metadata } from "next";
import { ResponsavelNovo } from "@/features/alunos/components/responsavel-novo";

export const metadata: Metadata = { title: "Cadastro de Responsável" };

/** Cadastro de responsável aberto pelo menu Responsáveis (Figura 4). */
export default function NovoResponsavelPage() {
  return <ResponsavelNovo origem="responsaveis" />;
}
