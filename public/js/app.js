/* ============================================================
   Be OutSight — App (demo VELLA)
   ============================================================ */
(() => {
  const D = VELLA;
  const $ = sel => document.querySelector(sel);
  const $$ = sel => document.querySelectorAll(sel);
  const fmtBI = v => (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v).toFixed(2).replace(".", ",");
  const fmtBRL = v => "R$ " + v.toLocaleString("pt-BR");
  const cssVar = name => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const biVarName = v => v >= 0.5 ? "--pos" : v <= -0.1 ? "--neg" : "--warn";
  const biColor = v => `var(${biVarName(v)})`;      // para estilos inline (acompanha o tema)
  const biColorRaw = v => cssVar(biVarName(v));      // para canvas (valor resolvido)
  const biTag = v => v >= 0.5 ? "AÇÃO" : v <= -0.1 ? "INAÇÃO" : "PONTO CRÍTICO";

  /* ================= NAVEGAÇÃO ================= */
  $$(".nav-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      $$(".nav-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      $$(".view").forEach(v => v.classList.remove("active"));
      $("#view-" + btn.dataset.view).classList.add("active");
      if (btn.dataset.view === "sinais" && !chartsReady) buildCharts();
    });
  });
  const goToChat = () => {
    $$(".nav-btn").forEach(b => b.classList.remove("active"));
    document.querySelector('[data-view="chat"]').classList.add("active");
    $$(".view").forEach(v => v.classList.remove("active"));
    $("#view-chat").classList.add("active");
  };

  /* ================= GAUGE (semicírculo) ================= */
  function drawGauge(canvas, value, opts = {}) {
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    const cx = W / 2, cy = H - 10, r = Math.min(W / 2 - 12, H - 24);
    const min = -2, max = 3;
    const frac = Math.max(0, Math.min(1, (value - min) / (max - min)));
    ctx.clearRect(0, 0, W, H);

    // trilha
    ctx.lineWidth = opts.thick || 13;
    ctx.lineCap = "round";
    ctx.strokeStyle = cssVar("--gauge-track") || "rgba(120,150,220,.12)";
    ctx.beginPath();
    ctx.arc(cx, cy, r, Math.PI, 2 * Math.PI);
    ctx.stroke();

    // arco de valor (gradiente vermelho→amarelo→verde, resolvido do tema)
    const grad = ctx.createLinearGradient(cx - r, 0, cx + r, 0);
    grad.addColorStop(0, cssVar("--neg"));
    grad.addColorStop(0.45, cssVar("--gauge-mid"));
    grad.addColorStop(1, cssVar("--pos"));
    ctx.strokeStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, r, Math.PI, Math.PI + Math.PI * frac);
    ctx.stroke();

    // ponteiro
    const ang = Math.PI + Math.PI * frac;
    const px = cx + (r - 2) * Math.cos(ang), py = cy + (r - 2) * Math.sin(ang);
    ctx.fillStyle = cssVar("--card") || "#fff";
    ctx.beginPath(); ctx.arc(px, py, 5.5, 0, 2 * Math.PI); ctx.fill();
    ctx.strokeStyle = biColorRaw(value); ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(px, py, 8, 0, 2 * Math.PI); ctx.stroke();
  }

  function drawAllGauges() {
    drawGauge($("#gauge-rail"), D.brand.behaviorIndexGeral);
    drawGauge($("#gauge-big"), D.brand.behaviorIndexGeral, { thick: 18 });
  }
  drawAllGauges();
  $("#gauge-rail-value").textContent = fmtBI(D.brand.behaviorIndexGeral);
  $("#gauge-rail-value").style.color = biColor(D.brand.behaviorIndexGeral);
  $("#gauge-big-value").textContent = fmtBI(D.brand.behaviorIndexGeral);
  $("#gauge-big-value").style.color = biColor(D.brand.behaviorIndexGeral);
  $("#bi-mini-value").textContent = fmtBI(D.brand.behaviorIndexGeral);

  /* ================= TEMA CLARO/ESCURO ================= */
  const themeIcon = $("#theme-icon");
  const applyThemeIcon = () => { themeIcon.textContent = document.documentElement.dataset.theme === "light" ? "🌙" : "☀️"; };
  applyThemeIcon();
  $("#theme-toggle").addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = next;
    localStorage.setItem("outsight-theme", next);
    applyThemeIcon();
    drawAllGauges();
    if (chartsReady) {
      chartInstances.forEach(c => c.destroy());
      chartInstances.length = 0;
      chartsReady = false;
      if ($("#view-sinais").classList.contains("active")) buildCharts();
    }
  });

  /* ================= CHAT ================= */
  const chatMessages = $("#chat-messages");
  const chatScroll = $("#chat-scroll");
  const input = $("#chat-input");
  const sendBtn = $("#chat-send");
  const history = [];
  let waiting = false;

  // chips de prompts agrupados pelos 3 pilares
  D.promptsPilares.forEach(g => {
    const grupo = document.createElement("div");
    grupo.className = "pilar-group";
    grupo.innerHTML = `
      <div class="pilar-head">
        <span class="pilar-ico">${g.icone}</span>
        <span class="pilar-nome">${g.pilar}</span>
        <span class="pilar-desc">${g.descricao}</span>
      </div>
      <div class="prompt-chips"></div>`;
    const chipsEl = grupo.querySelector(".prompt-chips");
    g.prompts.forEach(p => {
      const chip = document.createElement("button");
      chip.className = "chip";
      chip.textContent = p;
      chip.onclick = () => { input.value = p; sendMessage(); };
      chipsEl.appendChild(chip);
    });
    $("#prompt-pilares").appendChild(grupo);
  });

  input.addEventListener("keydown", e => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  });
  input.addEventListener("input", () => {
    input.style.height = "auto";
    input.style.height = Math.min(input.scrollHeight, 130) + "px";
  });
  sendBtn.addEventListener("click", sendMessage);

  function addMsg(role, html) {
    const div = document.createElement("div");
    div.className = "msg " + (role === "user" ? "user" : "bot");
    div.innerHTML = `
      <div class="msg-avatar">${role === "user" ? "👤" : "◉"}</div>
      <div class="msg-bubble">${html}</div>`;
    chatMessages.appendChild(div);
    chatScroll.scrollTop = chatScroll.scrollHeight;
    return div;
  }

  function renderBiCard(json) {
    try {
      const c = JSON.parse(json);
      const bi = typeof c.bi === "number" ? c.bi : (c.im - c.ie);
      const imPct = Math.round((c.im / 5) * 100), iePct = Math.round((c.ie / 5) * 100);
      return `
        <div class="bi-card">
          <div class="bi-card-head">
            <div class="bi-card-ctx"><b>${c.contexto || "Contexto"}</b>${c.cluster || ""}</div>
            <div class="bi-card-score" style="color:${biColor(bi)}">${fmtBI(bi)}</div>
          </div>
          <div class="bi-card-bars">
            <div class="bi-bar-group">
              <div class="bg-label"><span>IM · Motivação</span><span>${String(c.im).replace(".", ",")}</span></div>
              <div class="bi-bar im"><i style="width:${imPct}%"></i></div>
            </div>
            <div class="bi-bar-group">
              <div class="bg-label"><span>IE · Esforço</span><span>${String(c.ie).replace(".", ",")}</span></div>
              <div class="bi-bar ie"><i style="width:${iePct}%"></i></div>
            </div>
          </div>
          ${c.leitura ? `<div class="bi-card-leitura">${c.leitura}</div>` : ""}
        </div>`;
    } catch { return ""; }
  }

  function renderReply(text) {
    // extrai blocos ```bi-card ... ```
    let cards = "";
    const clean = text.replace(/```bi-card\s*([\s\S]*?)```/g, (_, json) => {
      cards += renderBiCard(json.trim());
      return "";
    });
    const html = (window.marked ? marked.parse(clean) : clean.replace(/\n/g, "<br>"));
    return html + cards;
  }

  async function sendMessage(presetText) {
    const text = (typeof presetText === "string" ? presetText : input.value).trim();
    if (!text || waiting) return;
    $("#chat-hero")?.remove();
    input.value = ""; input.style.height = "auto";
    addMsg("user", text.replace(/</g, "&lt;"));
    history.push({ role: "user", content: text });

    waiting = true; sendBtn.disabled = true;
    const typingDiv = addMsg("bot", '<span class="typing"><i></i><i></i><i></i></span>');

    try {
      const resp = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history })
      });
      const data = await resp.json();
      if (!resp.ok || data.error) throw new Error(data.error || "Erro " + resp.status);
      typingDiv.querySelector(".msg-bubble").innerHTML = renderReply(data.reply);
      history.push({ role: "assistant", content: data.reply });
    } catch (err) {
      const fallback = offlineAnswer(text);
      if (fallback) {
        typingDiv.querySelector(".msg-bubble").innerHTML =
          `<p style="font-size:11px;color:var(--warn);margin-bottom:8px">⚠️ Modo offline (IA indisponível: ${err.message}). Resposta pré-calculada da demo:</p>` +
          renderReply(fallback);
        history.push({ role: "assistant", content: fallback });
      } else {
        typingDiv.querySelector(".msg-bubble").innerHTML =
          `<p>⚠️ Não consegui falar com o agente agora (<i>${err.message}</i>).</p>
           <p>Verifique se a variável <code>OPENAI_API_KEY</code> está configurada no Netlify (Site settings → Environment variables) e tente de novo.</p>`;
      }
    } finally {
      waiting = false; sendBtn.disabled = false;
      chatScroll.scrollTop = chatScroll.scrollHeight;
    }
  }

  /* Fallback offline para os prompts principais da demo */
  function offlineAnswer(q) {
    const s = q.toLowerCase();
    if (s.includes("lume") || (s.includes("parou de vender") && !s.includes("vega"))) {
      return `**Resposta direta: é o site, não o produto.**

**O que está acontecendo:** o produto→carrinho mobile da Saia Lume caiu **44,6%** (9,2% → 5,1%) desde 28/jun — exatamente a data da release 2.9 do site. O Cropped Sol, da mesma categoria, caiu 27,2% no mesmo dia. No desktop, nada mudou (9,8%).

**Por que (dados de dentro):** o novo filtro de tamanho **não aplica no mobile** em Saias e Tops. Session replays mostram 3+ toques sem resposta e 14% de rage-clicks. Perda estimada: **R$ 210k/mês**.

**E os dados de fora confirmam:** zero menções negativas novas sobre a Lume — a peça segue com 79% de aprovação. Há apenas um tema antigo de percepção de valor (34% das menções citam "sem forro", fotos não mostram o caimento) que explica a devolução 2,1x acima da média, mas não a queda súbita.

**O que fazer:**
1. Hotfix ou rollback do componente de filtros **hoje**;
2. Teste de regressão mobile obrigatório no deploy;
3. Depois do fix: refazer as fotos da PDP mostrando forro (ataca a percepção de valor).

⚠️ **Checagem de viés:** heurística da representatividade — a queda "se parece" com produto fora de moda, e sem o cruzamento interno×externo o time mataria uma peça saudável.`;
    }
    if (s.includes("vega")) {
      return `**O que está acontecendo:** a conversão do Casaco Oversized Vega caiu **25,3% em 72h** (2,16% → 1,61%), enquanto as sessões na página subiram 38% — curiosidade sem intenção de compra.

**Por que:** o vídeo da @stylecomlulu no TikTok (24/jun, 2,1M views) mostrando o zíper enroscando gerou 4.830 menções com sentimento −72. O Esforço Emocional das Caçadoras de Tendência saltou para 4,7 — a desconfiança superou o desejo.

**O que fazer:**
1. Pausar campanhas do Vega (economia ~R$ 18k/semana);
2. Trocar o banner principal para o **Trench Coat Maré** (85% aprovação, margem 62%, BI +2,10);
3. Publicar resposta oficial sobre o zíper com troca facilitada — transparência reduz Esforço Emocional.

⚠️ **Checagem de viés:** cuidado com a ancoragem no desempenho histórico do Vega — ele não prevê o comportamento pós-crise.

\`\`\`bi-card
{"contexto":"Casaco Vega (pós-viral)","cluster":"Caçadoras de Tendência","im":2.5,"ie":2.78,"bi":-0.28,"leitura":"O Esforço Emocional (4,7) dominou o contexto: propensão à INAÇÃO até a marca responder publicamente."}
\`\`\``;
    }
    if (s.includes("maré") || s.includes("mare") || s.includes("banner")) {
      return `**Recomendação direta:** o banner principal deve ir para o **Trench Coat Maré**.

**Por que:** BI de **+2,10** nas Caçadoras de Tendência — o maior da marca. Motivação 4,0 (desejo 4,7 + urgência sazonal 4,2) contra esforço de apenas 1,9. Conversão +18,7% na semana, 85% de aprovação, margem de 62% e busca por "trench coat" +64% com a frente fria.

**Ações:**
1. Realocar a verba pausada do Vega para o Maré;
2. Gatilho de escassez real: "últimas 268 unidades";
3. Negociar reposição de estoque ainda esta semana (cobertura atual: ~3 semanas).

⚠️ **Checagem de viés:** evite a falácia dos custos irrecuperáveis — a verba já investida no Vega não justifica mantê-lo no ar.

\`\`\`bi-card
{"contexto":"Trench Coat Maré","cluster":"Caçadoras de Tendência","im":4.0,"ie":1.9,"bi":2.1,"leitura":"Motivação máxima com esforço mínimo: cada real de mídia aqui rende mais que em qualquer outro produto."}
\`\`\``;
    }
    if (s.includes("recompra") || s.includes("clássicas") || s.includes("classicas") || s.includes("fidel")) {
      return `**O que está acontecendo:** a recompra das Clássicas Conscientes caiu **14% no trimestre** — e é o cluster com maior LTV potencial (24% da receita).

**Por que:** o BI do contexto de recompra está em **+0,63**, travado pelo Esforço de Tempo (3,8): a memória do frete lento (9+ dias no N/NE) ancora a próxima decisão antes mesmo dela começar — heurística da disponibilidade em ação.

**O que fazer:**
1. Exibir prazo real de entrega na página (reduz ambiguidade);
2. Frete expresso como benefício de fidelidade (reescreve a memória do esforço);
3. Acesso antecipado a coleções (cria urgência + pertencimento);
4. Testar hub logístico em Recife.

\`\`\`bi-card
{"contexto":"Recompra em 90 dias","cluster":"Clássicas Conscientes","im":2.93,"ie":2.3,"bi":0.63,"leitura":"Sem urgência e com memória negativa do frete, a recompra não acontece sozinha — é preciso reescrever a experiência."}
\`\`\``;
    }
    if (s.includes("pedindo") || s.includes("não existem") || s.includes("nao existem") || s.includes("demanda reprimida") || s.includes("novos produtos")) {
      return `**Top 3 produtos que o público pede e a VELLA não tem:**

**1. 🔴 Plus size G3/G4 (a maior)** — 1.240 menções (+62%) com tom de frustração: *"paro no G2"*. Cruzamento interno: **3.900 buscas/mês** por G3/G4 sem nenhum resultado — 8,4% de todas as buscas do site. Carrinho abandonado pós-busca de tamanho: 2,3x a média. *Ação: cápsula G3/G4 dos 4 best-sellers via pré-venda.*

**2. Trench Maré verde-oliva** — 487 menções (+134%, sentimento +81). *"Bege todo mundo tem."* O Maré já é o produto de maior BI da marca (+2,10): cor nova em produto validado é a extensão de menor risco. *Ação: drop limitado.*

**3. 💥 Insight de choque: cápsula "Noiva Civil"** — 312 menções (+209%) de clientes casando no civil com o **Vestido Constelação**. Sinais internos confirmam: picos de venda às segundas e 18% dos pedidos com CEP de entrega diferente da cobrança (presente). Nicho de alta margem que nenhum concorrente viu. *Ação: versão branco/off-white + acessórios.*

⚠️ **Checagem de viés:** viés de sobrevivência — o dashboard de vendas só mostra quem *conseguiu* comprar. A demanda reprimida (plus size) é invisível na receita e por isso é sistematicamente subestimada.`;
    }
    if (s.includes("uso inesperado") || s.includes("tendência") && s.includes("produto")) {
      return `**Sim — e é o insight mais valioso do mês.** 💥

**O que os dados de fora mostram:** 312 menções (+209% em 4 semanas, sentimento +88) de clientes usando o **Vestido Festa Constelação como vestido de casamento civil**. *"Casei no civil com o Constelação e recebi mais elogios que no vestidão da festa."*

**O que os dados de dentro confirmam:** picos de venda às segundas-feiras (pós-fim de semana de casamentos) e 18% dos pedidos com CEP de entrega ≠ endereço de cobrança (compra-presente).

**Por que importa:** casamento civil é um contexto de decisão com Desejo e Urgência altíssimos e baixa sensibilidade a preço — margem premium num nicho que nenhum concorrente mapeou.

**O que fazer:**
1. Cápsula "Noiva Civil": Constelação em branco/off-white + acessórios (véu curto, brincos);
2. Landing própria com prova social real (repostar os casamentos com autorização);
3. Resolver o medo do tamanho ANTES de escalar: provador virtual — noiva não pode errar o caimento (EE 3,6 no cluster Ocasião Especial).`;
    }
    if (s.includes("campanha")) {
      return `**Qual campanha está dando certo — e para quem:**

| Campanha | ROAS | Veredito |
|---|---|---|
| VELLA Week (TikTok) | **6,8** | ▲ Escalar — melhor da marca, CAC R$ 24 |
| Volta pra VELLA (CRM) | 5,2 | ▲ Escalar — resolver frete multiplica |
| Inverno Essencial (Meta) | 4,2 | ◈ Otimizar — UGC converte 2,4x estúdio |
| Alfaiataria (PMax) | 3,1 | ● Manter |
| Sempre VELLA (institucional) | **1,4** | ▼ Revisar — fala com o público errado |

**O problema da institucional:** alvo pretendido 35–50, mas **61% do engajamento vem de 18–27**. CAC de R$ 96 (2,5x a média). As Clássicas Conscientes respondem no CRM (ROAS 5,2) e na loja — não no feed.

**Prescrição:** pausar a Sempre VELLA, realocar 50% da verba para a VELLA Week e recriar a mensagem institucional dentro do CRM/loja, onde o cluster-alvo de fato está.

⚠️ **Checagem de viés:** o time de brand mede a institucional por alcance e views — viés de confirmação: métricas que validam a tese sem testar se o ALVO foi tocado.`;
    }
    if (s.includes("vies") || s.includes("viés") || s.includes("vieses")) {
      return `**Checagem de viés da semana — 3 riscos na leitura dos dados:**

1. **Heurística da disponibilidade:** o viral do zíper domina a atenção do time, mas representa 1 produto de 12. Os outros 11 cresceram em média +5,4% — não deixe a crise contaminar a leitura do portfólio (efeito halo invertido).

2. **Ancoragem:** a meta de conversão foi definida antes do inverno. O crescimento atual (+12% sessões) é sazonal — celebrar como se fosse mérito de campanha é atribuição enviesada.

3. **Viés de confirmação:** o time de mídia acredita que TikTok "só dá problema". Mas 41% das menções vêm de lá e o Maré viralizou positivamente no mesmo canal. O canal não é o problema; o produto com defeito era.

**Recomendação:** decisões desta semana devem citar a taxa de base (desempenho médio de 90 dias), não o evento mais recente ou mais vívido.`;
    }
    if (s.includes("esforço") || s.includes("esforco") || s.includes("perdendo vendas")) {
      return `**Onde o esforço percebido está travando vendas (ranking IE):**

1. **Ocasião Especial × Vestido Constelação** — IE 3,20: medo de não chegar a tempo (ET 4,1) e de não servir (EE 3,6). Devolução de 13,5% confirma. *Alavanca: garantia de entrega + provador virtual.*
2. **Clássicas × Vestido Aurora (1ª compra)** — IE 2,84: frete 9+ dias (ET 3,9) e excesso de pesquisa (EC 3,6). BI em ponto crítico (+0,29). *Alavanca: prazo real na página + resumo de reviews com IA.*
3. **Caçadoras × Casaco Vega** — IE 2,78: desconfiança pós-viral (EE 4,7). *Alavanca: resposta pública + troca facilitada.*

**Impacto estimado:** reduzir ET e EE nesses 3 contextos pode recuperar ~R$ 190k/mês em conversão perdida (estimativa sobre o abandono acima da média nesses fluxos).`;
    }
    if (s.includes("pr ") || s.includes("comunicação") || s.includes("comunicacao") || s.includes("sinais externos")) {
      return `**Briefing de sinais externos para PR/Comunicação — hoje:**

🔴 **Crise ativa:** #casacovega com 4,2M views no TikTok; 4.830 menções, sentimento −72. Menções negativas: 380/sem → 2.870 no pico, recuando para 1.920. **Janela de resposta ainda aberta** — o recuo indica que uma resposta oficial agora encontra audiência receptiva.

🟢 **Onda positiva:** Trench Maré com 3.120 menções (+68 de sentimento) puxadas pela @amandalooks (890k views). Oportunidade de assessoria: enviar peças para creators de médio porte antes do pico do inverno.

🟡 **Risco reputacional latente:** Reclame Aqui com sentimento −46 (62% = frete N/NE). Se um creator grande pegar essa pauta, vira segunda crise.

**Prescrição:** comunicado sobre o zíper hoje (transparência + troca facilitada), pauta positiva do Maré amanhã para disputar o feed, e resposta ativa no Reclame Aqui com meta de 100% em 48h.`;
    }
    if (s.includes("plano") || s.includes("7 dias") || s.includes("crise")) {
      return `**Plano de 7 dias — resposta à crise do zíper Vega:**

**Dia 1–2 (contenção):** pausar mídia do Vega (economia R$ 18k/sem); comunicado oficial nos canais reconhecendo a falha + troca facilitada; responder o vídeo da @stylecomlulu com transparência (sem tom defensivo).
**Dia 2–3 (redirecionamento):** banner principal → Trench Maré; realocar verba de mídia; ativar escassez real ("últimas 268 un.").
**Dia 3–5 (recuperação de confiança):** enviar Vega corrigido (novo lote) para 5 creators de médio porte com brief honesto; depoimentos de clientes satisfeitas (prova social qualificada).
**Dia 5–7 (medição):** meta = EE das Caçadoras de 4,7 → abaixo de 3,5; sentimento do tema de −72 para acima de −30; recuperar 50% da conversão perdida.

⚠️ **Checagem de viés:** não caia no efeito Einstellung — a solução familiar ("dar desconto no Vega") reforçaria a percepção de produto defeituoso. O problema é confiança, não preço.`;
    }
    if (s.includes("behavior index") || s.includes(" bi ") || s.endsWith(" bi") || s.includes("cacadoras") || s.includes("caçadoras")) {
      return `**Behavior Index — Caçadoras de Tendência × Trench Coat Maré:**

**IM = 4,00** → Desejo 4,7 (produto viral positivo) + Necessidade 3,1 + Urgência 4,2 (inverno + escassez) ÷ 3
**IE = 1,90** → Financeiro 3,0 · Cognitivo 1,8 · Físico 1,0 · Tempo 2,0 · Emocional 1,7 ÷ 5
**BI = +2,10 → forte propensão à AÇÃO** (o maior da marca)

A prova social (85% de aprovação) praticamente eliminou o esforço emocional — o cérebro lê "escolha segura validada pelo coletivo" e libera a decisão sem racionalizar.

\`\`\`bi-card
{"contexto":"Trench Coat Maré","cluster":"Caçadoras de Tendência","D":4.7,"N":3.1,"U":4.2,"EF":3.0,"EC":1.8,"EFs":1.0,"ET":2.0,"EE":1.7,"im":4.0,"ie":1.9,"bi":2.1,"leitura":"Motivação máxima, esforço mínimo: janela ideal para concentrar mídia e estoque."}
\`\`\``;
    }
    return null;
  }

  // permite outros módulos mandarem prompt pro chat
  window.askOutSight = (prompt) => { goToChat(); sendMessage(prompt); };

  /* ================= RAIL: ALERTAS ================= */
  $("#alert-count").textContent = D.alertas.length;
  const sevColor = { critica: "var(--neg)", oportunidade: "var(--pos)", alta: "var(--warn)", media: "var(--accent)" };
  D.alertas.forEach(a => {
    const el = document.createElement("div");
    el.className = "rail-alert";
    el.innerHTML = `<span class="dot" style="background:${sevColor[a.severidade]}"></span><span>${a.titulo}</span>`;
    el.onclick = () => window.askOutSight(`Me explique o alerta "${a.titulo}" e o que devo fazer.`);
    $("#rail-alerts").appendChild(el);
  });

  /* ================= VIEW: BEHAVIOR INDEX ================= */
  const scoreLabels = { D: "Desejo", N: "Necessidade", U: "Urgência", EF: "Financeiro", EC: "Cognitivo", EFs: "Físico", ET: "Tempo", EE: "Emocional" };
  D.biContextos.forEach(c => {
    const card = document.createElement("div");
    card.className = "bi-ctx-card";
    const imPct = Math.round((c.im / 5) * 100), iePct = Math.round((c.ie / 5) * 100);
    card.innerHTML = `
      <div class="ctx-head">
        <div>
          <div class="ctx-cluster">${c.cluster}</div>
          <div class="ctx-name">${c.contexto}</div>
        </div>
        <div class="ctx-bi">
          <div class="ctx-bi-val" style="color:${biColor(c.bi)}">${fmtBI(c.bi)}</div>
          <div class="ctx-bi-tag" style="color:${biColor(c.bi)}">${biTag(c.bi)}</div>
        </div>
      </div>
      <div class="ctx-scores">
        <div class="bi-bar-group">
          <div class="bg-label"><span>IM · Motivação</span><span>${String(c.im).replace(".", ",")}</span></div>
          <div class="bi-bar im"><i style="width:${imPct}%"></i></div>
        </div>
        <div class="bi-bar-group">
          <div class="bg-label"><span>IE · Esforço</span><span>${String(c.ie).replace(".", ",")}</span></div>
          <div class="bi-bar ie"><i style="width:${iePct}%"></i></div>
        </div>
      </div>
      <div class="ctx-leitura">${c.leitura}</div>
      <div class="ctx-alavanca"><b>Alavanca:</b> ${c.alavanca}</div>
      <div class="ctx-actions"><button class="btn-ia">✦ Analisar com IA</button></div>`;
    card.querySelector(".btn-ia").onclick = () =>
      window.askOutSight(`Aprofunde o diagnóstico de Behavior Index do contexto "${c.contexto}" (cluster ${c.cluster}). Quais notas de motivação e esforço explicam o BI de ${fmtBI(c.bi)} e qual plano de ação você prescreve?`);
    $("#bi-grid").appendChild(card);
  });

  D.clusters.forEach(cl => {
    const card = document.createElement("div");
    card.className = "cluster-card";
    card.innerHTML = `
      <div class="cluster-head">
        <div class="cluster-name">${cl.nome}</div>
        <div class="cluster-share">${cl.share}%</div>
      </div>
      <div class="cluster-perfil">${cl.perfil}</div>
      <div class="cluster-drivers">${cl.drivers.map(d => `<span class="driver-tag">${d}</span>`).join("")}</div>`;
    $("#cluster-grid").appendChild(card);
  });

  /* ================= VIEW: SINAIS ================= */
  const last7 = D.dias.slice(-7), prev7 = D.dias.slice(-14, -7);
  const sum = (arr, k) => arr.reduce((a, b) => a + b[k], 0);
  const avg = (arr, k) => sum(arr, k) / arr.length;
  const receita7 = sum(last7, "receita");
  const dReceita = ((receita7 - sum(prev7, "receita")) / sum(prev7, "receita")) * 100;
  const conv7 = avg(last7, "conversao");
  const dConv = ((conv7 - avg(prev7, "conversao")) / avg(prev7, "conversao")) * 100;
  const sess7 = sum(last7, "sessoes");
  const dSess = ((sess7 - sum(prev7, "sessoes")) / sum(prev7, "sessoes")) * 100;
  const aband7 = avg(last7, "abandono");

  const kpis = [
    { label: "Receita · 7 dias", value: fmtBRL(receita7), delta: dReceita },
    { label: "Sessões · 7 dias", value: sess7.toLocaleString("pt-BR"), delta: dSess },
    { label: "Conversão média", value: conv7.toFixed(2).replace(".", ",") + "%", delta: dConv },
    { label: "Abandono de carrinho", value: aband7.toFixed(1).replace(".", ",") + "%", delta: null },
    { label: "Ticket médio", value: fmtBRL(D.brand.ticketMedio), delta: null },
    { label: "NPS", value: D.brand.nps, delta: null }
  ];
  kpis.forEach(k => {
    const el = document.createElement("div");
    el.className = "kpi-card";
    el.innerHTML = `
      <div class="kpi-label">${k.label}</div>
      <div class="kpi-value">${k.value}</div>
      ${k.delta !== null ? `<div class="kpi-delta ${k.delta >= 0 ? "up" : "down"}">${k.delta >= 0 ? "▲" : "▼"} ${Math.abs(k.delta).toFixed(1).replace(".", ",")}% vs semana anterior</div>` : ""}`;
    $("#kpi-row").appendChild(el);
  });

  // temas
  D.social.temas.forEach(t => {
    const el = document.createElement("div");
    el.className = "tema-row";
    const pct = Math.min(100, Math.round((t.volume / 5000) * 100));
    const cor = t.sentimento >= 0 ? "var(--pos)" : "var(--neg)";
    el.innerHTML = `
      <div class="tema-nome">${t.tema}</div>
      <div class="tema-meta">${t.volume.toLocaleString("pt-BR")} menções · ${t.tendencia}</div>
      <div class="tema-bar"><i style="width:${pct}%;background:${cor}"></i></div>
      <div class="tema-sent" style="color:${cor}">${t.sentimento > 0 ? "+" : ""}${t.sentimento}</div>`;
    $("#temas-list").appendChild(el);
  });

  /* ---- PILAR 1: usabilidade ---- */
  $("#release-nota").textContent = D.usabilidade.releaseNota;
  const sevIssueColor = { critica: "var(--neg)", alta: "var(--warn)", media: "var(--accent)" };
  D.usabilidade.issues.forEach(i => {
    const el = document.createElement("div");
    el.className = "issue-card";
    el.style.borderLeftColor = sevIssueColor[i.severidade];
    el.innerHTML = `
      <div class="issue-top">
        <span class="issue-sev" style="color:${sevIssueColor[i.severidade]}">${i.severidade.toUpperCase()}</span>
        <span class="issue-desde">desde ${i.desde}</span>
      </div>
      <div class="issue-titulo">${i.titulo}</div>
      <div class="issue-impacto">${i.impacto}</div>
      <div class="issue-evidencia">📎 ${i.evidencia}</div>`;
    el.onclick = () => window.askOutSight(`Analise o problema de usabilidade "${i.titulo}": qual o impacto no funil, a leitura comportamental e o plano de correção?`);
    $("#issues-grid").appendChild(el);
  });

  const diagLabel = { critico: ["🔴 Causa interna (bug filtro)", "var(--neg)"], externo: ["📡 Causa externa (viral)", "var(--warn)"], atencao: ["🟡 Observar (LCP alto)", "var(--warn)"], ok: ["🟢 Saudável", "var(--pos)"] };
  const funilBody = $("#funil-table tbody");
  D.usabilidade.funilProdutos.forEach(f => {
    const tr = document.createElement("tr");
    if (f.flag === "critico") tr.className = "destaque-crise";
    const [dl, dc] = diagLabel[f.flag];
    tr.innerHTML = `
      <td><b>${f.produto}</b></td>
      <td>${f.pdpSessoes.toLocaleString("pt-BR")}</td>
      <td>${f.pcDesktop.toFixed(1).replace(".", ",")}%</td>
      <td>${f.pcMobileAntes.toFixed(1).replace(".", ",")}%</td>
      <td>${f.pcMobileDepois.toFixed(1).replace(".", ",")}%</td>
      <td class="${f.deltaMobile >= -5 ? "delta-pos" : "delta-neg"}">${f.deltaMobile.toFixed(1).replace(".", ",")}%</td>
      <td style="color:${dc};font-size:12px">${dl}</td>`;
    funilBody.appendChild(tr);
  });

  /* ---- PILAR 2: demanda latente ---- */
  const potLabel = { alto: ["ALTO POTENCIAL", "var(--pos)"], choque: ["💥 INSIGHT DE CHOQUE", "var(--accent-2)"], medio: ["MÉDIO", "var(--accent)"] };
  D.demandaLatente.forEach(dm => {
    const [pl, pc] = potLabel[dm.potencial];
    const el = document.createElement("div");
    el.className = "demanda-card" + (dm.potencial === "choque" ? " choque" : "");
    el.innerHTML = `
      <div class="dm-top">
        <span class="dm-pot" style="color:${pc};border-color:${pc}">${pl}</span>
        <span class="dm-cresc">+${dm.crescimento4s}% · 4 sem</span>
      </div>
      <div class="dm-tema">${dm.tema}</div>
      <div class="dm-nums">${dm.mencoes.toLocaleString("pt-BR")} menções · sentimento ${dm.sentimento > 0 ? "+" : ""}${dm.sentimento}</div>
      <div class="dm-quote">${dm.quote}</div>
      <div class="dm-cruz">🔗 <b>Cruzamento interno:</b> ${dm.cruzamentoInterno}</div>
      <div class="ctx-alavanca"><b>Ação:</b> ${dm.acao}</div>
      <div class="ctx-actions"><button class="btn-ia">✦ Analisar com IA</button></div>`;
    el.querySelector(".btn-ia").onclick = () =>
      window.askOutSight(`Aprofunde o insight de demanda latente "${dm.tema}": dimensione a oportunidade, riscos, e monte o plano de validação e lançamento.`);
    $("#demanda-grid").appendChild(el);
  });

  /* ---- PILAR 3: campanhas ---- */
  $("#publico-gap-resumo").textContent = D.publicoGap.resumo;
  const statusLabel = { escalar: ["▲ Escalar", "var(--pos)"], otimizar: ["◈ Otimizar", "var(--cyan)"], manter: ["● Manter", "var(--txt-2)"], revisar: ["▼ Revisar", "var(--neg)"] };
  const campBody = $("#campanhas-table tbody");
  D.campanhas.forEach(c => {
    const [sl, sc] = statusLabel[c.status];
    const tr = document.createElement("tr");
    if (c.status === "revisar") tr.className = "destaque-crise";
    if (c.status === "escalar") tr.className = "destaque-oportunidade";
    tr.innerHTML = `
      <td><b>${c.nome}</b></td>
      <td>${c.canal}</td>
      <td>${c.clusterAlvo}</td>
      <td>${fmtBRL(c.investimento)}</td>
      <td><b>${c.roas.toFixed(1).replace(".", ",")}</b></td>
      <td>R$ ${c.cac}</td>
      <td style="color:${sc};font-weight:600">${sl}</td>
      <td style="font-size:12px;color:var(--txt-2);max-width:280px">${c.nota}</td>`;
    campBody.appendChild(tr);
  });

  /* ---- Omnichannel ---- */
  $("#ropo-resumo").textContent = D.lojas.resumoROPO;
  D.lojas.unidades.forEach(l => {
    const el = document.createElement("div");
    el.className = "loja-card";
    el.innerHTML = `
      <div class="loja-nome">${l.nome}</div>
      <div class="loja-receita">${fmtBRL(l.receitaMes)}<span>/mês</span></div>
      <div class="loja-stats">
        <div><b>${l.convLoja}%</b><span>conversão</span></div>
        <div><b>${l.clickCollect}%</b><span>click&collect</span></div>
        <div><b>${l.nps}</b><span>NPS</span></div>
      </div>`;
    $("#lojas-grid").appendChild(el);
  });
  D.lojas.insights.forEach(i => {
    const el = document.createElement("div");
    el.className = "loja-insight";
    el.textContent = "✦ " + i;
    $("#lojas-insights").appendChild(el);
  });

  // tabela de produtos
  const tbody = $("#prod-table tbody");
  D.produtos.forEach(p => {
    const tr = document.createElement("tr");
    if (p.destaque) tr.className = "destaque-" + p.destaque;
    tr.innerHTML = `
      <td><b>${p.nome}</b>${p.destaque === "crise" ? " 🔴" : p.destaque === "oportunidade" ? " 🟢" : ""}</td>
      <td>${p.categoria}</td>
      <td>${fmtBRL(p.preco)}</td>
      <td>${p.conversao.toFixed(2).replace(".", ",")}%</td>
      <td class="${p.deltaConv7d >= 0 ? "delta-pos" : "delta-neg"}">${p.deltaConv7d >= 0 ? "+" : ""}${p.deltaConv7d.toFixed(1).replace(".", ",")}%</td>
      <td>${p.aprovacao}%</td>
      <td>${p.margem}%</td>
      <td>${p.devolucao.toFixed(1).replace(".", ",")}%</td>`;
    tbody.appendChild(tr);
  });

  /* ================= CHARTS ================= */
  let chartsReady = false;
  const chartInstances = [];
  function buildCharts() {
    chartsReady = true;
    Chart.defaults.color = cssVar("--txt-2");
    Chart.defaults.borderColor = cssVar("--chart-grid");
    Chart.defaults.font.family = "'Inter', sans-serif";
    Chart.defaults.font.size = 11;

    const labels = D.dias.map(d => {
      const [y, m, dd] = d.data.split("-");
      return dd + "/" + m;
    });
    const viralIdx = 75, checkoutIdx = 52;

    // receita
    chartInstances.push(new Chart($("#chart-receita"), {
      type: "line",
      data: {
        labels,
        datasets: [{
          label: "Receita (R$)",
          data: D.dias.map(d => d.receita),
          borderColor: cssVar("--accent"),
          backgroundColor: (ctx) => {
            const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, 280);
            g.addColorStop(0, "rgba(79,124,255,.35)"); g.addColorStop(1, "rgba(79,124,255,0)");
            return g;
          },
          fill: true, tension: .35, pointRadius: 0, borderWidth: 2
        }]
      },
      options: {
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: c => "R$ " + c.parsed.y.toLocaleString("pt-BR") } },
          annotation: undefined
        },
        scales: {
          x: { ticks: { maxTicksLimit: 12 } },
          y: { ticks: { callback: v => "R$ " + (v / 1000) + "k" } }
        }
      },
      plugins: [{
        id: "eventLines",
        afterDraw(chart) {
          const { ctx, chartArea, scales } = chart;
          const marks = [
            { i: checkoutIdx, label: "Novo checkout", color: cssVar("--pos") },
            { i: viralIdx, label: "Viral zíper Vega", color: cssVar("--neg") }
          ];
          marks.forEach(m => {
            const x = scales.x.getPixelForValue(m.i);
            ctx.save();
            ctx.strokeStyle = m.color; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.4;
            ctx.beginPath(); ctx.moveTo(x, chartArea.top); ctx.lineTo(x, chartArea.bottom); ctx.stroke();
            ctx.fillStyle = m.color; ctx.font = "600 10px Inter";
            ctx.fillText(m.label, x + 5, chartArea.top + 12);
            ctx.restore();
          });
        }
      }]
    }));

    // conversão
    chartInstances.push(new Chart($("#chart-conversao"), {
      type: "line",
      data: {
        labels,
        datasets: [{
          data: D.dias.map(d => d.conversao),
          borderColor: cssVar("--cyan"), tension: .35, pointRadius: 0, borderWidth: 2, fill: false
        }]
      },
      options: {
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { x: { ticks: { maxTicksLimit: 8 } }, y: { ticks: { callback: v => v.toFixed(1) + "%" } } }
      }
    }));

    // abandono
    chartInstances.push(new Chart($("#chart-abandono"), {
      type: "line",
      data: {
        labels,
        datasets: [{
          data: D.dias.map(d => d.abandono),
          borderColor: cssVar("--ie-color"), tension: .35, pointRadius: 0, borderWidth: 2
        }]
      },
      options: {
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { x: { ticks: { maxTicksLimit: 8 } }, y: { ticks: { callback: v => v + "%" } } }
      }
    }));

    // social stacked
    chartInstances.push(new Chart($("#chart-social"), {
      type: "bar",
      data: {
        labels: D.social.semanas,
        datasets: [
          { label: "Positivas", data: D.social.mencoes.positivas, backgroundColor: cssVar("--pos") },
          { label: "Neutras", data: D.social.mencoes.neutras, backgroundColor: cssVar("--txt-3") },
          { label: "Negativas", data: D.social.mencoes.negativas, backgroundColor: cssVar("--neg") }
        ]
      },
      options: {
        maintainAspectRatio: false,
        plugins: { legend: { position: "bottom" } },
        scales: { x: { stacked: true }, y: { stacked: true } }
      }
    }));

    // canais
    chartInstances.push(new Chart($("#chart-canais"), {
      type: "bar",
      data: {
        labels: D.social.canais.map(c => c.canal),
        datasets: [{
          data: D.social.canais.map(c => c.sentimento),
          backgroundColor: D.social.canais.map(c => c.sentimento >= 0 ? cssVar("--pos") : cssVar("--neg")),
          borderRadius: 6
        }]
      },
      options: {
        indexAxis: "y",
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { afterLabel: c => D.social.canais[c.dataIndex].obs } }
        },
        scales: { x: { min: -60, max: 60 } }
      }
    }));
  }

  /* ================= VIEW: ALERTAS ================= */
  const sevLabel = { critica: "Crítica", oportunidade: "Oportunidade", alta: "Alta", media: "Média" };
  D.alertas.forEach(a => {
    const card = document.createElement("div");
    card.className = "alerta-card " + a.severidade;
    card.innerHTML = `
      <div class="alerta-head">
        <span class="alerta-sev">${sevLabel[a.severidade]}</span>
        <span class="alerta-titulo">${a.titulo}</span>
      </div>
      <div class="alerta-grid">
        <div class="alerta-box">
          <div class="alerta-box-label">📉 Métrica interna</div>
          <div class="alerta-box-txt">${a.metricaInterna}</div>
        </div>
        <div class="alerta-box">
          <div class="alerta-box-label">📡 Contexto externo</div>
          <div class="alerta-box-txt">${a.contextoExterno}</div>
        </div>
      </div>
      <div class="alerta-bi-note"><b>Leitura Behavior Index:</b> ${a.leituraBI}</div>
      <div class="alerta-reco">
        <div class="alerta-box-label">✦ Ação prescrita pelo agente</div>
        <div class="alerta-box-txt">${a.recomendacao}</div>
      </div>
      <div class="alerta-foot">
        <div class="alerta-vies">⚠️ ${a.viesAlerta}</div>
        <button class="btn-ia">✦ Aprofundar com IA</button>
      </div>`;
    card.querySelector(".btn-ia").onclick = () =>
      window.askOutSight(`Aprofunde o alerta "${a.titulo}": detalhe o plano de execução da recomendação, com responsáveis sugeridos (Marketing, Produto, PR ou Comunicação) e como medir o resultado.`);
    $("#alertas-list").appendChild(card);
  });

})();
