# Be OutSight — Demo (VELLA)

Demo funcional do **Be OutSight** (spin-off da Be Intelligence): agente de IA conversacional que conecta dados internos de uma marca fashion multicanal (**VELLA**, fictícia) ao contexto externo (social listening) e entrega recomendações prescritivas. Público da demo: decisores de Marketing, Produto, PR e Comunicação.

**Live:** https://beoutsight.netlify.app · **Repo:** https://github.com/ThebilabAutomation/outsight

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

## Arquitetura

- **Site estático** em `public/` — vanilla JS, sem build. Chart.js e marked.js via CDN.
- **Função serverless** `netlify/functions/chat.mjs` — proxy OpenAI, rota `/api/chat` (via `config.path`, sem redirect no netlify.toml). Modelo: `OPENAI_MODEL` ou `gpt-4o`.
- **Env vars no Netlify**: `OPENAI_API_KEY` (obrigatória — já configurada), `OPENAI_MODEL` (opcional).
- Chat: front envia `{messages: [...]}`; IA pode emitir bloco ```` ```bi-card ```` com JSON que o front renderiza como card visual (barras IM/IE) — manter esse contrato.

## Tema claro/escuro

- **Todas as cores via CSS vars** em `:root` (dark, padrão) e `:root[data-theme="light"]` em `style.css`. NUNCA hardcodar hex em estilos inline no app.js — usar `"var(--pos)"` etc.
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
