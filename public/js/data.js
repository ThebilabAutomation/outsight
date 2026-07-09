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
    canal: "E-commerce próprio (VTEX) + Instagram Shopping + 4 lojas físicas",
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
    },
    {
      id: "clickcollect-classicas",
      cluster: "Clássicas Conscientes",
      contexto: "Comprar online e retirar na loja (click & collect)",
      scores: { D: 3.4, N: 3.3, U: 2.6, EF: 2.2, EC: 1.9, EFs: 2.8, ET: 1.6, EE: 1.4 },
      leitura: "Trocar esforço de tempo (frete) por esforço físico (ir à loja) compensa para este cluster: a retirada elimina a ansiedade da espera e permite provar/trocar na hora — EE despenca para 1,4.",
      alavanca: "Promover retirada na loja como default para CEPs próximos às 4 lojas; na retirada, 23% adicionam itens — treinar vendedoras para ativar esse momento."
    },
    {
      id: "plussize-cacadoras",
      cluster: "Caçadoras de Tendência (plus size)",
      contexto: "Encontrar numeração G3/G4 nos best-sellers",
      scores: { D: 4.6, N: 4.0, U: 3.4, EF: 2.8, EC: 4.2, EFs: 1.4, ET: 2.6, EE: 4.6 },
      leitura: "Motivação altíssima (4,0) — mas o esforço não vem do produto, vem da AUSÊNCIA dele: buscar sem achar (EC 4,2) e a frustração de exclusão (EE 4,6). Demanda reprimida que a concorrência captura.",
      alavanca: "Cápsula G3/G4 dos 4 best-sellers. São 3.900 buscas internas sem resultado por mês: o cliente já está dentro da loja pedindo o produto."
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

  /* ---------- PILAR 1 · Usabilidade & Funil (dados "de dentro") ---------- */
  const usabilidade = {
    releaseNota: "Release 2.9 do site publicada em 28/jun — novo componente de filtros na listagem de produtos.",
    funilGeralDevice: [
      { device: "Mobile", trafego: 68, convGeral: 1.9, produtoCarrinho: 7.1, checkoutCompra: 61 },
      { device: "Desktop", trafego: 32, convGeral: 3.4, produtoCarrinho: 10.8, checkoutCompra: 74 }
    ],
    funilProdutos: [
      { id: "lume",        produto: "Saia Plissada Lume",        pdpSessoes: 41200, pcDesktop: 9.8,  pcMobileAntes: 9.2,  pcMobileDepois: 5.1, deltaMobile: -44.6, flag: "critico" },
      { id: "sol",         produto: "Cropped Canelado Sol",      pdpSessoes: 58900, pcDesktop: 12.1, pcMobileAntes: 11.4, pcMobileDepois: 8.3, deltaMobile: -27.2, flag: "critico" },
      { id: "mare",        produto: "Trench Coat Maré",          pdpSessoes: 74300, pcDesktop: 11.6, pcMobileAntes: 10.9, pcMobileDepois: 10.7, deltaMobile: -1.8, flag: "ok" },
      { id: "aurora",      produto: "Vestido Midi Aurora",       pdpSessoes: 52100, pcDesktop: 10.2, pcMobileAntes: 9.6,  pcMobileDepois: 9.4,  deltaMobile: -2.1, flag: "ok" },
      { id: "vega",        produto: "Casaco Oversized Vega",     pdpSessoes: 66800, pcDesktop: 6.1,  pcMobileAntes: 8.8,  pcMobileDepois: 4.2,  deltaMobile: -52.3, flag: "externo" },
      { id: "constelacao", produto: "Vestido Festa Constelação", pdpSessoes: 28400, pcDesktop: 7.4,  pcMobileAntes: 6.2,  pcMobileDepois: 5.9,  deltaMobile: -4.8, flag: "atencao" }
    ],
    issues: [
      { id: "filtro-mobile", severidade: "critica", titulo: "Filtro de tamanho não aplica no mobile (Saias e Tops)", desde: "28/jun (release 2.9)", impacto: "Produto→carrinho mobile: Lume −44,6%, Sol −27,2%. Perda estimada: R$ 210k/mês.", evidencia: "Session replays mostram 3+ toques no filtro sem resposta; taxa de rage-click 14% na listagem de Saias." },
      { id: "cep-checkout", severidade: "alta", titulo: "Autocomplete de CEP falha intermitente no checkout mobile", desde: "12/jun", impacto: "2,3% das sessões de checkout travam na etapa de endereço; ~R$ 46k/mês em pedidos perdidos.", evidencia: "1.870 sessões/sem abandonam exatamente no campo CEP; erro de timeout na API de CEP em horário de pico." },
      { id: "pdp-video", severidade: "media", titulo: "PDPs com vídeo carregam em 4,8s no 4G", desde: "sempre (piorou com vídeos em maio)", impacto: "Bounce 22% maior nas PDPs Constelação e Maré via mobile 4G.", evidencia: "LCP 4,8s vs meta de 2,5s; 71% do tráfego dessas PDPs vem de redes sociais no celular." },
      { id: "fotos-lume", severidade: "media", titulo: "Fotos da Saia Lume não mostram forro nem caimento", desde: "lançamento", impacto: "34% das menções ao produto citam 'transparente/sem forro' — percepção de baixo valor pelo preço (R$ 289). Sentimento do tema: −38.", evidencia: "Devolução por 'diferente do esperado' 2,1x acima da média; zoom da foto não abre no mobile." }
    ]
  };

  /* ---------- PILAR 2 · Demanda Latente (ideias de novos produtos) ---------- */
  const demandaLatente = [
    {
      id: "plussize",
      tema: "Numeração plus size (G3/G4) nos best-sellers",
      mencoes: 1240, crescimento4s: 62, sentimento: -12,
      quote: "\"Amo tudo da VELLA mas paro no G2. Já desisti de 3 carrinhos por isso.\"",
      cruzamentoInterno: "3.900 buscas internas/mês por 'G3'/'G4' sem resultado; 8,4% de todas as buscas do site.",
      acao: "Cápsula plus size dos 4 best-sellers (Maré, Aurora, Ícone, Terra). Demanda já validada dentro e fora da loja.",
      potencial: "alto"
    },
    {
      id: "mare-oliva",
      tema: "Trench Coat Maré em verde-oliva",
      mencoes: 487, crescimento4s: 134, sentimento: 81,
      quote: "\"Se a VELLA lançar o Maré em verde-oliva eu compro no dia. Bege todo mundo tem.\"",
      cruzamentoInterno: "Maré é o produto com maior BI da marca (+2,10); cor é o pedido nº1 nos comentários dos anúncios.",
      acao: "Drop limitado verde-oliva aproveitando a onda do produto — escassez real + novidade na cor de maior pedido.",
      potencial: "alto"
    },
    {
      id: "noiva-civil",
      tema: "Uso inesperado: Constelação como vestido de casamento civil",
      mencoes: 312, crescimento4s: 209, sentimento: 88,
      quote: "\"Casei no civil com o Constelação e recebi mais elogios que no vestidão da festa.\"",
      cruzamentoInterno: "Picos de venda do Constelação às segundas (pós-fim de semana de casamentos); 18% dos pedidos com CEP ≠ endereço de cobrança (presente).",
      acao: "Cápsula 'Noiva Civil': Constelação em branco/off-white + acessórios. Nicho de alta margem que a concorrência não viu.",
      potencial: "choque"
    },
    {
      id: "mare-impermeavel",
      tema: "Versão impermeável do trench (ciclistas urbanas)",
      mencoes: 178, crescimento4s: 47, sentimento: 64,
      quote: "\"Queria o Maré numa versão que aguentasse a garoa da bike até o trabalho.\"",
      cruzamentoInterno: "Cluster Ritmo Acelerado sobreindexa nas menções; mobilidade ativa cresce nos grandes centros.",
      acao: "Parceria com tecido tecnológico para linha 'Maré Urbana' — testa demanda via pré-venda.",
      potencial: "medio"
    },
    {
      id: "alfaiataria-pastel",
      tema: "Alfaiataria em tons pastel",
      mencoes: 265, crescimento4s: 38, sentimento: 71,
      quote: "\"O Ícone em lilás ia ser minha assinatura no trabalho.\"",
      cruzamentoInterno: "Blazer Ícone tem 91% de aprovação — maior da marca; cor é extensão de baixo risco em produto validado.",
      acao: "Testar 2 cores (lilás, verde-sálvia) em tiragem curta no drop de primavera.",
      potencial: "medio"
    }
  ];

  /* ---------- PILAR 3 · Campanhas & Mídia (últimos 30 dias) ---------- */
  const campanhas = [
    { id: "vella-week", nome: "VELLA Week", canal: "TikTok Ads", clusterAlvo: "Caçadoras de Tendência", investimento: 54000, roas: 6.8, cac: 24, ctr: 3.4, nota: "Melhor ROAS da marca. UGC de creators médios convertendo 2,4x mais que estúdio. O canal da crise é também o canal do lucro.", status: "escalar" },
    { id: "inverno-essencial", nome: "Inverno Essencial", canal: "Meta Ads (Reels)", clusterAlvo: "Caçadoras de Tendência", investimento: 86000, roas: 4.2, cac: 38, ctr: 2.1, nota: "Criativo vencedor: vídeo UGC com o Trench Maré. Criativos de estúdio com CTR 3x menor.", status: "otimizar" },
    { id: "alfaiataria-trabalha", nome: "Alfaiataria Que Trabalha", canal: "Google PMax", clusterAlvo: "Ritmo Acelerado", investimento: 71000, roas: 3.1, cac: 41, ctr: 1.8, nota: "Estável e eficiente para fundo de funil; termos de marca inflam levemente o ROAS real.", status: "manter" },
    { id: "sempre-vella", nome: "Sempre VELLA (institucional)", canal: "Meta + YouTube", clusterAlvo: "Clássicas Conscientes (35–50)", investimento: 62000, roas: 1.4, cac: 96, ctr: 0.9, nota: "DESALINHADA: 61% do engajamento vem de 18–27 anos — a campanha fala com quem já é cliente de outro jeito e não alcança o alvo pretendido.", status: "revisar" },
    { id: "volta-vella", nome: "Volta pra VELLA (CRM)", canal: "E-mail + WhatsApp", clusterAlvo: "Clássicas Conscientes (recompra)", investimento: 8000, roas: 5.2, cac: 12, ctr: 8.7, nota: "Ótimo ROAS mas alcance pequeno. Objeção nº1 nas respostas: frete. Resolver o frete multiplica este canal.", status: "escalar" }
  ];
  const publicoGap = {
    resumo: "A marca acha que fala com 35–50, mas 58% do engajamento orgânico e 61% do engajamento da campanha institucional vêm de 18–27. O público real é mais jovem que o pretendido — exceto no CRM, onde as Clássicas respondem.",
    alvoPretendido: { "18–27": 20, "28–38": 35, "39–50": 35, "50+": 10 },
    publicoReal:    { "18–27": 47, "28–38": 29, "39–50": 18, "50+": 6 }
  };

  /* ---------- Omnichannel · Lojas físicas ---------- */
  const lojas = {
    resumoROPO: "68% das compradoras de loja física visitaram o site nos 7 dias anteriores (ROPO). 14% dos pedidos online são retirados em loja — e na retirada, 23% adicionam itens.",
    unidades: [
      { id: "jardins", nome: "SP · Jardins", receitaMes: 512000, visitantesMes: 11400, convLoja: 21, clickCollect: 19, nps: 78 },
      { id: "centernorte", nome: "SP · Center Norte", receitaMes: 438000, visitantesMes: 14800, convLoja: 17, clickCollect: 11, nps: 66 },
      { id: "barra", nome: "Rio · Barra", receitaMes: 391000, visitantesMes: 10200, convLoja: 19, clickCollect: 13, nps: 71 },
      { id: "savassi", nome: "BH · Savassi", receitaMes: 356000, visitantesMes: 7900, convLoja: 24, clickCollect: 16, nps: 82 }
    ],
    insights: [
      "BH Savassi tem a maior conversão (24%): time de vendedoras reduz o Esforço Emocional na prova — influência social bem aplicada.",
      "Devolução de pedidos online feita NA LOJA gera NPS 74 vs. 58 pelo correio — e 31% saem com nova compra.",
      "Click & collect elimina o maior atrito do cluster Clássicas (frete/tempo) trocando-o por esforço físico baixo."
    ]
  };

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
      id: "alerta-filtro",
      severidade: "critica",
      titulo: "Filtro de tamanho quebrado no mobile derrubou Saias e Tops",
      metricaInterna: "Desde a release 2.9 (28/jun), produto→carrinho mobile: Saia Lume −44,6% (9,2% → 5,1%) e Cropped Sol −27,2%. Rage-clicks de 14% na listagem. Perda estimada: R$ 210k/mês.",
      contextoExterno: "Nenhuma menção negativa externa sobre os produtos — o problema é 100% interno. As peças seguem bem avaliadas (Lume 79%, Sol 76%).",
      recomendacao: "Hotfix ou rollback do componente de filtros da release 2.9 hoje; adicionar teste de regressão mobile no deploy; monitorar produto→carrinho por device como métrica de guarda.",
      leituraBI: "O Esforço Cognitivo do mobile explodiu: a cliente toca no filtro 3+ vezes sem resposta e desiste. Motivação intacta, esforço artificial — o BI cai sem o produto ter culpa.",
      viesAlerta: "Heurística da representatividade: a queda 'se parece' com produto que saiu de moda, e o time quase matou a Lume. Sempre separe causa interna (funil) de causa externa (percepção) antes de decidir."
    },
    {
      id: "alerta-plussize",
      severidade: "oportunidade",
      titulo: "Demanda reprimida: plus size é venda perdida todo dia",
      metricaInterna: "3.900 buscas internas/mês por G3/G4 sem nenhum resultado (8,4% de todas as buscas). Carrinhos abandonados após busca de tamanho: 2,3x a média.",
      contextoExterno: "1.240 menções pedindo numeração plus size (+62% em 4 semanas). Tom de frustração: 'paro no G2'. Concorrentes diretos já lançaram linhas estendidas.",
      recomendacao: "Cápsula G3/G4 dos 4 best-sellers (Maré, Aurora, Ícone, Terra). A demanda já está validada dentro (busca) e fora (menções) — começar por pré-venda para dimensionar estoque.",
      leituraBI: "BI do contexto plus size: motivação 4,0 travada por esforço 3,12 — e o esforço é a AUSÊNCIA do produto. É o único contexto onde a marca cria o próprio atrito.",
      viesAlerta: "Viés de sobrevivência: o dashboard só mostra quem CONSEGUIU comprar. As 3.900 buscas sem resultado são invisíveis na receita — mas são a maior oportunidade da base."
    },
    {
      id: "alerta-institucional",
      severidade: "media",
      titulo: "Campanha institucional fala com o público errado",
      metricaInterna: "'Sempre VELLA': R$ 62k investidos, ROAS 1,4, CAC R$ 96 (2,5x a média). CTR 0,9%.",
      contextoExterno: "61% do engajamento da campanha vem de 18–27 anos — o alvo era 35–50. No orgânico, o padrão se repete: 58% do engajamento é de 18–27.",
      recomendacao: "Pausar a veiculação atual; recriar criativos segmentados por cluster (a mensagem que funciona com Clássicas está no CRM, não no feed); realocar 50% da verba para VELLA Week (ROAS 6,8).",
      leituraBI: "Para as Clássicas, um vídeo institucional no feed não reduz nenhum esforço real (frete, confiança, prova) — não move IM nem IE. O canal certo para elas é CRM + loja.",
      viesAlerta: "Viés de confirmação: o time de brand mede sucesso por alcance e views — métricas que confirmam a tese da campanha sem testar se o ALVO foi tocado."
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

  /* ---------- Prompts sugeridos (3 pilares) ---------- */
  const promptsPilares = [
    {
      pilar: "Problema", icone: "🔍",
      descricao: "Por que parou de vender? Dados de dentro × dados de fora",
      prompts: [
        "Por que a Saia Lume parou de vender? É o produto ou o site?",
        "Por que a conversão do Casaco Vega caiu 25%?",
        "Onde estou perdendo vendas por esforço percebido?"
      ]
    },
    {
      pilar: "Novos produtos", icone: "💡",
      descricao: "O que o público pede que ainda não existe",
      prompts: [
        "Que produtos o público está pedindo que não existem?",
        "Algum uso inesperado dos nossos produtos virando tendência?",
        "Onde há demanda reprimida que a concorrência pode capturar?"
      ]
    },
    {
      pilar: "Público & campanha", icone: "🎯",
      descricao: "Quem é o público real e o que está dando certo",
      prompts: [
        "Qual campanha está dando certo e para quem?",
        "Minha campanha institucional está falando com quem eu penso?",
        "Como aumentar a recompra das Clássicas Conscientes?"
      ]
    }
  ];
  const promptsSugeridos = promptsPilares.flatMap(p => p.prompts);

  return { brand, produtos, clusters, biContextos, dias, social, alertas, usabilidade, demandaLatente, campanhas, publicoGap, lojas, promptsPilares, promptsSugeridos };
})();
