import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { criarSeedAlunos } from "../features/alunos/mock-data";
import { criarSeedPlanos } from "../features/planos/mock-data";
import { DISCIPLINAS, PROFESSORES } from "../app/(app)/disciplinas/_components/dados";

const prisma = new PrismaClient();

async function main() {
  console.log("-----------------------------------------");
  console.log("Iniciando execução do Seed completo...");
  console.log("-----------------------------------------");

  // 1. Usuário Administrador
  const adminEmail = "admin@licao.com";
  const adminUsername = "admin";
  const defaultPassword = "admin123";
  const hashedPassword = await bcrypt.hash(defaultPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: hashedPassword,
      name: "Administrador do Sistema",
      username: adminUsername,
      role: "ADMIN",
    },
    create: {
      email: adminEmail,
      username: adminUsername,
      name: "Administrador do Sistema",
      password: hashedPassword,
      role: "ADMIN",
    },
  });
  console.log(`✓ [User] Admin configurado: ${admin.email}`);

  // 2. Planos de Aula
  const planosBase = criarSeedPlanos();
  const planosExtras = [
    {
      id: "seed-trimestral",
      nome: "Trimestral",
      descricao: "Plano trimestral para acompanhamento acadêmico contínuo.",
      status: "ATIVO" as const,
      valorMensal: 890,
      aulasIncluidas: 12,
      beneficios: ["Acompanhamento Contínuo", "Relatórios Mensais"],
      icone: "auto_stories" as const,
      capa: { tipo: "gradiente" as const, de: "#9e4300", para: "#d0e4ff" },
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    },
    {
      id: "seed-plano-mensal",
      nome: "Plano Mensal",
      descricao: "Plano mensal com flexibilidade para apoio escolar regular.",
      status: "ATIVO" as const,
      valorMensal: 650,
      aulasIncluidas: 8,
      beneficios: ["Flexibilidade", "Reforço Específico"],
      icone: "draw" as const,
      capa: { tipo: "gradiente" as const, de: "#00629f", para: "#6ff7ee" },
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    },
    {
      id: "seed-particular",
      nome: "Particular",
      descricao: "Aulas individuais focadas nas dúvidas pontuais do aluno.",
      status: "ATIVO" as const,
      valorMensal: 450,
      aulasIncluidas: 4,
      beneficios: ["Atenção 100% individualizada"],
      icone: "psychology" as const,
      capa: { tipo: "gradiente" as const, de: "#783100", para: "#ffdbcb" },
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    },
    {
      id: "seed-trimestral-atelier",
      nome: "Trimestral (Atelier)",
      descricao: "Imersão trimestral com foco nas metodologias do Atelier.",
      status: "ATIVO" as const,
      valorMensal: 890,
      aulasIncluidas: 12,
      beneficios: ["Metodologia Atelier", "Oficinas Práticas"],
      icone: "school" as const,
      capa: { tipo: "gradiente" as const, de: "#9e4300", para: "#f2711c" },
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    },
    {
      id: "seed-mensal-atelier",
      nome: "Mensal (Atelier)",
      descricao: "Módulo mensal das oficinas pedagógicas do Atelier.",
      status: "ATIVO" as const,
      valorMensal: 890,
      aulasIncluidas: 8,
      beneficios: ["Oficinas Pedagógicas", "Acompanhamento Individual"],
      icone: "menu_book" as const,
      capa: { tipo: "gradiente" as const, de: "#00504c", para: "#6ff7ee" },
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    },
  ];

  const todosPlanos = [...planosBase, ...planosExtras];
  const mapaPlanosPorNome = new Map<string, string>();

  for (const plano of todosPlanos) {
    const salvo = await prisma.plano.upsert({
      where: { nome: plano.nome },
      update: {
        descricao: plano.descricao,
        status: plano.status,
        valorMensal: plano.valorMensal,
        aulasIncluidas: plano.aulasIncluidas,
        beneficios: JSON.stringify(plano.beneficios || []),
        icone: plano.icone,
        capaTipo: plano.capa.tipo,
        capaDe: plano.capa.tipo === "gradiente" ? plano.capa.de : null,
        capaPara: plano.capa.tipo === "gradiente" ? plano.capa.para : null,
        capaDataUrl: plano.capa.tipo === "imagem" ? plano.capa.dataUrl : null,
      },
      create: {
        id: plano.id,
        nome: plano.nome,
        descricao: plano.descricao,
        status: plano.status,
        valorMensal: plano.valorMensal,
        aulasIncluidas: plano.aulasIncluidas,
        beneficios: JSON.stringify(plano.beneficios || []),
        icone: plano.icone,
        capaTipo: plano.capa.tipo,
        capaDe: plano.capa.tipo === "gradiente" ? plano.capa.de : null,
        capaPara: plano.capa.tipo === "gradiente" ? plano.capa.para : null,
        capaDataUrl: plano.capa.tipo === "imagem" ? plano.capa.dataUrl : null,
      },
    });
    mapaPlanosPorNome.set(salvo.nome, salvo.id);
  }
  console.log(`✓ [Plano] ${todosPlanos.length} Planos cadastrados`);

  // 3. Professores
  const professores = [
    { id: 1, nome: "Prof. Carlos Mendes", especialidade: "Matemática", email: "carlos.mendes@licao.com", telefone: "(11) 98111-2233" },
    ...PROFESSORES,
  ];
  // Remove duplicados de id
  const profUnicos = Array.from(new Map(professores.map((p) => [p.id, p])).values());

  for (const prof of profUnicos) {
    await prisma.professor.upsert({
      where: { id: prof.id },
      update: {
        nome: prof.nome,
        especialidade: prof.especialidade,
        email: `${prof.nome.toLowerCase().replace(/[^a-z]/g, "")}@licao.com`,
      },
      create: {
        id: prof.id,
        nome: prof.nome,
        especialidade: prof.especialidade,
        email: `${prof.nome.toLowerCase().replace(/[^a-z]/g, "")}@licao.com`,
      },
    });
  }
  console.log(`✓ [Professor] ${profUnicos.length} Professores cadastrados`);

  // 4. Disciplinas
  for (const disc of DISCIPLINAS) {
    const profEncontrado = profUnicos.find((p) => p.nome === disc.professor) || profUnicos[0];

    const salva = await prisma.disciplina.upsert({
      where: { id: disc.id },
      update: {
        nome: disc.nome,
        area: disc.area,
        descricao: disc.descricao,
        cargaHoraria: disc.cargaHoraria,
        alunosQtd: disc.alunos,
        professorNome: disc.professor,
        ativa: disc.ativa,
      },
      create: {
        id: disc.id,
        nome: disc.nome,
        area: disc.area,
        descricao: disc.descricao,
        cargaHoraria: disc.cargaHoraria,
        alunosQtd: disc.alunos,
        professorNome: disc.professor,
        ativa: disc.ativa,
      },
    });

    if (profEncontrado) {
      await prisma.disciplinaProfessor.upsert({
        where: {
          disciplinaId_professorId: {
            disciplinaId: salva.id,
            professorId: profEncontrado.id,
          },
        },
        update: {},
        create: {
          disciplinaId: salva.id,
          professorId: profEncontrado.id,
        },
      });
    }
  }
  console.log(`✓ [Disciplina] ${DISCIPLINAS.length} Disciplinas cadastradas`);

  // 5. Alunos, Responsáveis e Registros de Pagamento
  const todosAlunos = criarSeedAlunos();
  const mapaResponsaveis = new Map<string, string>();

  let totalPagamentos = 0;
  for (const aluno of todosAlunos) {
    // Garante que o responsável existe
    const nomeResponsavel = aluno.guardian || aluno.name;
    let responsavelId = mapaResponsaveis.get(nomeResponsavel);

    if (!responsavelId) {
      const respSlug = `resp-${nomeResponsavel.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, "-")}`;
      const responsavelCriado = await prisma.responsavel.upsert({
        where: { id: respSlug },
        update: {
          name: nomeResponsavel,
          role: aluno.guardianRole?.split("•")[0]?.trim() || "Responsável",
          phone: aluno.guardianPhone || "(11) 98765-4321",
          city: aluno.city || "São Paulo",
          state: aluno.state || "SP",
          neighborhood: aluno.neighborhood || "Centro",
          address: aluno.address || "Rua Exemplo",
        },
        create: {
          id: respSlug,
          name: nomeResponsavel,
          role: aluno.guardianRole?.split("•")[0]?.trim() || "Responsável",
          phone: aluno.guardianPhone || "(11) 98765-4321",
          city: aluno.city || "São Paulo",
          state: aluno.state || "SP",
          neighborhood: aluno.neighborhood || "Centro",
          address: aluno.address || "Rua Exemplo",
        },
      });
      responsavelId = responsavelCriado.id;
      mapaResponsaveis.set(nomeResponsavel, responsavelId);
    }

    const planoId = mapaPlanosPorNome.get(aluno.plan) || null;

    await prisma.aluno.upsert({
      where: { id: aluno.id },
      update: {
        name: aluno.name,
        initials: aluno.initials,
        avatarBg: aluno.avatarBg,
        avatarText: aluno.avatarText,
        photo: aluno.photo || null,
        guardian: aluno.guardian,
        guardianRole: aluno.guardianRole || null,
        guardianPhone: aluno.guardianPhone || null,
        responsavelId,
        email: aluno.email || null,
        rg: aluno.rg || null,
        cpf: aluno.cpf || null,
        birthDate: aluno.birthDate || null,
        schoolGrade: aluno.schoolGrade || null,
        schoolName: aluno.schoolName || null,
        cep: aluno.cep || null,
        address: aluno.address || null,
        number: aluno.number || null,
        complement: aluno.complement || null,
        neighborhood: aluno.neighborhood || null,
        city: aluno.city || null,
        state: aluno.state || null,
        planoId,
        plan: aluno.plan,
        planPrice: aluno.planPrice || null,
        planBadgeType: aluno.planBadgeType,
        status: aluno.status,
        grade: aluno.grade || null,
        shift: aluno.shift || null,
        joinedDate: aluno.joinedDate || null,
        renewalDate: aluno.renewalDate || null,
      },
      create: {
        id: aluno.id,
        name: aluno.name,
        initials: aluno.initials,
        avatarBg: aluno.avatarBg,
        avatarText: aluno.avatarText,
        photo: aluno.photo || null,
        guardian: aluno.guardian,
        guardianRole: aluno.guardianRole || null,
        guardianPhone: aluno.guardianPhone || null,
        responsavelId,
        email: aluno.email || null,
        rg: aluno.rg || null,
        cpf: aluno.cpf || null,
        birthDate: aluno.birthDate || null,
        schoolGrade: aluno.schoolGrade || null,
        schoolName: aluno.schoolName || null,
        cep: aluno.cep || null,
        address: aluno.address || null,
        number: aluno.number || null,
        complement: aluno.complement || null,
        neighborhood: aluno.neighborhood || null,
        city: aluno.city || null,
        state: aluno.state || null,
        planoId,
        plan: aluno.plan,
        planPrice: aluno.planPrice || null,
        planBadgeType: aluno.planBadgeType,
        status: aluno.status,
        grade: aluno.grade || null,
        shift: aluno.shift || null,
        joinedDate: aluno.joinedDate || null,
        renewalDate: aluno.renewalDate || null,
      },
    });

    // Pagamentos do aluno
    if (aluno.paymentHistory && aluno.paymentHistory.length > 0) {
      for (const pag of aluno.paymentHistory) {
        const pagId = `pag-${aluno.id}-${pag.id}`;
        await prisma.registroPagamento.upsert({
          where: { id: pagId },
          update: {
            alunoId: aluno.id,
            description: pag.description,
            date: pag.date,
            amount: pag.amount,
            status: pag.status,
          },
          create: {
            id: pagId,
            alunoId: aluno.id,
            description: pag.description,
            date: pag.date,
            amount: pag.amount,
            status: pag.status,
          },
        });
        totalPagamentos++;
      }
    }

    // Matrícula em disciplinas (1 a 3 disciplinas por aluno para demonstração)
    const disc1 = (parseInt(aluno.id.replace(/\D/g, "") || "1", 10) % DISCIPLINAS.length) + 1;
    const disc2 = ((disc1 + 2) % DISCIPLINAS.length) + 1;
    for (const dId of [disc1, disc2]) {
      await prisma.alunoDisciplina.upsert({
        where: {
          alunoId_disciplinaId: {
            alunoId: aluno.id,
            disciplinaId: dId,
          },
        },
        update: {},
        create: {
          alunoId: aluno.id,
          disciplinaId: dId,
        },
      });
    }
  }

  console.log(`✓ [Responsavel] ${mapaResponsaveis.size} Responsáveis cadastrados`);
  console.log(`✓ [Aluno] ${todosAlunos.length} Alunos cadastrados com matrículas`);
  console.log(`✓ [RegistroPagamento] ${totalPagamentos} Pagamentos registrados`);

  console.log("-----------------------------------------");
  console.log(" Seed finalizado com sucesso!");
  console.log("-----------------------------------------");
}

main()
  .catch((e) => {
    console.error("Erro durante o seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
