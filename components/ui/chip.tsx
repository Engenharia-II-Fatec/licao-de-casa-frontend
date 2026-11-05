import { IconClose } from "./icons";

export function Chip({
  children,
  onRemove,
  removeLabel,
}: {
  children: string;
  onRemove?: () => void;
  removeLabel?: string;
}) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-secondary-fixed px-4 py-2 text-xs font-bold text-on-secondary-fixed">
      {children}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={removeLabel ?? `Remover ${children}`}
          className="grid size-4 place-items-center rounded-full transition hover:bg-on-secondary-fixed/10 focus-visible:outline-2 focus-visible:outline-secondary"
        >
          <IconClose className="size-3" />
        </button>
      )}
    </span>
  );
}
