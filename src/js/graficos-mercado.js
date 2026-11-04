// Bank-San | Gráficos interativos do mercado
(function () {
  'use strict';

  var A = window.BankSanAreas;
  if (!A) return;
  var $ = A.$;
  var ativos = [
    { ticker: 'IBOV', nome: 'Ibovespa', simbolo: 'BMFBOVESPA:IBOV', tipo: 'índice' },
    { ticker: 'PETR4', nome: 'Petrobras PN', simbolo: 'BMFBOVESPA:PETR4' },
    { ticker: 'PETR3', nome: 'Petrobras ON', simbolo: 'BMFBOVESPA:PETR3' },
    { ticker: 'VALE3', nome: 'Vale ON', simbolo: 'BMFBOVESPA:VALE3' },
    { ticker: 'ITUB4', nome: 'Itaú Unibanco PN', simbolo: 'BMFBOVESPA:ITUB4' },
    { ticker: 'ITSA4', nome: 'Itaúsa PN', simbolo: 'BMFBOVESPA:ITSA4' },
    { ticker: 'BBDC4', nome: 'Bradesco PN', simbolo: 'BMFBOVESPA:BBDC4' },
    { ticker: 'BBDC3', nome: 'Bradesco ON', simbolo: 'BMFBOVESPA:BBDC3' },
    { ticker: 'BPAC11', nome: 'BTG Pactual units', simbolo: 'BMFBOVESPA:BPAC11' },
    { ticker: 'SANB11', nome: 'Santander Brasil units', simbolo: 'BMFBOVESPA:SANB11' },
    { ticker: 'BBAS3', nome: 'Banco do Brasil ON', simbolo: 'BMFBOVESPA:BBAS3' },
    { ticker: 'BBSE3', nome: 'BB Seguridade ON', simbolo: 'BMFBOVESPA:BBSE3' },
    { ticker: 'ABEV3', nome: 'Ambev ON', simbolo: 'BMFBOVESPA:ABEV3' },
    { ticker: 'WEGE3', nome: 'WEG ON', simbolo: 'BMFBOVESPA:WEGE3' },
    { ticker: 'B3SA3', nome: 'B3 ON', simbolo: 'BMFBOVESPA:B3SA3' },
    { ticker: 'ELET3', nome: 'Eletrobras ON', simbolo: 'BMFBOVESPA:ELET3' },
    { ticker: 'ELET6', nome: 'Eletrobras PNB', simbolo: 'BMFBOVESPA:ELET6' },
    { ticker: 'EGIE3', nome: 'Engie Brasil ON', simbolo: 'BMFBOVESPA:EGIE3' },
    { ticker: 'ENEV3', nome: 'Eneva ON', simbolo: 'BMFBOVESPA:ENEV3' },
    { ticker: 'ENGI11', nome: 'Energisa units', simbolo: 'BMFBOVESPA:ENGI11' },
    { ticker: 'CPFE3', nome: 'CPFL Energia ON', simbolo: 'BMFBOVESPA:CPFE3' },
    { ticker: 'AURE3', nome: 'Auren Energia ON', simbolo: 'BMFBOVESPA:AURE3' },
    { ticker: 'TAEE11', nome: 'Taesa units', simbolo: 'BMFBOVESPA:TAEE11' },
    { ticker: 'PRIO3', nome: 'PRIO ON', simbolo: 'BMFBOVESPA:PRIO3' },
    { ticker: 'BRAV3', nome: 'Brava Energia ON', simbolo: 'BMFBOVESPA:BRAV3' },
    { ticker: 'RENT3', nome: 'Localiza ON', simbolo: 'BMFBOVESPA:RENT3' },
    { ticker: 'ASAI3', nome: 'Assaí ON', simbolo: 'BMFBOVESPA:ASAI3' },
    { ticker: 'MGLU3', nome: 'Magazine Luiza ON', simbolo: 'BMFBOVESPA:MGLU3' },
    { ticker: 'COGN3', nome: 'Cogna ON', simbolo: 'BMFBOVESPA:COGN3' },
    { ticker: 'YDUQ3', nome: 'Yduqs ON', simbolo: 'BMFBOVESPA:YDUQ3' },
    { ticker: 'SUZB3', nome: 'Suzano ON', simbolo: 'BMFBOVESPA:SUZB3' },
    { ticker: 'GGBR4', nome: 'Gerdau PN', simbolo: 'BMFBOVESPA:GGBR4' },
    { ticker: 'BRAP4', nome: 'Bradespar PN', simbolo: 'BMFBOVESPA:BRAP4' },
    { ticker: 'CMIN3', nome: 'CSN Mineração ON', simbolo: 'BMFBOVESPA:CMIN3' },
    { ticker: 'CSNA3', nome: 'CSN ON', simbolo: 'BMFBOVESPA:CSNA3' },
    { ticker: 'USIM5', nome: 'Usiminas PNA', simbolo: 'BMFBOVESPA:USIM5' },
    { ticker: 'KLBN11', nome: 'Klabin units', simbolo: 'BMFBOVESPA:KLBN11' },
    { ticker: 'RAIL3', nome: 'Rumo ON', simbolo: 'BMFBOVESPA:RAIL3' },
    { ticker: 'JBSS3', nome: 'JBS ON', simbolo: 'BMFBOVESPA:JBSS3' },
    { ticker: 'BRFS3', nome: 'BRF ON', simbolo: 'BMFBOVESPA:BRFS3' },
    { ticker: 'BEEF3', nome: 'Minerva ON', simbolo: 'BMFBOVESPA:BEEF3' },
    { ticker: 'MRFG3', nome: 'Marfrig ON', simbolo: 'BMFBOVESPA:MRFG3' },
    { ticker: 'RADL3', nome: 'Raia Drogasil ON', simbolo: 'BMFBOVESPA:RADL3' },
    { ticker: 'FLRY3', nome: 'Fleury ON', simbolo: 'BMFBOVESPA:FLRY3' },
    { ticker: 'HYPE3', nome: 'Hypera ON', simbolo: 'BMFBOVESPA:HYPE3' },
    { ticker: 'HAPV3', nome: 'Hapvida ON', simbolo: 'BMFBOVESPA:HAPV3' },
    { ticker: 'VIVT3', nome: 'Telefônica Brasil ON', simbolo: 'BMFBOVESPA:VIVT3' },
    { ticker: 'TIMS3', nome: 'TIM ON', simbolo: 'BMFBOVESPA:TIMS3' },
    { ticker: 'LREN3', nome: 'Lojas Renner ON', simbolo: 'BMFBOVESPA:LREN3' },
    { ticker: 'ALOS3', nome: 'Allos ON', simbolo: 'BMFBOVESPA:ALOS3' },
    { ticker: 'AZZA3', nome: 'Azzas 2154 ON', simbolo: 'BMFBOVESPA:AZZA3' },
    { ticker: 'VIVA3', nome: 'Vivara ON', simbolo: 'BMFBOVESPA:VIVA3' },
    { ticker: 'POMO4', nome: 'Marcopolo PN', simbolo: 'BMFBOVESPA:POMO4' },
    { ticker: 'DIRR3', nome: 'Direcional ON', simbolo: 'BMFBOVESPA:DIRR3' },
    { ticker: 'MRVE3', nome: 'MRV ON', simbolo: 'BMFBOVESPA:MRVE3' },
    { ticker: 'CYRE3', nome: 'Cyrela ON', simbolo: 'BMFBOVESPA:CYRE3' },
    { ticker: 'EQTL3', nome: 'Equatorial ON', simbolo: 'BMFBOVESPA:EQTL3' },
    { ticker: 'CMIG4', nome: 'Cemig PN', simbolo: 'BMFBOVESPA:CMIG4' },
    { ticker: 'CPLE6', nome: 'Copel PNB', simbolo: 'BMFBOVESPA:CPLE6' },
    { ticker: 'UGPA3', nome: 'Ultrapar ON', simbolo: 'BMFBOVESPA:UGPA3' },
    { ticker: 'VBBR3', nome: 'Vibra Energia ON', simbolo: 'BMFBOVESPA:VBBR3' },
    { ticker: 'SBSP3', nome: 'Sabesp ON', simbolo: 'BMFBOVESPA:SBSP3' },
    { ticker: 'PSSA3', nome: 'Porto Seguro ON', simbolo: 'BMFBOVESPA:PSSA3' },
    { ticker: 'CXSE3', nome: 'Caixa Seguridade ON', simbolo: 'BMFBOVESPA:CXSE3' },
    { ticker: 'SMTO3', nome: 'São Martinho ON', simbolo: 'BMFBOVESPA:SMTO3' },
    { ticker: 'RAIZ4', nome: 'Raízen PN', simbolo: 'BMFBOVESPA:RAIZ4' },
    { ticker: 'RDOR3', nome: "Rede D'Or ON", simbolo: 'BMFBOVESPA:RDOR3' },
    { ticker: 'TOTS3', nome: 'Totvs ON', simbolo: 'BMFBOVESPA:TOTS3' },
    { ticker: 'LWSA3', nome: 'Locaweb ON', simbolo: 'BMFBOVESPA:LWSA3' },
    { ticker: 'CVCB3', nome: 'CVC Brasil ON', simbolo: 'BMFBOVESPA:CVCB3' },
    { ticker: 'IGTI11', nome: 'Iguatemi units', simbolo: 'BMFBOVESPA:IGTI11' },
    { ticker: 'MULT3', nome: 'Multiplan ON', simbolo: 'BMFBOVESPA:MULT3' },
    { ticker: 'CSAN3', nome: 'Cosan ON', simbolo: 'BMFBOVESPA:CSAN3' },
    { ticker: 'BPAN4', nome: 'Banco Pan PN', simbolo: 'BMFBOVESPA:BPAN4' },
    { ticker: 'BLAU3', nome: 'Blau Farmacêutica ON', simbolo: 'BMFBOVESPA:BLAU3' },
    { ticker: 'STBP3', nome: 'Santos Brasil ON', simbolo: 'BMFBOVESPA:STBP3' },
    { ticker: 'VAMO3', nome: 'Vamos ON', simbolo: 'BMFBOVESPA:VAMO3' },
    { ticker: 'KNRI11', nome: 'Kinea Renda Imobiliária FII', simbolo: 'BMFBOVESPA:KNRI11' },
    { ticker: 'HGLG11', nome: 'CSHG Logística FII', simbolo: 'BMFBOVESPA:HGLG11' },
    { ticker: 'MXRF11', nome: 'Maxi Renda FII', simbolo: 'BMFBOVESPA:MXRF11' },
    { ticker: 'XPLG11', nome: 'XP Log FII', simbolo: 'BMFBOVESPA:XPLG11' },
    { ticker: 'VISC11', nome: 'Vinci Shopping Centers FII', simbolo: 'BMFBOVESPA:VISC11' },
    { ticker: 'HGRU11', nome: 'CSHG Renda Urbana FII', simbolo: 'BMFBOVESPA:HGRU11' },
    { ticker: 'CPTS11', nome: 'Capitania Securities II FII', simbolo: 'BMFBOVESPA:CPTS11' },
    { ticker: 'GGRC11', nome: 'GGR Covepi Renda FII', simbolo: 'BMFBOVESPA:GGRC11' },
    { ticker: 'TRXF11', nome: 'TRX Real Estate FII', simbolo: 'BMFBOVESPA:TRXF11' },
    { ticker: 'KNCR11', nome: 'Kinea Rendimentos Imobiliários FII', simbolo: 'BMFBOVESPA:KNCR11' },
    { ticker: 'HSML11', nome: 'HSI Malls FII', simbolo: 'BMFBOVESPA:HSML11' },
    { ticker: 'BOVA11', nome: 'iShares Ibovespa ETF', simbolo: 'BMFBOVESPA:BOVA11' },
    { ticker: 'IVVB11', nome: 'iShares S&P 500 ETF', simbolo: 'BMFBOVESPA:IVVB11' },
    { ticker: 'SMAL11', nome: 'iShares Small Cap ETF', simbolo: 'BMFBOVESPA:SMAL11' },
    { ticker: 'DIVO11', nome: 'It Now IDIV ETF', simbolo: 'BMFBOVESPA:DIVO11' },
    { ticker: 'GOLD11', nome: 'Trend Ouro ETF', simbolo: 'BMFBOVESPA:GOLD11' },
    { ticker: 'HASH11', nome: 'Hashdex Nasdaq Crypto ETF', simbolo: 'BMFBOVESPA:HASH11' },
    { ticker: 'SPXI11', nome: 'It Now S&P 500 TRN ETF', simbolo: 'BMFBOVESPA:SPXI11' },
    { ticker: 'AAPL', nome: 'Apple', simbolo: 'NASDAQ:AAPL', mercado: 'EUA' },
    { ticker: 'MSFT', nome: 'Microsoft', simbolo: 'NASDAQ:MSFT', mercado: 'EUA' },
    { ticker: 'NVDA', nome: 'NVIDIA', simbolo: 'NASDAQ:NVDA', mercado: 'EUA' },
    { ticker: 'AMZN', nome: 'Amazon', simbolo: 'NASDAQ:AMZN', mercado: 'EUA' },
    { ticker: 'GOOGL', nome: 'Alphabet (Google)', simbolo: 'NASDAQ:GOOGL', mercado: 'EUA' },
    { ticker: 'META', nome: 'Meta Platforms', simbolo: 'NASDAQ:META', mercado: 'EUA' },
    { ticker: 'TSLA', nome: 'Tesla', simbolo: 'NASDAQ:TSLA', mercado: 'EUA' },
    { ticker: 'AMD', nome: 'Advanced Micro Devices', simbolo: 'NASDAQ:AMD', mercado: 'EUA' },
    { ticker: 'NFLX', nome: 'Netflix', simbolo: 'NASDAQ:NFLX', mercado: 'EUA' },
    { ticker: 'AVGO', nome: 'Broadcom', simbolo: 'NASDAQ:AVGO', mercado: 'EUA' },
    { ticker: 'COST', nome: 'Costco', simbolo: 'NASDAQ:COST', mercado: 'EUA' },
    { ticker: 'ADBE', nome: 'Adobe', simbolo: 'NASDAQ:ADBE', mercado: 'EUA' },
    { ticker: 'PEP', nome: 'PepsiCo', simbolo: 'NASDAQ:PEP', mercado: 'EUA' },
    { ticker: 'CSCO', nome: 'Cisco', simbolo: 'NASDAQ:CSCO', mercado: 'EUA' },
    { ticker: 'INTC', nome: 'Intel', simbolo: 'NASDAQ:INTC', mercado: 'EUA' },
    { ticker: 'ORCL', nome: 'Oracle', simbolo: 'NYSE:ORCL', mercado: 'EUA' },
    { ticker: 'KO', nome: 'Coca-Cola', simbolo: 'NYSE:KO', mercado: 'EUA' },
    { ticker: 'WMT', nome: 'Walmart', simbolo: 'NYSE:WMT', mercado: 'EUA' },
    { ticker: 'JPM', nome: 'JPMorgan Chase', simbolo: 'NYSE:JPM', mercado: 'EUA' },
    { ticker: 'DIS', nome: 'Walt Disney', simbolo: 'NYSE:DIS', mercado: 'EUA' },
    { ticker: 'SPX', nome: 'S&P 500', simbolo: 'SP:SPX', tipo: 'índice', mercado: 'EUA' },
    { ticker: 'NDX', nome: 'Nasdaq 100', simbolo: 'NASDAQ:NDX', tipo: 'índice', mercado: 'EUA' },
    { ticker: 'DJI', nome: 'Dow Jones Industrial Average', simbolo: 'DJ:DJI', tipo: 'índice', mercado: 'EUA' },
    { ticker: 'BTCUSD', nome: 'Bitcoin / Dólar', simbolo: 'COINBASE:BTCUSD' },
    { ticker: 'USDBRL', nome: 'Dólar / Real', simbolo: 'FX_IDC:USDBRL' }
  ];

  function ativo(ticker) {
    var termo = String(ticker || '').trim();
    var upper = termo.toUpperCase();
    var exato = ativos.filter(function (item) { return item.ticker === upper; })[0];
    if (exato) return exato;
    var normalizado = termo.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    var encontrados = ativos.filter(function (item) {
      return item.nome.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase() === normalizado;
    });
    return encontrados.length === 1 ? encontrados[0] : null;
  }
  window.BankSanMarketSymbols = ativos.slice();

  function listaAtivos(id) {
    return '<datalist id="' + id + '">' + ativos.map(function (item) {
      return '<option value="' + item.ticker + '" label="' + item.nome + '"></option>';
    }).join('') + '</datalist>';
  }

  var html = '<article class="card market-chart-card">' +
    '<header class="card-head"><div><p class="area-eyebrow">MERCADO</p><h2>Gráficos do mercado</h2><p class="chart-name">Explore ' + ativos.length + ' opções: ações do Brasil e dos EUA, FIIs, ETFs, índices, Bitcoin e câmbio.</p></div></header>' +
    '<p class="aviso-edu">Gráficos interativos fornecidos pelo TradingView. A disponibilidade e o atraso das cotações dependem do mercado e da bolsa; confirme o horário e a fonte no próprio gráfico. Conteúdo informativo, não é recomendação de investimento.</p>' +
    '<div class="ctl market-chart-controls"><label for="marketTicker">Digite o ticker ou o nome completo da empresa<input id="marketTicker" list="marketSymbols" value="IBOV" autocomplete="off" spellcheck="false"></label><label for="marketInterval">Intervalo inicial<select id="marketInterval"><option value="1">1 minuto</option><option value="15">15 minutos</option><option value="60">1 hora</option><option value="D" selected>1 dia</option><option value="W">1 semana</option><option value="M">1 mês</option></select></label><button class="btn" type="button" id="marketApply">Abrir gráfico</button>' + listaAtivos('marketSymbols') + '</div>' +
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
