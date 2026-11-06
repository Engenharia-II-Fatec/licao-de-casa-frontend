import { Badge } from "@/components/ui/badge";
import type { PlanoStatus } from "../types";

export function StatusBadge({ status }: { status: PlanoStatus }) {
  return <Badge tone={status === "ATIVO" ? "success" : "neutral"}>{status === "ATIVO" ? "Ativo" : "Inativo"}</Badge>;
}
