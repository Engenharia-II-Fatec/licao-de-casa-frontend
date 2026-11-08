"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { CADASTRO_ALUNO_INICIAL } from "./constants";
import type { CadastroAlunoForm } from "./types";

interface CadastroAlunoApi {
  form: CadastroAlunoForm;
  setForm: Dispatch<SetStateAction<CadastroAlunoForm>>;
  limpar: () => void;
}

const CadastroAlunoContext = createContext<CadastroAlunoApi | null>(null);

/**
 * Mantém o rascunho do "Cadastro de Novo Aluno" enquanto o usuário vai para
 * "Cadastro de Responsável" e volta. Fica no layout de /alunos.
 */
export function CadastroAlunoProvider({ children }: { children: ReactNode }) {
  const [form, setForm] = useState<CadastroAlunoForm>(CADASTRO_ALUNO_INICIAL);
  const limpar = useCallback(() => setForm(CADASTRO_ALUNO_INICIAL), []);
  const api = useMemo(() => ({ form, setForm, limpar }), [form, limpar]);

  return <CadastroAlunoContext.Provider value={api}>{children}</CadastroAlunoContext.Provider>;
}

export function useCadastroAluno(): CadastroAlunoApi {
  const ctx = useContext(CadastroAlunoContext);
  if (!ctx) throw new Error("useCadastroAluno deve ser usado dentro de <CadastroAlunoProvider>.");
  return ctx;
}
