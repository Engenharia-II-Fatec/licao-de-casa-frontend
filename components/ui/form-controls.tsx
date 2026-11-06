import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

const controlBase =
  "w-full rounded-2xl bg-surface-container-low text-[0.9rem] text-on-surface outline-none transition " +
  "placeholder:text-on-surface-variant/50 focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/45 " +
  "disabled:cursor-not-allowed disabled:opacity-50";
const controlError = "ring-2 ring-error/60";

export function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
  className = "",
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label htmlFor={htmlFor} className="text-sm font-semibold text-on-surface">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${htmlFor}-erro`} role="alert" className="text-xs font-medium text-error">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-on-surface-variant/70">{hint}</p>
      ) : null}
    </div>
  );
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
  /** Texto fixo à esquerda (ex.: "R$"). */
  prefixo?: string;
};

export function Input({ invalid, prefixo, className = "", id, ...props }: InputProps) {
  const input = (
    <input
      id={id}
      aria-invalid={invalid || undefined}
      aria-describedby={invalid && id ? `${id}-erro` : undefined}
      className={`h-[3.25rem] ${prefixo ? "pl-12" : "px-4"} pr-4 ${controlBase} ${
        invalid ? controlError : ""
      } ${className}`}
      {...props}
    />
  );
  if (!prefixo) return input;
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-on-surface-variant/70">
        {prefixo}
      </span>
      {input}
    </div>
  );
}

export function Textarea({
  invalid,
  className = "",
  id,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }) {
  return (
    <textarea
      id={id}
      aria-invalid={invalid || undefined}
      aria-describedby={invalid && id ? `${id}-erro` : undefined}
      className={`resize-none p-4 ${controlBase} ${invalid ? controlError : ""} ${className}`}
      {...props}
    />
  );
}

export function Select({
  invalid,
  className = "",
  id,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }) {
  return (
    <select
      id={id}
      aria-invalid={invalid || undefined}
      className={`h-[3.25rem] px-4 ${controlBase} ${invalid ? controlError : ""} ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}
