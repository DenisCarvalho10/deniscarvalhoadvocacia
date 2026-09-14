/* ===================================================================
   AdvX — Atribuição de origem (UTM) · first-touch, 90 dias
   Guarda de qual anúncio/campanha o visitante veio e carrega esse código
   nos links de WhatsApp, para a Liz registrar a origem no lead do CRM.
   Referência: docs/atribuicao-utm.md no repo do AdvX.
   =================================================================== */
(function () {
  "use strict";

  var KEY = "advx_attrib";
  var MAX_MS = 90 * 24 * 60 * 60 * 1000; // first-touch vale 90 dias
  var CAMPOS = [
    "utm_source", "utm_medium", "utm_campaign",
    "utm_content", "utm_term", "fbclid", "gclid"
  ];

  function slug(v) {
    return String(v || "")
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60);
  }

  /** Qual dos sites do escritório é este (usado quando não há campanha). */
  function siteSlug() {
    var h = String(location.hostname || "").replace(/^www\./, "");
    if (h.indexOf("cobertura") >= 0) return "site-cobertura";
    if (h.indexOf("odontologica") >= 0) return "site-odonto";
    if (h.indexOf("lgpd") >= 0) return "site-lgpd";
    if (h.indexOf("deniscarvalhoadvocacia") >= 0) return "site-institucional";
    return "site";
  }

  function daUrl() {
    var out = {};
    try {
      var u = new URLSearchParams(location.search);
      CAMPOS.forEach(function (k) {
        var v = u.get(k);
        if (v) out[k] = String(v).slice(0, 200);
      });
    } catch (e) {}
    return out;
  }

  function guardado() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return null;
      var d = JSON.parse(raw);
      if (!d || typeof d !== "object") return null;
      if (d._ts && Date.now() - d._ts > MAX_MS) return null; // expirou
      return d;
    } catch (e) { return null; }
  }

  var salvo = guardado();
  var atual = daUrl();
  var novaOrigem = false;

  // First-touch: a primeira origem manda. Só grava campo que ainda não existe.
  var dados = salvo || { _ts: Date.now() };
  CAMPOS.forEach(function (k) {
    if (atual[k] && !dados[k]) { dados[k] = atual[k]; novaOrigem = true; }
  });
  if (!dados.landing_page) {
    dados.landing_page = location.href.split("#")[0].slice(0, 400);
    novaOrigem = true;
  }
  if (!dados.referrer) {
    dados.referrer = (document.referrer || "").slice(0, 400);
  }

  try {
    if (!salvo || novaOrigem) localStorage.setItem(KEY, JSON.stringify(dados));
  } catch (e) {}

  // Disponível para o JS da página.
  window.ADVX_ATTRIB = dados;

  /**
   * Código de origem que viaja na mensagem do WhatsApp. É a CHAVE DE JUNÇÃO:
   * a Liz o grava como utm_campaign do lead, e ele precisa casar com
   * campanhas.utm_campaign no AdvX.
   * Ordem: campanha > origem > clique de anúncio > o site em si.
   */
  window.ADVX_REF = function () {
    if (dados.utm_campaign) return slug(dados.utm_campaign);
    if (dados.utm_source) return slug(dados.utm_source);
    if (dados.fbclid) return "meta";
    if (dados.gclid) return "google";
    return siteSlug(); // visita orgânica: ao menos sabemos qual site converteu
  };

  /**
   * Acrescenta "#ref-<codigo>" ao texto de um link do WhatsApp.
   * Monta na mão, com encodeURIComponent: o "#" PRECISA virar %23, senão o
   * navegador o trata como fragmento e corta a URL.
   */
  window.ADVX_WA = function (url) {
    try {
      if (!url) return url;
      if (url.indexOf("wa.me") < 0 && url.indexOf("api.whatsapp.com") < 0) return url;
      if (url.indexOf("%23ref-") >= 0 || url.indexOf("#ref-") >= 0) return url; // já marcado
      var ref = window.ADVX_REF();
      if (!ref) return url;
      var marca = encodeURIComponent("\n\n#ref-" + ref);
      var i = url.indexOf("text=");
      if (i < 0) return url + (url.indexOf("?") < 0 ? "?" : "&") + "text=" + marca;
      var fim = url.indexOf("&", i);
      return fim < 0 ? url + marca : url.slice(0, fim) + marca + url.slice(fim);
    } catch (e) { return url; }
  };

  // Marca qualquer link de WhatsApp no momento do clique. Pega links que já
  // estão na página, os que o React renderiza depois e os criados por script.
  document.addEventListener("click", function (ev) {
    try {
      var alvo = ev.target;
      if (!alvo || !alvo.closest) return;
      var a = alvo.closest('a[href*="wa.me"], a[href*="api.whatsapp.com"]');
      if (!a) return;
      var novo = window.ADVX_WA(a.getAttribute("href"));
      if (novo) a.setAttribute("href", novo);
    } catch (e) {}
  }, true);

  // Injeta os campos ocultos em <form data-advx-lead> (para formulários que um
  // dia enviem a um backend). Hoje os formulários abrem o WhatsApp.
  function injetar() {
    var forms = document.querySelectorAll("form[data-advx-lead]");
    for (var i = 0; i < forms.length; i++) {
      var f = forms[i];
      Object.keys(dados).forEach(function (k) {
        if (k.charAt(0) === "_") return;
        if (f.querySelector('[name="' + k + '"]')) return;
        var input = document.createElement("input");
        input.type = "hidden";
        input.name = k;
        input.value = dados[k];
        f.appendChild(input);
      });
    }
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", injetar);
  } else {
    injetar();
  }
})();
/* ===================================================================
   Denis Carvalho Advocacia — Interações
   =================================================================== */
(function () {
  "use strict";

  var WA_NUMBER = "5562992586422"; // WhatsApp principal (62) 99258-6422
  function wa(msg) {
    var u = "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(msg); return window.ADVX_WA ? window.ADVX_WA(u) : u;
  }
  function $(sel) { return document.querySelector(sel); }

  /* ---------- Header scroll shadow ---------- */
  var header = $("#header");
  var toTop = $("#toTop");
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle("scrolled", y > 10);
    if (toTop) toTop.classList.toggle("show", y > 600);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (toTop) toTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  /* ---------- Mobile nav ---------- */
  var navToggle = $("#navToggle");
  var navLinks = $("#navLinks");
  if (navToggle && navLinks) {
    navToggle.addEventListener("click", function () {
      var open = navLinks.classList.toggle("open");
      navToggle.classList.toggle("open", open);
      navToggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    });
    navLinks.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        navLinks.classList.remove("open");
        navToggle.classList.remove("open");
      });
    });
  }

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll(".faq-item").forEach(function (item) {
    var q = item.querySelector(".faq-q");
    var a = item.querySelector(".faq-a");
    if (!q || !a) return;
    q.addEventListener("click", function () {
      var isActive = item.classList.contains("active");
      // close all
      document.querySelectorAll(".faq-item").forEach(function (it) {
        it.classList.remove("active");
        var ans = it.querySelector(".faq-a");
        if (ans) ans.style.maxHeight = null;
      });
      if (!isActive) {
        item.classList.add("active");
        a.style.maxHeight = a.scrollHeight + "px";
      }
    });
  });

  /* ---------- Toast helper ---------- */
  var toast = $("#toast");
  var toastMsg = $("#toastMsg");
  var toastTimer;
  function showToast(msg) {
    if (!toast) return;
    if (toastMsg) toastMsg.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove("show"); }, 4200);
  }

  /* ---------- Contact form -> WhatsApp ---------- */
  var contactForm = $("#contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var nome = $("#nome").value.trim();
      var fone = $("#fone").value.trim();
      var assunto = $("#assunto").value;
      var msg = $("#msg").value.trim();
      var texto =
        "Olá, Dr. Denis! Meu nome é " + nome + ".\n" +
        "Assunto: " + assunto + ".\n" +
        (msg ? "Caso: " + msg + "\n" : "") +
        "Telefone: " + fone;
      window.open(wa(texto), "_blank");
      showToast("Abrindo o WhatsApp para enviar sua mensagem...");
      contactForm.reset();
    });
  }

  /* ---------- Lead capture (slide-in) ---------- */
  var leadin = $("#leadin");
  var leadinTab = $("#leadinTab");
  var leadinClose = $("#leadinClose");
  var leadForm = $("#leadForm");
  var LEAD_KEY = "dc_lead_closed";

  function openLead() { if (leadin) { leadin.classList.add("show"); if (leadinTab) leadinTab.style.display = "none"; } }
  function closeLead() {
    if (leadin) leadin.classList.remove("show");
    if (leadinTab) leadinTab.style.display = "flex";
    try { sessionStorage.setItem(LEAD_KEY, "1"); } catch (e) {}
  }

  // Auto show once per session after 12s (if not closed before)
  var leadShown = false;
  function maybeAutoLead() {
    if (leadShown) return;
    try { if (sessionStorage.getItem(LEAD_KEY) === "1") return; } catch (e) {}
    leadShown = true;
    openLead();
  }
  setTimeout(maybeAutoLead, 12000);
  // Or when user scrolls past 45% of page
  window.addEventListener("scroll", function () {
    var sc = (window.scrollY) / (document.body.scrollHeight - window.innerHeight);
    if (sc > 0.45) maybeAutoLead();
  }, { passive: true });

  if (leadinTab) leadinTab.addEventListener("click", openLead);
  if (leadinClose) leadinClose.addEventListener("click", closeLead);
  if (leadForm) {
    leadForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var nome = $("#leadNome").value.trim();
      var email = $("#leadEmail").value.trim();
      // Sem backend: registra intenção e direciona ao WhatsApp para envio do material
      var texto = "Olá! Sou " + nome + " (" + email + ") e gostaria de receber o e-book gratuito sobre Direito Médico.";
      window.open(wa(texto), "_blank");
      showToast("Perfeito, " + nome.split(" ")[0] + "! Vamos te enviar o material.");
      leadForm.reset();
      closeLead();
    });
  }

  /* ---------- LinkedIn Insight Tag (só após consentimento) ---------- */
  var liLoaded = false;
  function loadLinkedInInsight() {
    if (liLoaded) return;
    liLoaded = true;
    window._linkedin_partner_id = "10882153";
    window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
    window._linkedin_data_partner_ids.push("10882153");
    (function (l) {
      if (!l) { window.lintrk = function (a, b) { window.lintrk.q.push([a, b]); }; window.lintrk.q = []; }
      var s = document.getElementsByTagName("script")[0];
      var b = document.createElement("script");
      b.type = "text/javascript"; b.async = true;
      b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
      s.parentNode.insertBefore(b, s);
    })(window.lintrk);
  }

  /* ---------- Cookie banner + consentimento (LGPD) ---------- */
  var COOKIE_KEY = "dc_cookie_consent";
  var consent = null;
  try { consent = localStorage.getItem(COOKIE_KEY); } catch (e) {}

  // Já consentiu antes: carrega os rastreadores de imediato.
  if (consent === "accepted") loadLinkedInInsight();

  // Garante o banner em qualquer página (inclusive landing de anúncio) enquanto
  // não houver decisão — nas páginas sem o HTML do banner, injeta um igual.
  var cookieBanner = $("#cookieBanner");
  if (!consent && !cookieBanner) {
    cookieBanner = document.createElement("div");
    cookieBanner.className = "cookie";
    cookieBanner.id = "cookieBanner";
    cookieBanner.innerHTML =
      '<div class="container">' +
      '<div class="ck-text"><strong>🍪 Este site usa cookies.</strong> Utilizamos cookies para melhorar sua experiência de navegação e analisar o tráfego. Ao continuar, você concorda com nossa <a href="privacidade.html">Política de Privacidade</a> e o uso de cookies, conforme a LGPD.</div>' +
      '<div class="ck-actions">' +
      '<button class="btn ck-link" id="cookieReject">Rejeitar</button>' +
      '<button class="btn btn-gold" id="cookieAccept">Aceitar cookies</button>' +
      '</div></div>';
    document.body.appendChild(cookieBanner);
  }

  function cookieDecision(val) {
    try { localStorage.setItem(COOKIE_KEY, val); } catch (e) {}
    if (cookieBanner) cookieBanner.classList.remove("show");
    if (val === "accepted") loadLinkedInInsight();
  }

  if (!consent && cookieBanner) {
    setTimeout(function () { cookieBanner.classList.add("show"); }, 1500);
    var cA = cookieBanner.querySelector("#cookieAccept");
    var cR = cookieBanner.querySelector("#cookieReject");
    if (cA) cA.addEventListener("click", function () { cookieDecision("accepted"); });
    if (cR) cR.addEventListener("click", function () { cookieDecision("rejected"); });
  }

  /* ---------- Reveal on scroll (subtle) ---------- */
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.style.opacity = "1";
          en.target.style.transform = "none";
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll(".card, .step, .post, .lgpd-panel, .niche, .about-figure").forEach(function (el) {
      el.style.opacity = "0";
      el.style.transform = "translateY(24px)";
      el.style.transition = "opacity .6s ease, transform .6s ease";
      io.observe(el);
    });
  }
})();
