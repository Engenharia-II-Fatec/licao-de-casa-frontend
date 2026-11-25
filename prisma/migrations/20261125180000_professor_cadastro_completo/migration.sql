-- AlterTable
ALTER TABLE "Professor" ADD COLUMN     "bairro" TEXT,
ADD COLUMN     "cep" TEXT,
ADD COLUMN     "cidade" TEXT,
ADD COLUMN     "complemento" TEXT,
ADD COLUMN     "cpf" TEXT,
ADD COLUMN     "curriculoDados" TEXT,
ADD COLUMN     "curriculoNome" TEXT,
ADD COLUMN     "curriculoTipo" TEXT,
ADD COLUMN     "dataNascimento" DATE,
ADD COLUMN     "formacao" TEXT,
ADD COLUMN     "logradouro" TEXT,
ADD COLUMN     "numero" TEXT,
ADD COLUMN     "rg" TEXT,
ADD COLUMN     "uf" CHAR(2),
ADD COLUMN     "valorHoraAula" DECIMAL(10,2),
ALTER COLUMN "especialidade" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Professor_cpf_key" ON "Professor"("cpf");


-- Regra que o Prisma não gera: valor da hora/aula não pode ser negativo.
ALTER TABLE "Professor" ADD CONSTRAINT "Professor_valorHoraAula_check" CHECK ("valorHoraAula" IS NULL OR "valorHoraAula" >= 0);
