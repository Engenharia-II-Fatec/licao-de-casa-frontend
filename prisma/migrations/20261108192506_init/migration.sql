-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "username" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'ADMIN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plano" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ATIVO',
    "valorMensal" DOUBLE PRECISION,
    "aulasIncluidas" INTEGER,
    "beneficios" TEXT NOT NULL DEFAULT '[]',
    "icone" TEXT NOT NULL DEFAULT 'school',
    "capaTipo" TEXT NOT NULL DEFAULT 'gradiente',
    "capaDe" TEXT,
    "capaPara" TEXT,
    "capaDataUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Plano_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Responsavel" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'Responsável',
    "phone" TEXT NOT NULL,
    "photo" TEXT,
    "cpf" TEXT,
    "rg" TEXT,
    "email" TEXT,
    "cep" TEXT,
    "address" TEXT,
    "number" TEXT,
    "complement" TEXT,
    "neighborhood" TEXT,
    "city" TEXT,
    "state" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Responsavel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Aluno" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "initials" TEXT NOT NULL,
    "avatarBg" TEXT NOT NULL DEFAULT 'bg-[#d0e4ff]',
    "avatarText" TEXT NOT NULL DEFAULT 'text-[#00629f]',
    "photo" TEXT,
    "guardian" TEXT NOT NULL,
    "guardianRole" TEXT,
    "guardianPhone" TEXT,
    "guardianPhoto" TEXT,
    "responsavelId" TEXT,
    "email" TEXT,
    "rg" TEXT,
    "cpf" TEXT,
    "birthDate" TEXT,
    "schoolGrade" TEXT,
    "schoolName" TEXT,
    "cep" TEXT,
    "address" TEXT,
    "number" TEXT,
    "complement" TEXT,
    "neighborhood" TEXT,
    "city" TEXT,
    "state" TEXT,
    "planoId" TEXT,
    "plan" TEXT NOT NULL DEFAULT 'Atelier Total',
    "planPrice" TEXT,
    "planBadgeType" TEXT NOT NULL DEFAULT 'orange',
    "status" TEXT NOT NULL DEFAULT 'Ativo',
    "grade" TEXT,
    "shift" TEXT,
    "joinedDate" TEXT,
    "renewalDate" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Aluno_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegistroPagamento" (
    "id" TEXT NOT NULL,
    "alunoId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pendente',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RegistroPagamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Professor" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "especialidade" TEXT NOT NULL,
    "email" TEXT,
    "telefone" TEXT,
    "foto" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Professor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Disciplina" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "ementa" TEXT,
    "cargaHoraria" INTEGER NOT NULL,
    "alunosQtd" INTEGER NOT NULL DEFAULT 0,
    "professorNome" TEXT,
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Disciplina_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DisciplinaProfessor" (
    "disciplinaId" INTEGER NOT NULL,
    "professorId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DisciplinaProfessor_pkey" PRIMARY KEY ("disciplinaId","professorId")
);

-- CreateTable
CREATE TABLE "AlunoDisciplina" (
    "alunoId" TEXT NOT NULL,
    "disciplinaId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AlunoDisciplina_pkey" PRIMARY KEY ("alunoId","disciplinaId")
);

-- CreateTable
CREATE TABLE "Agendamento" (
    "id" TEXT NOT NULL,
    "alunoId" TEXT,
    "professorId" INTEGER,
    "disciplinaId" INTEGER,
    "dataHora" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'AGENDADO',
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Agendamento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Plano_nome_key" ON "Plano"("nome");

-- AddForeignKey
ALTER TABLE "Aluno" ADD CONSTRAINT "Aluno_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "Responsavel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Aluno" ADD CONSTRAINT "Aluno_planoId_fkey" FOREIGN KEY ("planoId") REFERENCES "Plano"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroPagamento" ADD CONSTRAINT "RegistroPagamento_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "Aluno"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DisciplinaProfessor" ADD CONSTRAINT "DisciplinaProfessor_disciplinaId_fkey" FOREIGN KEY ("disciplinaId") REFERENCES "Disciplina"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DisciplinaProfessor" ADD CONSTRAINT "DisciplinaProfessor_professorId_fkey" FOREIGN KEY ("professorId") REFERENCES "Professor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlunoDisciplina" ADD CONSTRAINT "AlunoDisciplina_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "Aluno"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlunoDisciplina" ADD CONSTRAINT "AlunoDisciplina_disciplinaId_fkey" FOREIGN KEY ("disciplinaId") REFERENCES "Disciplina"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agendamento" ADD CONSTRAINT "Agendamento_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "Aluno"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agendamento" ADD CONSTRAINT "Agendamento_professorId_fkey" FOREIGN KEY ("professorId") REFERENCES "Professor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agendamento" ADD CONSTRAINT "Agendamento_disciplinaId_fkey" FOREIGN KEY ("disciplinaId") REFERENCES "Disciplina"("id") ON DELETE SET NULL ON UPDATE CASCADE;
