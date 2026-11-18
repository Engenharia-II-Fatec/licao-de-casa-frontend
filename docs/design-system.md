# Design system — "The Academic Atelier"

Visual acolhedor e "editorial": laranja como cor de marca, azul de apoio, verde-água para progresso,
cantos sempre arredondados e separação por camadas de cor, não por linhas.

**Fonte de verdade dos tokens: `app/globals.css` (`@theme`).** Use as classes do Tailwind geradas por
eles (`bg-primary`, `text-on-surface-variant`, `bg-surface-container-low`, `shadow-ambient`...).
Nunca escreva hex direto no componente; se faltar um token, adicione-o em `globals.css`.

## Paleta de marca
| Papel | Cor base | Tokens no código |
|---|---|---|
| Primária (laranja) | `#F2711C` | `primary` `#9e4300` (tom escuro, texto/gradiente) · `primary-container` `#f2711c` · `primary-fixed` `#ffdbcb` (realce) |
| Secundária (azul) | `#2185D0` | `secondary` `#00629f` · `secondary-container` `#5cb1ff` · `secondary-fixed` `#d0e4ff` |
| Terciária (verde-água) | `#00B5AD` | `tertiary` `#006a65` · `tertiary-container` `#00a9a1` — use para progresso/positivo |
| Neutra | `#454545` | `on-surface` `#1b1c1c` · `on-surface-variant` `#584237` · `outline` `#8c7265` |
| Erro | — | `error` `#ba1a1a` · `error-container` `#ffdad6` |

Superfícies (do mais escuro ao mais claro): `surface-container-highest` `#e4e2e2` →
`surface-container-high` `#eae8e7` → `surface-container` `#f0eded` → `surface-container-low` `#f5f3f3` →
`surface` `#fbf9f8` (fundo da página) → `surface-container-lowest` `#ffffff` (cards).

## Tipografia
**Plus Jakarta Sans** em tudo (headline, body, label), pesos 400–800.
- Títulos: espaçosos, estilo revista.
- Texto longo: `text-on-surface-variant`.
- Labels de formulário e micro-dados: tamanho pequeno, peso médio.

## Regras
- **Sem bordas de 1px para separar seções.** Separe com troca de fundo (ex.: card `surface-container-lowest`
  sobre `surface-container-low`). Se precisar de borda por acessibilidade, `outline-variant` com ~15% de opacidade.
- **Nada de canto reto.** Elementos interativos com raio ≥ 1rem; botões `rounded-full`.
- **Não usar preto puro** (`#000`) em texto: use `on-surface`.
- **Sombras**: só a ambiente (`shadow-ambient`, laranja a 5%) em modais/dropdowns; CTAs com `shadow-cta`.
  Nada de sombra padrão Material.
- **Elementos flutuantes** (toasts, menus rápidos): glassmorphism — `surface` 80% de opacidade + `backdrop-blur` 12px.
- Espaço em branco é estrutura: se ficou apertado, aumente o `gap` em vez de colocar divisor.

## Componentes
- **Botão primário**: gradiente 135° de `primary` → `primary-container`, `rounded-full`, sem borda.
- **Botão secundário**: fundo neutro claro (`surface-container-high`), texto `on-surface`.
- **Invertido**: fundo escuro (`on-surface`) com texto branco. **Outlined**: borda fina neutra, fundo transparente.
- **Inputs**: fundo `surface-container-low`, sem borda; no foco, fundo `surface-container-lowest` + anel 2px `primary`.
- **Busca**: pílula arredondada com ícone de lupa à esquerda.
- **Barras de progresso**: trilho claro, preenchimento em laranja, azul ou verde-água conforme o contexto.
- **Navegação inferior/rápida**: pílula com ícones; item ativo em círculo laranja (`primary`).
- **Botões de ícone**: círculos coloridos (laranja, azul, verde-água; vermelho `error` para excluir).
- **Tabelas/agendas**: sem bordas; linhas alternando `surface` e `surface-container-low`; horário atual
  destacado com `secondary-container`; slots com raio `0.5rem`.
- **Badges/chips de status**: pequenos, arredondados; ativo em tons de `tertiary`, inativo neutro.

Componentes prontos em `components/ui/` — reaproveite antes de criar outro.
