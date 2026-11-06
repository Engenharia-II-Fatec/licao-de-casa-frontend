const TIPOS_ACEITOS = ["image/png", "image/jpeg", "image/webp"];
const TAMANHO_MAXIMO = 5 * 1024 * 1024;
const LARGURA_MAXIMA = 1200;

/**
 * Valida, redimensiona e comprime a imagem escolhida no dispositivo.
 * Retorna um data URL JPEG pequeno o bastante para o localStorage.
 */
export async function processarImagem(file: File): Promise<string> {
  if (!TIPOS_ACEITOS.includes(file.type)) {
    throw new Error("Formato inválido. Use PNG, JPEG ou WebP.");
  }
  if (file.size > TAMANHO_MAXIMO) {
    throw new Error("A imagem deve ter no máximo 5 MB.");
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error("Não foi possível ler a imagem selecionada.");
  }

  const escala = Math.min(1, LARGURA_MAXIMA / bitmap.width);
  const largura = Math.round(bitmap.width * escala);
  const altura = Math.round(bitmap.height * escala);

  const canvas = document.createElement("canvas");
  canvas.width = largura;
  canvas.height = altura;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Não foi possível processar a imagem.");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, largura, altura);
  ctx.drawImage(bitmap, 0, 0, largura, altura);
  bitmap.close();

  return canvas.toDataURL("image/jpeg", 0.8);
}
