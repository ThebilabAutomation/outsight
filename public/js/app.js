/* ============================================================
   Be OutSight — App (demo VELLA)
   ============================================================ */
(() => {
  const D = VELLA;
  const $ = sel => document.querySelector(sel);
  const $$ = sel => document.querySelectorAll(sel);
  const fmtBI = v => (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v).toFixed(2).replace(".", ",");
  const fmtBRL = v => "R$ " + v.toLocaleString("pt-BR");
  const biColor = v => v >= 0.5 ? "#2ee6a8" : v <= -0.1 ? "#ff5c7a" : "#ffb547";
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
    ctx.strokeStyle = "rgba(120,150,220,.12)";
    ctx.beginPath();
    ctx.arc(cx, cy, r, Math.PI, 2 * Math.PI);
    ctx.stroke();

    // arco de valor (gradiente vermelho→amarelo→verde)
    const grad = ctx.createLinearGradient(cx - r, 0, cx + r, 0);
    grad.addColorStop(0, "#ff5c7a");
    grad.addColorStop(0.45, "#ffb547");
    grad.addColorStop(1, "#2ee6a8");
    ctx.strokeStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, r, Math.PI, Math.PI + Math.PI * frac);
    ctx.stroke();

    // ponteiro
    const ang = Math.PI + Math.PI * frac;
    const px = cx + (r - 2) * Math.cos(ang), py = cy + (r - 2) * Math.sin(ang);
    ctx.fillStyle = "#fff";
    ctx.beginPath(); ctx.arc(px, py, 5.5, 0, 2 * Math.PI); ctx.fill();
    ctx.strokeStyle = biColor(value); ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(px, py, 8, 0, 2 * Math.PI); ctx.stroke();
  }

  drawGauge($("#gauge-rail"), D.brand.behaviorIndexGeral);
  $("#gauge-rail-value").textContent = fmtBI(D.brand.behaviorIndexGeral);
  $("#gauge-rail-value").style.color = biColor(D.brand.behaviorIndexGeral);
  drawGauge($("#gauge-big"), D.brand.behaviorIndexGeral, { thick: 18 });
  $("#gauge-big-value").textContent = fmtBI(D.brand.behaviorIndexGeral);
  $("#gauge-big-value").style.color = biColor(D.brand.behaviorIndexGeral);
  $("#bi-mini-value").textContent = fmtBI(D.brand.behaviorIndexGeral);

  /* ================= CHAT ================= */
  const chatMessages = $("#chat-messages");
  const chatScroll = $("#chat-scroll");
  const input = $("#chat-input");
  const sendBtn = $("#chat-send");
  const history = [];
  let waiting = false;

  // chips de prompts sugeridos
  D.promptsSugeridos.forEach(p => {
    const chip = document.createElement("button");
    chip.className = "chip";
    chip.textContent = p;
    chip.onclick = () => { input.value = p; sendMessage(); };
    $("#prompt-chips").appendChild(chip);
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
          `<p style="font-size:11px;color:#ffb547;margin-bottom:8px">⚠️ Modo offline (IA indisponível: ${err.message}). Resposta pré-calculada da demo:</p>` +
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
  const sevColor = { critica: "#ff5c7a", oportunidade: "#2ee6a8", alta: "#ffb547", media: "#4f7cff" };
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
    const cor = t.sentimento >= 0 ? "#2ee6a8" : "#ff5c7a";
    el.innerHTML = `
      <div class="tema-nome">${t.tema}</div>
      <div class="tema-meta">${t.volume.toLocaleString("pt-BR")} menções · ${t.tendencia}</div>
      <div class="tema-bar"><i style="width:${pct}%;background:${cor}"></i></div>
      <div class="tema-sent" style="color:${cor}">${t.sentimento > 0 ? "+" : ""}${t.sentimento}</div>`;
    $("#temas-list").appendChild(el);
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
  function buildCharts() {
    chartsReady = true;
    Chart.defaults.color = "#93a1bd";
    Chart.defaults.borderColor = "rgba(120,150,220,.10)";
    Chart.defaults.font.family = "'Inter', sans-serif";
    Chart.defaults.font.size = 11;

    const labels = D.dias.map(d => {
      const [y, m, dd] = d.data.split("-");
      return dd + "/" + m;
    });
    const viralIdx = 75, checkoutIdx = 52;

    // receita
    new Chart($("#chart-receita"), {
      type: "line",
      data: {
        labels,
        datasets: [{
          label: "Receita (R$)",
          data: D.dias.map(d => d.receita),
          borderColor: "#4f7cff",
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
            { i: checkoutIdx, label: "Novo checkout", color: "#2ee6a8" },
            { i: viralIdx, label: "Viral zíper Vega", color: "#ff5c7a" }
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
    });

    // conversão
    new Chart($("#chart-conversao"), {
      type: "line",
      data: {
        labels,
        datasets: [{
          data: D.dias.map(d => d.conversao),
          borderColor: "#38d6ff", tension: .35, pointRadius: 0, borderWidth: 2, fill: false
        }]
      },
      options: {
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { x: { ticks: { maxTicksLimit: 8 } }, y: { ticks: { callback: v => v.toFixed(1) + "%" } } }
      }
    });

    // abandono
    new Chart($("#chart-abandono"), {
      type: "line",
      data: {
        labels,
        datasets: [{
          data: D.dias.map(d => d.abandono),
          borderColor: "#ff8a5c", tension: .35, pointRadius: 0, borderWidth: 2
        }]
      },
      options: {
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { x: { ticks: { maxTicksLimit: 8 } }, y: { ticks: { callback: v => v + "%" } } }
      }
    });

    // social stacked
    new Chart($("#chart-social"), {
      type: "bar",
      data: {
        labels: D.social.semanas,
        datasets: [
          { label: "Positivas", data: D.social.mencoes.positivas, backgroundColor: "#2ee6a8" },
          { label: "Neutras", data: D.social.mencoes.neutras, backgroundColor: "#5c6a87" },
          { label: "Negativas", data: D.social.mencoes.negativas, backgroundColor: "#ff5c7a" }
        ]
      },
      options: {
        maintainAspectRatio: false,
        plugins: { legend: { position: "bottom" } },
        scales: { x: { stacked: true }, y: { stacked: true } }
      }
    });

    // canais
    new Chart($("#chart-canais"), {
      type: "bar",
      data: {
        labels: D.social.canais.map(c => c.canal),
        datasets: [{
          data: D.social.canais.map(c => c.sentimento),
          backgroundColor: D.social.canais.map(c => c.sentimento >= 0 ? "#2ee6a8" : "#ff5c7a"),
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
    });
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
