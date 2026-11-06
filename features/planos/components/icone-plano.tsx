import { IconCap } from "@/components/ui/icons";
import { ICONES_PLANO } from "../icones";
import type { IconePlanoId } from "../types";

export function IconePlano({ id, className }: { id: IconePlanoId; className?: string }) {
  const item = ICONES_PLANO.find((i) => i.id === id);
  if (!item) return <IconCap className={className} />;
  return <item.Icon className={className} />;
}
