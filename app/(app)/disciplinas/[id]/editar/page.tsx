import Link from "next/link";
import { notFound } from "next/navigation";
import FormularioDisciplina, {
  type DadosFormulario,
} from "../../_components/FormularioDisciplina";
import { DISCIPLINAS, PROFESSORES } from "../../_components/dados";

export default async function EditarDisciplina({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const disciplina = DISCIPLINAS.find((d) => d.id === Number(id));
  if (!disciplina) notFound();

  const professor = PROFESSORES.find((p) => p.nome === disciplina.professor);

  const inicial: DadosFormulario = {
    nome: disciplina.nome,
    cargaHoraria: String(disciplina.cargaHoraria),
    ativa: disciplina.ativa,
    area: disciplina.area,
    ementa: disciplina.descricao,
    professores: professor ? [professor.id] : [],
  };

  return (
    <div className="text-neutral-900">
      <div className="mx-auto max-w-3xl space-y-4">
        <nav className="text-xs text-neutral-500">
          <Link href="/disciplinas" className="hover:underline">
            Disciplinas
          </Link>{" "}
          &gt;{" "}
          <span className="font-semibold text-[#a8501a]">Editar: {disciplina.nome}</span>
        </nav>

        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Refinando o Currículo</h1>
            <p className="text-sm text-neutral-500">
              Mantenha as informações das disciplinas atualizadas para um melhor
              acompanhamento pedagógico.
            </p>
          </div>
          <Link href="/disciplinas" className="text-xs font-semibold text-[#a8501a]">
            ← Voltar para Lista
          </Link>
        </div>

        <FormularioDisciplina inicial={inicial} textoBotao="Salvar Alterações" />
      </div>
    </div>
  );
}