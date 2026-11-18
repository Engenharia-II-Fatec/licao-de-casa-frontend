# Fluxo de trabalho da equipe (com e sem Claude)

## Configurar uma máquina nova
1. Crie uma pasta (ex.: `Lição de Casa`) e clone os dois repositórios lado a lado:
   ```bash
   git clone https://github.com/Engenharia-II-Fatec/licao-de-casa-frontend.git
   git clone https://github.com/Engenharia-II-Fatec/licao-de-casa-backend.git
   ```
2. Frontend: crie o `.env` a partir do `.env.example` (`DATABASE_URL` do Postgres) e `AUTH_SECRET="<qualquer texto longo>"`
   (nunca commite o `.env`), depois `npm install`, `npx prisma migrate dev`, `npm run db:seed`, `npm run dev`.
3. Abra o Claude Code **dentro da pasta do repositório** em que vai trabalhar (ou na pasta-mãe, se a
   tarefa envolver front e back). O `CLAUDE.md` de cada repo é carregado automaticamente.

## Como o contexto do Claude é compartilhado
- `CLAUDE.md` (raiz de cada repo) + `docs/` → **versionados**: todo mundo recebe via `git pull`.
- `CLAUDE.local.md` → preferências pessoais (não versionar; adicione ao `.gitignore` se criar).
- A pasta `.claude/` está no `.gitignore` do frontend, então configurações em `.claude/settings.json`
  ficam só na máquina de cada um.
- Aprendeu algo que o Claude errou ou que vale para todos (uma regra, um padrão novo)? **Atualize o
  `CLAUDE.md` ou o doc relevante no mesmo PR.** Peça ao próprio Claude: "adicione isso ao CLAUDE.md".

## Git
- `main` é protegida por convenção: nada de commit direto. Trabalhe em `feature/<assunto>`
  (ex.: `feature/professores`, `feature/agendamentos`), ou `fix/<assunto>` para correções.
- Commits no padrão Conventional Commits, em português: `feat: cadastro de professores`,
  `fix: busca automática pelo cep`, `refactor:`, `docs:`, `style:`.
- Antes de abrir PR: `git pull origin main`, `npm run lint` e `npm run build` sem erros.
- PR pequeno e por módulo; pelo menos um colega revisa (coluna *Code Review* do Kanban).
- Para evitar conflito: avise no grupo qual módulo está pegando. Arquivos compartilhados que mais dão
  conflito: `components/layout/nav-config.ts`, `middleware.ts`, `app/globals.css`, `prisma/schema.prisma`.

## Pedindo tarefas ao Claude (dicas)
- Diga o módulo e a tela do protótipo: "implemente a listagem de professores (Figura 12) seguindo o padrão de `features/alunos`".
- Peça para seguir o padrão de services (localStorage agora, API depois).
- Revise o diff antes de commitar; o Claude não deve fazer push nem merge sem você pedir.
