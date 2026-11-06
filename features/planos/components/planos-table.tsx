import Link from "next/link";
import { DataTable, type Column } from "@/components/ui/data-table";
import { IconButton, iconButtonClasses } from "@/components/ui/icon-button";
import { IconEye, IconPencil, IconTrash } from "@/components/ui/icons";
import { formatarMoeda } from "@/lib/format";
import type { Plano } from "../types";
import { StatusBadge } from "./status-badge";

export function PlanosTable({
  planos,
  onExcluir,
}: {
  planos: Plano[];
  onExcluir: (plano: Plano) => void;
}) {
  const colunas: Column<Plano>[] = [
    {
      key: "nome",
      header: "Nome do Plano",
      cell: (p) => (
        <Link
          href={`/planos/${p.id}`}
          className="font-semibold text-on-surface hover:text-primary hover:underline"
        >
          {p.nome}
        </Link>
      ),
    },
    {
      key: "valor",
      header: "Valor Mensal (R$)",
      cell: (p) =>
        p.valorMensal === null ? (
          <span className="italic">Consultar</span>
        ) : (
          formatarMoeda(p.valorMensal)
        ),
    },
    {
      key: "aulas",
      header: "Aulas Incluídas",
      cell: (p) =>
        p.aulasIncluidas === null ? (
          "Personalizado"
        ) : (
          `${p.aulasIncluidas} ${p.aulasIncluidas === 1 ? "aula" : "aulas"}`
        ),
    },
    { key: "status", header: "Status", cell: (p) => <StatusBadge status={p.status} /> },
    {
      key: "acoes",
      header: "Ações",
      align: "right",
      cell: (p) => (
        <div className="flex items-center justify-end gap-1">
          <Link
            href={`/planos/${p.id}`}
            aria-label={`Ver detalhes de ${p.nome}`}
            title="Ver detalhes"
            className={iconButtonClasses("neutral")}
          >
            <IconEye className="size-5" />
          </Link>
          <Link
            href={`/planos/${p.id}/editar`}
            aria-label={`Editar ${p.nome}`}
            title="Editar"
            className={iconButtonClasses("secondary")}
          >
            <IconPencil className="size-5" />
          </Link>
          <IconButton
            tone="danger"
            aria-label={`Excluir ${p.nome}`}
            title="Excluir"
            onClick={() => onExcluir(p)}
          >
            <IconTrash className="size-5" />
          </IconButton>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      caption="Lista de planos de aula"
      columns={colunas}
      rows={planos}
      getRowKey={(p) => p.id}
    />
  );
}
