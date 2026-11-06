import type { ReactNode } from "react";
import { IconFolderEmpty } from "./icons";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-[2rem] bg-surface-container-low px-6 py-14 text-center">
      <span className="grid size-14 place-items-center rounded-2xl bg-surface-container-lowest text-primary-container shadow-ambient">
        <IconFolderEmpty className="size-7" />
      </span>
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-bold text-on-surface">{title}</h2>
        {description && (
          <p className="max-w-md text-sm text-on-surface-variant">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-2xl bg-surface-container-high ${className}`}
    />
  );
}
