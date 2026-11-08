/** Máscaras de entrada para campos de formulário (aplicadas a cada digitação). */

const somenteDigitos = (valor: string) => valor.replace(/\D/g, "");

/** CPF: 000.000.000-00 */
export function mascararCpf(valor: string): string {
  return somenteDigitos(valor)
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

/** RG: 00.000.000-0 (o dígito verificador pode ser "X"). */
export function mascararRg(valor: string): string {
  const limpo = valor.toUpperCase().replace(/[^\dX]/g, "");
  // "X" só é aceito como último caractere (dígito verificador).
  const corpo = limpo.slice(0, 8).replace(/X/g, "");
  const digito = limpo.length > 8 ? limpo.charAt(8) : "";
  const v = (corpo + (corpo.length === 8 ? digito : "")).slice(0, 9);
  return v
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/^(\d{2})\.(\d{3})\.(\d{3})([\dX])$/, "$1.$2.$3-$4");
}

/** Telefone: (00) 0000-0000 ou (00) 00000-0000 */
export function mascararTelefone(valor: string): string {
  const d = somenteDigitos(valor).slice(0, 11);
  if (d.length === 0) return "";
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/** CEP: 00000-000 */
export function mascararCep(valor: string): string {
  return somenteDigitos(valor)
    .slice(0, 8)
    .replace(/(\d{5})(\d)/, "$1-$2");
}

/** Data: dd/mm/aaaa */
export function mascararData(valor: string): string {
  return somenteDigitos(valor)
    .slice(0, 8)
    .replace(/(\d{2})(\d)/, "$1/$2")
    .replace(/(\d{2})\/(\d{2})(\d)/, "$1/$2/$3");
}

/** E-mail: sem espaços, em minúsculas e com no máximo um "@". */
export function mascararEmail(valor: string): string {
  const limpo = valor.replace(/\s/g, "").toLowerCase().slice(0, 254);
  const [usuario, ...resto] = limpo.split("@");
  return resto.length ? `${usuario}@${resto.join("")}` : usuario;
}
