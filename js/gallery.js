/* ============================================================
   Galeria Masonry — adaptado do componente React (GSAP) para
   JS vanilla. Fotos coloridas, alturas reais, clique = lightbox.
   ============================================================ */
(function () {
  "use strict";

  // 30 fotos únicas (nomes limpos em img/galeria/)
  var TOTAL = 30;
  var items = [];
  for (var i = 1; i <= TOTAL; i++) {
    var n = i < 10 ? "0" + i : "" + i;
    items.push({ id: "f" + n, img: "img/galeria/foto-" + n + ".jpeg" });
  }

  var container = null;
  var measured = false;          // alturas reais já lidas?
  var mounted = false;           // animação de entrada já rodou?
  var prefersReduced =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function columnsForWidth() {
    var w = window.innerWidth;
    if (w >= 1500) return 5;
    if (w >= 1000) return 4;
    if (w >= 600) return 3;
    if (w >= 400) return 2;
    return 2; // celular: 2 colunas (decisão do plano)
  }

  // Pré-carrega e lê dimensões naturais → razão de aspecto
  function preload() {
    return Promise.all(
      items.map(function (item) {
        return new Promise(function (resolve) {
          var im = new Image();
          im.onload = function () {
            item.ratio = im.naturalHeight / im.naturalWidth || 1.3;
            resolve();
          };
          im.onerror = function () {
            item.ratio = 1.3;
            resolve();
          };
          im.src = item.img;
        });
      })
    );
  }

  // Calcula o grid (posição/tamanho de cada item) e devolve altura total
  function layout() {
    if (!container) return 0;
    var width = container.clientWidth;
    if (!width) return 0;

    var cols = columnsForWidth();
    var colW = width / cols;
    var colHeights = new Array(cols).fill(0);

    items.forEach(function (item) {
      var col = colHeights.indexOf(Math.min.apply(null, colHeights));
      var x = colW * col;
      var h = colW * (item.ratio || 1.3);
      var y = colHeights[col];
      colHeights[col] += h;
      item.x = x;
      item.y = y;
      item.w = colW;
      item.h = h;
    });

    return Math.max.apply(null, colHeights);
  }

  function createNodes() {
    var frag = document.createDocumentFragment();
    items.forEach(function (item) {
      var wrap = document.createElement("div");
      wrap.className = "m-item";
      wrap.setAttribute("role", "listitem");
      wrap.setAttribute("data-key", item.id);

      var inner = document.createElement("div");
      inner.className = "m-item-img";
      inner.style.backgroundImage = "url('" + item.img + "')";
      inner.setAttribute("role", "img");
      inner.setAttribute("aria-label", "Foto do casal");
      wrap.appendChild(inner);

      // hover: leve zoom
      wrap.addEventListener("mouseenter", function () {
        if (prefersReduced) return;
        gsap.to(wrap, { scale: 0.96, duration: 0.3, ease: "power2.out" });
      });
      wrap.addEventListener("mouseleave", function () {
        if (prefersReduced) return;
        gsap.to(wrap, { scale: 1, duration: 0.3, ease: "power2.out" });
      });

      // clique: abre lightbox (substitui o open(url) do componente original)
      wrap.addEventListener("click", function () {
        if (window.Lightbox) window.Lightbox.open(item.img);
      });

      item.node = wrap;
      frag.appendChild(wrap);
    });
    container.appendChild(frag);
  }

  function place() {
    var totalH = layout();
    container.style.height = totalH + "px";

    items.forEach(function (item, index) {
      var node = item.node;
      if (!node) return;

      if (!mounted) {
        // entrada: sobe de baixo, blur → foco
        gsap.fromTo(
          node,
          {
            opacity: 0,
            x: item.x,
            y: item.y + 80,
            width: item.w,
            height: item.h,
            filter: prefersReduced ? "none" : "blur(8px)"
          },
          {
            opacity: 1,
            x: item.x,
            y: item.y,
            width: item.w,
            height: item.h,
            filter: "blur(0px)",
            duration: prefersReduced ? 0.001 : 0.8,
            ease: "power3.out",
            delay: prefersReduced ? 0 : index * 0.05
          }
        );
      } else {
        // re-layout (resize): só reposiciona
        gsap.to(node, {
          x: item.x,
          y: item.y,
          width: item.w,
          height: item.h,
          duration: 0.4,
          ease: "power3.out",
          overwrite: "auto"
        });
      }
    });

    mounted = true;
  }

  var resizeTimer = null;
  function onResize() {
    if (!measured) return;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(place, 120);
  }

  // Inicia a galeria (chamada pelo main.js após a abertura)
  function init() {
    container = document.getElementById("masonry");
    if (!container || measured) return;

    createNodes();
    preload().then(function () {
      measured = true;
      place();
      window.addEventListener("resize", onResize);
    });
  }

  window.Gallery = { init: init };
})();
