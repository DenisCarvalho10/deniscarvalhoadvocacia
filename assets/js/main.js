/* ===================================================================
   Denis Carvalho Advocacia — Interações
   =================================================================== */
(function () {
  "use strict";

  var WA_NUMBER = "5562992586422"; // WhatsApp principal (62) 99258-6422
  function wa(msg) {
    return "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(msg);
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

  /* ---------- Cookie banner ---------- */
  var cookieBanner = $("#cookieBanner");
  var cookieAccept = $("#cookieAccept");
  var cookieReject = $("#cookieReject");
  var COOKIE_KEY = "dc_cookie_consent";

  function cookieDecision(val) {
    try { localStorage.setItem(COOKIE_KEY, val); } catch (e) {}
    if (cookieBanner) cookieBanner.classList.remove("show");
  }
  var hasConsent = false;
  try { hasConsent = !!localStorage.getItem(COOKIE_KEY); } catch (e) {}
  if (!hasConsent && cookieBanner) {
    setTimeout(function () { cookieBanner.classList.add("show"); }, 1500);
  }
  if (cookieAccept) cookieAccept.addEventListener("click", function () { cookieDecision("accepted"); });
  if (cookieReject) cookieReject.addEventListener("click", function () { cookieDecision("rejected"); });

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
