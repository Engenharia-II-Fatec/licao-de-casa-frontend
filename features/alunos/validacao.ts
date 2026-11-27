import type { CadastroAlunoForm } from "./types";

export type CampoAluno = "name" | "birthDate" | "cpf" | "phone" | "cep";
export type ErrosAluno = Partial<Record<CampoAluno, string>>;

/** Ordem dos campos na tela: usada para focar o primeiro campo inválido. */
export const ORDEM_CAMPOS_ALUNO: CampoAluno[] = ["name", "birthDate", "cpf", "phone", "cep"];

const soDigitos = (v: string) => v.replace(/\D/g, "");

/** Valida os dígitos verificadores do CPF. */
export function cpfValido(cpf: string): boolean {
  const d = soDigitos(cpf);
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
  const digito = (base: number) => {
    let soma = 0;
    for (let i = 0; i < base; i++) soma += Number(d[i]) * (base + 1 - i);
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };
  return digito(9) === Number(d[9]) && digito(10) === Number(d[10]);
}

/** Converte "dd/mm/aaaa" em Date (ou null se a data não existir). */
export function parseDataBr(texto: string): Date | null {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(texto);
  if (!m) return null;
  const [dia, mes, ano] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const data = new Date(ano, mes - 1, dia);
  if (data.getFullYear() !== ano || data.getMonth() !== mes - 1 || data.getDate() !== dia) return null;
  return data;
}

export function formatarDataBr(data: Date): string {
  const dd = String(data.getDate()).padStart(2, "0");
  const mm = String(data.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${data.getFullYear()}`;
}

/**
 * Valida a data de nascimento "dd/mm/aaaa" (usada na tela e na API).
 * Retorna a mensagem de erro, ou null se a data for válida.
 */
export function erroDataNascimento(texto: string, hoje = new Date()): string | null {
  const nascimento = parseDataBr(texto);
  if (!nascimento) return "Data inválida. Use o formato dd/mm/aaaa.";
  if (nascimento > hoje) return "A data de nascimento não pode estar no futuro.";
  if (hoje.getFullYear() - nascimento.getFullYear() > 100) return "Confira o ano de nascimento.";
  return null;
}

/**
 * Regras do "Cadastro de Novo Aluno". Nome e data de nascimento são obrigatórios;
 * CPF, telefone e CEP são opcionais, mas precisam estar completos e válidos se preenchidos.
 */
export function validarCadastroAluno(form: CadastroAlunoForm, hoje = new Date()): ErrosAluno {
  const erros: ErrosAluno = {};

  const nome = form.name.trim();
  if (!nome) erros.name = "Informe o nome completo do aluno.";
  else if (nome.length < 3) erros.name = "O nome deve ter pelo menos 3 letras.";
  else if (!nome.includes(" ")) erros.name = "Informe nome e sobrenome.";

  if (!form.birthDate) {
    erros.birthDate = "Informe a data de nascimento.";
  } else {
    const erro = erroDataNascimento(form.birthDate, hoje);
    if (erro) erros.birthDate = erro;
  }

  if (form.cpf && !cpfValido(form.cpf)) erros.cpf = "CPF inválido. Confira os 11 números.";

  const tel = soDigitos(form.phone);
  if (tel && (tel.length < 10 || tel.length > 11))
    erros.phone = "Telefone incompleto. Informe DDD + número.";

  const cep = soDigitos(form.cep);
  if (cep && cep.length !== 8) erros.cep = "CEP incompleto. Informe os 8 números.";

  return erros;
}
