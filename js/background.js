(function () {
  const sky = document.getElementById("sky");
  const cv = document.getElementById("stars");
  const ctx = cv.getContext("2d");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---- Settings you can play with ----
  const SHAPE = "square";     // "dot" or "square"
  const RADIUS = 190;      // how far from the mouse the dots react
  const PUSH = 70;         // how far the dots get pushed away
  const EASE = 0.14;       // how smooth the movement is (smaller = slower)
  // ------------------------------------

  const THEME = {
    dark: {
      bg: "radial-gradient(60% 50% at 50% 75%, rgba(139,92,246,0.22), rgba(139,92,246,0) 70%), linear-gradient(180deg, #0B0B0F, #100B24)",
      base: "139,92,246", hot: "196,181,253", baseAlpha: 0.22,
    },
    light: {
      bg: "radial-gradient(60% 50% at 50% 75%, rgba(124,58,237,0.14), rgba(124,58,237,0) 70%), linear-gradient(180deg, #F7F7FA, #EEE9FF)",
      base: "124,58,237", hot: "91,33,182", baseAlpha: 0.25,
    },
  };

  let W, H, dots = [], lastTheme = "", lastMove = -10;
  const mouse = { x: -999, y: -999 };

  const theme = () => (document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark");

  function resize() {
    const d = Math.min(devicePixelRatio || 1, 2);
    W = innerWidth;
    H = innerHeight;
    cv.width = W * d;
    cv.height = H * d;
    ctx.setTransform(d, 0, 0, d, 0, 0);

    const gap = W < 700 ? 30 : 26;
    const cols = Math.ceil(W / gap) + 1;
    const rows = Math.ceil(H / gap) + 1;
    const offX = (W - (cols - 1) * gap) / 2;
    const offY = (H - (rows - 1) * gap) / 2;
    dots = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = offX + c * gap;
        const y = offY + r * gap;
        dots.push({ ox: x, oy: y, x: x, y: y });
      }
    }
    if (reduce) draw(0);
  }

  function draw(time) {
    const t = time / 1000;
    const name = theme();
    const T = THEME[name];
    if (name !== lastTheme) {
      sky.style.background = T.bg;
      lastTheme = name;
    }

    // With no mouse (phones, or an idle mouse), a soft invisible cursor wanders around
    let mx = mouse.x;
    let my = mouse.y;
    if (!reduce && t - lastMove > 3) {
      mx = W * (0.5 + 0.35 * Math.sin(t * 0.45));
      my = H * (0.5 + 0.3 * Math.sin(t * 0.31 + 1));
    }

    ctx.clearRect(0, 0, W, H);

    for (const p of dots) {
      const dx = p.ox - mx;
      const dy = p.oy - my;
      const dist = Math.sqrt(dx * dx + dy * dy);
      let tx = p.ox;
      let ty = p.oy;
      let heat = 0;

      if (dist < RADIUS && dist > 0.001) {
        heat = 1 - dist / RADIUS;                 // 0 far away, 1 under the mouse
        const push = heat * heat * PUSH;          // stronger the closer you are
        tx = p.ox + (dx / dist) * push;           // move away from the mouse
        ty = p.oy + (dy / dist) * push;
      }

      p.x += (tx - p.x) * EASE;                   // ease toward the target
      p.y += (ty - p.y) * EASE;

      const size = 1.6 + heat * 2.6;
      ctx.fillStyle = "rgba(" + (heat > 0.05 ? T.hot : T.base) + "," + (T.baseAlpha + heat * 0.75) + ")";
      if (SHAPE === "square") {
        ctx.fillRect(p.x - size / 2, p.y - size / 2, size, size);
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, size / 2, 0, 6.283);
        ctx.fill();
      }
    }

    if (!reduce) requestAnimationFrame(draw);
  }

  addEventListener("resize", resize);
  addEventListener("pointermove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    lastMove = performance.now() / 1000;
  });
  addEventListener("pointerleave", () => { mouse.x = -999; mouse.y = -999; });

  resize();
  requestAnimationFrame(draw);
})();
