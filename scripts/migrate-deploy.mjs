// Roda `prisma migrate deploy` por uma conexão DIRETA ao Postgres (sem o pooler do Neon).
//
// Por quê: o migrate usa um "advisory lock" de sessão (pg_advisory_lock). Pelo pooler
// (host com "-pooler", PgBouncer em modo transação) a sessão real do Postgres é reaproveitada
// e o lock pode ficar preso; o build seguinte espera 10 s e falha com P1002
// ("Timed out trying to acquire a postgres advisory lock").
//
// Ordem de escolha da URL: DIRECT_URL > DATABASE_URL_UNPOOLED (criada pela integração
// Neon + Vercel) > DATABASE_URL sem o "-pooler" no host. Em localhost nada muda.
import { spawnSync } from "node:child_process";

function urlDireta() {
  const explicita = process.env.DIRECT_URL || process.env.DATABASE_URL_UNPOOLED;
  if (explicita) return explicita;

  const original = process.env.DATABASE_URL;
  if (!original) {
    console.error("[migrate] DATABASE_URL não definida.");
    process.exit(1);
  }
  try {
    const url = new URL(original);
    url.hostname = url.hostname.replace("-pooler.", ".");
    url.searchParams.delete("pgbouncer");
    return url.toString();
  } catch {
    return original;
  }
}

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
const env = { ...process.env, DATABASE_URL: urlDireta() };
const host = (() => {
  try {
    return new URL(env.DATABASE_URL).hostname;
  } catch {
    return "?";
  }
})();

// Outro deploy (ex.: preview do PR e produção ao mesmo tempo) pode estar segurando o lock:
// tenta de novo algumas vezes antes de falhar o build.
const TENTATIVAS = 3;
for (let i = 1; i <= TENTATIVAS; i++) {
  console.log(`[migrate] prisma migrate deploy em ${host} (tentativa ${i}/${TENTATIVAS})`);
  const r = spawnSync("npx", ["prisma", "migrate", "deploy"], {
    env,
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  if (r.status === 0) process.exit(0);
  if (i < TENTATIVAS) await esperar(15_000);
}
process.exit(1);
