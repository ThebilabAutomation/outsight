/* ============================================================
   Be OutSight — Autenticação (Supabase, login via popup)
   Se o config estiver com placeholder, o gate fica desativado.
   ============================================================ */
(() => {
  const cfg = window.OUTSIGHT_CONFIG || {};
  const overlay = document.getElementById("auth-overlay");
  const form = document.getElementById("auth-form");
  const emailEl = document.getElementById("auth-email");
  const passEl = document.getElementById("auth-pass");
  const errEl = document.getElementById("auth-error");
  const submitBtn = document.getElementById("auth-submit");
  const userChip = document.getElementById("user-chip");
  const userEmailEl = document.getElementById("user-email");
  const logoutBtn = document.getElementById("logout-btn");

  const configured = cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY &&
    !cfg.SUPABASE_URL.includes("COLE_AQUI") && !cfg.SUPABASE_ANON_KEY.includes("COLE_AQUI");

  if (!configured || !window.supabase) {
    // Supabase ainda não configurado: app aberto (sem gate)
    overlay.classList.add("hidden");
    window.outsightToken = null;
    return;
  }

  const sb = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);

  const showApp = (session) => {
    overlay.classList.add("hidden");
    window.outsightToken = session.access_token;
    userEmailEl.textContent = session.user?.email || "";
    userChip.hidden = false;
  };
  const showLogin = () => {
    overlay.classList.remove("hidden");
    window.outsightToken = null;
    userChip.hidden = true;
    setTimeout(() => emailEl.focus(), 80);
  };

  sb.auth.getSession().then(({ data }) => data.session ? showApp(data.session) : showLogin());
  sb.auth.onAuthStateChange((_event, session) => session ? showApp(session) : showLogin());

  const errMsg = (error) => {
    const m = (error?.message || "").toLowerCase();
    if (m.includes("invalid login credentials")) return "E-mail ou senha incorretos.";
    if (m.includes("email not confirmed")) return "E-mail ainda não confirmado. Fale com o administrador.";
    if (m.includes("rate limit")) return "Muitas tentativas. Aguarde um instante e tente de novo.";
    if (m.includes("failed to fetch") || m.includes("network")) return "Sem conexão com o servidor de autenticação.";
    return "Não foi possível entrar. Tente novamente.";
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errEl.textContent = "";
    submitBtn.disabled = true;
    submitBtn.textContent = "Entrando…";
    const { error } = await sb.auth.signInWithPassword({
      email: emailEl.value.trim(),
      password: passEl.value
    });
    submitBtn.disabled = false;
    submitBtn.textContent = "Entrar";
    if (error) errEl.textContent = errMsg(error);
  });

  logoutBtn.addEventListener("click", () => sb.auth.signOut());
})();
