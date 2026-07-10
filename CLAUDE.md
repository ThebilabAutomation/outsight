# Be OutSight — Demo (VELLA)

Demo funcional do **Be OutSight** (spin-off da Be Intelligence): agente de IA conversacional que conecta dados internos de uma marca fashion multicanal (**VELLA**, fictícia) ao contexto externo (social listening) e entrega recomendações prescritivas. Público da demo: decisores de Marketing, Produto, PR e Comunicação.

**Live:** https://beoutsight.netlify.app · **Repo:** https://github.com/ThebilabAutomation/outsight

## Regra nº 0: reprodutibilidade com dados reais (decisão do Antonio, 09/jul)

**Nenhuma análise, insight ou métrica entra na demo se não for reproduzível com dados reais coletáveis.** Antes de adicionar qualquer coisa, responder: (1) qual a fonte real (GA/Hotjar, CRM, ERP, social listening, SAC, pesquisa, ads platform)? (2) como o número é calculado na prática? (3) a coleta é viável para e-commerce de médio porte? Se falhar em algum, ajustar ou descartar. Itens que exigem definição metodológica (ex: operacionalização das notas do BI, índice de intenção de compra) devem ser validados com a Perla antes de virar feature. Engenharia de dados vem antes de UI bonita.

## Regra de ouro: consistência de dados em 3 lugares

Os números da demo existem em **três lugares que DEVEM estar sempre sincronizados**. Qualquer mudança de dado exige atualizar os três:

1. `public/js/data.js` — dataset que alimenta a interface (const `VELLA`)
2. `netlify/functions/chat.mjs` — `SYSTEM_PROMPT` com os mesmos números para a IA
3. `public/js/app.js` — função `offlineAnswer()` com respostas de fallback

Se um número divergir entre interface e resposta da IA, a demo perde credibilidade na frente do cliente.

## Metodologia Behavior Index (nunca alterar as fórmulas)

- **BI = IM − IE** (metodologia © Be Intelligence / Perla Amabile)
- IM (Motivação) = (Desejo + Necessidade + Urgência) / 3 — notas 1–5
- IE (Esforço) = (Financeiro + Cognitivo + Físico + Tempo + Emocional) / 5 — notas 1–5
- Interpretação no código (`biVarName`/`biTag` em app.js): BI ≥ 0,5 → AÇÃO · BI ≤ −0,1 → INAÇÃO · entre → PONTO CRÍTICO
- Em `data.js`, IM/IE/BI são **calculados** pela função `makeBI()` a partir das notas — nunca escrever im/ie/bi na mão

## Os 3 pilares (direcionais da Perla — áudio de 09/jul/2026)

Toda feature nova deve servir a pelo menos um pilar:
1. **Problema** — "por que parou de vender?" SEMPRE separando causa interna (usabilidade/funil) de externa (percepção/redes). Casos: Saia Lume = bug interno; Casaco Vega = viral externo.
2. **Novos produtos** — demanda latente cruzando menções externas com buscas internas (plus size, Maré verde-oliva, "Noiva Civil").
3. **Público & campanha** — público real vs. pretendido, ROAS por cluster.

## Decisões da Perla (validadas em 09/jul, WhatsApp + áudios)

- **Nome**: o módulo é **"Consumer Insights"**; o Behavior Index é UMA ferramenta de medição dentro dele. As 4 lentes (cultura, vieses, crenças, motivações) vêm ANTES do BI na apresentação.
- **Posicionamento**: o diferencial NÃO é diagnóstico de performance/growth (commodity — outras IAs agênticas já fazem). É **substituir o investimento em pesquisa** que a indústria faz e o e-commerce médio não tem margem para fazer: posicionamento, novos produtos, jornadas. Discurso de "pesquisa democratizada".
- **Notas do BI na prática**: a IA estima cada nota de motivação/esforço cruzando dados quali + quanti (conversas sociais, SAC, avaliações, pesquisas do cliente, GA). Nunca autoavaliação.
- **IIC (Índice de Intenção de Compra)**: composto de CTR qualificado + add-to-cart do tráfego + brand lift. Aprovado.
- **Prioridades da demo**: Posicionamento/Marca, Marketing e Jornada.
- **SAC listening**: coleta via ferramenta do cliente (WhatsApp Business e afins), com acesso aos dados do cliente.

## Views da interface

Copilot (chat) · Behavior Index · Sinais & Dados · **Trends** (radar externo fashion: picos anotados A/B com callouts de drivers, ranking com sparklines SVG, share of voice, conversas por categoria, nuvem de temas) · Alertas. Trends é 100% fictício por decisão de produto — APIs reais (Google Trends alpha, TikTok Commercial Content API, X pago) ficam para o roadmap de produção via Netlify Functions dedicadas.

Chat tem toolbar com "Baixar conversa" (.txt) e "Limpar" (restaura o hero com os chips); prompts sugeridos são GENÉRICOS (user básico não conhece os dados internos — nunca citar produto/número no chip) e os 3 pilares ficam em colunas horizontais. Sinais & Dados e Trends têm botão "✦ Pedir leitura da IA" no header. Sinais tem filtro de período (7/30/60/90d) que re-renderiza KPIs (`renderKPIs`) e gráficos; todos os gráficos têm tooltip `mode: index` com valor + variação vs dia/semana anterior. Consumer Insights tem gauge animado (`animateGauge`) com filtro de período (`biPorPeriodo` em data.js) e análise dinâmica. Alertas tem aside "Como um alerta nasce". Modal "?" (guia do usuário) no topbar explica metodologia, fontes, alertas e IA (GPT-4o). Gráficos são lazy (`buildCharts`/`buildTrendsCharts`/`buildBiCharts` + flags) e reconstruídos na troca de tema/período via `chartInstances`. Logos de fontes em `public/img/`.

## Autenticação (Supabase)

- Login por e-mail/senha via popup (`public/js/auth.js` + modal no index.html). Config pública em `public/js/config.js` (SUPABASE_URL + publishable/anon key — são valores públicos por design, podem ser commitados).
- **Rollout seguro**: enquanto o config estiver com placeholder `COLE_AQUI_*`, o gate fica DESATIVADO (app abre direto e a function não exige token). Ao preencher, o gate ativa em front e back.
- A function `chat.mjs` valida o token (`Authorization: Bearer`) contra `{SUPABASE_URL}/auth/v1/user` antes de chamar a OpenAI — protege os créditos. Mesmos valores no topo do chat.mjs (ou env vars SUPABASE_URL/SUPABASE_ANON_KEY no Netlify, que têm precedência).
- Sem cadastro na UI: usuários são criados no dashboard do Supabase (Authentication → Users → Add user, com auto-confirm). Projeto Supabase: "Outsight project" (org ThebilabAutomation) — NÃO acessível pelo MCP conectado (que enxerga outra conta).
- Sessão persiste via supabase-js (localStorage); logout no chip do usuário no topbar.
- **Kill switch do chat (proteção de créditos OpenAI)**: a function lê `public.app_config` (key `chat_enabled`) no Supabase antes de chamar a OpenAI — cache de 60s por instância. Liga/desliga no Table Editor do Supabase (value `true`/`false`), sem redeploy. Se a tabela não existir, assume LIGADO. Front mostra "agente pausado" quando `disabled: true` (sem cair no fallback offline).

## Arquitetura

- **Site estático** em `public/` — vanilla JS, sem build. Chart.js e marked.js via CDN.
- **Função serverless** `netlify/functions/chat.mjs` — proxy OpenAI, rota `/api/chat` (via `config.path`, sem redirect no netlify.toml). Modelo: `OPENAI_MODEL` ou `gpt-4o`.
- **Env vars no Netlify**: `OPENAI_API_KEY` (obrigatória — já configurada), `OPENAI_MODEL` (opcional).
- Chat: front envia `{messages: [...]}`; IA pode emitir bloco ```` ```bi-card ```` com JSON que o front renderiza como card visual (barras IM/IE) — manter esse contrato.

## Tema claro/escuro

- **Identidade visual OFICIAL (guideline da Perla em `Guideline/`, aplicada 09/jul)**: marca **OUTSIGHT** — wordmark caixa alta com letter-spacing largo, símbolo **◎** (círculos concêntricos), paleta **amarelo #FFDE14 + preto #141414 + branco + cinza claro**, linguagem flat (sem gradientes chamativos). Spans `.grad` = destaque "marca-texto" amarelo com texto preto. Amarelo/preto são acentos de MARCA; verde/vermelho/âmbar continuam como cores SEMÂNTICAS de dados (não misturar). Base de layout: linha Metricool — fundo cinza claro, cards brancos com sombra sutil, topbar preta, tipografia Plus Jakarta Sans + Inter. **PROIBIDO roxo/azul/preto-marinho**. Light é o tema PADRÃO; dark é grafite neutro com nav ativa amarela.
- **Todas as cores via CSS vars** em `:root` (light, padrão) e `:root[data-theme="dark"]` em `style.css`. NUNCA hardcodar hex em estilos inline no app.js — usar `"var(--pos)"` etc. Topbar tem vars próprias (`--topbar-*`) pois é escura nos dois temas.
- Chave do localStorage: `outsight-theme-v2` (a v1 foi aposentada quando o padrão virou light).
- Canvas (gauges, Chart.js) não aceita `var()`: resolver com o helper `cssVar()` e **redesenhar na troca de tema** (gauges via `drawAllGauges()`, charts destruídos/reconstruídos via `chartInstances`).
- Anti-flash: script inline no `<head>` do index.html aplica o tema do localStorage antes do CSS.

## Narrativa dos dados (não contradizer)

- Casaco Vega: crise EXTERNA (viral TikTok do zíper 24/jun, conversão −25,3%, BI −0,28)
- Saia Lume: queda INTERNA (bug do filtro mobile desde release 2.9 de 28/jun, −44,6% produto→carrinho)
- Trench Coat Maré: oportunidade (BI +2,10, 85% aprovação, pedido de verde-oliva)
- Demanda reprimida plus size: 3.900 buscas internas/mês sem resultado
- Insight de choque: Constelação usado como vestido de casamento civil
- Campanha institucional "Sempre VELLA" desalinhada (ROAS 1,4; 61% do engajamento fora do alvo)
- Omnichannel: 4 lojas (Jardins, Center Norte, Barra, Savassi), ROPO 68%, click & collect 14%

## Convenções

- **Idioma**: tudo em pt-BR (interface, respostas da IA, commits podem ser pt-BR)
- **VELLA, paleta e layout são provisórios**: a Perla vai enviar identidade visual (logo, paleta, nome da marca da história). Quando chegar, trocar nas CSS vars e renomear a marca em data.js + chat.mjs + index.html.
- `Materiais/` está no .gitignore (pitch, PDFs, transcrições confidenciais) — **nunca commitar**
- Git: este repo é ANINHADO (o home do usuário também é repo git) — sempre rodar git dentro da pasta do projeto
- A IA deve sempre sinalizar "⚠️ Checagem de viés" quando houver risco de leitura enviesada (ancoragem, disponibilidade, confirmação, manada, halo, framing, custos irrecuperáveis, sobrevivência etc.)

## Como testar

```bash
node --check public/js/app.js public/js/data.js netlify/functions/chat.mjs
```
Smoke test visual: servir `public/` com http.server + Playwright (python, disponível na máquina), screenshot das 4 views **nos dois temas**. Testar o chat offline (fallback) e, no deploy, o endpoint real:
```bash
curl -X POST https://beoutsight.netlify.app/api/chat -H "Content-Type: application/json" -d '{"messages":[{"role":"user","content":"teste"}]}'
```
