// Bank-San | Comparador de empresas com gráficos reais do TradingView
(function () {
  'use strict';
  var A = window.BankSanAreas;
  if (!A) return;
  var $ = A.$;
  var ativos = (window.BankSanMarketSymbols || []).filter(function (item) {
    return item.ticker !== 'BTCUSD' && item.ticker !== 'USDBRL';
  });

  function opcoes(id) {
    return '<datalist id="' + id + '">' + ativos.map(function (item) {
      return '<option value="' + item.ticker + '" label="' + item.nome + '"></option>';
    }).join('') + '</datalist>';
  }

  A.view('compare', '<article class="card compare-card">' +
    '<header class="card-head"><div><p class="area-eyebrow">ANÁLISE VISUAL</p><h2>Comparador de empresas</h2><p class="chart-name">Pesquise empresas e compare o histórico de preço no mesmo gráfico.</p></div></header>' +
    '<p class="aviso-edu">Gráficos fornecidos pelo TradingView. A disponibilidade e o atraso variam por ativo e mercado. A comparação visual não substitui a análise de fundamentos ou de riscos; confirme a fonte e o horário da cotação no gráfico.</p>' +
    '<div class="ctl compare-controls">' +
      '<label for="cmpAtivoA">Empresa principal<input id="cmpAtivoA" list="cmpListaA" value="PETR4" autocomplete="off" spellcheck="false"></label>' + opcoes('cmpListaA') +
      '<label for="cmpAtivoB">Comparar com<input id="cmpAtivoB" list="cmpListaB" value="VALE3" autocomplete="off" spellcheck="false"></label>' + opcoes('cmpListaB') +
      '<label for="cmpIntervalo">Intervalo inicial<select id="cmpIntervalo"><option value="1">1 minuto</option><option value="15">15 minutos</option><option value="60">1 hora</option><option value="D" selected>1 dia</option><option value="W">1 semana</option><option value="M">1 mês</option></select></label>' +
      '<button class="btn" type="button" id="cmpAplicar">Comparar</button>' +
    '</div>' +
    '<p class="compare-message" id="cmpMensagem" role="status" aria-live="polite"></p>' +
    '<div id="cmpGrafico" class="market-widget market-widget-compare" aria-label="Gráfico comparativo de empresas"></div>' +
    '<p class="nota">A lista inclui ações, FIIs e ETFs brasileiros disponíveis no seletor. Os dados quantitativos demonstrativos do filtro de ativos não são usados neste comparador.</p>' +
  '</article>');

  function ativo(ticker) {
    return ativos.filter(function (item) { return item.ticker === String(ticker || '').trim().toUpperCase(); })[0];
  }

  function comparar() {
    var principal = ativo($('#cmpAtivoA').value);
    var segundo = ativo($('#cmpAtivoB').value);
    var mensagem = $('#cmpMensagem');
    if (!principal || !segundo) {
      mensagem.textContent = 'Escolha dois tickers da lista de sugestões.';
      mensagem.classList.add('is-error');
      return false;
    }
    if (principal.ticker === segundo.ticker) {
      mensagem.textContent = 'Escolha empresas diferentes para comparar.';
      mensagem.classList.add('is-error');
      return false;
    }
    mensagem.classList.remove('is-error');
    mensagem.textContent = principal.nome + ' (' + principal.ticker + ') × ' + segundo.nome + ' (' + segundo.ticker + ')';
    return window.BankSanTradingView.montar($('#cmpGrafico'), principal.simbolo, {
      interval: $('#cmpIntervalo').value,
      comparar: [segundo.simbolo]
    });
  }

  $('#cmpAplicar').addEventListener('click', comparar);
  ['cmpAtivoA', 'cmpAtivoB'].forEach(function (id) {
    $('#' + id).addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); comparar(); }
    });
  });
  document.addEventListener('bs-view-change', function (e) {
    if (e.detail === 'compare' && !$('#cmpGrafico').hasChildNodes()) comparar();
  });
})();
