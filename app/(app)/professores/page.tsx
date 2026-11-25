import type { Metadata } from "next";
import { ProfessoresListagem } from "@/features/professores/components/professores-listagem";

export const metadata: Metadata = { title: "Professores" };

export default function ProfessoresPage() {
  return <ProfessoresListagem />;
}
