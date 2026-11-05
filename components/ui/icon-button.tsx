import type { ButtonHTMLAttributes, ReactNode } from "react";

type Tone = "neutral" | "secondary" | "danger";

const tones: Record<Tone, string> = {
  neutral: "text-on-surface-variant hover:bg-surface-container-high",
  secondary: "text-secondary hover:bg-secondary-fixed",
  danger: "text-error hover:bg-error-container",
};

type IconButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-label"> & {
  "aria-label": string;
  tone?: Tone;
  children: ReactNode;
};

export function iconButtonClasses(tone: Tone = "neutral", className = ""): string {
  return (
    "grid size-10 place-items-center rounded-full transition active:scale-95 " +
    "focus-visible:outline-2 focus-visible:outline-primary " +
    `${tones[tone]} ${className}`
  );
}

export function IconButton({
  tone = "neutral",
  className,
  type = "button",
  title,
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      title={title ?? props["aria-label"]}
      className={iconButtonClasses(tone, className)}
      {...props}
    />
  );
}
