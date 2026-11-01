// Bank-San | Inclinação 3D do cartão (mesmo efeito de antes, agora suave e sem conflitos)
(function () {
    "use strict";

    var cards = document.querySelectorAll("[data-tilt-card]");
    var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    var canHover = window.matchMedia("(hover: hover) and (pointer: fine)");

    function resetTilt(card) {
        card.style.removeProperty("--tilt-x");
        card.style.removeProperty("--tilt-y");
        card.style.removeProperty("--tilt-scale");
    }

    cards.forEach(function (card) {
        var quadro = 0;
        var ultimo = null;

        function aplicar() {
            quadro = 0;
            if (!ultimo) return;
            var bounds = card.getBoundingClientRect();
            var horizontal = (ultimo.x - bounds.left) / bounds.width;
            var vertical = (ultimo.y - bounds.top) / bounds.height;
            card.style.setProperty("--tilt-x", (0.5 - vertical) * 10 + "deg");
            card.style.setProperty("--tilt-y", (horizontal - 0.5) * 10 + "deg");
            card.style.setProperty("--tilt-scale", "1.04");
        }

        card.addEventListener("pointermove", function (event) {
            if (reducedMotion.matches || !canHover.matches || event.pointerType === "touch") return;
            ultimo = { x: event.clientX, y: event.clientY };
            if (!quadro) quadro = requestAnimationFrame(aplicar); // no máximo 1 cálculo por quadro
        });

        card.addEventListener("pointerleave", function () {
            ultimo = null;
            if (quadro) { cancelAnimationFrame(quadro); quadro = 0; }
            resetTilt(card);
        });

        reducedMotion.addEventListener("change", function () { resetTilt(card); });
    });
})();
