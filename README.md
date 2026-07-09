# Be OutSight — Demo (VELLA Fashion)

> **Inteligência Corporativa Autônoma**: conectando o comportamento interno do e-commerce ao contexto real das ruas. Spin-off da Be Intelligence.

Demo funcional com **dados fictícios** simulando a marca **VELLA** (e-commerce de moda feminina), construída para demonstrações do produto a times de **Marketing, Produto, PR e Comunicação**.

## O que a demo mostra

| Área | O que tem |
|---|---|
| **Copilot (chat IA)** | Conversa em linguagem natural com o agente OutSight (OpenAI GPT-4o), treinado na metodologia Behavior Index e em leitura anti-viés dos dados |
| **Behavior Index** | Protagonista da interface: BI = IM − IE, gauge da marca, diagnóstico por contexto de decisão (cluster × produto), alavancas prescritivas |
| **Sinais & Dados** | 90 dias de KPIs (receita, conversão, abandono) + social listening (menções, sentimento por canal, temas quentes) |
| **Alertas** | Anomalias prescritivas: métrica interna + causa externa + ação recomendada + checagem de viés |

## Narrativa embutida nos dados

- 🔴 **Crise do Casaco Vega**: vídeo viral no TikTok sobre o zíper → conversão −25% → BI do produto vira negativo (inação por desconfiança)
- 🟢 **Oportunidade Trench Coat Maré**: 85% de aprovação, BI +2,10 → recomendação de troca de banner e realocação de verba
- 🟡 **Frete N/NE** travando recompra das Clássicas Conscientes (heurística da disponibilidade)
- 🔵 **Tabela de medidas** gerando devolução no cluster Ocasião Especial (efeito de ambiguidade)

## Metodologia Behavior Index (© Be Intelligence / Perla Amabile)

```
BI = IM − IE
IM (Motivação) = (Desejo + Necessidade + Urgência) / 3
IE (Esforço)   = (Financeiro + Cognitivo + Físico + Tempo + Emocional) / 5

BI > 0 → propensão à AÇÃO
BI ≈ 0 → ponto crítico
BI < 0 → procrastinação / INAÇÃO
```

## Stack

- **Frontend**: HTML/CSS/JS estático (`public/`), Chart.js, marked.js
- **Backend**: Netlify Function (`netlify/functions/chat.mjs`) — proxy para a OpenAI com system prompt do agente
- **Deploy**: Netlify + GitHub

## Deploy no Netlify

1. Conecte este repositório no Netlify (**Add new site → Import from GitHub**)
2. Build settings já vêm do `netlify.toml` (publish: `public`, functions: `netlify/functions`) — não precisa de build command
3. Em **Site settings → Environment variables**, adicione:
   - `OPENAI_API_KEY` = sua chave da OpenAI *(obrigatória)*
   - `OPENAI_MODEL` = `gpt-4o` *(opcional; é o padrão)*
4. Deploy 🚀

> Sem a chave configurada, o chat opera em **modo offline** com respostas pré-calculadas para os prompts principais da demo (sinalizadas com ⚠️).

## Rodar localmente

```bash
npx netlify-cli dev
# configure OPENAI_API_KEY no ambiente ou em um arquivo .env
```

---

*Demo com dados 100% fictícios. Metodologia Behavior Index © Be Intelligence.*
