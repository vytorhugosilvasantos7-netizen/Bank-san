// Bank-San | Gráficos interativos do mercado
(function () {
  'use strict';

  var A = window.BankSanAreas;
  if (!A) return;
  var $ = A.$;
  var ativos = [
    { ticker: 'IBOV', nome: 'Ibovespa', simbolo: 'BMFBOVESPA:IBOV' },
    { ticker: 'PETR4', nome: 'Petrobras PN', simbolo: 'BMFBOVESPA:PETR4' },
    { ticker: 'VALE3', nome: 'Vale ON', simbolo: 'BMFBOVESPA:VALE3' },
    { ticker: 'ITUB4', nome: 'Itaú Unibanco PN', simbolo: 'BMFBOVESPA:ITUB4' },
    { ticker: 'BBDC4', nome: 'Bradesco PN', simbolo: 'BMFBOVESPA:BBDC4' },
    { ticker: 'BBAS3', nome: 'Banco do Brasil ON', simbolo: 'BMFBOVESPA:BBAS3' },
    { ticker: 'ABEV3', nome: 'Ambev ON', simbolo: 'BMFBOVESPA:ABEV3' },
    { ticker: 'WEGE3', nome: 'WEG ON', simbolo: 'BMFBOVESPA:WEGE3' },
    { ticker: 'B3SA3', nome: 'B3 ON', simbolo: 'BMFBOVESPA:B3SA3' },
    { ticker: 'ELET3', nome: 'Eletrobras ON', simbolo: 'BMFBOVESPA:ELET3' },
    { ticker: 'PRIO3', nome: 'PRIO ON', simbolo: 'BMFBOVESPA:PRIO3' },
    { ticker: 'RENT3', nome: 'Localiza ON', simbolo: 'BMFBOVESPA:RENT3' },
    { ticker: 'MGLU3', nome: 'Magazine Luiza ON', simbolo: 'BMFBOVESPA:MGLU3' },
    { ticker: 'SUZB3', nome: 'Suzano ON', simbolo: 'BMFBOVESPA:SUZB3' },
    { ticker: 'GGBR4', nome: 'Gerdau PN', simbolo: 'BMFBOVESPA:GGBR4' },
    { ticker: 'RAIL3', nome: 'Rumo ON', simbolo: 'BMFBOVESPA:RAIL3' },
    { ticker: 'RADL3', nome: 'Raia Drogasil ON', simbolo: 'BMFBOVESPA:RADL3' },
    { ticker: 'VIVT3', nome: 'Telefônica Brasil ON', simbolo: 'BMFBOVESPA:VIVT3' },
    { ticker: 'LREN3', nome: 'Lojas Renner ON', simbolo: 'BMFBOVESPA:LREN3' },
    { ticker: 'EQTL3', nome: 'Equatorial ON', simbolo: 'BMFBOVESPA:EQTL3' },
    { ticker: 'CMIG4', nome: 'Cemig PN', simbolo: 'BMFBOVESPA:CMIG4' },
    { ticker: 'CPLE6', nome: 'Copel PNB', simbolo: 'BMFBOVESPA:CPLE6' },
    { ticker: 'JBSS3', nome: 'JBS ON', simbolo: 'BMFBOVESPA:JBSS3' },
    { ticker: 'RDOR3', nome: "Rede D'Or ON", simbolo: 'BMFBOVESPA:RDOR3' },
    { ticker: 'TOTS3', nome: 'Totvs ON', simbolo: 'BMFBOVESPA:TOTS3' },
    { ticker: 'CYRE3', nome: 'Cyrela ON', simbolo: 'BMFBOVESPA:CYRE3' },
    { ticker: 'CSAN3', nome: 'Cosan ON', simbolo: 'BMFBOVESPA:CSAN3' },
    { ticker: 'MULT3', nome: 'Multiplan ON', simbolo: 'BMFBOVESPA:MULT3' },
    { ticker: 'HGLG11', nome: 'CSHG Logística FII', simbolo: 'BMFBOVESPA:HGLG11' },
    { ticker: 'MXRF11', nome: 'Maxi Renda FII', simbolo: 'BMFBOVESPA:MXRF11' },
    { ticker: 'BOVA11', nome: 'iShares Ibovespa ETF', simbolo: 'BMFBOVESPA:BOVA11' },
    { ticker: 'IVVB11', nome: 'iShares S&P 500 ETF', simbolo: 'BMFBOVESPA:IVVB11' },
    { ticker: 'BTCUSD', nome: 'Bitcoin / Dólar', simbolo: 'COINBASE:BTCUSD' },
    { ticker: 'USDBRL', nome: 'Dólar / Real', simbolo: 'FX_IDC:USDBRL' }
  ];

  function ativo(ticker) {
    return ativos.filter(function (item) { return item.ticker === String(ticker || '').trim().toUpperCase(); })[0];
  }
  window.BankSanMarketSymbols = ativos.slice();

  function listaAtivos(id) {
    return '<datalist id="' + id + '">' + ativos.map(function (item) {
      return '<option value="' + item.ticker + '" label="' + item.nome + '"></option>';
    }).join('') + '</datalist>';
  }

  var html = '<article class="card market-chart-card">' +
    '<header class="card-head"><div><p class="area-eyebrow">MERCADO</p><h2>Gráficos do mercado</h2><p class="chart-name">Acompanhe índices, ações, FIIs, ETFs, Bitcoin e câmbio.</p></div></header>' +
    '<p class="aviso-edu">Gráficos interativos fornecidos pelo TradingView. A disponibilidade e o atraso das cotações dependem do mercado e da bolsa; confirme o horário e a fonte no próprio gráfico. Conteúdo informativo, não é recomendação de investimento.</p>' +
    '<div class="ctl market-chart-controls"><label for="marketTicker">Buscar ativo pelo ticker ou nome<input id="marketTicker" list="marketSymbols" value="IBOV" autocomplete="off" spellcheck="false"></label><label for="marketInterval">Intervalo inicial<select id="marketInterval"><option value="1">1 minuto</option><option value="15">15 minutos</option><option value="60">1 hora</option><option value="D" selected>1 dia</option><option value="W">1 semana</option><option value="M">1 mês</option></select></label><button class="btn" type="button" id="marketApply">Abrir gráfico</button>' + listaAtivos('marketSymbols') + '</div>' +
    '<p class="market-symbol-name" id="marketSymbolName" aria-live="polite">Ibovespa · BMFBOVESPA:IBOV</p>' +
    '<div id="marketChart" class="market-widget market-widget-main" aria-label="Gráfico interativo do ativo selecionado"></div>' +
    '</article>';

  A.view('market-charts', html);

  function abrirGrafico() {
    var escolhido = ativo($('#marketTicker').value);
    if (!escolhido) {
      $('#marketTicker').setAttribute('aria-invalid', 'true');
      $('#marketSymbolName').textContent = 'Escolha um ativo da lista de sugestões para abrir o gráfico.';
      return;
    }
    $('#marketTicker').removeAttribute('aria-invalid');
    $('#marketTicker').value = escolhido.ticker;
    $('#marketSymbolName').textContent = escolhido.nome + ' · ' + escolhido.simbolo;
    window.BankSanTradingView.montar($('#marketChart'), escolhido.simbolo, { interval: $('#marketInterval').value });
  }

  $('#marketApply').addEventListener('click', abrirGrafico);
  $('#marketTicker').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') { e.preventDefault(); abrirGrafico(); }
  });
  document.addEventListener('bs-view-change', function (e) {
    if (e.detail === 'market-charts' && !$('#marketChart').hasChildNodes()) abrirGrafico();
  });
})();
