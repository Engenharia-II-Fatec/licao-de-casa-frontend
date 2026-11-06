import type { ReactNode } from "react";

type Tone = "success" | "neutral";

const tones: Record<Tone, string> = {
  success: "bg-tertiary-fixed text-on-tertiary-fixed-variant",
  neutral: "bg-surface-container-highest text-on-surface-variant",
};

export function Badge({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold tracking-wide ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
