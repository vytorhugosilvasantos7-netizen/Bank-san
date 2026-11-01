// Bank-San | Gráfico de investimentos (AAPL - Spell UI)
(function () {
  'use strict';

  var container = document.getElementById('chartInvest');
  var valorTotal = document.getElementById('valorTotal');
  var badgeResultado = document.getElementById('badgeResultado');
  var chartName = document.getElementById('chartName');
  var cardGrafico = document.getElementById('cardGrafico');
  if (!container) return;

  var color = '#EAB308';
  var name = 'AAPL';

  var data = [
    183.05, 186.28, 187.43, 189.72, 189.84, 189.87, 191.04, 192.35, 190.9,
    186.88, 189.98, 189.99, 190.29, 191.29, 192.25, 194.03, 194.35, 195.87,
    194.48, 196.89, 193.12, 207.15, 213.07, 214.24, 212.49, 216.67, 214.29,
    209.68, 207.49, 208.14, 209.07, 213.25, 214.1, 210.62, 216.75, 220.27,
    221.55, 226.34, 227.82, 228.68, 232.98, 227.57, 230.54, 234.4, 234.82,
    228.88, 224.18, 224.31, 223.96, 225.01, 218.54, 217.49, 217.96, 218.24,
    218.8, 222.08, 218.36, 219.86, 209.27, 207.23, 209.82, 213.31, 216.24,
    217.53, 221.27, 221.72, 224.72, 226.05, 225.89, 226.51, 226.4, 224.53,
    226.84, 227.18, 228.03, 226.49, 229.79, 229, 222.77, 220.85, 222.38, 220.82,
    220.91, 220.11, 222.66, 222.77, 222.5, 216.32, 216.79, 220.69, 228.87,
    228.2, 226.47, 227.37, 226.37, 227.52, 227.79, 233, 226.21, 226.78, 225.67,
    226.8, 221.69, 225.77, 229.54, 229.04, 227.55, 231.3, 233.85, 231.78,
    232.15, 235, 236.48, 235.86, 230.76, 230.57, 231.41, 233.4, 233.67, 230.1,
    225.91, 222.91, 222.01, 223.45, 222.72, 227.48, 226.96, 224.23, 224.23,
    225.12, 228.22, 225, 228.02, 228.28, 229, 228.52, 229.87, 232.87, 235.06,
    234.93, 237.33, 239.59, 242.65, 243.01, 243.04, 242.84, 246.75, 247.77,
    246.49, 247.96, 248.13, 251.04, 253.48, 248.05, 249.79, 254.49, 255.27,
    258.2, 259.02, 255.59, 252.2, 250.42, 243.85, 243.36, 245, 242.21, 242.7,
    236.85, 234.4, 233.28, 237.87, 228.26, 229.98, 222.64, 223.83, 223.66,
    222.78, 229.86, 238.26, 239.36, 237.59, 236, 228.01, 232.8, 232.47, 233.22,
    227.63, 227.65, 232.62, 236.87, 241.53, 244.6, 244.47, 244.87, 245.83,
    245.55, 247.1, 247.04, 240.36, 237.3, 241.84, 238.03, 235.93, 235.74,
    235.33, 239.07, 227.48, 220.84, 216.98, 209.68, 213.49, 214, 212.69, 215.24,
    214.1, 218.27, 220.73, 223.75, 221.53, 223.85, 217.9, 222.13, 223.19,
    223.89, 203.19, 188.38, 181.46, 172.42, 198.85, 190.42, 198.15, 202.52,
    202.14, 194.27, 196.98, 193.16, 199.74, 204.6, 208.37, 209.28, 210.14,
    211.21, 212.5, 213.32, 205.35, 198.89, 198.51, 196.25, 197.49, 198.53,
    210.79, 212.93, 212.33, 211.45, 211.26, 208.78, 206.86, 202.09, 201.36,
    195.27, 200.21, 200.42, 199.95, 200.85, 201.7, 203.27, 202.82, 200.63,
    203.92, 201.45, 202.67, 198.78, 199.2, 196.45, 198.42, 195.64, 196.58, 201,
    201.5, 200.3, 201.56, 201, 201.08, 205.17, 207.82, 212.44, 213.55, 209.95,
    210.01, 211.14, 212.41, 211.16, 208.62, 209.11, 210.16, 210.02, 211.18,
    212.48, 214.4, 214.15, 213.76, 213.88, 214.05, 211.27, 209.05, 207.57,
    202.38, 203.35, 202.92, 213.25, 220.03, 229.35, 227.18, 229.65, 233.33,
    232.78, 231.59, 230.89, 230.56, 226.01, 224.9, 227.76, 227.16, 229.31,
    230.49, 232.56, 232.14, 229.72, 238.47, 239.78, 239.69, 237.88, 234.35,
    226.79, 230.03, 234.07, 236.7, 238.15, 238.99, 237.88, 245.5, 256.08,
    254.43, 252.31, 256.87, 255.46, 254.43, 254.63, 255.45, 257.13, 258.02,
    256.69, 256.48, 258.06, 254.04, 245.27, 247.66, 247.77, 249.34, 247.45,
    252.29, 262.24, 262.77, 258.45, 259.58, 262.82, 268.81, 269, 269.7, 271.4,
    270.37, 269.05, 270.04, 270.14, 269.77, 268.47, 269.43, 275.25, 273.47,
    272.95, 272.41, 267.46, 267.44, 268.56, 266.25, 271.49, 275.92, 276.97,
    277.55, 278.85, 283.1, 286.19, 284.15, 280.7, 278.78, 277.89, 277.18,
    278.78, 278.03, 278.28, 274.11, 274.61, 271.84, 272.19, 273.67, 270.97,
    272.36, 273.81, 273.4, 273.76, 273.08, 271.86, 271.01, 267.26, 262.36,
    260.33, 259.04, 259.37, 260.25, 261.05, 259.96, 258.21, 255.53, 246.7,
    247.65, 248.35, 248.04, 255.41, 258.27, 256.44, 258.28, 259.48, 270.01,
    269.48, 276.49, 275.91, 278.12, 274.62, 273.68, 275.5, 261.73, 255.78,
    263.88, 264.35, 260.58, 264.58, 266.18, 272.14, 274.23, 272.95, 264.18,
    264.72, 263.75, 262.52, 260.29, 257.46, 259.88, 260.83, 260.81, 255.76,
    250.12, 252.82, 254.23, 249.94, 248.96, 247.99, 251.49, 251.64, 252.62,
    252.89, 248.8, 246.63, 253.79, 255.63, 255.92, 258.86, 253.5, 258.9,
    260.49, 260.48, 259.2, 258.83, 266.43, 263.4, 270.23, 273.05, 266.17,
    273.17, 273.43, 271.06, 267.61, 270.71, 270.17, 271.98
  ];

  var start = new Date(2024, 4, 10).getTime();
  var end = new Date(2026, 3, 30).getTime();

  var labels = data.map(function (_, i) {
    var d = new Date(start + (i / (data.length - 1)) * (end - start));
    var month = d.toLocaleDateString('en-US', { month: 'short' });
    return month + " '" + String(d.getFullYear()).slice(-2);
  });

  function formatValue(v) {
    return v.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2
    });
  }

  // Preço inicial e atual
  var primeiroValor = data[0];
  var ultimoValor = data[data.length - 1];
  var diff = ultimoValor - primeiroValor;
  var percentual = ((diff / primeiroValor) * 100).toFixed(2);

  if (cardGrafico) {
    cardGrafico.style.setProperty('--trend', color);
  }

  if (chartName) {
    chartName.textContent = name + ' • Apple Inc.';
  }

  function atualizarHeader(val, perc) {
    if (valorTotal) {
      valorTotal.textContent = formatValue(val);
    }
    if (badgeResultado) {
      var sinal = perc >= 0 ? '+' : '';
      badgeResultado.textContent = sinal + perc + '%';
      badgeResultado.style.color = color;
      badgeResultado.style.borderColor = color;
    }
  }

  atualizarHeader(ultimoValor, percentual);

  // Escala do SVG
  var minVal = Math.min.apply(null, data);
  var maxVal = Math.max.apply(null, data);
  var margem = (maxVal - minVal) * 0.06;
  minVal -= margem;
  maxVal += margem;
  var range = maxVal - minVal || 1;

  var svgWidth = 800;
  var svgHeight = 260;

  var coords = data.map(function (val, i) {
    var x = (i / (data.length - 1)) * svgWidth;
    var y = svgHeight - ((val - minVal) / range) * (svgHeight - 40) - 20;
    return { x: x, y: y, valor: val, label: labels[i] };
  });

  // Linha contínua
  var dPath = 'M ' + coords.map(function (c) {
    return c.x.toFixed(1) + ' ' + c.y.toFixed(1);
  }).join(' L ');

  var dArea = dPath + ' L ' + svgWidth + ' ' + svgHeight + ' L 0 ' + svgHeight + ' Z';

  container.innerHTML = '';

  var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 ' + svgWidth + ' ' + svgHeight);
  svg.setAttribute('preserveAspectRatio', 'none');
  svg.style.width = '100%';
  svg.style.height = '100%';
  svg.style.display = 'block';

  // Gradiente da área
  var defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  var grad = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
  grad.setAttribute('id', 'spell-chart-grad');
  grad.setAttribute('x1', '0');
  grad.setAttribute('y1', '0');
  grad.setAttribute('x2', '0');
  grad.setAttribute('y2', '1');

  var stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
  stop1.setAttribute('offset', '0%');
  stop1.setAttribute('stop-color', color);
  stop1.setAttribute('stop-opacity', '0.24');

  var stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
  stop2.setAttribute('offset', '100%');
  stop2.setAttribute('stop-color', color);
  stop2.setAttribute('stop-opacity', '0.0');

  grad.appendChild(stop1);
  grad.appendChild(stop2);
  defs.appendChild(grad);
  svg.appendChild(defs);

  // Path área
  var pathArea = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  pathArea.setAttribute('d', dArea);
  pathArea.setAttribute('fill', 'url(#spell-chart-grad)');
  svg.appendChild(pathArea);

  // Path linha
  var pathLine = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  pathLine.setAttribute('d', dPath);
  pathLine.setAttribute('fill', 'none');
  pathLine.setAttribute('stroke', color);
  pathLine.setAttribute('stroke-width', '2.2');
  pathLine.setAttribute('stroke-linecap', 'round');
  pathLine.setAttribute('stroke-linejoin', 'round');
  svg.appendChild(pathLine);

  container.appendChild(svg);

  // Elementos do hover
  var vline = document.createElement('div');
  vline.className = 'chart-vline';
  vline.style.cssText = 'position:absolute;top:0;bottom:0;width:1px;background:rgba(255,255,255,0.2);opacity:0;pointer-events:none;transition:opacity .15s;';
  container.appendChild(vline);

  var dot = document.createElement('div');
  dot.className = 'chart-dot';
  dot.style.cssText = 'position:absolute;width:10px;height:10px;margin:-5px 0 0 -5px;border-radius:50%;background:' + color + ';box-shadow:0 0 12px ' + color + ';border:2px solid #0e0e0e;opacity:0;pointer-events:none;transition:opacity .15s;';
  container.appendChild(dot);

  var tip = document.createElement('div');
  tip.className = 'chart-tip';
  tip.style.cssText = 'position:absolute;top:10px;padding:6px 12px;border-radius:8px;background:rgba(14,14,14,0.92);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,0.15);font-size:.85rem;white-space:nowrap;opacity:0;pointer-events:none;color:#fff;box-shadow:0 8px 24px rgba(0,0,0,0.6);transition:opacity .15s;';
  container.appendChild(tip);

  // Eixo X com datas
  var axisContainer = document.getElementById('chartAxisX');
  if (!axisContainer) {
    axisContainer = document.createElement('div');
    axisContainer.id = 'chartAxisX';
    axisContainer.style.cssText = 'display:flex;justify-content:space-between;margin-top:10px;font-size:11px;color:var(--muted);font-family:system-ui,-apple-system,sans-serif;padding:0 4px;';
    container.parentElement.appendChild(axisContainer);
  }

  // 6 marcos temporais ao longo do período
  var steps = [0, Math.floor(data.length * 0.2), Math.floor(data.length * 0.4), Math.floor(data.length * 0.6), Math.floor(data.length * 0.8), data.length - 1];
  axisContainer.innerHTML = '';
  steps.forEach(function (idx) {
    var span = document.createElement('span');
    span.textContent = labels[idx];
    axisContainer.appendChild(span);
  });

  // Interatividade Hover / Touch
  function handleMove(e) {
    var rect = container.getBoundingClientRect();
    var clientX = e.touches ? e.touches[0].clientX : e.clientX;
    var relX = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    var idx = Math.round(relX * (coords.length - 1));
    var pt = coords[idx];
    if (!pt) return;

    var px = (pt.x / svgWidth) * rect.width;
    var py = (pt.y / svgHeight) * rect.height;

    vline.style.opacity = '1';
    vline.style.transform = 'translateX(' + px + 'px)';

    dot.style.opacity = '1';
    dot.style.left = px + 'px';
    dot.style.top = py + 'px';

    tip.style.opacity = '1';
    var tipX = Math.min(rect.width - 120, Math.max(10, px - 60));
    tip.style.left = tipX + 'px';
    tip.style.top = Math.max(8, py - 52) + 'px';

    tip.innerHTML = '<strong style="color:' + color + ';">' + formatValue(pt.valor) + '</strong> <span style="opacity:.65;font-size:11px;margin-left:4px;">' + pt.label + '</span>';

    var diffHover = pt.valor - primeiroValor;
    var percHover = ((diffHover / primeiroValor) * 100).toFixed(2);
    atualizarHeader(pt.valor, percHover);
  }

  function handleLeave() {
    vline.style.opacity = '0';
    dot.style.opacity = '0';
    tip.style.opacity = '0';
    atualizarHeader(ultimoValor, percentual);
  }

  container.addEventListener('pointermove', handleMove);
  container.addEventListener('pointerleave', handleLeave);
  container.addEventListener('touchmove', handleMove, { passive: true });
  container.addEventListener('touchend', handleLeave);
})();
