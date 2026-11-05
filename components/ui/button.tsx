import type { ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "secondary" | "tertiary" | "danger";
export type ButtonSize = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-bold transition " +
  "focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-primary-fixed " +
  "disabled:cursor-not-allowed disabled:opacity-60";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-linear-to-br from-primary to-primary-container text-white shadow-cta hover:shadow-cta-hover active:scale-[0.99]",
  secondary: "bg-secondary text-on-secondary hover:opacity-90 active:scale-[0.99]",
  tertiary: "bg-transparent text-on-surface hover:bg-surface-container-high",
  danger: "bg-error text-white hover:opacity-90 active:scale-[0.99]",
};

const sizes: Record<ButtonSize, string> = {
  md: "h-11 px-6 text-sm",
  lg: "h-14 px-9 text-[0.95rem]",
};

/** Use também em <Link> para links com aparência de botão. */
export function buttonClasses({
  variant = "primary",
  size = "md",
  className = "",
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}): string {
  return [base, variants[variant], sizes[size], className].filter(Boolean).join(" ");
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function Button({ variant, size, className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={buttonClasses({ variant, size, className })} {...props} />;
}
