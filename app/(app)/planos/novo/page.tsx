import type { Metadata } from "next";
import { PlanoNovo } from "@/features/planos/components/plano-novo";

export const metadata: Metadata = { title: "Novo Plano" };

export default function NovoPlanoPage() {
  return <PlanoNovo />;
}
