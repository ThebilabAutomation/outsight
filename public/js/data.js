/* ============================================================
   Be OutSight — Dataset Fictício (Demo)
   Marca simulada: VELLA — moda feminina (e-commerce)
   Período: últimos 90 dias (encerrando em 08/07/2026)
   ============================================================ */

const VELLA = (() => {

  /* ---------- Marca ---------- */
  const brand = {
    nome: "VELLA",
    segmento: "Fashion • Moda Feminina",
    canal: "E-commerce próprio (VTEX) + Instagram Shopping",
    faturamentoMes: 2847000,
    ticketMedio: 389,
    nps: 62,
    behaviorIndexGeral: 0.92
  };

  /* ---------- Produtos ---------- */
  const produtos = [
    { id: "vega",        nome: "Casaco Oversized Vega",      categoria: "Casacos",    preco: 559, margem: 48, conversao: 1.61, deltaConv7d: -25.3, aprovacao: 61, devolucao: 8.4, estoque: 412, destaque: "crise" },
    { id: "mare",        nome: "Trench Coat Maré",           categoria: "Casacos",    preco: 689, margem: 62, conversao: 3.42, deltaConv7d: 18.7,  aprovacao: 85, devolucao: 2.1, estoque: 268, destaque: "oportunidade" },
    { id: "aurora",      nome: "Vestido Midi Aurora",        categoria: "Vestidos",   preco: 429, margem: 55, conversao: 2.84, deltaConv7d: 4.2,   aprovacao: 88, devolucao: 5.6, estoque: 534 },
    { id: "icone",       nome: "Blazer Alfaiataria Ícone",   categoria: "Alfaiataria",preco: 619, margem: 58, conversao: 2.95, deltaConv7d: 6.1,   aprovacao: 91, devolucao: 3.2, estoque: 189 },
    { id: "terra",       nome: "Calça Wide Leg Terra",       categoria: "Calças",     preco: 349, margem: 52, conversao: 3.11, deltaConv7d: 2.8,   aprovacao: 84, devolucao: 9.8, estoque: 641 },
    { id: "lume",        nome: "Saia Plissada Lume",         categoria: "Saias",      preco: 289, margem: 50, conversao: 2.37, deltaConv7d: -1.4,  aprovacao: 79, devolucao: 6.1, estoque: 377 },
    { id: "nuvem",       nome: "Tênis Plataforma Nuvem",     categoria: "Calçados",   preco: 459, margem: 44, conversao: 2.62, deltaConv7d: 9.3,   aprovacao: 82, devolucao: 11.2, estoque: 298 },
    { id: "duna",        nome: "Bolsa Estruturada Duna",     categoria: "Acessórios", preco: 519, margem: 66, conversao: 1.98, deltaConv7d: 3.5,   aprovacao: 90, devolucao: 1.8, estoque: 154 },
    { id: "sol",         nome: "Cropped Canelado Sol",       categoria: "Tops",       preco: 159, margem: 47, conversao: 3.87, deltaConv7d: -3.2,  aprovacao: 76, devolucao: 7.4, estoque: 823 },
    { id: "orla",        nome: "Jaqueta Jeans Orla",         categoria: "Casacos",    preco: 399, margem: 51, conversao: 2.51, deltaConv7d: 5.9,   aprovacao: 83, devolucao: 4.9, estoque: 445 },
    { id: "constelacao", nome: "Vestido Festa Constelação",  categoria: "Vestidos",   preco: 789, margem: 60, conversao: 1.74, deltaConv7d: 7.6,   aprovacao: 87, devolucao: 13.5, estoque: 96 },
    { id: "brisa",       nome: "Camisa Linho Brisa",         categoria: "Camisas",    preco: 319, margem: 53, conversao: 2.29, deltaConv7d: 1.1,   aprovacao: 81, devolucao: 5.2, estoque: 502 }
  ];

  /* ---------- Clusters comportamentais ---------- */
  const clusters = [
    {
      id: "cacadoras",
      nome: "Caçadoras de Tendência",
      perfil: "18–27 anos, descoberta via TikTok/Reels, compra por impulso guiada por prova social e escassez.",
      share: 34,
      drivers: ["Prova social (efeito manada)", "Escassez / urgência", "Busca por status e pertencimento"],
      canais: ["TikTok", "Instagram Reels"]
    },
    {
      id: "ritmo",
      nome: "Ritmo Acelerado",
      perfil: "28–38 anos, profissionais urbanas, compra planejada e rápida, valorizam eficiência e frete expresso.",
      share: 27,
      drivers: ["Utilidade funcional", "Redução de esforço de tempo", "Confiança na marca (efeito halo)"],
      canais: ["Google", "E-mail", "App"]
    },
    {
      id: "classicas",
      nome: "Clássicas Conscientes",
      perfil: "35–50 anos, decisão deliberada (Sistema 2), pesquisam reviews e composição, sensíveis a frete e trocas.",
      share: 24,
      drivers: ["Aversão à perda", "Prova social qualificada (reviews)", "Memória afetiva com a marca"],
      canais: ["Site direto", "E-mail", "WhatsApp"]
    },
    {
      id: "ocasiao",
      nome: "Ocasião Especial",
      perfil: "Compra eventual para eventos (festas, formaturas), alta urgência e alto esforço emocional (medo de errar).",
      share: 15,
      drivers: ["Urgência de calendário", "Medo de arrependimento", "Prêmio de indulgência"],
      canais: ["Instagram", "Google", "Indicação"]
    }
  ];

  /* ---------- Behavior Index por contexto (BI = IM − IE) ----------
     IM = (D + N + U) / 3          [Desejo, Necessidade, Urgência: 1–5]
     IE = (EF + EC + EFs + ET + EE) / 5  [Financeiro, Cognitivo, Físico, Tempo, Emocional: 1–5]
  ------------------------------------------------------------------ */
  const round2 = n => Math.round(n * 100) / 100;
  const makeBI = (s) => {
    const im = round2((s.D + s.N + s.U) / 3);
    const ie = round2((s.EF + s.EC + s.EFs + s.ET + s.EE) / 5);
    return { im, ie, bi: round2(im - ie) };
  };

  const biContextos = [
    {
      id: "vega-cacadoras",
      cluster: "Caçadoras de Tendência",
      contexto: "Compra do Casaco Oversized Vega (pós-vídeo viral do zíper)",
      scores: { D: 2.4, N: 2.4, U: 2.7, EF: 3.3, EC: 2.6, EFs: 1.0, ET: 2.3, EE: 4.7 },
      leitura: "O vídeo viral no TikTok quebrou a confiança: o Esforço Emocional (4,7) domina o contexto. O desejo, que era o motor do produto, despencou junto com a prova social.",
      alavanca: "Responder publicamente à falha do zíper (transparência reduz EE), pausar mídia do Vega e redirecionar tráfego para o Trench Coat Maré."
    },
    {
      id: "mare-cacadoras",
      cluster: "Caçadoras de Tendência",
      contexto: "Compra do Trench Coat Maré (85% de aprovação, tendência de inverno)",
      scores: { D: 4.7, N: 3.1, U: 4.2, EF: 3.0, EC: 1.8, EFs: 1.0, ET: 2.0, EE: 1.7 },
      leitura: "Motivação altíssima com esforço baixo: prova social forte (85% aprovação) e senso de urgência sazonal. Propensão máxima à ação.",
      alavanca: "Colocar o Maré no banner principal, ativar gatilho de escassez real (estoque 268 un.) e creators de médio porte para amplificar o efeito manada."
    },
    {
      id: "icone-ritmo",
      cluster: "Ritmo Acelerado",
      contexto: "Compra do Blazer Alfaiataria Ícone (uso corporativo)",
      scores: { D: 4.1, N: 4.3, U: 3.6, EF: 2.6, EC: 2.9, EFs: 1.1, ET: 2.4, EE: 2.0 },
      leitura: "Necessidade funcional alta e baixo esforço emocional: compra racionalizada que já virou 'decisão segura'. Cluster fiel ao produto.",
      alavanca: "Reduzir esforço cognitivo com recomendação de look completo (blazer + calça Terra) e recompra em 1 clique."
    },
    {
      id: "aurora-classicas",
      cluster: "Clássicas Conscientes",
      contexto: "Compra do Vestido Midi Aurora (primeira compra na marca)",
      scores: { D: 3.8, N: 3.4, U: 2.2, EF: 2.4, EC: 3.6, EFs: 1.2, ET: 3.9, EE: 3.1 },
      leitura: "BI em ponto crítico: desejo existe, mas o esforço de tempo (frete 9+ dias no NE) e a carga de pesquisa travam a decisão. É o cluster que mais abandona carrinho.",
      alavanca: "Exibir prazo de entrega real na página do produto (reduz ambiguidade), resumo de reviews com IA (reduz EC) e política de troca em destaque (reduz aversão à perda)."
    },
    {
      id: "constelacao-ocasiao",
      cluster: "Ocasião Especial",
      contexto: "Compra do Vestido Festa Constelação (evento com data marcada)",
      scores: { D: 4.9, N: 3.9, U: 4.6, EF: 3.8, EC: 3.2, EFs: 1.3, ET: 4.1, EE: 3.6 },
      leitura: "Motivação máxima, mas esforço alto: medo de não chegar a tempo (ET 4,1) e de não servir (EE 3,6). A devolução de 13,5% confirma a ansiedade do contexto.",
      alavanca: "Garantia 'Chega antes do seu evento ou o frete é grátis', tabela de medidas com IA e troca expressa prioritária."
    },
    {
      id: "recompra-classicas",
      cluster: "Clássicas Conscientes",
      contexto: "Recompra em até 90 dias (fidelização)",
      scores: { D: 3.2, N: 3.6, U: 2.0, EF: 2.2, EC: 1.6, EFs: 1.0, ET: 3.8, EE: 2.9 },
      leitura: "A recompra não acontece por falta de urgência e pela memória negativa do frete lento — a última experiência ancora a próxima decisão (heurística da disponibilidade).",
      alavanca: "Programa de acesso antecipado a coleções (urgência + pertencimento) e frete expresso como benefício de fidelidade (reescreve a memória do esforço)."
    }
  ].map(c => ({ ...c, ...makeBI(c.scores) }));

  /* ---------- Série diária (90 dias, determinística) ---------- */
  // Eventos na linha do tempo:
  //  d0 = 10/abr/2026 ... d89 = 08/07/2026
  //  d52 (01/jun): novo checkout → abandono cai de ~74% para ~68%
  //  d75 (24/jun): vídeo viral do zíper do Vega → conversão geral sofre, menções negativas explodem
  //  tendência: inverno puxa sessões de casacos a partir de d40
  const seed = s => () => (s = (s * 16807) % 2147483647) / 2147483647;
  const rnd = seed(42);
  const dias = [];
  const start = new Date(2026, 3, 10); // 10/abr/2026
  for (let i = 0; i < 90; i++) {
    const dt = new Date(start); dt.setDate(start.getDate() + i);
    const dow = dt.getDay();
    const weekendBoost = (dow === 0 || dow === 6) ? 1.14 : 1.0;
    const winter = i > 40 ? 1 + (i - 40) * 0.006 : 1.0;
    const viralHit = i >= 75 ? (i < 82 ? 0.86 : 0.92) : 1.0;
    const sessions = Math.round(31000 * weekendBoost * winter * (0.92 + rnd() * 0.16));
    const baseConv = 2.42 * winter * viralHit * (0.94 + rnd() * 0.12);
    const conv = round2(baseConv);
    const ticket = Math.round(389 * (0.95 + rnd() * 0.1));
    const receita = Math.round(sessions * (conv / 100) * ticket);
    const abandonoBase = i < 52 ? 74 : 68;
    const abandono = round2(abandonoBase + (i >= 75 && i < 82 ? 3.5 : 0) + (rnd() * 3 - 1.5));
    dias.push({
      data: dt.toISOString().slice(0, 10),
      sessoes: sessions,
      conversao: conv,
      receita,
      abandono
    });
  }

  /* ---------- Social Listening ---------- */
  const socialSemanas = ["S-8","S-7","S-6","S-5","S-4","S-3","S-2","S-1 (atual)"];
  const social = {
    semanas: socialSemanas,
    mencoes: {
      positivas: [1240, 1310, 1385, 1420, 1510, 1490, 1830, 2140],
      neutras:   [860,  890,  910,  940,  980,  1010, 1450, 1680],
      negativas: [310,  290,  340,  325,  360,  380,  2870, 1920]
    },
    canais: [
      { canal: "TikTok",      share: 41, sentimento: -18, obs: "Dominado pela crise do zíper Vega; hashtag #casacovega com 4,2M de views." },
      { canal: "Instagram",   share: 33, sentimento: 34,  obs: "Trench Coat Maré em alta com looks de inverno; 85% de aprovação em enquetes." },
      { canal: "Reclame Aqui",share: 14, sentimento: -46, obs: "62% das queixas citam prazo de frete Norte/Nordeste (9+ dias)." },
      { canal: "YouTube",     share: 7,  sentimento: 22,  obs: "Reviews de alfaiataria elogiam caimento do Blazer Ícone." },
      { canal: "X/Twitter",   share: 5,  sentimento: -8,  obs: "Discussões pontuais sobre preço vs. concorrência." }
    ],
    temas: [
      { tema: "Zíper Casaco Vega", volume: 4830, sentimento: -72, tendencia: "explosivo" },
      { tema: "Trench Coat Maré (looks de inverno)", volume: 3120, sentimento: 68, tendencia: "crescendo" },
      { tema: "Frete demorado (N/NE)", volume: 1890, sentimento: -58, tendencia: "estável-alto" },
      { tema: "Unboxing / embalagem", volume: 1240, sentimento: 74, tendencia: "estável" },
      { tema: "Tabela de medidas confusa", volume: 860, sentimento: -41, tendencia: "crescendo" }
    ],
    influenciadores: [
      { nome: "@stylecomlulu", evento: "Vídeo (24/jun) mostrando zíper do Vega enroscando — 2,1M views, 214k likes", impacto: "negativo" },
      { nome: "@amandalooks", evento: "Reel 'Trench Maré em 5 looks' — 890k views, salvamentos 4x acima da média", impacto: "positivo" },
      { nome: "@corporativa.chic", evento: "Review do Blazer Ícone para entrevistas de emprego — 320k views", impacto: "positivo" }
    ]
  };

  /* ---------- Alertas do agente ---------- */
  const alertas = [
    {
      id: "alerta-vega",
      severidade: "critica",
      titulo: "Conversão do Casaco Vega caiu 25% em 72h",
      metricaInterna: "Conversão do produto: 2,16% → 1,61% (−25,3%). Sessões na página subiram 38% (curiosidade ≠ intenção).",
      contextoExterno: "Vídeo da @stylecomlulu no TikTok (24/jun, 2,1M views) mostra o zíper enroscando. Tema 'Zíper Casaco Vega' com 4.830 menções e sentimento −72.",
      recomendacao: "Pausar campanhas do Vega (economia estimada: R$ 18k/semana), trocar o banner principal para o Trench Coat Maré (85% aprovação, margem 62%) e publicar resposta oficial sobre o zíper com política de troca facilitada.",
      leituraBI: "BI das Caçadoras para o Vega caiu de +1,4 para −0,3: o Esforço Emocional (desconfiança) superou a motivação. Sem intervenção, a inação vira regra.",
      viesAlerta: "Cuidado com o viés de ancoragem: o desempenho histórico do Vega não prevê o comportamento pós-crise. E atenção ao efeito halo invertido — a crise de um produto pode contaminar a percepção da marca inteira se não houver resposta pública."
    },
    {
      id: "alerta-mare",
      severidade: "oportunidade",
      titulo: "Trench Coat Maré: janela de tendência aberta",
      metricaInterna: "Conversão +18,7% na semana; salvamentos no Instagram 4x acima da média; estoque para ~3 semanas no ritmo atual.",
      contextoExterno: "Reel da @amandalooks (890k views) e frente fria prolongada no Sudeste ampliaram busca por 'trench coat' em 64%.",
      recomendacao: "Realocar a verba pausada do Vega para o Maré, ativar gatilho de escassez real ('últimas 268 unidades') e negociar reposição com o fornecedor ainda esta semana.",
      leituraBI: "BI de +2,10 nas Caçadoras — o maior da marca. Motivação 4,0 contra esforço 1,9: cada real de mídia aqui rende mais que em qualquer outro produto.",
      viesAlerta: "Evite a falácia dos custos irrecuperáveis: a verba já investida no Vega não justifica mantê-lo no ar durante a crise."
    },
    {
      id: "alerta-frete",
      severidade: "alta",
      titulo: "Frete N/NE está travando o cluster mais fiel",
      metricaInterna: "Abandono de carrinho 11 p.p. acima da média nas regiões N/NE; recompra das Clássicas Conscientes caiu 14% no trimestre.",
      contextoExterno: "62% das queixas no Reclame Aqui citam prazo de 9+ dias. Tema 'Frete demorado' com sentimento −58.",
      recomendacao: "Exibir prazo real de entrega na página do produto (reduz ambiguidade), testar hub logístico em Recife e oferecer frete expresso como benefício de fidelidade.",
      leituraBI: "No contexto de recompra, o Esforço de Tempo (3,8) é a maior barreira — a memória do frete lento ancora a próxima decisão antes mesmo dela começar.",
      viesAlerta: "Heurística da disponibilidade em ação: a última experiência ruim de entrega pesa mais na decisão do que 5 experiências boas anteriores."
    },
    {
      id: "alerta-medidas",
      severidade: "media",
      titulo: "Tabela de medidas gera devolução e medo de errar",
      metricaInterna: "Devolução do Vestido Constelação em 13,5% (motivo nº1: 'não serviu'). Tema 'tabela de medidas' crescendo (+41% em 4 semanas).",
      contextoExterno: "Menções com sentimento −41 relatam confusão entre numeração VELLA e padrão nacional.",
      recomendacao: "Implementar provador virtual / recomendação de tamanho por IA e fotos com modelos de biotipos variados (reduz esforço cognitivo e emocional).",
      leituraBI: "No contexto Ocasião Especial, EE de 3,6 vem do medo de errar o tamanho para um evento com data marcada. Reduzir essa incerteza destrava um BI que já é positivo.",
      viesAlerta: "Efeito de ambiguidade: quando a probabilidade de acerto parece desconhecida, o cliente evita a escolha — mesmo desejando o produto."
    }
  ];

  /* ---------- Prompts sugeridos ---------- */
  const promptsSugeridos = [
    "Por que a conversão do Casaco Vega caiu 25%?",
    "Qual o Behavior Index das Caçadoras de Tendência para o Trench Maré?",
    "Onde estou perdendo vendas por esforço percebido?",
    "Que vieses podem estar distorcendo minha leitura dos dados desta semana?",
    "Monte um plano de 7 dias para responder à crise do zíper.",
    "Como aumentar a recompra das Clássicas Conscientes?",
    "Qual produto merece o banner principal e por quê?",
    "Resuma os sinais externos que o time de PR precisa ver hoje."
  ];

  return { brand, produtos, clusters, biContextos, dias, social, alertas, promptsSugeridos };
})();
