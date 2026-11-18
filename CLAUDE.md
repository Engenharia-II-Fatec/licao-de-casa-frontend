@AGENTS.md

# Espaço Lição de Casa — Frontend

Sistema web de gestão para o **Espaço Lição de Casa**, escola de reforço escolar em Sorocaba-SP
(~200 alunos, ~30 funcionários, 9 salas). Projeto acadêmico da FATEC Sorocaba (ADS, Engenharia de
Software III, 2026/2). Equipe: Carolina Campos, João Roberto, Maria Fernanda Machado, Mateus Tognoli,
Thaís Duarte.

Antes de mexer em uma tela ou regra de negócio, leia:
- [docs/contexto-projeto.md](docs/contexto-projeto.md) — domínio, perfis, requisitos e telas previstas
- [docs/design-system.md](docs/design-system.md) — cores, tipografia e regras visuais
- [docs/fluxo-de-trabalho.md](docs/fluxo-de-trabalho.md) — git, branches, PRs e como usar o Claude na equipe

## Repositórios (org GitHub `Engenharia-II-Fatec`)
- `licao-de-casa-frontend` (este) — Next.js
- `licao-de-casa-backend` — API (ver o CLAUDE.md de lá)

## Stack
- **Next.js 16** (App Router) + **React 19** + **TypeScript** — APIs podem diferir do que você conhece:
  consulte `node_modules/next/dist/docs/` antes de usar uma API do Next (ver AGENTS.md).
  Ex.: o arquivo de middleware ainda se chama `middleware.ts` neste projeto.
- **Tailwind CSS v4** — tokens definidos em `app/globals.css` via `@theme` (não existe `tailwind.config`).
- **Prisma 6 + PostgreSQL** — schema em `prisma/schema.prisma`, migrations em `prisma/migrations/`,
  dados de exemplo em `prisma/seed.ts`. `DATABASE_URL` vem do `.env` (não versionado).
- **O back-end é este próprio repo**: rotas de API do Next em `app/api/<recurso>/route.ts` e
  `app/api/<recurso>/[id]/route.ts`, acessando o banco via `lib/prisma.ts`. O repo `licao-de-casa-backend`
  (Laravel) não está em uso.
- Auth: cookie HttpOnly com JWT (`lib/auth.ts`, `lib/auth-tokens.ts`), rotas em `app/api/auth/*`,
  proteção de rotas em `middleware.ts` (`PROTECTED_PREFIXES`).
- Fonte: Plus Jakarta Sans via `next/font` (`app/layout.tsx`).

## Comandos
```bash
npm install          # roda prisma generate no postinstall
npx prisma migrate dev   # aplica as migrations no Postgres do DATABASE_URL
npm run db:seed      # cria o usuário admin (admin@licao.com)
npm run dev          # http://localhost:3000
npm run lint
npm run build        # rode antes de abrir PR
```
Não há testes automatizados no frontend ainda.

## Arquitetura
```
app/
  page.tsx                 # login (rota "/")
  (app)/                   # área logada, com AppShell (sidebar + header)
    <modulo>/page.tsx      # listagem
    <modulo>/novo/         # cadastro
    <modulo>/[id]/editar/  # edição
  api/auth/                # login, logout, me
  api/<recurso>/           # CRUD via Prisma (alunos, planos, disciplinas, responsaveis, professores)
components/
  layout/                  # app-shell, sidebar, header, nav-config.ts
  ui/                      # componentes reutilizáveis (button, chip, data-table, toast, dialogs...)
features/<modulo>/         # lógica de cada módulo (alunos, planos)
  types.ts, constants.ts, hooks.ts, utils.ts, mock-data.ts
  components/              # componentes específicos do módulo
  services/
    <modulo>.service.ts        # interface (contrato) + erros de domínio
    <modulo>.api.ts            # implementação atual (fetch em /api/<modulo>)
    <modulo>.local-storage.ts  # implementação antiga com dados fictícios
    index.ts                   # ÚNICO ponto que escolhe a implementação
lib/                       # auth, prisma, máscaras, formatação, ViaCEP, storage
```

### Regras da arquitetura
- **Telas nunca acessam dados diretamente**: usam o service exportado em `features/<modulo>/services/index.ts`.
  O `index.ts` exporta a implementação `<modulo>.api.ts`, que chama as rotas de `app/api`.
- **Rotas de API precisam checar a sessão** (`getSession()` de `lib/auth.ts`): o `middleware.ts` só
  protege as páginas, não `/api/*`.
- **Novo módulo**: criar `features/<modulo>/` seguindo o padrão de `features/planos` ou `features/alunos`,
  rotas em `app/(app)/<modulo>/`, e trocar `implementado: true` em `components/layout/nav-config.ts`.
  Se a rota for nova, conferir se está em `PROTECTED_PREFIXES` no `middleware.ts`.
- Reutilize `components/ui/*` antes de criar componente novo. Ícones ficam em `components/ui/icons.tsx`.
- Use os tokens de cor do tema (`bg-surface`, `text-on-surface`, `bg-primary-container`...), nunca hex solto.
- Máscaras (CPF, telefone, CEP) em `lib/masks.ts`; formatação em `lib/format.ts`; CEP via `lib/viacep.ts`.

## Convenções
- Interface, mensagens, nomes de domínio e comentários em **português** (`listar`, `buscarPorId`,
  `criar`, `atualizar`, `excluir`; `Aluno`, `Plano`, `Responsavel`). Nomes técnicos genéricos em inglês são ok.
- Alias de import: `@/` aponta para a raiz do projeto.
- Componentes client precisam de `"use client"` no topo.
- Nunca commitar `.env`, banco `*.db` ou credenciais.

## Estado dos módulos
A sprint atual cobre as telas das Figuras 3–19 do protótipo e a entrega de banco de dados.
O status tela a tela e a lista de tarefas estão em [docs/tarefas-sprint.md](docs/tarefas-sprint.md);
atualize esse arquivo quando concluir uma tarefa.
