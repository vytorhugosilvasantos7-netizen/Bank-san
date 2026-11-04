// Bank-San | Minha carteira e simulador
(function () {
  'use strict';
  var A = window.BankSanAreas;
  if (!A) return;
  var $ = A.$;
  var simbolos = window.BankSanMarketSymbols || [];
  var brl = function (valor) {
    return Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };
  var ativo = function (ticker) {
    return simbolos.filter(function (item) { return item.ticker === ticker; })[0] ||
      (window.BankSanMercado && window.BankSanMercado.ativos.filter(function (item) { return item.t === ticker; })[0]);
  };
  var tickerAtivo = function (item) { return item.ticker || item.t; };
  var ativoLegado = function (item) { return !item.ticker; };
  var opcoes = simbolos.filter(function (item) {
    return item.ticker !== 'BTCUSD' && item.ticker !== 'USDBRL';
  }).map(function (item) {
    return '<option value="' + item.ticker + '">' + item.ticker + ' — ' + item.nome + '</option>';
  }).join('');

  var cart = [];
  var erroCarregamento = false;
  try {
    cart = JSON.parse(localStorage.getItem('bs-carteira') || '[]').filter(function (posicao) {
      return ativo(posicao.t) && Number(posicao.q) > 0 && Number(posicao.pm) > 0;
    });
  } catch (e) {
    erroCarregamento = true;
  }
  A.carteira = cart;

  function salvar() {
    try {
      localStorage.setItem('bs-carteira', JSON.stringify(cart));
      return true;
    } catch (e) {
      $('#cStatus').textContent = 'Não foi possível salvar as alterações neste navegador. Elas continuam visíveis apenas nesta sessão.';
      $('#cStatus').classList.add('is-error');
      return false;
    }
  }
  function notificar() {
    A.carteira = cart;
    document.dispatchEvent(new CustomEvent('bs-carteira', { detail: cart.slice() }));
  }

  A.view('carteira',
    '<header class="area-page-heading"><p class="area-eyebrow">PLANEJAMENTO</p><h2>Minha carteira / Simulador</h2><p>Acompanhe suas posições informadas e projete cenários de aportes.</p></header>' +
    '<article class="card portfolio-card"><header class="card-head"><div><h3>Posições da carteira</h3><p class="chart-name">Registro manual; não conectado à corretora.</p></div></header>' +
    '<p class="aviso-edu">O valor investido abaixo usa a quantidade e o preço médio informados por você. Não é uma cotação de mercado nem o valor atual da carteira. Para ver gráficos de mercado, use a área “Gráficos do mercado”.</p>' +
    '<form class="ctl portfolio-form" id="cForm"><label for="cAtivo">Ativo<select id="cAtivo">' + opcoes + '</select></label><label for="cQtd">Quantidade<input id="cQtd" type="number" min="0.000001" step="any" value="10" required></label><label for="cPm">Preço médio pago (R$)<input id="cPm" type="number" min="0.01" step="0.01" placeholder="Informe o preço médio" required></label><button class="btn" type="submit">Adicionar posição</button></form><p class="portfolio-status" id="cStatus" role="status" aria-live="polite"></p>' +
    '<div class="portfolio-summary"><div><small>Total investido informado</small><strong id="cTotal">R$ 0,00</strong></div><div><small>Ativos na carteira</small><strong id="cQuantidade">0</strong></div></div>' +
    '<div id="cGrafico" class="portfolio-allocation" role="img" aria-label="Distribuição do capital investido por ativo"></div>' +
    '<div class="tabela-area"><table class="tabela"><thead><tr><th>Ativo</th><th>Quantidade</th><th>Preço médio</th><th>Total investido</th><th></th></tr></thead><tbody id="cCorpo"></tbody></table></div></article>' +
    '<article class="card simulator-card"><header class="card-head"><div><p class="area-eyebrow">CENÁRIOS</p><h3>Simulador de juros compostos</h3><p class="chart-name">Ajuste os valores para explorar diferentes cenários de longo prazo.</p></div></header>' +
    '<div class="ctl simulator-form"><label>Valor inicial (R$)<input id="sIni" type="number" min="0" step="100" value="1000"></label><label>Aporte mensal (R$)<input id="sMes" type="number" min="0" step="50" value="300"></label><label>Taxa anual (%)<input id="sTaxa" type="number" min="0" max="100" step="0.1" value="10"></label><label>Prazo (anos)<input id="sAnos" type="number" min="1" max="50" step="1" value="10"></label></div>' +
    '<div class="kpis simulator-kpis"><div><small>Patrimônio projetado</small><strong id="sFinal"></strong></div><div><small>Total aportado</small><strong id="sInv"></strong></div><div><small>Rendimento projetado</small><strong id="sJuros" class="pos"></strong></div></div>' +
    '<div class="sim-chart-heading"><h4>Projeção do patrimônio</h4><div class="legenda"><span><i class="sim-total-i"></i>Patrimônio</span><span><i class="sim-inv-i"></i>Capital aportado</span></div></div><div class="grafico-sim" id="sGraf"></div>' +
    '<p class="nota">Simulação matemática com taxa anual constante e aportes no fim de cada mês. Não considera impostos, taxas, inflação nem oscilações reais; não é promessa ou recomendação de rentabilidade.</p></article>'
  );
  if (erroCarregamento) {
    $('#cStatus').textContent = 'Não foi possível ler a carteira salva neste navegador. O conteúdo armazenado não foi apagado.';
    $('#cStatus').classList.add('is-error');
  }

  function desenharAlocacao() {
    var container = $('#cGrafico'), total = cart.reduce(function (soma, p) { return soma + p.q * p.pm; }, 0);
    container.innerHTML = '';
    if (!cart.length || !total) {
      container.textContent = 'Adicione posições para visualizar a distribuição do capital informado.';
      return;
    }

    var barras = document.createElement('div');
    barras.className = 'allocation-bars';
    cart.forEach(function (posicao, indice) {
      var a = ativo(posicao.t), valor = posicao.q * posicao.pm;
      var linha = document.createElement('div');
      linha.className = 'allocation-row';
      var rotulo = document.createElement('div');
      rotulo.className = 'allocation-label';
      var nome = document.createElement('strong');
      nome.textContent = tickerAtivo(a);
      var percentual = document.createElement('span');
      percentual.textContent = (valor / total * 100).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '% · ' + brl(valor);
      rotulo.append(nome, percentual);
      var trilho = document.createElement('div');
      trilho.className = 'allocation-track';
      var barra = document.createElement('span');
      barra.style.width = (valor / total * 100) + '%';
      barra.style.setProperty('--allocation-color', 'hsl(' + ((148 + indice * 31) % 360) + ' 64% 48%)');
      trilho.appendChild(barra);
      linha.append(rotulo, trilho);
      barras.appendChild(linha);
    });
    container.appendChild(barras);
  }

  function desenharCarteira() {
    var total = cart.reduce(function (soma, p) { return soma + p.q * p.pm; }, 0);
    $('#cCorpo').innerHTML = cart.map(function (p, indice) {
      var a = ativo(p.t);
      return '<tr><td><strong>' + tickerAtivo(a) + '</strong><br><small>' + a.nome +
        (ativoLegado(a) ? ' · ativo demonstrativo legado' : '') + '</small></td><td>' +
        Number(p.q).toLocaleString('pt-BR', { maximumFractionDigits: 6 }) + '</td><td>' + brl(p.pm) +
        '</td><td>' + brl(p.q * p.pm) + '</td><td><button class="btn-small" type="button" data-rm="' +
        indice + '" aria-label="Remover ' + tickerAtivo(a) + ' da carteira">Remover</button></td></tr>';
    }).join('') || '<tr><td colspan="5" class="vazio">Sua carteira está vazia. Adicione uma posição para começar.</td></tr>';
    $('#cTotal').textContent = brl(total);
    $('#cQuantidade').textContent = String(cart.length);
    desenharAlocacao();
  }

  var primeiroAtivo = simbolos.filter(function (item) { return item.ticker !== 'BTCUSD' && item.ticker !== 'USDBRL'; })[0];
  if (primeiroAtivo) $('#cAtivo').value = primeiroAtivo.ticker;
  $('#cForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var ticker = $('#cAtivo').value;
    var quantidade = Number($('#cQtd').value);
    var precoMedio = Number($('#cPm').value);
    if (!ativo(ticker) || !(quantidade > 0) || !(precoMedio > 0)) return;
    cart.push({ t: ticker, q: quantidade, pm: precoMedio });
    var salvo = salvar();
    desenharCarteira();
    notificar();
    if (salvo) {
      $('#cStatus').textContent = '';
      $('#cStatus').classList.remove('is-error');
    }
    $('#cPm').value = '';
  });
  $('#cCorpo').addEventListener('click', function (e) {
    var botao = e.target.closest('[data-rm]');
    if (!botao) return;
    cart.splice(Number(botao.getAttribute('data-rm')), 1);
    var salvo = salvar();
    desenharCarteira();
    notificar();
    if (salvo) {
      $('#cStatus').textContent = '';
      $('#cStatus').classList.remove('is-error');
    }
  });

  function svg(nome, attrs, texto) {
    var el = document.createElementNS('http://www.w3.org/2000/svg', nome);
    Object.keys(attrs || {}).forEach(function (key) { el.setAttribute(key, attrs[key]); });
    if (texto) el.textContent = texto;
    return el;
  }

  function simular() {
    var inicio = Math.max(0, Number($('#sIni').value) || 0);
    var mensal = Math.max(0, Number($('#sMes').value) || 0);
    var taxaAnual = Math.min(100, Math.max(0, Number($('#sTaxa').value) || 0));
    var anos = Math.min(50, Math.max(1, Math.floor(Number($('#sAnos').value) || 1)));
    var taxaMensal = Math.pow(1 + taxaAnual / 100, 1 / 12) - 1;
    var saldo = inicio, investido = inicio, pontos = [{ ano: 0, saldo: saldo, investido: investido }];
    for (var mes = 1; mes <= anos * 12; mes++) {
      saldo = saldo * (1 + taxaMensal) + mensal;
      investido += mensal;
      if (mes % 12 === 0) pontos.push({ ano: mes / 12, saldo: saldo, investido: investido });
    }
    $('#sFinal').textContent = brl(saldo);
    $('#sInv').textContent = brl(investido);
    $('#sJuros').textContent = brl(saldo - investido);

    var largura = 760, altura = 260, esquerda = 76, direita = 12, topo = 18, base = 214;
    var maximo = Math.max(saldo, 1), larguraPlot = largura - esquerda - direita, alturaPlot = base - topo;
    var x = function (indice) { return esquerda + indice / anos * larguraPlot; };
    var y = function (valor) { return base - valor / maximo * alturaPlot; };
    var svgGrafico = svg('svg', { viewBox: '0 0 ' + largura + ' ' + altura, role: 'img', 'aria-label': 'Projeção de patrimônio em ' + anos + ' anos. Valor projetado: ' + brl(saldo) + '; total aportado: ' + brl(investido) + '.' });
    var tituloGrafico = svg('title', {}, 'Projeção ilustrativa de juros compostos');
    svgGrafico.appendChild(tituloGrafico);

    [0, .25, .5, .75, 1].forEach(function (passo) {
      var valor = maximo * passo, yi = y(valor);
      svgGrafico.appendChild(svg('line', { x1: esquerda, x2: largura - direita, y1: yi, y2: yi, class: 'sim-grid' }));
      svgGrafico.appendChild(svg('text', { x: esquerda - 9, y: yi + 4, 'text-anchor': 'end', class: 'sim-axis' }, brl(valor)));
    });
    var linha = function (campo) {
      return pontos.map(function (p, i) { return (i ? 'L' : 'M') + x(p.ano).toFixed(1) + ' ' + y(p[campo]).toFixed(1); }).join(' ');
    };
    var dTotal = linha('saldo'), dInvestido = linha('investido');
    var area = dTotal + ' L ' + x(anos).toFixed(1) + ' ' + base + ' L ' + x(0).toFixed(1) + ' ' + base + ' Z';
    var defs = svg('defs');
    var gradiente = svg('linearGradient', { id: 'sim-gradiente', x1: '0', y1: '0', x2: '0', y2: '1' });
    gradiente.append(svg('stop', { offset: '0%', 'stop-color': '#22c55e', 'stop-opacity': '.25' }), svg('stop', { offset: '100%', 'stop-color': '#22c55e', 'stop-opacity': '0' }));
    defs.appendChild(gradiente);
    svgGrafico.appendChild(defs);
    svgGrafico.appendChild(svg('path', { d: area, class: 'sim-area' }));
    svgGrafico.appendChild(svg('path', { d: dInvestido, class: 'sim-inv' }));
    var totalLinha = svg('path', { d: dTotal, class: 'sim-total' });
    totalLinha.style.setProperty('--sim-line-length', totalLinha.getTotalLength() + 'px');
    svgGrafico.appendChild(totalLinha);
    pontos.forEach(function (p, indice) {
      if (p.ano % Math.max(1, Math.ceil(anos / 5)) !== 0 && p.ano !== anos) return;
      var ponto = svg('circle', { cx: x(p.ano), cy: y(p.saldo), r: 3, class: 'sim-point' });
      ponto.appendChild(svg('title', {}, 'Ano ' + p.ano + ': ' + brl(p.saldo)));
      svgGrafico.appendChild(ponto);
      svgGrafico.appendChild(svg('text', {
        x: x(p.ano), y: 242, 'text-anchor': indice === 0 ? 'start' : p.ano === anos ? 'end' : 'middle', class: 'sim-axis'
      }, p.ano + (p.ano === 1 ? ' ano' : ' anos')));
    });
    var areaGrafico = $('#sGraf');
    areaGrafico.replaceChildren(svgGrafico);
  }

  ['sIni', 'sMes', 'sTaxa', 'sAnos'].forEach(function (id) {
    $('#' + id).addEventListener('input', simular);
  });
  desenharCarteira();
  simular();
  notificar();
})();
