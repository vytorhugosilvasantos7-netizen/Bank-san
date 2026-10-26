/*
 * Fundo animado BANK-SAN
 * - candles e linhas de cotação rolando devagar (acima do horizonte)
 * - malha em perspectiva avançando (abaixo do horizonte)
 * - feixe de luz diagonal varrendo a tela de tempos em tempos
 * - pulsos esporádicos nas linhas, como transações acontecendo
 * Só preto, branco e cinza. Pausa com a aba oculta e respeita prefers-reduced-motion.
 */
(() => {
    const canvas = document.querySelector("[data-market-bg]");
    if (!(canvas instanceof HTMLCanvasElement)) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const HORIZON = 0.62;
    const PULSE_LIFE = 1.8;

    const CONFIG = [
        { kind: "candles", base: 0.38, amp: 0.1, step: 15, speed: 9, alpha: 0.12 },
        { kind: "line", base: 0.42, amp: 0.12, step: 26, speed: 16, alpha: 0.3, width: 1.2 },
        { kind: "line", base: 0.3, amp: 0.14, step: 22, speed: 22, alpha: 0.6, width: 1.7, head: true },
        { kind: "line", base: 0.22, amp: 0.09, step: 18, speed: 30, alpha: 0.2, width: 1 },
    ];

    let w = 0;
    let h = 0;
    let dpr = 1;
    let quality = 1;       // 1 = nítido; 0.5 = metade da resolução (computadores lentos)
    let slowFrames = 0;
    let sampleCount = 0;
    let prevNow = 0;
    let series = [];
    let pulses = [];
    let raf = 0;
    let last = 0;
    let lastDraw = 0;
    const FRAME_MS = 1000 / 30;
    let time = 0;
    let nextPulse = 0.8;
    let running = false;

    const rand = (min, max) => min + Math.random() * (max - min);

    // Passeio aleatório com retorno à média: parece cotação, sem fugir da tela.
    function nextValue(prev, vol) {
        const value = prev + (Math.random() - 0.5) * vol - prev * 0.03;
        return Math.max(-1, Math.min(1, value));
    }

    function buildSeries() {
        series = CONFIG.map((cfg) => {
            const count = Math.ceil(w / cfg.step) + 4;
            const pts = [];
            const hi = [];
            const lo = [];
            let value = rand(-0.4, 0.4);

            for (let i = 0; i < count; i += 1) {
                value = nextValue(value, 0.5);
                pts.push(value);
                hi.push(rand(0.02, 0.12));
                lo.push(rand(0.02, 0.12));
            }

            return { ...cfg, pts, hi, lo, off: 0 };
        });
    }

    function yAt(s, x) {
        const p = (x + s.off) / s.step;
        const i = Math.max(0, Math.min(s.pts.length - 2, Math.floor(p)));
        const f = p - i;
        const value = s.pts[i] + (s.pts[i + 1] - s.pts[i]) * f;
        return s.base * h + value * s.amp * h;
    }

    function advance(dt) {
        for (const s of series) {
            s.off += s.speed * dt;

            while (s.off >= s.step) {
                s.off -= s.step;
                s.pts.shift();
                s.hi.shift();
                s.lo.shift();
                s.pts.push(nextValue(s.pts[s.pts.length - 1], 0.5));
                s.hi.push(rand(0.02, 0.12));
                s.lo.push(rand(0.02, 0.12));
            }
        }
    }

    function drawGrid() {
        const hy = h * HORIZON;
        const vx = w / 2;
        const spread = 18;

        ctx.lineWidth = 1;

        const radial = ctx.createLinearGradient(0, hy, 0, h);
        radial.addColorStop(0, "rgba(255,255,255,0)");
        radial.addColorStop(1, "rgba(255,255,255,0.16)");
        ctx.strokeStyle = radial;

        for (let k = -spread; k <= spread; k += 1) {
            ctx.beginPath();
            ctx.moveTo(vx, hy);
            ctx.lineTo(vx + k * (w / spread) * 0.9, h);
            ctx.stroke();
        }

        const rows = 14;
        const scroll = (time * 0.06) % 1;

        for (let j = 0; j < rows; j += 1) {
            const z = (j + scroll) / rows;
            const y = hy + (h - hy) * Math.pow(z, 2.3);
            ctx.strokeStyle = `rgba(255,255,255,${0.02 + z * 0.16})`;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();
        }

        ctx.strokeStyle = "rgba(255,255,255,0.14)";
        ctx.beginPath();
        ctx.moveTo(0, hy);
        ctx.lineTo(w, hy);
        ctx.stroke();
    }

    function drawCandles(s) {
        const bodyW = Math.max(3, s.step * 0.55);

        ctx.lineWidth = 1;
        ctx.strokeStyle = `rgba(255,255,255,${s.alpha})`;
        ctx.fillStyle = `rgba(255,255,255,${s.alpha * 1.2})`;

        for (let i = 0; i < s.pts.length - 1; i += 1) {
            const x = i * s.step - s.off;
            const open = s.base * h + s.pts[i] * s.amp * h;
            const close = s.base * h + s.pts[i + 1] * s.amp * h;
            const top = Math.min(open, close) - s.hi[i] * s.amp * h;
            const bottom = Math.max(open, close) + s.lo[i] * s.amp * h;
            const bodyY = Math.min(open, close);
            const bodyH = Math.max(1.5, Math.abs(close - open));

            ctx.beginPath();
            ctx.moveTo(x, top);
            ctx.lineTo(x, bottom);
            ctx.stroke();

            if (close < open) {
                ctx.fillRect(x - bodyW / 2, bodyY, bodyW, bodyH);
            } else {
                ctx.strokeRect(x - bodyW / 2, bodyY, bodyW, bodyH);
            }
        }
    }

    function drawLine(s) {
        ctx.beginPath();

        for (let i = 0; i < s.pts.length; i += 1) {
            const x = i * s.step - s.off;
            const y = s.base * h + s.pts[i] * s.amp * h;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }

        const stroke = ctx.createLinearGradient(0, 0, w, 0);
        stroke.addColorStop(0, "rgba(255,255,255,0)");
        stroke.addColorStop(0.25, `rgba(255,255,255,${s.alpha * 0.6})`);
        stroke.addColorStop(0.85, `rgba(255,255,255,${s.alpha})`);
        stroke.addColorStop(1, `rgba(255,255,255,${s.alpha * 0.4})`);

        ctx.lineWidth = s.width;
        ctx.lineJoin = "round";
        ctx.strokeStyle = stroke;
        ctx.stroke();

        ctx.lineTo(w + s.step, h * HORIZON);
        ctx.lineTo(-s.step, h * HORIZON);
        ctx.closePath();

        const fill = ctx.createLinearGradient(0, (s.base - s.amp) * h, 0, h * HORIZON);
        fill.addColorStop(0, `rgba(255,255,255,${s.alpha * 0.12})`);
        fill.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = fill;
        ctx.fill();
    }

    function drawHead(s) {
        const x = w * 0.86;
        const y = yAt(s, x);
        const phase = (time * 0.8) % 1;

        ctx.strokeStyle = "rgba(255,255,255,0.1)";
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 5]);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, h * HORIZON);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.strokeStyle = `rgba(255,255,255,${0.35 * (1 - phase)})`;
        ctx.beginPath();
        ctx.arc(x, y, 5 + phase * 16, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = "rgba(255,255,255,0.9)";
        ctx.beginPath();
        ctx.arc(x, y, 2.6, 0, Math.PI * 2);
        ctx.fill();
    }

    function spawnPulse() {
        const lines = series.filter((s) => s.kind === "line");
        const s = lines[Math.floor(Math.random() * lines.length)];
        const x = rand(w * 0.12, w * 0.88);
        pulses.push({ s, x, y: yAt(s, x), age: 0 });
    }

    function drawPulses() {
        for (const p of pulses) {
            const life = p.age / PULSE_LIFE;

            ctx.strokeStyle = `rgba(255,255,255,${0.5 * (1 - life)})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 4 + life * 26, 0, Math.PI * 2);
            ctx.stroke();

            ctx.fillStyle = `rgba(255,255,255,${0.8 * (1 - life)})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function drawBeam() {
        const period = 11;
        const sweep = 5;
        const t = time % period;

        if (t > sweep) return;

        const p = t / sweep;
        const eased = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
        const band = Math.max(180, w * 0.16);

        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.globalAlpha = Math.sin(Math.PI * p);
        ctx.translate(-0.3 * w + eased * 1.6 * w, h / 2);
        ctx.rotate(-0.38);

        const beam = ctx.createLinearGradient(-band, 0, band, 0);
        beam.addColorStop(0, "rgba(255,255,255,0)");
        beam.addColorStop(0.5, "rgba(255,255,255,0.075)");
        beam.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = beam;
        ctx.fillRect(-band, -h * 1.5, band * 2, h * 3);
        ctx.restore();
    }

    function render() {
        ctx.fillStyle = "#060606";
        ctx.fillRect(0, 0, w, h);

        drawGrid();

        for (const s of series) {
            if (s.kind === "candles") {
                drawCandles(s);
            } else {
                drawLine(s);
            }
        }

        for (const s of series) {
            if (s.head) drawHead(s);
        }

        drawPulses();
        drawBeam();
    }

    function frame(now) {
        if (!running) return;

        // Desenha no máximo ~30 vezes por segundo (o resto do tempo fica livre para a página)
        if (now - lastDraw < FRAME_MS - 1) {
            raf = requestAnimationFrame(frame);
            return;
        }
        lastDraw = now;

        // Se o computador não dá conta (muitos quadros acima de ~45 ms), desenha em metade da resolução
        if (prevNow) {
            sampleCount += 1;
            if (now - prevNow > 45) slowFrames += 1;
            if (sampleCount === 45) {
                if (quality === 1 && slowFrames > 20) {
                    quality = 0.5;
                    resize();
                }
                sampleCount = 0;
                slowFrames = 0;
            }
        }
        prevNow = now;

        const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
        last = now;
        time += dt;

        advance(dt);

        nextPulse -= dt;
        if (nextPulse <= 0) {
            spawnPulse();
            nextPulse = rand(0.9, 2.2);
        }

        for (const p of pulses) {
            p.age += dt;
            p.x -= p.s.speed * dt;
            p.y = yAt(p.s, p.x);
        }
        pulses = pulses.filter((p) => p.age < PULSE_LIFE);

        render();
        raf = requestAnimationFrame(frame);
    }

    function start() {
        if (running) return;
        running = true;
        prevNow = 0;
        last = performance.now();
        raf = requestAnimationFrame(frame);
    }

    function stop() {
        running = false;
        cancelAnimationFrame(raf);
    }

    function applyMotion() {
        if (reduced.matches) {
            stop();
            time = 3;
            render();
        } else if (!document.hidden) {
            start();
        }
    }

    function resize() {
        const previousWidth = w;

        dpr = quality; // fundo suave: 1x já basta (2x seria 4 vezes mais pesado)
        w = window.innerWidth;
        h = window.innerHeight;
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        // Só refaz as séries se a largura mudou (evita "pulo" quando a barra do celular some).
        if (w !== previousWidth) {
            buildSeries();
            pulses = [];
        }

        if (!running) render();
    }

    let resizeTimer = 0;
    window.addEventListener("resize", () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(resize, 120);
    });

    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            stop();
        } else {
            applyMotion();
        }
    });

    reduced.addEventListener("change", applyMotion);

    resize();
    applyMotion();
})();
