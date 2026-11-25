# Sprint atual — Telas das Figuras 3 a 19 + entrega de Banco de Dados

Levantamento feito em 18/11/2026 sobre a `origin/main` do frontend (commit `92f9702`).
Marque `[x]` ao concluir e coloque seu nome na frente da tarefa que pegar.

> **Arquitetura atual:** o "back" está **dentro do repo do frontend**: rotas de API do Next em
> `app/api/*` + Prisma + **PostgreSQL**. O repo `licao-de-casa-backend` (Laravel) está só com o esqueleto
> e não é usado. Os scripts SQL da entrega de BD, portanto, devem ser em **PostgreSQL (PL/pgSQL)**.

## Situação das telas

| Fig. | Tela | Front | API / Banco | Situação |
|---|---|---|---|---|
| 3 | Login | ✅ `app/page.tsx` | ✅ `/api/auth/*` | Pronta |
| 4 | Cadastro de Responsável | ✅ `alunos/novo/responsavel` | ✅ `POST /api/responsaveis` | Pronta |
| 5 | Cadastro de Aluno | ✅ `alunos/novo` | ✅ `POST /api/alunos` | Pronta |
| 6 | Listagem de Alunos | ✅ `alunos` | ✅ `GET /api/alunos` | Pronta |
| 7 | Detalhes/Edição — Aluno Independente | ✅ `aluno-titular-dialog` + `aluno-editar-dialog` | ✅ `PUT/DELETE /api/alunos/[id]` | Pronta |
| 8 | Detalhes/Edição — Aluno Dependente | ✅ `aluno-dependente-dialog` | ✅ | Pronta — "Perfil Financeiro via Responsável" leva ao perfil do responsável |
| 9 | Listagem de Responsáveis | ✅ `responsaveis` | ✅ `GET /api/responsaveis` | Pronta |
| 10 | Detalhes/Edição de Responsável | ✅ `responsaveis/[id]` | ✅ `GET/PUT/DELETE /api/responsaveis/[id]` | Pronta |
| 11 | Cadastro de Professor | ✅ `professores/novo` | ✅ `POST /api/professores` | Pronta |
| 12 | Listagem de Professores | ✅ `professores` | ✅ `GET /api/professores` | Pronta — cabeçalho, filtros e "Exportar" (planilha ou PDF) no mesmo padrão de Alunos e Responsáveis |
| 13 | Detalhes/Edição de Professor | ✅ `professores/[id]` | ✅ `GET/PUT/PATCH/DELETE /api/professores/[id]` | Pronta |
| 14 | Cadastro de Disciplina | ✅ `disciplinas/nova` | ✅ `POST /api/disciplinas` | Pronta |
| 15 | Listagem de Disciplinas | ✅ `disciplinas` | ✅ `GET/DELETE /api/disciplinas` | Pronta — estados de carregando, vazio e erro reais; exclusão só sai da tela se a API responder OK |
| 16 | Detalhes/Edição de Disciplina | ✅ `disciplinas/[id]/editar` | ✅ `GET/PUT /api/disciplinas/[id]` | Pronta — carrega a disciplina e os professores da API |
| 17 | Cadastro de Plano de Aula | ✅ `planos/novo` | ✅ | Pronta |
| 18 | Listagem de Planos de Aula | ✅ `planos` | ✅ | Pronta |
| 19 | Detalhes/Edição de Plano de Aula | ✅ `planos/[id]`, `planos/[id]/editar` | ✅ | Pronta |

**Resumo:** 17 telas, todas prontas.

---

## 0. Antes de começar (todos)
- [ ] Cada um faz `git pull` na `main` — há 6 commits do João (Prisma + Postgres + rotas de API) que mudaram bastante coisa.
- [ ] Combinar o `DATABASE_URL` do Postgres (local com Docker ou banco compartilhado) e documentar no `.env.example`.
- [ ] Rodar `npx prisma migrate dev` + `npm run db:seed` e conferir que as telas prontas funcionam com o banco.
- [ ] Decidir oficialmente o destino do repo `licao-de-casa-backend` (arquivar ou usar) e atualizar o CLAUDE.md.

## 1. Front-end

### Responsáveis (Fig. 9 e 10) — branch `feature/responsaveis`
- [x] Criar `app/(app)/responsaveis/page.tsx` — listagem com busca, filtros e paginação (seguir `alunos-listagem.tsx`).
- [x] Criar tela de detalhes/edição do responsável (`responsaveis/[id]`), com a lista de dependentes e o histórico financeiro.
- [x] Adicionar `buscarPorId`, `atualizar` e `excluir` em `ResponsaveisService` (interface + `alunos.api.ts`), ou mover para `features/responsaveis/`.
- [x] Ligar o botão "Ver Perfil Financeiro" do aluno dependente (Fig. 8) à tela do responsável.
- [x] `nav-config.ts`: `Responsáveis` → `implementado: true`.
- [x] "Vincular novo aluno" no perfil do responsável: lista os alunos cadastrados (`POST /api/responsaveis/[id]/alunos`) ou abre o cadastro de aluno com o responsável já selecionado (`/alunos/novo?responsavel=<id>`).
- [x] Base de Alunos: botão Exportar (CSV); Novo Aluno: rodapé Cancelar/Finalizar Cadastro.

### Professores (Fig. 11, 12 e 13) — branch `feature/professores`
- [x] Criar `features/professores/` (types, service, `professores.api.ts`, hooks, components), no padrão de `features/planos`.
- [x] Tela de cadastro `professores/novo` (conferir os campos no protótipo: dados pessoais, contato, disciplinas, disponibilidade/valor da hora se houver).
- [x] Tela de listagem `professores` com busca, filtro por disciplina/status e paginação.
- [x] Tela de detalhes/edição `professores/[id]` (ativar/inativar e disciplinas vinculadas).
- [x] `nav-config.ts`: `Professores` → `implementado: true`.

### Disciplinas (Fig. 15 e 16) — branch `fix/disciplinas-api`
- [x] Listagem: remover a volta aos dados fictícios; mostrar estado vazio e erro de verdade.
- [x] Edição: carregar a disciplina via `GET /api/disciplinas/[id]` e os professores via `GET /api/professores`.
- [x] Exclusão: só remover da tela se a API responder OK; mostrar toast de erro.
- [x] Criar `features/disciplinas/` (types, constants, hooks, service). Os dados fictícios foram para `features/disciplinas/mock-data.ts` e só o `prisma/seed.ts` usa.

### Planos de Aula (Fig. 19) — branch `fix/planos-navegacao`
- [x] Botão "Voltar" da edição (`planos/[id]/editar`): pelo lápis da listagem volta para `/planos`; pelo "Editar" dos detalhes (`?de=detalhes`) volta para os detalhes.

### Geral
- [ ] Verificar redundância entre as telas de detalhes e de edição (alunos, responsáveis, disciplinas, planos, professores): campos e ações repetidos, e se vale unificar em uma tela só com modo de edição.
- [ ] Verificar a padronização dos botões em todas as telas: mesmo componente (`components/ui/button`), variantes (primário/secundário/perigo), textos ("Salvar", "Cancelar", "Voltar", "Excluir"), ícones, tamanhos e posição (ex.: ações do formulário sempre no rodapé, à direita).
- [ ] Remover `mock-data.ts` e as implementações de localStorage que não são mais usadas (ou deixar só para testes).
- [ ] Conferir cada tela com o protótipo do Stitch (campos, textos, cores) e com o `docs/design-system.md`.
- [ ] Testar responsividade (celular/tablet) das telas 3–19.
- [ ] `npm run lint` e `npm run build` sem erros antes de cada PR.

## 2. Back-end (rotas de API em `app/api`)
- [x] **Segurança:** todas as rotas de `/api` (alunos, planos, disciplinas, responsáveis e professores) exigem login via `exigirSessao()` de `lib/api-auth.ts`; sem sessão respondem 401 (o `middleware.ts` só protege as páginas). Branch `fix/seguranca-api`.
- [x] `PATCH /api/responsaveis/[id]` para inativar/reativar (coluna nova `Responsavel.ativo`, migration `responsavel_ativo` — rode `npx prisma migrate dev` depois do pull).
- [x] `GET/PUT/DELETE /api/responsaveis/[id]` (com checagem de login; o PUT atualiza nome/telefone/foto nos alunos vinculados; o DELETE bloqueia com 409 se houver dependentes).
- [x] `POST /api/professores` e `GET/PUT/PATCH/DELETE /api/professores/[id]` (com login, vínculo de disciplinas e currículo em `/api/professores/[id]/curriculo`; o DELETE bloqueia com 409 se houver aulas na agenda). Migration `professor_cadastro_completo` — rode `npx prisma migrate dev` depois do pull.
- [ ] Validação dos dados no servidor (campos obrigatórios, CPF, e-mail, CEP) e mensagens de erro padronizadas.
- [ ] Tratar exclusões com vínculo (ex.: excluir responsável com dependentes → bloquear ou desvincular, conforme a regra decidida para o banco).

## 3. Banco de dados (entrega da disciplina)

### 3.1 Ajustes no modelo (para passar na normalização/3FN)
O `schema.prisma` atual tem 10 tabelas e relações 1:N e N:M, mas alguns pontos vão ser questionados:
- [ ] `Aluno` repete dados do responsável (`guardian`, `guardianRole`, `guardianPhone`, `guardianPhoto`) e do plano (`plan`, `planPrice`, `planBadgeType`) → usar só `responsavelId` e `planoId`.
- [ ] `Aluno` guarda dados de apresentação (`initials`, `avatarBg`, `avatarText`) → calcular no front.
- [ ] `Disciplina.alunosQtd` e `Disciplina.professorNome` são derivados → remover, ou manter `alunosQtd` como desnormalização **justificada**, atualizada por trigger.
- [ ] `Plano.beneficios` é JSON em texto (fere a 1FN) → tabela `plano_beneficio`, ou justificar.
- [ ] Datas e valores como texto (`birthDate`, `joinedDate`, `RegistroPagamento.date/amount`, `planPrice`) → `DATE` e `NUMERIC(10,2)`.
- [ ] Status em texto livre → `CHECK` (ex.: `status IN ('ATIVO','INATIVO')`) ou enum.
- [ ] Endereço repetido em `Aluno` e `Responsavel` → avaliar uma tabela `endereco` (ou justificar).
- [ ] Padronizar o idioma dos nomes (hoje há mistura: `name`/`nome`, `phone`/`telefone`).
- [ ] Criar a tabela `auditoria` (para o trigger de log).
- [ ] Definir e justificar `ON DELETE`/`ON UPDATE` de cada FK (hoje: `Cascade` e `SetNull`).
- [ ] Constraints que o Prisma não gera (`CHECK`) → migration SQL manual (`prisma migrate dev --create-only` e editar o SQL).

### 3.2 Documento (Markdown ou PDF)
- [ ] Contextualização do projeto (aproveitar `docs/contexto-projeto.md`) e regras de negócio que afetam os dados.
- [ ] DER atualizado e legível (dá para gerar do Prisma com `prisma-erd-generator` ou desenhar no dbdiagram/draw.io).
- [ ] Dicionário de dados: todas as tabelas, colunas, tipos, PK, FK, UNIQUE, CHECK, NOT NULL e descrição.
- [ ] Justificativa da normalização até a 3FN (e das desnormalizações mantidas).
- [ ] Justificativa de cada índice, view, function, procedure e trigger (o que faz, qual regra ou gargalo resolve, por que no banco e não na aplicação).

### 3.3 Scripts SQL (PostgreSQL, executáveis em ordem)
- [ ] `01_ddl_estrutura.sql` — tabelas, constraints e índices (pode partir de `prisma/migrations/*/migration.sql`).
- [ ] `02_dml_carga_inicial.sql` — 15 a 20 registros realistas nas tabelas principais (alunos, responsáveis, professores, disciplinas, planos, pagamentos, matrículas).
- [ ] `03_programacao_avancada.sql` — views, functions, procedures e triggers (sugestões abaixo).
- [ ] `04_testes_e_transacoes.sql` — chamadas das procedures/functions, disparo dos triggers, 2 transações com `BEGIN`/`COMMIT`/`ROLLBACK` simulando falha, e `EXPLAIN ANALYZE` antes/depois dos índices.

**Sugestões alinhadas às telas 3–19** (mínimos exigidos entre parênteses):
- **Índices (3):** `aluno(status, plano_id)` para os filtros da listagem; `aluno(lower(nome))` para a busca por nome; `aluno(responsavel_id)` para o join com responsável e a tela de dependentes; `registro_pagamento(aluno_id, status)` para pendências; `disciplina(area, ativa)` para o filtro por área.
- **Views (2, uma com 3+ tabelas e `GROUP BY`/`HAVING`):** `vw_receita_por_plano` (plano + aluno + pagamento: alunos ativos, receita prevista e valor pendente por plano, `HAVING` para planos com inadimplência); `vw_disciplinas_resumo` (disciplina + professores + alunos matriculados).
- **Functions (2):** `fn_eh_dependente(aluno_id)` (menor de idade ou com responsável vinculado); `fn_total_pendente(aluno_id ou responsavel_id)`; `fn_idade(data_nascimento)`.
- **Procedures (2, várias tabelas, parâmetros de entrada/saída, tratamento de erro):** `sp_matricular_aluno` (cria responsável se precisar, aluno, matrículas nas disciplinas e a 1ª mensalidade, numa transação); `sp_trocar_plano_aluno` (atualiza o plano e gera o novo lançamento); `sp_inativar_professor` (inativa e redistribui ou desvincula as disciplinas).
- **Triggers (2: 1 de auditoria + 1 de regra):** `trg_auditoria_aluno` / `trg_auditoria_plano` (grava em `auditoria` alteração de status, plano ou valor); `trg_valida_dependente` (impede aluno menor de 18 anos sem responsável) ou `trg_atualiza_alunos_qtd` (mantém o contador da disciplina).
- **Transações (2 cenários):** matrícula completa que falha no meio (ex.: disciplina inexistente → `ROLLBACK` de tudo); troca de plano com pagamento inválido.

### 3.4 Slides
- [ ] Slides visuais: contexto, DER, destaques da programação avançada, prints dos testes e do `EXPLAIN` antes/depois.

### 3.5 Pacote final
- [ ] Pasta `banco-de-dados/` no repo (documento + 4 scripts + slides) ou `.zip`, enviada antes da data da apresentação.
