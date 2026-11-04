// Bank-San | Gráfico de investimentos e gastos
(function () {
  'use strict';

  var container = document.getElementById('chartInvest');
  var titulo = document.querySelector('#cardGrafico h2');
  var valorTotal = document.getElementById('valorTotal');
  var badgeResultado = document.getElementById('badgeResultado');
  var chartName = document.getElementById('chartName');
  var cardGrafico = document.getElementById('cardGrafico');
  var botoesModo = document.querySelectorAll('[data-chart-mode]');
  if (!container || !titulo || !valorTotal || !badgeResultado || !chartName) return;

  var svgNS = 'http://www.w3.org/2000/svg';
  var modo = 'investimentos';
  var carteira = [];
  var cartao = null;
  var ease = 'cubic-bezier(.22, 1, .36, 1)';
  var btcHistorico = [
    96492,96910,95892,94316,94748,96802,97032,103241,102971,104696,104106,102813,104170,103539,103745,103489,103191,106446,105606,106791,109678,111673,107288,107791,109035,109440,108995,107802,105642,103999,104638,105652,105882,105432,104732,101576,104390,105616,105794,110294,110257,108687,105929,106091,105472,105552,106797,104601,104883,104684,103310,102257,100987,105578,106046,107361,106960,107088,107328,108386,107135,105698,108859,109648,108034,108231,109232,108300,108950,111327,115987,117517,117435,119116,119850,117777,118739,119290,118003,117940,117301,117440,119995,118755,118368,117636,117947,119448,117924,117922,117831,115758,113320,112527,114218,115072,114141,115028,117497,116689,116500,119307,118731,120173,123344,118360,117398,117491,117453,116252,112831,114275,112419,116874,115374,113458,110124,111803,111222,112545,108411,108808,108237,109251,111201,111723,110724,110651,110225,111168,112071,111531,113955,115508,116102,115951,115408,115445,116843,116469,117137,115689,115722,115306,112749,112015,113329,109049,109713,109682,112123,114400,114056,118649,120681,122267,122425,123513,124753,121451,123355,121706,113214,110808,115170,115271,113119,110783,108186,106468,107198,108667,110589,108477,107689,110070,111034,111642,114472,114119,112956,110055,108306,109556,110064,110640,106548,101591,103892,101301,103372,102282,104720,105997,102997,101663,99697,94398,95549,94177,92094,92949,91466,86632,85091,84648,86805,88271,87342,90518,91285,90919,90852,90394,86322,91350,93528,92142,89388,89272,90406,90640,92692,92021,92511,90270,90299,88175,86420,87844,86144,85463,88103,88344,88622,88490,87414,87612,87235,87301,87802,87836,87138,88430,87509,88732,89945,90603,91413,93883,93729,91308,91027,90513,90387,90827,91193,95322,96929,95551,95525,95100,93634,92554,88311,89377,89462,89504,89111,86572,88267,89103,89185,84562,84129,78621,76974,78689,75634,73020,62702,70555,69282,70265,70121,68794,66992,66222,68858,69768,68788,68843,67494,66425,66958,68005,68004,67659,64617,64080,67960,67454,65882,66996,65738,68776,68294,72711,70841,68136,67273,65970,68402,69927,70205,70493,70968,71215,72790,74861,73922,71246,69913,70523,68712,67845,70915,70518,71310,68792,66338,66320,65955,66691,68233,68079,66889,66931,67291,68982,68860,71941,71123,71768,72979,73054,70753,74485,74182,74805,75152,77127,75726,73856,75873,76353,78203,78269,77455,77612,78658,77367,76351,75776,76425
  ];

  function moeda(valor, decimais) {
    return Number(valor || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: decimais,
      maximumFractionDigits: decimais
    });
  }

  function formatarValor(valor, moedaDados) {
    if (moedaDados === 'USD') {
      return Number(valor || 0).toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
      });
    }
    return moeda(valor, 2);
  }

  function svgElemento(nome, atributos, texto) {
    var el = document.createElementNS(svgNS, nome);
    Object.keys(atributos || {}).forEach(function (chave) { el.setAttribute(chave, atributos[chave]); });
    if (texto != null) el.textContent = texto;
    return el;
  }

  function dataOrdem(texto) {
    var partes = String(texto || '').split('/');
    if (partes.length === 3) return partes[2] + partes[1] + partes[0];
    if (partes.length === 2) return '0000' + partes[1] + partes[0];
    return String(texto || '');
  }

  function dadosInvestimentos() {
    var ativosMercado = window.BankSanMarketSymbols || [];
    var ativosExemplo = window.BankSanMercado ? window.BankSanMercado.ativos : [];
    var posicoes = carteira.map(function (posicao) {
      var ativo = ativosMercado.filter(function (item) { return item.ticker === posicao.t; })[0] ||
        ativosExemplo.filter(function (item) { return item.t === posicao.t; })[0];
      return ativo ? {
        nome: ativo.ticker || ativo.t,
        valor: Number(posicao.pm) * Number(posicao.q),
        detalhe: ativo.nome + ' • capital investido informado'
      } : null;
    }).filter(Boolean).sort(function (a, b) { return a.nome.localeCompare(b.nome); });

    return {
      titulo: 'Capital investido',
      subtitulo: posicoes.length ? 'Distribuição pelos preços médios informados por você • não é cotação atual' : 'Adicione ativos à carteira para acompanhar seu capital investido',
      resumo: posicoes.length + (posicoes.length === 1 ? ' ativo' : ' ativos'),
      total: posicoes.reduce(function (soma, posicao) { return soma + posicao.valor; }, 0),
      pontos: posicoes.map(function (posicao) {
        return { label: posicao.nome, valor: posicao.valor, detalhe: posicao.detalhe };
      }),
      cor: '#EAB308',
      vazio: 'Adicione ativos à carteira para ver o gráfico'
    };
  }

  function dadosGastos() {
    var gastos = cartao && cartao.gastos ? cartao.gastos.slice() : [];
    gastos.sort(function (a, b) { return dataOrdem(a.data).localeCompare(dataOrdem(b.data)); });
    var acumulado = 0;
    var pontos = gastos.map(function (gasto) {
      acumulado += Number(gasto.valor || 0);
      return {
        label: gasto.data || 'Lançamento',
        valor: acumulado,
        detalhe: gasto.desc || 'Gasto'
      };
    });
    var nome = cartao ? cartao.nome : 'Nenhum cartão';

    return {
      titulo: 'Meus gastos',
      subtitulo: cartao ? nome + ' • total acumulado dos lançamentos' : 'Selecione um cartão para acompanhar os gastos',
      resumo: gastos.length + (gastos.length === 1 ? ' lançamento' : ' lançamentos'),
      total: gastos.reduce(function (soma, gasto) { return soma + Number(gasto.valor || 0); }, 0),
      pontos: pontos,
      cor: '#EAB308',
      vazio: cartao ? 'Nenhum gasto registrado neste cartão' : 'Adicione um cartão para ver os gastos'
    };
  }

  function dadosBitcoin() {
    return {
      titulo: 'Bitcoin (BTC/USD)',
      subtitulo: 'Gráfico interativo do TradingView • valores em USD',
      resumo: 'BTC / USD',
      total: null,
      pontos: [],
      cor: '#F7931A',
      moeda: 'USD',
      widget: true,
      simbolo: 'COINBASE:BTCUSD',
      vazio: 'O gráfico do TradingView não está disponível agora'
    };
  }

  function mostrarVazio(mensagem) {
    container.innerHTML = '';
    var svg = svgElemento('svg', {
      viewBox: '0 0 800 260',
      role: 'img',
      'aria-label': mensagem
    });
    svg.appendChild(svgElemento('text', {
      x: 400,
      y: 132,
      class: 'chart-empty-label',
      'text-anchor': 'middle'
    }, mensagem));
    container.appendChild(svg);
  }

  function desenhar(dados) {
    titulo.textContent = dados.titulo;
    chartName.textContent = dados.subtitulo;
    valorTotal.textContent = dados.total == null ? '—' : formatarValor(dados.total, dados.moeda);
    badgeResultado.textContent = dados.resumo;
    badgeResultado.style.color = dados.cor;
    badgeResultado.style.borderColor = dados.cor;
    if (cardGrafico) cardGrafico.style.setProperty('--trend', dados.cor);

    if (dados.widget) {
      if (!window.BankSanTradingView || !window.BankSanTradingView.montar(container, dados.simbolo, { interval: 'D' })) {
        mostrarVazio(dados.vazio);
        return;
      }
      container.classList.add('chart-tradingview');
      return;
    }

    container.classList.remove('chart-tradingview');
    if (!dados.pontos.length) {
      mostrarVazio(dados.vazio);
      return;
    }

    container.innerHTML = '';
    var largura = 800, altura = 260;
    var margem = { topo: 20, direita: 16, baixo: 34, esquerda: 74 };
    var larguraGrafico = largura - margem.esquerda - margem.direita;
    var alturaGrafico = altura - margem.topo - margem.baixo;
    var valores = dados.pontos.map(function (ponto) { return ponto.valor; });
    var minimo = Math.min.apply(null, valores);
    var maximo = Math.max.apply(null, valores);
    if (minimo === maximo) {
      var folga = Math.max(maximo * .12, 1);
      minimo = Math.max(0, minimo - folga);
      maximo += folga;
    } else {
      var margemValor = (maximo - minimo) * .12;
      minimo = Math.max(0, minimo - margemValor);
      maximo += margemValor;
    }
    var faixa = maximo - minimo || 1;
    var pontos = dados.pontos.map(function (ponto, indice) {
      var x = dados.pontos.length === 1
        ? margem.esquerda + larguraGrafico / 2
        : margem.esquerda + (indice / (dados.pontos.length - 1)) * larguraGrafico;
      var y = margem.topo + alturaGrafico - ((ponto.valor - minimo) / faixa) * alturaGrafico;
      return { x: x, y: y, valor: ponto.valor, label: ponto.label, detalhe: ponto.detalhe };
    });
    var linha = 'M ' + pontos.map(function (ponto) {
      return ponto.x.toFixed(1) + ' ' + ponto.y.toFixed(1);
    }).join(' L ');
    var area = linha + ' L ' + pontos[pontos.length - 1].x.toFixed(1) + ' ' +
      (altura - margem.baixo) + ' L ' + pontos[0].x.toFixed(1) + ' ' +
      (altura - margem.baixo) + ' Z';

    var svg = svgElemento('svg', {
      viewBox: '0 0 ' + largura + ' ' + altura,
      preserveAspectRatio: 'none',
      role: 'img',
      'aria-label': dados.titulo + '. Valor: ' + formatarValor(dados.total, dados.moeda)
    });
    var defs = svgElemento('defs');
    var gradiente = svgElemento('linearGradient', { id: 'grafico-area-grad', x1: '0', y1: '0', x2: '0', y2: '1' });
    gradiente.appendChild(svgElemento('stop', { offset: '0%', 'stop-color': dados.cor, 'stop-opacity': '.25' }));
    gradiente.appendChild(svgElemento('stop', { offset: '100%', 'stop-color': dados.cor, 'stop-opacity': '0' }));
    defs.appendChild(gradiente);
    svg.appendChild(defs);

    for (var i = 0; i <= 4; i++) {
      var proporcao = i / 4;
      var y = margem.topo + alturaGrafico * proporcao;
      var valorEixo = maximo - (maximo - minimo) * proporcao;
      svg.appendChild(svgElemento('line', {
        x1: margem.esquerda,
        x2: largura - margem.direita,
        y1: y,
        y2: y,
        class: 'chart-grid-line'
      }));
      svg.appendChild(svgElemento('text', {
        x: margem.esquerda - 10,
        y: y + 4,
        class: 'chart-axis-label',
        'text-anchor': 'end'
      }, formatarValor(valorEixo, dados.moeda)));
    }

    svg.appendChild(svgElemento('path', { d: area, class: 'chart-area' }));
    var linhaSvg = svgElemento('path', { d: linha, class: 'chart-line' });
    linhaSvg.style.setProperty('--chart-line-length', linhaSvg.getTotalLength() + 'px');
    svg.appendChild(linhaSvg);
    if (pontos.length === 1) {
      svg.appendChild(svgElemento('circle', {
        cx: pontos[0].x,
        cy: pontos[0].y,
        r: 5,
        class: 'chart-single-point'
      }));
    }

    var pontosVisiveis = pontos.length <= 8
      ? pontos
      : pontos.filter(function (_, indice) {
        return indice === 0 || indice === pontos.length - 1 || indice % Math.ceil(pontos.length / 6) === 0;
      });
    pontosVisiveis.forEach(function (ponto) {
      svg.appendChild(svgElemento('text', {
        x: ponto.x,
        y: altura - 10,
        class: 'chart-x-label',
        'text-anchor': 'middle'
      }, ponto.label));
    });

    container.appendChild(svg);

    var vline = document.createElement('div');
    vline.className = 'chart-vline';
    container.appendChild(vline);
    var dot = document.createElement('div');
    dot.className = 'chart-dot';
    container.appendChild(dot);
    var tip = document.createElement('div');
    tip.className = 'chart-tip';
    container.appendChild(tip);

    function mover(e) {
      var rect = container.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var indice = Math.round(Math.max(0, Math.min(1, x / rect.width)) * (pontos.length - 1));
      var ponto = pontos[indice];
      if (!ponto) return;
      var px = ponto.x / largura * rect.width;
      var py = ponto.y / altura * rect.height;
      vline.style.left = px + 'px';
      dot.style.left = px + 'px';
      dot.style.top = py + 'px';
      tip.textContent = '';
      var forte = document.createElement('strong');
      forte.textContent = formatarValor(ponto.valor, dados.moeda);
      var detalhe = document.createElement('small');
      detalhe.textContent = ponto.detalhe + ' • ' + ponto.label;
      tip.appendChild(forte);
      tip.appendChild(detalhe);
      tip.style.left = Math.max(8, Math.min(rect.width - 170, px - 70)) + 'px';
      tip.style.top = Math.max(6, py - 52) + 'px';
      container.classList.add('is-hover');
    }

    container.addEventListener('pointermove', mover);
    container.addEventListener('pointerleave', function () { container.classList.remove('is-hover'); });
  }

  function atualizar() {
    botoesModo.forEach(function (botao) {
      var ativo = botao.getAttribute('data-chart-mode') === modo;
      botao.classList.toggle('is-active', ativo);
      botao.setAttribute('aria-pressed', ativo ? 'true' : 'false');
    });
    if (cardGrafico) cardGrafico.dataset.chartDisplayMode = modo;
    var dados = modo === 'investimentos'
      ? dadosInvestimentos()
      : modo === 'gastos'
        ? dadosGastos()
        : dadosBitcoin();
    desenhar(dados);
  }

  botoesModo.forEach(function (botao) {
    botao.addEventListener('click', function () {
      modo = botao.getAttribute('data-chart-mode');
      atualizar();
    });
  });

  document.addEventListener('bs-carteira', function (evento) {
    carteira = Array.isArray(evento.detail) ? evento.detail.slice() : [];
    if (modo === 'investimentos') atualizar();
  });
  document.addEventListener('bs-cartao-alterado', function (evento) {
    cartao = evento.detail;
    if (modo === 'gastos') atualizar();
  });

  atualizar();
})();
