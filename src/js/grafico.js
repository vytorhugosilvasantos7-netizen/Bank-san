// Bank-San | Gráfico de investimentos
(function () {
  'use strict';

  var container = document.getElementById('chartInvest');
  var valorTotal = document.getElementById('valorTotal');
  var badgeResultado = document.getElementById('badgeResultado');
  var chartName = document.getElementById('chartName');
  if (!container) return;

  var pontos = [
    { data: '01/10', valor: 14200 },
    { data: '05/10', valor: 14450 },
    { data: '10/10', valor: 14380 },
    { data: '15/10', valor: 14920 },
    { data: '20/10', valor: 15300 },
    { data: '24/10', valor: 15650 },
    { data: '26/10', valor: 15890 }
  ];

  function formatarMoeda(v) {
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  var primeiro = pontos[0].valor;
  var ultimo = pontos[pontos.length - 1].valor;
  var dif = ultimo - primeiro;
  var pct = ((dif / primeiro) * 100).toFixed(2);

  if (chartName) chartName.textContent = 'Carteira Geral Consolidada';
  if (valorTotal) valorTotal.textContent = formatarMoeda(ultimo);
  if (badgeResultado) {
    var sinal = dif >= 0 ? '+' : '';
    badgeResultado.textContent = sinal + pct + '%';
    badgeResultado.parentElement.parentElement.classList.toggle('is-up', dif >= 0);
    badgeResultado.parentElement.parentElement.classList.toggle('is-down', dif < 0);
  }

  // Desenhar SVG do gráfico
  var minVal = Math.min.apply(null, pontos.map(function (p) { return p.valor; })) * 0.98;
  var maxVal = Math.max.apply(null, pontos.map(function (p) { return p.valor; })) * 1.02;
  var rangeVal = maxVal - minVal || 1;

  var svgWidth = 600;
  var svgHeight = 220;

  var coords = pontos.map(function (p, i) {
    var x = (i / (pontos.length - 1)) * svgWidth;
    var y = svgHeight - ((p.valor - minVal) / rangeVal) * (svgHeight - 30) - 15;
    return { x: x, y: y, data: p.data, valor: p.valor };
  });

  var dPath = 'M ' + coords.map(function (c) { return c.x.toFixed(1) + ' ' + c.y.toFixed(1); }).join(' L ');
  var dArea = dPath + ' L ' + svgWidth + ' ' + svgHeight + ' L 0 ' + svgHeight + ' Z';

  var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 ' + svgWidth + ' ' + svgHeight);
  svg.setAttribute('preserveAspectRatio', 'none');

  var pathArea = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  pathArea.setAttribute('class', 'chart-area');
  pathArea.setAttribute('d', dArea);
  svg.appendChild(pathArea);

  var pathLine = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  pathLine.setAttribute('class', 'chart-line');
  pathLine.setAttribute('d', dPath);
  svg.appendChild(pathLine);

  container.innerHTML = '';
  container.appendChild(svg);

  // Linha vertical, ponto e tooltip interativo
  var vline = document.createElement('div');
  vline.className = 'chart-vline';
  container.appendChild(vline);

  var dot = document.createElement('div');
  dot.className = 'chart-dot';
  container.appendChild(dot);

  var tip = document.createElement('div');
  tip.className = 'chart-tip';
  container.appendChild(tip);

  container.addEventListener('pointermove', function (e) {
    var rect = container.getBoundingClientRect();
    var relX = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    var idx = Math.round(relX * (coords.length - 1));
    var pt = coords[idx];
    if (!pt) return;

    container.classList.add('is-hover');
    var px = (pt.x / svgWidth) * rect.width;
    var py = (pt.y / svgHeight) * rect.height;

    vline.style.transform = 'translateX(' + px + 'px)';
    dot.style.left = px + 'px';
    dot.style.top = py + 'px';

    tip.style.left = Math.min(rect.width - 110, Math.max(10, px - 50)) + 'px';
    tip.style.top = Math.max(10, py - 48) + 'px';
    tip.innerHTML = '<strong>' + formatarMoeda(pt.valor) + '</strong><small>' + pt.data + '</small>';
  });

  container.addEventListener('pointerleave', function () {
    container.classList.remove('is-hover');
  });
})();

