/* ============================================================
   Hero de corações — adaptado do prompt hero-coracoes.md
   Desktop (> 768px): Matter.js, corações subindo (hélio).
   Mobile (<= 768px): explosão via CSS keyframes.
   Cores rosa/dourado da paleta (não vermelho).
   ============================================================ */
(function () {
  "use strict";

  var BREAKPOINT = 768;
  var COLORS = ["#db2777", "#f472b6", "#e8b04b"]; // rosa forte, rosa, dourado
  var stage = null;
  var runner = null;
  var render = null;
  var engine = null;
  var started = false;

  var prefersReduced =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // SVG de coração → Data URI (sem imagem externa, evita CORS)
  function heartTexture(color) {
    var svg =
      '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24">' +
      '<path fill="' + color + '" d="M12 21s-7.5-4.9-10-9.2C.3 8.5 1.7 4.7 5.2 4.1 ' +
      '7.4 3.7 9.1 4.9 10 6.2c.4.6.7 1 .9 1.4h.2c.2-.4.5-.8.9-1.4.9-1.3 2.6-2.5 ' +
      '4.8-2.1 3.5.6 4.9 4.4 3.2 7.7C19.5 16.1 12 21 12 21Z"/></svg>';
    return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
  }

  /* ---------- Desktop: Matter.js ---------- */
  function startDesktop() {
    if (typeof Matter === "undefined") return startMobile(); // fallback
    var M = Matter;
    var w = stage.clientWidth;
    var h = stage.clientHeight;

    engine = M.Engine.create();
    engine.world.gravity.y = -0.3; // gravidade invertida: corações sobem

    render = M.Render.create({
      element: stage,
      engine: engine,
      options: {
        width: w,
        height: h,
        background: "transparent",
        wireframes: false,
        pixelRatio: window.devicePixelRatio || 1
      }
    });

    // Limites do mundo: paredes laterais, teto (segura os corações dentro)
    // e um chão bem abaixo da tela (de onde os balões "nascem" e sobem).
    var t = 80; // espessura
    var walls = [
      M.Bodies.rectangle(w / 2, -t / 2, w, t, { isStatic: true }),          // teto
      M.Bodies.rectangle(-t / 2, h / 2, t, h * 3, { isStatic: true }),       // esquerda
      M.Bodies.rectangle(w + t / 2, h / 2, t, h * 3, { isStatic: true }),    // direita
      M.Bodies.rectangle(w / 2, h + 300 + t / 2, w, t, { isStatic: true })   // chão (fora da tela)
    ];
    M.World.add(engine.world, walls);

    // Quantidade responsiva (cap para não pesar)
    var count = Math.min(150, Math.max(60, Math.round(w / 11)));
    var hearts = [];
    for (var i = 0; i < count; i++) {
      var radius = 14 + Math.random() * 16;
      var color = COLORS[Math.floor(Math.random() * COLORS.length)];
      var scale = (radius * 2) / 40; // textura é 40px → casa com o diâmetro
      var body = M.Bodies.circle(
        40 + Math.random() * (w - 80),
        h + Math.random() * 280, // começam abaixo da tela
        radius,
        {
          restitution: 0.6,
          frictionAir: 0.05, // flutuação suave
          render: {
            sprite: { texture: heartTexture(color), xScale: scale, yScale: scale }
          }
        }
      );
      hearts.push(body);
    }
    M.World.add(engine.world, hearts);

    M.Render.run(render);
    runner = M.Runner.create();
    M.Runner.run(runner, engine);

    window.addEventListener("resize", onResizeDesktop);
  }

  function onResizeDesktop() {
    if (!render) return;
    var w = stage.clientWidth;
    var h = stage.clientHeight;
    render.canvas.width = w;
    render.canvas.height = h;
    render.options.width = w;
    render.options.height = h;
  }

  function destroyDesktop() {
    var M = Matter;
    if (render) { M.Render.stop(render); if (render.canvas) render.canvas.remove(); render = null; }
    if (runner) { M.Runner.stop(runner); runner = null; }
    if (engine) { M.World.clear(engine.world, false); M.Engine.clear(engine); engine = null; }
    window.removeEventListener("resize", onResizeDesktop);
  }

  /* ---------- Mobile: explosão CSS ---------- */
  function startMobile() {
    var count = 36;
    var heart =
      '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 21s-7.5-4.9-10-9.2C.3 8.5 1.7 4.7 5.2 4.1 7.4 3.7 9.1 4.9 10 6.2c.4.6.7 1 .9 1.4h.2c.2-.4.5-.8.9-1.4.9-1.3 2.6-2.5 4.8-2.1 3.5.6 4.9 4.4 3.2 7.7C19.5 16.1 12 21 12 21Z"/></svg>';
    var frag = document.createDocumentFragment();
    for (var i = 0; i < count; i++) {
      var el = document.createElement("span");
      el.className = "css-heart";
      var angle = Math.random() * Math.PI * 2;
      var dist = 120 + Math.random() * 220;
      el.style.setProperty("--tx", Math.cos(angle) * dist + "px");
      el.style.setProperty("--ty", Math.sin(angle) * dist + "px");
      el.style.setProperty("--rot", (Math.random() * 720 - 360) + "deg");
      el.style.setProperty("--scale", (0.6 + Math.random() * 1.1).toFixed(2));
      el.style.setProperty("--delay", (Math.random() * 0.5).toFixed(2) + "s");
      el.style.color = COLORS[i % COLORS.length];
      el.innerHTML = heart;
      frag.appendChild(el);
    }
    stage.appendChild(frag);
  }

  function start() {
    if (started) return;
    stage = document.getElementById("hearts-stage");
    if (!stage) return;
    started = true;

    if (prefersReduced) { startMobile(); return; } // versão leve e curta

    if (window.innerWidth > BREAKPOINT) startDesktop();
    else startMobile();
  }

  window.Hearts = { start: start, destroyDesktop: destroyDesktop };
})();
