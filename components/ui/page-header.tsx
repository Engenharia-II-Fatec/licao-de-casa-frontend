import Link from "next/link";
import type { ReactNode } from "react";
import { IconArrowLeft } from "./icons";

export function PageHeader({
  title,
  description,
  actions,
  backHref,
  backLabel = "Voltar",
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <div className="flex flex-col gap-4">
      {backHref && (
        <Link
          href={backHref}
          className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-secondary hover:underline"
        >
          <IconArrowLeft className="size-4" />
          {backLabel}
        </Link>
      )}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-on-surface md:text-4xl">
            {title}
          </h1>
          {description && (
            <p className="max-w-2xl text-base leading-relaxed text-on-surface-variant">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
      </div>
    </div>
  );
}
