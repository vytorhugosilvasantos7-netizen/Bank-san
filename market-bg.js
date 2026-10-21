(() => {
    const canvas = document.querySelector("[data-market-bg]");
    if (!(canvas instanceof HTMLCanvasElement)) {
        return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
        console.error("Não foi possível iniciar a animação do fundo: canvas 2D indisponível.");
        return;
    }

    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const series = [
        { level: 0.3, amplitude: 0.07, speed: 0.000018, opacity: 0.15, width: 1 },
        { level: 0.4, amplitude: 0.1, speed: 0.000026, opacity: 0.26, width: 1.2 },
        { level: 0.22, amplitude: 0.06, speed: 0.000034, opacity: 0.12, width: 1 },
    ];

    let width = 0;
    let height = 0;
    let pixelRatio = 1;
    let frame = 0;
    let lastFrame = 0;
    let elapsed = 0;
    let isRunning = false;

    function resizeCanvas() {
        const bounds = canvas.getBoundingClientRect();
        pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
        width = Math.max(1, bounds.width);
        height = Math.max(1, bounds.height);
        canvas.width = Math.round(width * pixelRatio);
        canvas.height = Math.round(height * pixelRatio);
        context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        draw();
    }

    function drawGrid() {
        const horizon = height * 0.62;
        const center = width / 2;
        const fade = context.createLinearGradient(0, horizon, 0, height);
        fade.addColorStop(0, "rgba(255,255,255,0)");
        fade.addColorStop(1, "rgba(255,255,255,0.13)");
        context.strokeStyle = fade;
        context.lineWidth = 1;

        for (let index = -12; index <= 12; index += 1) {
            context.beginPath();
            context.moveTo(center, horizon);
            context.lineTo(center + index * (width / 12), height);
            context.stroke();
        }

        for (let row = 1; row <= 12; row += 1) {
            const phase = motionPreference.matches ? 0 : (elapsed * 0.000018) % 1;
            const depth = ((row / 12 + phase) % 1) || 0.02;
            const y = horizon + (height - horizon) * depth ** 2;
            context.strokeStyle = `rgba(255,255,255,${0.015 + depth * 0.08})`;
            context.beginPath();
            context.moveTo(0, y);
            context.lineTo(width, y);
            context.stroke();
        }
    }

    function drawSeries(line, index) {
        const pointSpacing = Math.max(18, width / 48);
        const pointCount = Math.ceil(width / pointSpacing) + 2;
        const phase = motionPreference.matches ? 0 : elapsed * line.speed;
        const offset = phase % pointSpacing;

        context.beginPath();
        for (let point = -1; point <= pointCount; point += 1) {
            const x = point * pointSpacing - offset;
            const wave = Math.sin(point * 0.72 + phase * 0.8 + index) * 0.55
                + Math.sin(point * 0.23 - phase * 0.45) * 0.35;
            const y = height * line.level + wave * height * line.amplitude;
            if (point === -1) {
                context.moveTo(x, y);
            } else {
                context.lineTo(x, y);
            }
        }

        context.strokeStyle = `rgba(255,255,255,${line.opacity})`;
        context.lineWidth = line.width;
        context.stroke();
    }

    function drawCandles() {
        const spacing = Math.max(18, width / 48);
        const count = Math.ceil(width / spacing) + 2;
        const offset = motionPreference.matches ? 0 : (elapsed * 0.008) % spacing;

        for (let index = -1; index <= count; index += 1) {
            const x = index * spacing - offset;
            const base = Math.sin(index * 1.7 + elapsed * 0.0002) * height * 0.025;
            const open = height * 0.43 + base;
            const close = open + Math.cos(index * 0.85 + elapsed * 0.00016) * height * 0.025;
            const wick = height * 0.018;
            const rising = close < open;

            context.strokeStyle = "rgba(255,255,255,0.11)";
            context.fillStyle = "rgba(255,255,255,0.09)";
            context.lineWidth = 1;
            context.beginPath();
            context.moveTo(x, Math.min(open, close) - wick);
            context.lineTo(x, Math.max(open, close) + wick);
            context.stroke();

            if (rising) {
                context.fillRect(x - 2, close, 4, Math.max(2, open - close));
            } else {
                context.strokeRect(x - 2, open, 4, Math.max(2, close - open));
            }
        }
    }

    function draw() {
        context.clearRect(0, 0, width, height);
        drawGrid();
        series.forEach(drawSeries);
        drawCandles();
    }

    function animate(timestamp) {
        if (!isRunning) {
            return;
        }

        if (lastFrame) {
            elapsed += Math.min(timestamp - lastFrame, 50);
        }
        lastFrame = timestamp;
        draw();
        frame = window.requestAnimationFrame(animate);
    }

    function stop() {
        isRunning = false;
        lastFrame = 0;
        window.cancelAnimationFrame(frame);
    }

    function start() {
        if (isRunning || document.hidden || motionPreference.matches) {
            draw();
            return;
        }
        isRunning = true;
        frame = window.requestAnimationFrame(animate);
    }

    const observer = new ResizeObserver(resizeCanvas);
    observer.observe(canvas);
    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            stop();
        } else {
            start();
        }
    });
    motionPreference.addEventListener("change", () => {
        if (motionPreference.matches) {
            stop();
            draw();
        } else {
            start();
        }
    });

    resizeCanvas();
    start();
})();
