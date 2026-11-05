import Link from "next/link";
import FormularioDisciplina from "../_components/FormularioDisciplina";

export default function NovaDisciplina() {
  return (
    <div className="text-neutral-900">
      <div className="mx-auto max-w-3xl space-y-4">
        <nav className="text-xs text-neutral-500">
          <Link href="/disciplinas" className="hover:underline">
            Disciplinas
          </Link>{" "}
          &gt; <span className="font-semibold text-[#a8501a]">Nova Disciplina</span>
        </nav>

        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Cadastro de Nova Disciplina</h1>
            <p className="text-sm text-neutral-500">
              Preencha as informações para registrar uma nova matéria na grade curricular.
            </p>
          </div>
          <Link href="/disciplinas" className="text-xs font-semibold text-[#a8501a]">
            ← Voltar para Lista
          </Link>
        </div>

        <FormularioDisciplina textoBotao="Salvar Disciplina" />
      </div>
    </div>
  );
}