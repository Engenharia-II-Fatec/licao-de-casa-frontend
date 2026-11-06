import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
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

  console.log("-----------------------------------------");
  console.log(" Seed executado com sucesso!");
  console.log(" Usuário Admin configurado:");
  console.log(` - ID: ${admin.id}`);
  console.log(` - Nome: ${admin.name}`);
  console.log(` - Usuário: ${admin.username}`);
  console.log(` - E-mail: ${admin.email}`);
  console.log(` - Senha padrão: ${defaultPassword}`);
  console.log(` - Perfil: ${admin.role}`);
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
