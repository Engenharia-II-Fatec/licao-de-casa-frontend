# Contexto do projeto — Espaço Lição de Casa

Resumo do Documento de Concepção (FATEC Sorocaba, ADS, 2026/2). Fonte: `PJ-202604-11016-ES3-02.pdf`.

## O problema
A escola de reforço **Espaço Lição de Casa** (Sorocaba-SP, fundada por Ilce Karin) atende ~200 alunos
do fundamental e médio, com ~30 funcionários, aulas presenciais e online, reforço e preparação para
vestibulares/concursos. Hoje a gestão é espalhada: SimplyBook (agendamentos), Google Agenda (horários
dos professores), Excel (alunos), WhatsApp e sistemas à parte (financeiro). Isso gera retrabalho,
perda de informação, erro no cálculo do pagamento dos professores e conflito no uso das **9 salas**.

O sistema unifica: cadastros, agendamento de aulas (professor × aluno × sala), registro de aulas dadas,
financeiro (receitas, despesas, repasse a professores, inadimplência) e relatórios/dashboards.

## Metas (requisitos de negócio)
- RN01 Centralizar operações acadêmicas, administrativas e financeiras em uma plataforma web
- RN02 Reduzir em 50% o tempo de matrícula
- RN03 Reduzir em 30% o atraso de mensalidades no 1º semestre
- RN04 Migrar 100% dos alunos e responsáveis ativos em até 3 meses
- RN05 Eliminar planilhas, Google Agenda avulsa e SimplyBook

## Perfis (atores)
| Perfil | O que faz |
|---|---|
| **Administrador** | Acesso irrestrito: configurações, dashboards financeiros, relatórios, gestão de aulas dadas por professor |
| **Secretaria** | Cadastra alunos e responsáveis, gerencia financeiro e dashboard, agenda aulas |
| **Professor** | Registra disponibilidade, vê agenda, registra aula dada (presença, conteúdo, desempenho), cria e atribui questionários |
| **Responsável** | Paga mensalidades, acompanha dependentes, solicita agendamentos, vê histórico/desempenho (não responde atividades) |
| **Aluno** | Vê agenda, solicita agendamentos, responde questionários, vê desempenho |

### Aluno dependente × independente
- **Dependente** (menor / vinculado a responsável): **não** vê financeiro (faturas, checkout, histórico de
  pagamento) nem gestão de dependentes; **não** pode solicitar agendamento, só consultar a própria agenda.
  Na tela de detalhes do aluno dependente, o histórico financeiro leva ao perfil do responsável.
- **Independente** (maior de 18): acesso completo a pagamentos, contratação de planos e agendamento.
- **Responsável**: financeiro, dependentes, agendamentos; vê atividades, questionários e desempenho dos
  dependentes, mas não os responde.

## Requisitos funcionais
- **RF01** Cadastro de alunos, responsáveis, professores, disciplinas, planos de aula e questionários
- **RF02** Gestão de disponibilidade do professor
- **RF03** Agendamento, remarcação e cancelamento de aulas (presencial/online) pela secretaria/admin e
  por alunos/responsáveis — validando conflito entre agenda do professor, horário do aluno e sala
- **RF04** Notificações automáticas (e-mail/WhatsApp) sobre confirmação, alteração e cancelamento de aulas
- **RF05** Registro de aulas ministradas: presença, conteúdo, avaliação do desempenho do aluno
- **RF06** Gestão financeira: mensalidades, despesas, repasse a professores, inadimplência
- **RF07** Painel gerencial e dashboards: receitas, despesas, lucratividade, indicadores
- **RF08** Pagamento online (responsáveis e alunos 18+) via gateway (Stripe ou Asaas: boleto, PIX, cartão)

## Requisitos não funcionais
- **RNF01** Resposta em até 2 s nas operações comuns
- **RNF02** 99% de disponibilidade em horário comercial (seg–sex 9h–18h, sáb 9h–17h)
- **RNF03** Responsivo (desktop, tablet, celular) e navegação intuitiva
- **RNF04** Autenticação com controle de acesso por papel (Administrador, Secretaria, Professor, Responsável, Aluno)
- **RNF05** LGPD — atenção especial a dados de **menores de idade** (CPF, RG, endereço, foto)
- **RNF06** Arquitetura desacoplada: Next.js no front, API REST no back, MySQL, Docker, AWS

> ⚠️ O documento cita **Java/Spring Boot** no backend, mas o repositório `licao-de-casa-backend` foi criado
> em **Laravel (PHP)**. Confirmar com a equipe qual é a decisão vigente antes de implementar a API.

## Processo
Scrum + Kanban, sprints de 2 semanas, quadro To Do → In Progress → Code Review → Done.
Fases: 1) requisitos, 2) modelagem/protótipo, 3) core (API + front), 4) integrações e infra
(gateway, Docker, AWS), 5) testes e homologação.

## Telas previstas (protótipos no Google Stitch)
**Admin/Secretaria:** login · cadastro de responsável · cadastro, listagem e detalhes/edição de aluno
(independente e dependente) · listagem e detalhes de responsável · cadastro, listagem e detalhes de
professor · cadastro, listagem e detalhes de disciplina · cadastro, listagem e detalhes de plano de aula ·
gestão de aulas dadas (geral e por professor) · gestão financeira · registro de despesa · registro de pagamento.

**Professor:** dashboard · registro de disponibilidade · agenda · detalhes da aula marcada ·
cancelamento de aula · registro de aulas dadas · desempenho dos alunos · cadastro e atribuição de questionário.

**Aluno/Responsável:** tela inicial · menu · agenda · agendamento de aulas · financeiro e pagamentos ·
checkout · dependentes · perfil (plano contratado, conquistas) · atividades · histórico de atividades ·
resolução de questionário e feedback.

Os protótipos exportados do Stitch (HTML + `DESIGN.md`) estão fora do repositório, na pasta
`stitch_prot_tipo_final_tg` de quem os baixou. Diagramas de casos de uso, de classes e personas estão
no GitHub da organização.

## Glossário
- **Plano (de aula)**: pacote/plano contratado pelo aluno (nome, preço, benefícios, ícone, capa, status).
- **Disciplina**: matéria oferecida (Matemática, Português...).
- **Aula dada**: registro de uma aula realizada — base para o repasse ao professor e o histórico do aluno.
- **Repasse**: valor pago ao professor calculado a partir das aulas dadas.
