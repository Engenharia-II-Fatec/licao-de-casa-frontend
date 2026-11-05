export class StorageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StorageError";
  }
}

export function lerJson<T>(chave: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const bruto = window.localStorage.getItem(chave);
    return bruto === null ? null : (JSON.parse(bruto) as T);
  } catch {
    // JSON corrompido ou storage indisponível: trata como "sem dados".
    return null;
  }
}

export function gravarJson(chave: string, valor: unknown): void {
  if (typeof window === "undefined") {
    throw new StorageError("Armazenamento local indisponível.");
  }
  try {
    window.localStorage.setItem(chave, JSON.stringify(valor));
  } catch {
    throw new StorageError(
      "Não foi possível salvar: o armazenamento do navegador está cheio ou indisponível. Tente uma imagem menor.",
    );
  }
}
