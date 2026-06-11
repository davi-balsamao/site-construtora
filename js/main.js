/* ============================================================
   main.js — tema dark/light, tela de abertura, reveal no
   scroll e lightbox da galeria.
   ============================================================ */
(function () {
  "use strict";

  var root = document.documentElement;

  /* ---------- Tema (dark padrão) ---------- */
  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    try { localStorage.setItem("ana-theme", theme); } catch (e) {}
  }
  (function initTheme() {
    var saved = null;
    try { saved = localStorage.getItem("ana-theme"); } catch (e) {}
    applyTheme(saved === "light" ? "light" : "dark"); // padrão: dark
  })();

  var toggle = document.getElementById("theme-toggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      var cur = root.getAttribute("data-theme");
      applyTheme(cur === "light" ? "dark" : "light");
    });
  }

  /* ---------- Lightbox ---------- */
  var lb = document.createElement("div");
  lb.className = "lightbox";
  lb.innerHTML =
    '<button class="lightbox-close" type="button" aria-label="Fechar">&times;</button>' +
    '<img alt="Foto ampliada do casal" />';
  document.body.appendChild(lb);
  var lbImg = lb.querySelector("img");
  var lbClose = lb.querySelector(".lightbox-close");

  function openLightbox(src) {
    lbImg.src = src;
    lb.classList.add("open");
    document.body.classList.add("locked");
  }
  function closeLightbox() {
    lb.classList.remove("open");
    if (!document.getElementById("opening").classList.contains("hide")) return;
    document.body.classList.remove("locked");
  }
  lb.addEventListener("click", function (e) {
    if (e.target === lb || e.target === lbClose) closeLightbox();
  });
  lbClose.addEventListener("click", closeLightbox);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && lb.classList.contains("open")) closeLightbox();
  });
  window.Lightbox = { open: openLightbox };

  /* ---------- Reveal no scroll ---------- */
  function initReveal() {
    var els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("visible"); });
      return;
    }
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
    );
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Tela de abertura ---------- */
  var opening = document.getElementById("opening");
  var openBtn = document.getElementById("open-btn");

  // trava o scroll até a Ana abrir o presente
  document.body.classList.add("locked");

  function reveal() {
    opening.classList.add("hide");
    document.body.classList.remove("locked");

    if (window.Hearts) window.Hearts.start();      // dispara os corações
    if (window.Gallery) window.Gallery.init();      // monta a galeria
    initReveal();                                   // ativa animações de scroll

    // a primeira seção (hero) aparece logo
    var heroContent = document.querySelector(".hero .reveal");
    if (heroContent) setTimeout(function () { heroContent.classList.add("visible"); }, 120);
  }

  if (openBtn) {
    openBtn.addEventListener("click", reveal, { once: true });
  } else {
    // sem botão? revela direto
    reveal();
  }
})();
