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

  function moeda(valor, decimais) {
    return Number(valor || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: decimais,
      maximumFractionDigits: decimais
    });
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
    var ativos = window.BankSanMercado ? window.BankSanMercado.ativos : [];
    var posicoes = carteira.map(function (posicao) {
      var ativo = ativos.filter(function (item) { return item.t === posicao.t; })[0];
      return ativo ? {
        nome: ativo.t,
        valor: Number(ativo.preco) * Number(posicao.q),
        detalhe: ativo.nome
      } : null;
    }).filter(Boolean).sort(function (a, b) { return a.nome.localeCompare(b.nome); });

    return {
      titulo: 'Meus investimentos',
      subtitulo: posicoes.length ? 'Valor atual da carteira por ativo' : 'Adicione ativos à carteira para acompanhar seu total',
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
    valorTotal.textContent = moeda(dados.total, 2);
    badgeResultado.textContent = dados.resumo;
    badgeResultado.style.color = dados.cor;
    badgeResultado.style.borderColor = dados.cor;
    if (cardGrafico) cardGrafico.style.setProperty('--trend', dados.cor);

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
      'aria-label': dados.titulo + '. Total: ' + moeda(dados.total, 2)
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
      }, moeda(valorEixo, 0)));
    }

    svg.appendChild(svgElemento('path', { d: area, class: 'chart-area' }));
    svg.appendChild(svgElemento('path', { d: linha, class: 'chart-line' }));
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
      forte.textContent = moeda(ponto.valor, 2);
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
    desenhar(modo === 'investimentos' ? dadosInvestimentos() : dadosGastos());
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
