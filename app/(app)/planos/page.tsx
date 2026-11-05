import type { Metadata } from "next";
import { PlanosListagem } from "@/features/planos/components/planos-listagem";

export const metadata: Metadata = { title: "Planos de Aula" };

export default function PlanosPage() {
  return <PlanosListagem />;
}
