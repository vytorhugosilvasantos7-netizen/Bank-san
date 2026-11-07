// Bank-San | Widgets oficiais de gráficos do TradingView
(function () {
  'use strict';

  function montar(container, simbolo, opcoes) {
    if (!container || !/^[A-Z0-9._-]+:[A-Z0-9._!-]+$/.test(simbolo)) return false;
    opcoes = opcoes || {};
    container.replaceChildren();

    var widget = document.createElement('div');
    widget.className = 'tradingview-widget-container';
    var area = document.createElement('div');
    area.className = 'tradingview-widget-container__widget';
    widget.appendChild(area);

    var config = {
      autosize: true,
      symbol: simbolo,
      interval: opcoes.interval || 'D',
      timezone: 'America/Sao_Paulo',
      theme: document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark',
      style: '1',
      locale: 'br',
      allow_symbol_change: true,
      calendar: false,
      support_host: 'https://www.tradingview.com',
      withdateranges: true,
      details: true,
      hotlist: false,
      hide_side_toolbar: false,
      save_image: false,
      compareSymbols: (opcoes.comparar || []).map(function (item) {
        return { symbol: item, position: 'SameScale' };
      })
    };

    var script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.async = true;
    script.textContent = JSON.stringify(config);
    script.addEventListener('error', function () {
      widget.replaceChildren();
      var falha = document.createElement('p');
      falha.className = 'tv-widget-error';
      falha.textContent = 'Não foi possível carregar o gráfico. Verifique a conexão e tente novamente.';
      widget.appendChild(falha);
    });
    widget.appendChild(script);

    var credito = document.createElement('div');
    credito.className = 'tradingview-widget-copyright';
    var link = document.createElement('a');
    link.href = 'https://www.tradingview.com/';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = 'Gráficos fornecidos pelo TradingView';
    credito.appendChild(link);
    widget.appendChild(credito);
    container.appendChild(widget);
    return true;
  }

  function montarPanorama(container) {
    if (!container) return false;
    container.replaceChildren();

    var widget = document.createElement('div');
    widget.className = 'tradingview-widget-container';
    var area = document.createElement('div');
    area.className = 'tradingview-widget-container__widget';
    widget.appendChild(area);

    var tema = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    var config = {
      colorTheme: tema,
      dateRange: '1D',
      showChart: true,
      locale: 'br',
      isTransparent: true,
      showSymbolLogo: false,
      showFloatingTooltip: false,
      width: '100%',
      height: window.innerWidth <= 650 ? '1040' : '760',
      tabs: [
        {
          title: 'Brasil',
          symbols: [
            { s: 'BMFBOVESPA:IBOV', d: 'Ibovespa' },
            { s: 'BMFBOVESPA:IFIX', d: 'Índice de FIIs' },
            { s: 'BMFBOVESPA:IBRA', d: 'Índice Brasil Amplo' }
          ]
        },
        {
          title: 'América do Norte',
          symbols: [
            { s: 'SP:SPX', d: 'S&P 500' },
            { s: 'NASDAQ:NDX', d: 'Nasdaq 100' },
            { s: 'DJ:DJI', d: 'Dow Jones' },
            { s: 'RUSSELL:RUT', d: 'Russell 2000' },
            { s: 'TSX:TSX', d: 'S&P/TSX Composite' }
          ]
        },
        {
          title: 'América Latina',
          symbols: [
            { s: 'BMFBOVESPA:IBOV', d: 'Ibovespa · Brasil' },
            { s: 'BCS:IPSA', d: 'IPSA · Chile' }
          ]
        },
        {
          title: 'Europa',
          symbols: [
            { s: 'XETR:DAX', d: 'DAX · Alemanha' },
            { s: 'TVC:UKX', d: 'FTSE 100 · Reino Unido' },
            { s: 'TVC:CAC40', d: 'CAC 40 · França' },
            { s: 'TVC:STOXX50E', d: 'EURO STOXX 50' },
            { s: 'TVC:IBEX35', d: 'IBEX 35 · Espanha' }
          ]
        },
        {
          title: 'Ásia',
          symbols: [
            { s: 'TVC:NI225', d: 'Nikkei 225 · Japão' },
            { s: 'HSI:HSI', d: 'Hang Seng · Hong Kong' },
            { s: 'SSE:000001', d: 'Shanghai Composite · China' },
            { s: 'KRX:KOSPI', d: 'KOSPI · Coreia do Sul' },
            { s: 'NSE:NIFTY', d: 'Nifty 50 · Índia' },
            { s: 'BSE:SENSEX', d: 'Sensex · Índia' }
          ]
        },
        {
          title: 'Pacífico e outros',
          symbols: [
            { s: 'ASX:XJO', d: 'S&P/ASX 200 · Austrália' },
            { s: 'NZX:NZ50G', d: 'S&P/NZX 50 · Nova Zelândia' },
            { s: 'TADAWUL:TASI', d: 'Tadawul All Share · Arábia Saudita' },
            { s: 'BIST:XU100', d: 'BIST 100 · Turquia' },
            { s: 'JSE:J203', d: 'FTSE/JSE Top 40 · África do Sul' }
          ]
        }
      ]
    };

    var script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js';
    script.async = true;
    script.textContent = JSON.stringify(config);
    script.addEventListener('error', function () {
      widget.replaceChildren();
      var falha = document.createElement('p');
      falha.className = 'tv-widget-error';
      falha.textContent = 'Não foi possível carregar o panorama das bolsas. Verifique a conexão e tente novamente.';
      widget.appendChild(falha);
    });
    widget.appendChild(script);

    var credito = document.createElement('div');
    credito.className = 'tradingview-widget-copyright';
    var link = document.createElement('a');
    link.href = 'https://www.tradingview.com/markets/indices/';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = 'Dados dos índices fornecidos pelo TradingView';
    credito.appendChild(link);
    widget.appendChild(credito);
    container.appendChild(widget);
    return true;
  }

  window.BankSanTradingView = { montar: montar, montarPanorama: montarPanorama };
})();
