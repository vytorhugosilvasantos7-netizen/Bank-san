const tiltCards = document.querySelectorAll("[data-tilt-card]");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const canHover = window.matchMedia("(hover: hover) and (pointer: fine)");

function resetTilt(card) {
    card.style.removeProperty("--tilt-x");
    card.style.removeProperty("--tilt-y");
    card.style.removeProperty("--tilt-scale");
}

tiltCards.forEach((card) => {
    card.addEventListener("pointermove", (event) => {
        if (reducedMotion.matches || !canHover.matches || event.pointerType === "touch") {
            return;
        }

        const bounds = card.getBoundingClientRect();
        const horizontal = (event.clientX - bounds.left) / bounds.width;
        const vertical = (event.clientY - bounds.top) / bounds.height;

        card.style.setProperty("--tilt-x", `${(0.5 - vertical) * 10}deg`);
        card.style.setProperty("--tilt-y", `${(horizontal - 0.5) * 10}deg`);
        card.style.setProperty("--tilt-scale", "1.04");
    });

    card.addEventListener("pointerleave", () => {
        resetTilt(card);
    });

    reducedMotion.addEventListener("change", () => resetTilt(card));
});
