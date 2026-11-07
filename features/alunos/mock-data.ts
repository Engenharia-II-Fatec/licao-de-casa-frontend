import type { Aluno } from "./types";

/** Dados iniciais de demonstração, gravados só se o localStorage estiver vazio. */
export function criarSeedAlunos(): Aluno[] {
  return [
    {
      id: "2024-0891",
      name: "Arthur Meireles",
      initials: "AM",
      avatarBg: "bg-[#d0e4ff]",
      avatarText: "text-[#00629f]",
      guardian: "Clara Meireles",
      guardianRole: "Mãe • Principal",
      guardianPhone: "(11) 98765-4321",
      email: "arthur.meireles@email.com",
      address: "Rua das Palmeiras, 150 - 42",
      neighborhood: "Vila Mariana",
      city: "São Paulo",
      plan: "Trimestral",
      planPrice: "R$ 890,00",
      planBadgeType: "orange",
      status: "Ativo",
      grade: "5º Ano - Ensino Fundamental",
      shift: "Tarde (14h - 17h)",
      joinedDate: "12/01/2024",
      renewalDate: "12/04/2024",
      paymentHistory: [
        { id: "1", description: "Mensalidade Abril", date: "10/04/2024", amount: "R$ 890,00", status: "Pago" },
        { id: "2", description: "Mensalidade Maio", date: "10/05/2024", amount: "R$ 890,00", status: "Pendente" },
      ],
    },
    {
      id: "4530",
      name: "Beatriz Cavalcanti",
      initials: "BC",
      avatarBg: "bg-[#6ff7ee]/50",
      avatarText: "text-[#00504c]",
      guardian: "Ricardo Cavalcanti",
      guardianRole: "Pai • Principal",
      guardianPhone: "(11) 99123-8844",
      email: "beatriz.cavalcanti@email.com",
      address: "Av. Paulista, 1000 - Ap 81",
      neighborhood: "Bela Vista",
      city: "São Paulo",
      plan: "Plano Mensal",
      planPrice: "R$ 650,00",
      planBadgeType: "gray",
      status: "Ativo",
      grade: "7º Ano - Ensino Fundamental",
      shift: "Manhã (09h - 11h30)",
      joinedDate: "01/03/2024",
      renewalDate: "01/04/2024",
      paymentHistory: [
        { id: "1", description: "Mensalidade Abril", date: "05/04/2024", amount: "R$ 650,00", status: "Pago" },
      ],
    },
    {
      id: "4412",
      name: "Gabriel Souza",
      initials: "GS",
      avatarBg: "bg-[#ffdad6]",
      avatarText: "text-[#ba1a1a]",
      guardian: "Mariana Souza",
      guardianRole: "Mãe • Principal",
      guardianPhone: "(11) 97654-1122",
      email: "gabriel.souza@email.com",
      address: "Rua Vergueiro, 780",
      neighborhood: "Liberdade",
      city: "São Paulo",
      plan: "Particular",
      planPrice: "R$ 450,00",
      planBadgeType: "gray",
      status: "Inativo",
      grade: "3º Ano - Ensino Médio",
      shift: "Sábados (10h - 12h)",
      joinedDate: "10/08/2023",
      renewalDate: "10/09/2023",
      paymentHistory: [
        { id: "1", description: "Aula Particular Agosto", date: "10/08/2023", amount: "R$ 450,00", status: "Pago" },
      ],
    },
    {
      id: "4566",
      name: "Luiza Lima",
      initials: "LL",
      avatarBg: "bg-[#d0e4ff]",
      avatarText: "text-[#00629f]",
      guardian: "Sonia Lima",
      guardianRole: "Mãe • Principal",
      guardianPhone: "(11) 98234-7711",
      email: "luiza.lima@email.com",
      address: "Rua Domingos de Morais, 2100",
      neighborhood: "Vila Mariana",
      city: "São Paulo",
      plan: "Trimestral (Atelier)",
      planPrice: "R$ 890,00",
      planBadgeType: "orange",
      status: "Ativo",
      grade: "4º Ano - Ensino Fundamental",
      shift: "Tarde (14h - 17h)",
      joinedDate: "12/04/2024",
      renewalDate: "12/07/2024",
      paymentHistory: [
        { id: "1", description: "Mensalidade Abril", date: "12/04/2024", amount: "R$ 890,00", status: "Pago" },
      ],
    },
    {
      id: "4570",
      name: "Mateus Fontana",
      initials: "MF",
      avatarBg: "bg-[#6ff7ee]/50",
      avatarText: "text-[#00504c]",
      guardian: "Mateus Fontana", // Titular da conta! Aluno é o próprio responsável financeiro
      guardianRole: "Titular da Conta",
      guardianPhone: "(11) 99432-5566",
      email: "mateus.fontana@email.com",
      address: "Rua das Palmeiras, 150 - 42",
      neighborhood: "Vila Mariana",
      city: "São Paulo",
      plan: "Mensal (Atelier)",
      planPrice: "R$ 890,00",
      planBadgeType: "orange",
      status: "Ativo",
      grade: "6º Ano - Ensino Fundamental",
      shift: "Manhã (08h30 - 11h)",
      joinedDate: "12/01/2024",
      renewalDate: "12/04/2024",
      paymentHistory: [
        { id: "1", description: "Mensalidade Abril", date: "10/04/2024", amount: "R$ 890,00", status: "Pago" },
        { id: "2", description: "Mensalidade Maio", date: "10/05/2024", amount: "R$ 890,00", status: "Pendente" },
      ],
    },
    ...criarAlunosExtras(),
  ];
}

const AVATARES = [
  { bg: "bg-[#d0e4ff]", text: "text-[#00629f]" },
  { bg: "bg-[#6ff7ee]/50", text: "text-[#00504c]" },
  { bg: "bg-[#ffdad6]", text: "text-[#ba1a1a]" },
  { bg: "bg-[#ffdbcb]", text: "text-[#783100]" },
];

const PLANOS: { nome: string; preco: string; badge: Aluno["planBadgeType"] }[] = [
  { nome: "Trimestral", preco: "R$ 890,00", badge: "orange" },
  { nome: "Plano Mensal", preco: "R$ 650,00", badge: "gray" },
  { nome: "Particular", preco: "R$ 450,00", badge: "gray" },
  { nome: "Trimestral (Atelier)", preco: "R$ 890,00", badge: "orange" },
  { nome: "Mensal (Atelier)", preco: "R$ 890,00", badge: "orange" },
];

const TURNOS = ["Manhã (08h30 - 11h)", "Tarde (14h - 17h)", "Manhã (09h - 11h30)", "Sábados (10h - 12h)"];

/** [id, aluno, responsável (igual ao aluno = titular), papel, série, bairro, ativo?] */
const EXTRAS: [string, string, string, string, string, string, boolean][] = [
  ["4601", "Alice Ramos", "Fernanda Ramos", "Mãe", "2º Ano - Ensino Fundamental", "Moema", true],
  ["4602", "Bruno Tavares", "Paulo Tavares", "Pai", "8º Ano - Ensino Fundamental", "Pinheiros", true],
  ["4603", "Camila Duarte", "Camila Duarte", "Titular", "2º Ano - Ensino Médio", "Perdizes", true],
  ["4604", "Davi Nogueira", "Juliana Nogueira", "Mãe", "1º Ano - Ensino Fundamental", "Tatuapé", true],
  ["4605", "Eduarda Pires", "Marcos Pires", "Pai", "6º Ano - Ensino Fundamental", "Santana", false],
  ["4606", "Felipe Andrade", "Renata Andrade", "Mãe", "9º Ano - Ensino Fundamental", "Ipiranga", true],
  ["4607", "Giovana Rocha", "Sérgio Rocha", "Pai", "3º Ano - Ensino Fundamental", "Lapa", true],
  ["4608", "Heitor Martins", "Patrícia Martins", "Mãe", "5º Ano - Ensino Fundamental", "Butantã", true],
  ["4609", "Isabela Freitas", "Isabela Freitas", "Titular", "3º Ano - Ensino Médio", "Vila Madalena", true],
  ["4610", "João Pedro Alves", "Cristina Alves", "Mãe", "7º Ano - Ensino Fundamental", "Mooca", false],
  ["4611", "Larissa Moura", "André Moura", "Pai", "4º Ano - Ensino Fundamental", "Saúde", true],
  ["4612", "Miguel Barros", "Tatiane Barros", "Mãe", "1º Ano - Ensino Médio", "Jabaquara", true],
  ["4613", "Nicole Cardoso", "Eduardo Cardoso", "Pai", "8º Ano - Ensino Fundamental", "Aclimação", true],
  ["4614", "Otávio Ribeiro", "Luciana Ribeiro", "Mãe", "2º Ano - Ensino Fundamental", "Campo Belo", true],
  ["4615", "Pietra Gomes", "Roberto Gomes", "Pai", "6º Ano - Ensino Fundamental", "Brooklin", false],
  ["4616", "Rafael Teixeira", "Adriana Teixeira", "Mãe", "9º Ano - Ensino Fundamental", "Vila Prudente", true],
  ["4617", "Sofia Mendes", "Gustavo Mendes", "Pai", "3º Ano - Ensino Fundamental", "Cambuci", true],
  ["4618", "Thiago Correia", "Thiago Correia", "Titular", "2º Ano - Ensino Médio", "Liberdade", true],
  ["4619", "Valentina Costa", "Daniela Costa", "Mãe", "5º Ano - Ensino Fundamental", "Higienópolis", true],
  ["4620", "Yuri Batista", "Fábio Batista", "Pai", "7º Ano - Ensino Fundamental", "Água Branca", true],
];


/** 20 alunos adicionais de demonstração, para a lista ter mais de uma página. */
export function criarAlunosExtras(): Aluno[] {
  return EXTRAS.map(([id, nome, responsavel, papel, serie, bairro, ativo], i) => {
    const avatar = AVATARES[i % AVATARES.length];
    const plano = PLANOS[i % PLANOS.length];
    const partes = nome.split(" ");
    const usuario = nome
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/\s+/g, ".");
    const mes = String((i % 9) + 1).padStart(2, "0");
    return {
      id,
      name: nome,
      initials: `${partes[0][0]}${partes[partes.length - 1][0]}`.toUpperCase(),
      avatarBg: avatar.bg,
      avatarText: avatar.text,
      guardian: responsavel,
      guardianRole: papel === "Titular" ? "Titular da Conta" : `${papel} • Principal`,
      guardianPhone: `(11) 9${String(8100 + i * 37).padStart(4, "0")}-${String(1000 + i * 241).slice(-4)}`,
      email: `${usuario}@email.com`,
      address: `Rua Exemplo, ${100 + i * 15}`,
      neighborhood: bairro,
      city: "São Paulo",
      state: "SP",
      plan: plano.nome,
      planPrice: plano.preco,
      planBadgeType: plano.badge,
      status: ativo ? "Ativo" : "Inativo",
      grade: serie,
      shift: TURNOS[i % TURNOS.length],
      joinedDate: `10/${mes}/2024`,
      renewalDate: `10/${String(((i % 9) + 3) % 12 || 12).padStart(2, "0")}/2024`,
      paymentHistory: [
        { id: "1", description: "Mensalidade Abril", date: "10/04/2024", amount: plano.preco, status: "Pago" },
      ],
    };
  });
}
