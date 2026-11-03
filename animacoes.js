// Bank-San | Animações do site
// Tudo aqui é opcional: se algo falhar, a página continua funcionando normalmente.
(function () {
  'use strict';

  var semMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ease = 'cubic-bezier(0.22, 1, 0.36, 1)';

  // ---------- 1) Blocos entram na tela ao aparecer (rolagem) ----------
  var ALVOS = ['.card', '.bank', '.news-item', '.entrada', '.about-heading', '.card-explainer', '.about-card', '.logo-marquee'];

  function prepararEntrada() {
    if (semMovimento || !('IntersectionObserver' in window) || !Element.prototype.animate) return;

    var itens = document.querySelectorAll(ALVOS.join(','));
    var porPai = new Map();
    itens.forEach(function (el) {
      var pai = el.parentElement;
      var n = porPai.get(pai) || 0;
      porPai.set(pai, n + 1);
      el.setAttribute('data-reveal', '');
      el.style.setProperty('--i', n);
    });

    document.documentElement.classList.add('js-anim');

    var io = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        io.unobserve(el);
        var atraso = Math.min(Number(el.style.getPropertyValue('--i')) || 0, 5) * 80;
        el.classList.add('is-in');
        el.animate(
          [{ opacity: 0, transform: 'translateY(22px)' }, { opacity: 1, transform: 'translateY(0)' }],
          { duration: 650, delay: atraso, easing: ease, fill: 'backwards' }
        );
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -4% 0px' });

    itens.forEach(function (el) { io.observe(el); });

    // Segurança: se por algum motivo algo continuar escondido, mostra tudo depois de 4 s
    setTimeout(function () {
      document.querySelectorAll('[data-reveal]:not(.is-in)').forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.width && r.top < window.innerHeight) el.classList.add('is-in');
      });
    }, 4000);
  }

  // ---------- 2) Brilho que segue o mouse nos quadros ----------
  function prepararBrilho() {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    var quadro = 0, ultimo = null;
    document.addEventListener('pointermove', function (e) {
      var card = e.target.closest ? e.target.closest('.card') : null;
      if (!card) return;
      ultimo = { card: card, x: e.clientX, y: e.clientY };
      if (!quadro) quadro = requestAnimationFrame(function () {
        quadro = 0;
        var r = ultimo.card.getBoundingClientRect();
        ultimo.card.style.setProperty('--mx', (ultimo.x - r.left) + 'px');
        ultimo.card.style.setProperty('--my', (ultimo.y - r.top) + 'px');
      });
    }, { passive: true });
  }

  // ---------- 3) Cartão: animação ao trocar de banco ----------
  function prepararCartao() {
    if (semMovimento || !Element.prototype.animate || !window.MutationObserver) return;
    document.querySelectorAll('[data-tilt-card], #cartaoAtual').forEach(function (card) {
      var banco = card.getAttribute('data-bank');
      new MutationObserver(function () {
        var novo = card.getAttribute('data-bank');
        if (novo === banco) return;
        banco = novo;
        card.animate(
          [
            { opacity: 0, transform: 'translateY(18px) rotateX(-18deg) scale(0.94)' },
            { opacity: 1, transform: 'translateY(0) rotateX(0deg) scale(1)' }
          ],
          { duration: 560, easing: ease }
        );
      }).observe(card, { attributes: true, attributeFilter: ['data-bank'] });
    });
  }

  // ---------- 4) Números que contam até o valor ----------
  function analisar(t) {
    var m = String(t).trim().match(/^(\D*?)(\d[\d.,]*)(\D*)$/);
    if (!m) return null;
    var br = /R\$/.test(m[1]);
    var normal = br ? m[2].replace(/\./g, '').replace(',', '.') : m[2].replace(/,/g, '');
    var v = parseFloat(normal);
    if (isNaN(v)) return null;
    return { pre: m[1], suf: m[3], v: v, dec: (normal.split('.')[1] || '').length, br: br };
  }
  function formatar(p, x) {
    return p.pre + x.toLocaleString(p.br ? 'pt-BR' : 'en-US', { minimumFractionDigits: p.dec, maximumFractionDigits: p.dec }) + p.suf;
  }

  function prepararNumeros() {
    if (semMovimento || !window.MutationObserver) return;
    ['valorTotal', 'gastosTotal'].forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      var valorAtual = 0, esperado = null, rafId = 0;

      function contar(texto) {
        var p = analisar(texto);
        if (!p) return;
        cancelAnimationFrame(rafId);
        var de = valorAtual, ate = p.v, t0 = performance.now(), dur = 900;
        function passo(agora) {
          var k = Math.min(1, (agora - t0) / dur);
          var suave = 1 - Math.pow(1 - k, 3);
          if (k < 1) {
            esperado = formatar(p, de + (ate - de) * suave);
            el.textContent = esperado;
            rafId = requestAnimationFrame(passo);
          } else {
            esperado = texto;
            el.textContent = texto;
            valorAtual = ate;
          }
        }
        rafId = requestAnimationFrame(passo);
      }

      new MutationObserver(function () {
        var agora = el.textContent;
        if (agora === esperado) return;       // fomos nós que escrevemos
        contar(agora);                        // outro código mudou o valor
      }).observe(el, { childList: true, characterData: true, subtree: true });

      // Valor que já estava na página ao carregar
      if (el.textContent.trim()) contar(el.textContent);
    });
  }

  function iniciar() {
    try { prepararBrilho(); } catch (e) { console.error('[Bank-San] Não foi possível iniciar o brilho dos cartões.', e); }
    try { prepararCartao(); } catch (e) { console.error('[Bank-San] Não foi possível iniciar a animação dos cartões.', e); }
    try { prepararNumeros(); } catch (e) { console.error('[Bank-San] Não foi possível iniciar a animação dos valores.', e); }
    try { prepararEntrada(); } catch (e) {
      document.documentElement.classList.remove('js-anim');
      console.error('[Bank-San] Não foi possível iniciar as animações de entrada.', e);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();
})();
