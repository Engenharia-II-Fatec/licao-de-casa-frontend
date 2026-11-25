import { iniciaisDe } from "../utils";

// Cores alternadas das iniciais, todas a partir dos tokens do tema.
const CORES = [
  "bg-primary-fixed text-on-primary-fixed-variant",
  "bg-secondary-fixed text-on-secondary-fixed",
  "bg-tertiary-fixed/50 text-on-tertiary-fixed-variant",
];

export function AvatarProfessor({
  nome,
  foto,
  indice = 0,
  tamanho = "size-10 text-sm",
}: {
  nome: string;
  foto?: string;
  indice?: number;
  tamanho?: string;
}) {
  return (
    <span
      className={`grid shrink-0 place-items-center overflow-hidden rounded-full font-bold ${tamanho} ${
        CORES[indice % CORES.length]
      }`}
    >
      {foto ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={foto} alt={`Foto de ${nome}`} className="size-full object-cover" />
      ) : (
        iniciaisDe(nome)
      )}
    </span>
  );
}
