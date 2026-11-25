import type { Metadata } from "next";
import { ResponsaveisListagem } from "@/features/responsaveis/components/responsaveis-listagem";

export const metadata: Metadata = { title: "Responsáveis" };

export default function ResponsaveisPage() {
  return <ResponsaveisListagem />;
}
