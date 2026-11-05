import { textoSobreGradiente } from "@/lib/color";
import { formatarMoeda } from "@/lib/format";
import { IconCheckCircle } from "@/components/ui/icons";
import { IconePlano } from "./icone-plano";
import type { PlanoInput } from "../types";

type PreviewDados = Pick<
  PlanoInput,
  "nome" | "descricao" | "valorMensal" | "aulasIncluidas" | "beneficios" | "icone" | "capa"
>;

export function descreverAulas(aulas: number | null): string {
  if (aulas === null) return "Aulas personalizadas";
  return `${aulas} ${aulas === 1 ? "aula mensal" : "aulas mensais"}`;
}

export function PlanoPreviewCard({ dados }: { dados: PreviewDados }) {
  const { capa } = dados;
  const textoEscuro =
    capa.tipo === "gradiente" && textoSobreGradiente(capa.de, capa.para) === "escuro";

  const fundo =
    capa.tipo === "gradiente"
      ? { backgroundImage: `linear-gradient(135deg, ${capa.de}, ${capa.para})` }
      : {
          backgroundImage: `url("${capa.dataUrl}")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        };

  const itens = [descreverAulas(dados.aulasIncluidas), ...dados.beneficios];

  return (
    <article className="overflow-hidden rounded-[2rem] bg-surface-container-lowest shadow-ambient">
      <div className="relative overflow-hidden p-7" style={fundo}>
        {capa.tipo === "imagem" && (
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-linear-to-t from-black/65 via-black/25 to-black/10"
          />
        )}
        <div className={`relative ${textoEscuro ? "text-on-surface" : "text-white"}`}>
          <div
            className={`mb-4 grid size-14 place-items-center rounded-2xl backdrop-blur-md ${
              textoEscuro ? "bg-black/10" : "bg-white/20"
            }`}
          >
            <IconePlano id={dados.icone} className="size-7" />
          </div>
          <h3 className="mb-1 break-words text-2xl font-black leading-tight">
            {dados.nome.trim() || "Nome do plano"}
          </h3>
          <p className={`text-sm ${textoEscuro ? "text-on-surface/80" : "text-white/85"}`}>
            {dados.descricao.trim() || "A descrição do plano aparece aqui."}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-6 p-7">
        <div className="flex items-baseline gap-1">
          {dados.valorMensal === null ? (
            <span className="text-3xl font-black text-on-surface">Consultar</span>
          ) : (
            <>
              <span className="text-3xl font-black text-on-surface">
                {formatarMoeda(dados.valorMensal)}
              </span>
              <span className="text-sm font-medium text-on-surface-variant">/mês</span>
            </>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <p className="text-xs font-black uppercase tracking-wider text-outline">
            O que está incluso:
          </p>
          <ul className="flex flex-col gap-3">
            {itens.map((item, i) => (
              <li key={`${item}-${i}`} className="flex items-center gap-3 text-sm text-on-surface-variant">
                <IconCheckCircle className="size-5 shrink-0 text-tertiary" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div
          aria-hidden="true"
          className="rounded-full border-2 border-primary py-3 text-center text-sm font-bold text-primary"
        >
          Selecionar Plano
        </div>
      </div>
    </article>
  );
}
