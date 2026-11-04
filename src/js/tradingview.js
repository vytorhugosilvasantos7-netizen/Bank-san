// Bank-San | Widgets oficiais de gráficos do TradingView
(function () {
  'use strict';

  function montar(container, simbolo, opcoes) {
    if (!container || !/^[A-Z0-9._:-]+$/.test(simbolo)) return false;
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
      allow_symbol_change: false,
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

  window.BankSanTradingView = { montar: montar };
})();
