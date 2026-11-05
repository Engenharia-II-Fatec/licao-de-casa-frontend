function luminancia(hex: string): number {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return 0;
  const n = parseInt(m[1], 16);
  const canais = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * canais[0] + 0.7152 * canais[1] + 0.0722 * canais[2];
}

/** Escolhe texto claro ou escuro para ficar legível sobre o gradiente. */
export function textoSobreGradiente(de: string, para: string): "claro" | "escuro" {
  const media = (luminancia(de) + luminancia(para)) / 2;
  return media > 0.4 ? "escuro" : "claro";
}

export function ehCorHex(valor: string): boolean {
  return /^#[0-9a-f]{6}$/i.test(valor.trim());
}
