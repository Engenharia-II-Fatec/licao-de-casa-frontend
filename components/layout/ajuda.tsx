"use client";

import type { ReactNode } from "react";
import { InfoDialog } from "@/components/ui/info-dialog";

/**
 * Contato de suporte exibido nas telas de ajuda.
 * TODO(equipe): preencher com o e-mail/WhatsApp reais da secretaria quando definidos.
 */
export const CONTATO_SUPORTE: { email?: string; whatsapp?: string; horario: string } = {
  horario: "segunda a sexta, das 8h às 18h",
};

export type TopicoAjuda = "geral" | "suporte" | "senha" | "privacidade" | "termos" | "contato";

const TITULOS: Record<TopicoAjuda, string> = {
  geral: "Ajuda do sistema",
  suporte: "Falar com o suporte",
  senha: "Esqueceu a senha?",
  privacidade: "Privacidade",
  termos: "Termos de uso",
  contato: "Contato",
};

function Contato() {
  return (
    <div className="rounded-2xl bg-surface-container-low p-4">
      <p className="font-bold text-on-surface">Secretaria do Espaço Lição de Casa</p>
      {CONTATO_SUPORTE.email && <p>E-mail: {CONTATO_SUPORTE.email}</p>}
      {CONTATO_SUPORTE.whatsapp && <p>WhatsApp: {CONTATO_SUPORTE.whatsapp}</p>}
      {!CONTATO_SUPORTE.email && !CONTATO_SUPORTE.whatsapp && (
        <p>Procure a secretaria ou a coordenação pessoalmente ou pelos canais da escola.</p>
      )}
      <p className="text-xs">Atendimento: {CONTATO_SUPORTE.horario}.</p>
    </div>
  );
}

function Pergunta({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <details className="rounded-2xl bg-surface-container-low px-4 py-3 open:pb-4">
      <summary className="cursor-pointer font-bold text-on-surface">{titulo}</summary>
      <div className="mt-2">{children}</div>
    </details>
  );
}

function Conteudo({ topico }: { topico: TopicoAjuda }) {
  switch (topico) {
    case "senha":
      return (
        <>
          <p>
            Por segurança, a senha não é redefinida automaticamente. Peça ao{" "}
            <strong>administrador do sistema</strong> (coordenação) para cadastrar uma nova senha
            para o seu usuário.
          </p>
          <Contato />
        </>
      );
    case "privacidade":
      return (
        <>
          <p>
            Os dados de alunos e responsáveis (nome, documentos, endereço e contatos) são usados
            somente para a gestão acadêmica e financeira do Espaço Lição de Casa e ficam acessíveis
            apenas a usuários autenticados.
          </p>
          <p>
            Para solicitar correção ou remoção de dados pessoais, fale com a secretaria. A política
            de privacidade completa está em elaboração.
          </p>
        </>
      );
    case "termos":
      return (
        <p>
          O acesso é restrito a funcionários autorizados do Espaço Lição de Casa. Cada usuário é
          responsável pelas ações feitas com seu login e não deve compartilhar a senha. Os termos de
          uso completos estão em elaboração.
        </p>
      );
    case "suporte":
    case "contato":
      return (
        <>
          <p>Problemas para entrar ou usar o sistema? Fale com a secretaria:</p>
          <Contato />
        </>
      );
    case "geral":
      return (
        <>
          <p>Guia rápido das principais tarefas:</p>
          <Pergunta titulo="Como cadastrar um aluno?">
            Em <strong>Alunos → Novo Aluno</strong>, preencha nome e data de nascimento (obrigatórios),
            escolha o responsável financeiro ou marque &ldquo;Sem responsável&rdquo; e o plano, e clique em{" "}
            <strong>Finalizar Cadastro</strong>.
          </Pergunta>
          <Pergunta titulo="Aluno titular x aluno dependente">
            <strong>Dependente</strong>: tem um responsável (pai, mãe, tutor) que recebe as faturas.{" "}
            <strong>Titular</strong>: não tem responsável; o próprio aluno responde pelo financeiro.
          </Pergunta>
          <Pergunta titulo="Como vincular ou trocar o responsável de um aluno?">
            Abra o aluno na lista e use <strong>Vincular</strong> / <strong>Trocar Responsável</strong>,
            ou escolha o responsável em <strong>Editar Aluno</strong>. Depois clique em{" "}
            <strong>Salvar Alterações</strong>.
          </Pergunta>
          <Pergunta titulo="Por que não dá para excluir um cadastro?">
            Por regra da escola, nenhum cadastro é apagado. O botão de inativar (alunos, responsáveis,
            professores, disciplinas e planos) só marca o registro como <strong>Inativo</strong> e
            mantém o histórico. Para voltar a usar, clique em <strong>Reativar</strong>.
          </Pergunta>
          <Pergunta titulo="Atalhos">
            <kbd className="rounded bg-surface-container-high px-1.5 font-mono">Esc</kbd> fecha janelas;{" "}
            <kbd className="rounded bg-surface-container-high px-1.5 font-mono">Enter</kbd> no campo CEP
            busca o endereço.
          </Pergunta>
          <Contato />
        </>
      );
  }
}

/** Diálogo de ajuda por tópico (tela de login e botão "Ajuda" do cabeçalho). */
export function AjudaDialog({
  topico,
  onClose,
}: {
  topico: TopicoAjuda | null;
  onClose: () => void;
}) {
  return (
    <InfoDialog open={topico !== null} title={topico ? TITULOS[topico] : ""} onClose={onClose}>
      {topico && <Conteudo topico={topico} />}
    </InfoDialog>
  );
}
