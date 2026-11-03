// Bank-San | Painel manual de gastos por cartão e carteira geral de investimentos
(function () {
  'use strict';

  var listaEl = document.getElementById('accountList');
  var vazioEl = document.getElementById('accountEmpty');
  var tituloEl = document.getElementById('accountDetailTitle');
  var descricaoEl = document.getElementById('accountDetailDescription');
  var conteudoEl = document.getElementById('accountDetailContent');
  var semSelecaoEl = document.getElementById('accountNoSelection');
  var tabelaEl = document.getElementById('accountLedger');
  var exportarEl = document.getElementById('accountExport');
  if (!listaEl || !window.BankSanCartoes) return;

  var selecionada = null;
  var moeda = function (valor) {
    return Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };
  var texto = function (valor) { return valor == null || valor === '' ? '-' : String(valor); };

  function celula(linha, valor) {
    var td = document.createElement('td');
    td.textContent = texto(valor);
    linha.appendChild(td);
    return td;
  }

  function dataOrdem(valor) {
    var partes = String(valor || '').split('/');
    if (partes.length === 3) return partes[2] + partes[1].padStart(2, '0') + partes[0].padStart(2, '0');
    if (partes.length === 2) return String(new Date().getFullYear()) + partes[1].padStart(2, '0') + partes[0].padStart(2, '0');
    return String(valor || '');
  }

  function carteiraAtual() {
    var ativos = window.BankSanMercado ? window.BankSanMercado.ativos : [];
    var carteira = [];
    try {
      carteira = JSON.parse(localStorage.getItem('bs-carteira') || '[]');
    } catch (erro) {
      console.error('[Bank-San] Não foi possível ler a carteira de investimentos local.', erro);
    }
    return carteira.map(function (posicao) {
      var ativo = ativos.filter(function (item) { return item.t === posicao.t; })[0];
      var quantidade = Number(posicao.q);
      if (!ativo || !Number.isFinite(quantidade) || quantidade <= 0) return null;
      return {
        ticker: ativo.t,
        nome: ativo.nome,
        quantidade: quantidade,
        preco: Number(ativo.preco),
        total: Number(ativo.preco) * quantidade
      };
    }).filter(Boolean);
  }

  function criarGraficoLinha(container, gastos) {
    container.innerHTML = '';
    if (!gastos.length) {
      var mensagem = document.createElement('p');
      mensagem.className = 'account-chart-empty';
      mensagem.textContent = 'Ainda não há gastos registrados neste cartão.';
      container.appendChild(mensagem);
      return;
    }

    var pontos = gastos.slice().sort(function (a, b) { return dataOrdem(a.data).localeCompare(dataOrdem(b.data)); });
    pontos = pontos.length > 20 ? pontos.slice(-20) : pontos;
    var valores = pontos.map(function (gasto) { return Number(gasto.valor) || 0; });
    var maximo = Math.max.apply(null, valores.concat([1]));
    var w = 640, h = 210, esquerda = 48, topo = 18, base = 168;
    var largura = w - esquerda - 16, altura = base - topo;
    var coordenadas = valores.map(function (valor, indice) {
      return {
        x: esquerda + (pontos.length === 1 ? largura / 2 : indice / (pontos.length - 1) * largura),
        y: base - (valor / maximo) * altura
      };
    });
    var caminho = coordenadas.map(function (ponto, indice) {
      return (indice ? 'L ' : 'M ') + ponto.x.toFixed(1) + ' ' + ponto.y.toFixed(1);
    }).join(' ');
    var ns = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', 'Gráfico dos últimos ' + pontos.length + ' gastos do cartão');
    [0, 0.5, 1].forEach(function (fracao) {
      var y = topo + altura * fracao;
      var linha = document.createElementNS(ns, 'line');
      linha.setAttribute('x1', String(esquerda));
      linha.setAttribute('x2', String(w - 16));
      linha.setAttribute('y1', String(y));
      linha.setAttribute('y2', String(y));
      linha.setAttribute('class', 'account-chart-grid');
      svg.appendChild(linha);
    });
    var area = document.createElementNS(ns, 'path');
    area.setAttribute('d', caminho + ' L ' + coordenadas[coordenadas.length - 1].x + ' ' + base + ' L ' + coordenadas[0].x + ' ' + base + ' Z');
    area.setAttribute('class', 'account-expense-area');
    svg.appendChild(area);
    var linhaGrafico = document.createElementNS(ns, 'path');
    linhaGrafico.setAttribute('d', caminho);
    linhaGrafico.setAttribute('class', 'account-expense-line');
    var comprimento = linhaGrafico.getTotalLength();
    linhaGrafico.style.setProperty('--account-line-length', comprimento + 'px');
    svg.appendChild(linhaGrafico);
    coordenadas.forEach(function (ponto, indice) {
      if (pontos.length > 8 && indice % Math.ceil(pontos.length / 6) !== 0 && indice !== pontos.length - 1) return;
      var textoSvg = document.createElementNS(ns, 'text');
      textoSvg.setAttribute('x', String(ponto.x));
      textoSvg.setAttribute('y', '195');
      textoSvg.setAttribute('text-anchor', 'middle');
      textoSvg.setAttribute('class', 'account-chart-label');
      textoSvg.textContent = pontos[indice].data || '';
      svg.appendChild(textoSvg);
    });
    container.appendChild(svg);
  }

  function criarGraficoCarteira(container, posicoes) {
    container.innerHTML = '';
    if (!posicoes.length) {
      var mensagem = document.createElement('p');
      mensagem.className = 'account-chart-empty';
      mensagem.textContent = 'Sua carteira geral ainda não tem ativos registrados.';
      container.appendChild(mensagem);
      return;
    }
    var maximo = Math.max.apply(null, posicoes.map(function (p) { return p.total; }).concat([1]));
    posicoes.forEach(function (posicao) {
      var item = document.createElement('div');
      item.className = 'account-invest-row';
      var cabecalho = document.createElement('div');
      cabecalho.className = 'account-invest-label';
      var nome = document.createElement('strong');
      nome.textContent = posicao.ticker;
      var valor = document.createElement('span');
      valor.textContent = moeda(posicao.total);
      cabecalho.appendChild(nome);
      cabecalho.appendChild(valor);
      var trilha = document.createElement('div');
      trilha.className = 'account-invest-track';
      var barra = document.createElement('span');
      barra.style.width = Math.max(2, posicao.total / maximo * 100) + '%';
      trilha.appendChild(barra);
      var detalhe = document.createElement('small');
      detalhe.textContent = posicao.nome + ' · ' + posicao.quantidade + ' un.';
      item.appendChild(cabecalho);
      item.appendChild(trilha);
      item.appendChild(detalhe);
      container.appendChild(item);
    });
  }

  function registros(cartao, posicoes) {
    var gastos = (cartao.gastos || []).map(function (gasto) {
      return {
        tipo: 'Gasto',
        data: gasto.data || '-',
        origem: cartao.nome + ' · ' + cartao.tipo,
        descricao: gasto.desc || 'Gasto',
        categoria: gasto.cat || 'Sem categoria',
        quantidade: '',
        unitario: '',
        total: Number(gasto.valor) || 0
      };
    });
    var investimentos = posicoes.map(function (posicao) {
      return {
        tipo: 'Investimento',
        data: '—',
        origem: 'Carteira geral (não vinculada)',
        descricao: posicao.ticker + ' · ' + posicao.nome,
        categoria: 'Carteira manual',
        quantidade: posicao.quantidade,
        unitario: posicao.preco,
        total: posicao.total
      };
    });
    return gastos.concat(investimentos).sort(function (a, b) {
      if (a.data === '—') return b.data === '—' ? 0 : 1;
      if (b.data === '—') return -1;
      return dataOrdem(b.data).localeCompare(dataOrdem(a.data));
    });
  }

  function desenharTabela(linhas) {
    tabelaEl.innerHTML = '';
    if (!linhas.length) {
      var linhaVazia = document.createElement('tr');
      var vazio = celula(linhaVazia, 'Ainda não há movimentações. Registre um gasto ou adicione ativos à carteira.');
      vazio.colSpan = 8;
      vazio.className = 'vazio';
      tabelaEl.appendChild(linhaVazia);
      return;
    }
    linhas.forEach(function (item) {
      var linha = document.createElement('tr');
      celula(linha, item.tipo);
      celula(linha, item.data);
      celula(linha, item.origem);
      celula(linha, item.descricao);
      celula(linha, item.categoria);
      celula(linha, item.quantidade);
      celula(linha, item.unitario === '' ? '' : moeda(item.unitario));
      celula(linha, moeda(item.total));
      tabelaEl.appendChild(linha);
    });
  }

  function atualizarDetalhe() {
    if (!selecionada) return;
    var cartao = window.BankSanCartoes.obter(selecionada);
    if (!cartao) {
      selecionada = null;
      conteudoEl.hidden = true;
      semSelecaoEl.hidden = false;
      tituloEl.textContent = 'Selecione uma conta';
      descricaoEl.textContent = 'Volte ao início e selecione um cartão cadastrado para abrir sua planilha.';
      exportarEl.disabled = true;
      return;
    }
    var gastos = cartao.gastos || [];
    var posicoes = carteiraAtual();
    var linhas = registros(cartao, posicoes);
    var totalGastos = gastos.reduce(function (soma, gasto) { return soma + (Number(gasto.valor) || 0); }, 0);
    var totalInvestido = posicoes.reduce(function (soma, posicao) { return soma + posicao.total; }, 0);
    tituloEl.textContent = cartao.nome;
    descricaoEl.textContent = cartao.nome + ' · ' + cartao.tipo + (cartao.bandeira ? ' · ' + cartao.bandeira : '') + ' · dados registrados manualmente';
    document.getElementById('accountExpenseTotal').textContent = moeda(totalGastos);
    document.getElementById('accountInvestmentTotal').textContent = moeda(totalInvestido);
    document.getElementById('accountRecordCount').textContent = String(linhas.length);
    document.getElementById('accountLedgerCount').textContent = linhas.length + (linhas.length === 1 ? ' registro' : ' registros');
    criarGraficoLinha(document.getElementById('accountExpenseChart'), gastos);
    criarGraficoCarteira(document.getElementById('accountInvestmentChart'), posicoes);
    desenharTabela(linhas);
    conteudoEl.hidden = false;
    semSelecaoEl.hidden = true;
    exportarEl.disabled = false;
  }

  function desenharContas() {
    listaEl.innerHTML = '';
    var cartoes = window.BankSanCartoes.listar();
    vazioEl.hidden = cartoes.length > 0;
    cartoes.forEach(function (cartao) {
      var botao = document.createElement('button');
      botao.type = 'button';
      botao.className = 'account-tile';
      botao.dataset.accountId = cartao.id;
      botao.style.setProperty('--account-color', cartao.cor || '#9a9a9a');
      var marca = document.createElement('span');
      marca.className = 'account-tile-mark';
      marca.setAttribute('aria-hidden', 'true');
      marca.textContent = cartao.nome.slice(0, 2).toUpperCase();
      var textoEl = document.createElement('span');
      textoEl.className = 'account-tile-copy';
      var nome = document.createElement('strong');
      nome.textContent = cartao.nome;
      var subtitulo = document.createElement('small');
      subtitulo.textContent = [cartao.tipo, cartao.bandeira].filter(Boolean).join(' · ');
      var total = document.createElement('small');
      total.textContent = (cartao.gastos || []).length + ((cartao.gastos || []).length === 1 ? ' gasto registrado' : ' gastos registrados');
      textoEl.appendChild(nome);
      textoEl.appendChild(subtitulo);
      textoEl.appendChild(total);
      var seta = document.createElement('span');
      seta.className = 'account-tile-arrow';
      seta.setAttribute('aria-hidden', 'true');
      seta.textContent = '→';
      botao.appendChild(marca);
      botao.appendChild(textoEl);
      botao.appendChild(seta);
      listaEl.appendChild(botao);
    });
  }

  function csvValor(valor) {
    return '"' + String(valor == null ? '' : valor).replace(/"/g, '""') + '"';
  }

  function baixarPlanilha() {
    if (!selecionada) return;
    var cartao = window.BankSanCartoes.obter(selecionada);
    if (!cartao) return;
    var linhas = registros(cartao, carteiraAtual());
    var cabecalho = ['Tipo', 'Data', 'Conta / carteira', 'Descricao', 'Categoria', 'Quantidade', 'Valor unitario (R$)', 'Total (R$)'];
    var conteudo = [cabecalho].concat(linhas.map(function (item) {
      return [item.tipo, item.data, item.origem, item.descricao, item.categoria, item.quantidade, item.unitario, item.total];
    })).map(function (linha) { return linha.map(csvValor).join(';'); }).join('\r\n');
    var blob = new Blob(['\uFEFF' + conteudo], { type: 'text/csv;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = url;
    var nomeArquivo = cartao.nome.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    link.download = 'bank-san-' + nomeArquivo + '.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  listaEl.addEventListener('click', function (evento) {
    var botao = evento.target.closest('[data-account-id]');
    if (!botao) return;
    selecionada = botao.dataset.accountId;
    window.BankSanCartoes.selecionar(selecionada);
    atualizarDetalhe();
    window.BankSanNavegar('conta');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  document.querySelectorAll('[data-account-add]').forEach(function (botao) {
    botao.addEventListener('click', function () { document.getElementById('btnNovoCartao').click(); });
  });
  document.querySelector('[data-account-back]').addEventListener('click', function () {
    window.BankSanNavegar('inicio');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  exportarEl.addEventListener('click', baixarPlanilha);
  document.addEventListener('bs-cartao-alterado', function () {
    desenharContas();
    if (selecionada) atualizarDetalhe();
  });
  document.addEventListener('bs-carteira', function () { atualizarDetalhe(); });

  desenharContas();
})();
