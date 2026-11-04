// Bank-San | Calendário de proventos
(function () {
  'use strict';
  var A = window.BankSanAreas;
  if (!A) return;
  var $ = A.$;
  var mes = new Date();
  mes.setDate(1);

  A.view('calendar',
    '<article class="card dividend-calendar">' +
      '<header class="card-head"><div><p class="area-eyebrow">AGENDA DO INVESTIDOR</p><h2>Calendário de proventos</h2><p class="chart-name">Consulte o mês e acompanhe suas posições sem registrar eventos manualmente.</p></div>' +
      '<div class="nav-mes"><button class="btn-small" id="mAnt" type="button" aria-label="Mês anterior">←</button><strong id="mNome"></strong><button class="btn-small" id="mProx" type="button" aria-label="Próximo mês">→</button></div></header>' +
      '<div class="calendar-data-note"><strong>Agenda oficial ainda não conectada.</strong><p>Os widgets do TradingView exibem gráficos e cotações, mas não fornecem a agenda de datas-com e pagamentos de proventos para este calendário. Para não exibir datas ou valores inventados, os eventos aparecerão aqui quando uma fonte oficial de proventos for integrada.</p></div>' +
      '<div class="calendar-layout"><section class="calendar-month" aria-label="Calendário mensal"><div class="calendar-weekdays" aria-hidden="true"><span>Dom</span><span>Seg</span><span>Ter</span><span>Qua</span><span>Qui</span><span>Sex</span><span>Sáb</span></div><div id="calendarDays" class="calendar-days"></div></section>' +
      '<aside class="calendar-agenda"><h3>Proventos do mês</h3><p class="calendar-empty" id="calendarEmpty">Nenhuma data oficial disponível para este período.</p><h3>Minha carteira</h3><p class="calendar-portfolio-note" id="calendarPortfolio">Nenhum ativo na carteira manual.</p><button class="btn-small" type="button" id="calendarPortfolioLink">Ver minha carteira</button></aside></div>' +
      '<p class="nota">Datas de pagamento e valores podem mudar conforme o comunicado oficial de cada emissor. Consulte também as relações com investidores antes de tomar decisões.</p>' +
    '</article>'
  );

  function desenhar() {
    var nomeMes = mes.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    $('#mNome').textContent = nomeMes.charAt(0).toLocaleUpperCase('pt-BR') + nomeMes.slice(1);
    var grade = $('#calendarDays');
    grade.replaceChildren();
    var primeiroDia = mes.getDay();
    var diasNoMes = new Date(mes.getFullYear(), mes.getMonth() + 1, 0).getDate();
    var hoje = new Date();
    for (var vazio = 0; vazio < primeiroDia; vazio++) {
      var espaco = document.createElement('span');
      espaco.className = 'calendar-day is-empty';
      espaco.setAttribute('aria-hidden', 'true');
      grade.appendChild(espaco);
    }
    for (var dia = 1; dia <= diasNoMes; dia++) {
      var celula = document.createElement('span');
      celula.className = 'calendar-day' +
        (hoje.getFullYear() === mes.getFullYear() && hoje.getMonth() === mes.getMonth() && hoje.getDate() === dia ? ' is-today' : '');
      celula.textContent = String(dia);
      grade.appendChild(celula);
    }
    var posicoes = A.carteira || [];
    var notaCarteira = $('#calendarPortfolio');
    notaCarteira.textContent = posicoes.length
      ? posicoes.length + (posicoes.length === 1 ? ' ativo cadastrado manualmente.' : ' ativos cadastrados manualmente.') + ' A agenda de pagamentos ainda não está disponível.'
      : 'Nenhum ativo na carteira manual.';
  }

  $('#mAnt').addEventListener('click', function () {
    mes.setMonth(mes.getMonth() - 1);
    desenhar();
  });
  $('#mProx').addEventListener('click', function () {
    mes.setMonth(mes.getMonth() + 1);
    desenhar();
  });
  $('#calendarPortfolioLink').addEventListener('click', function () {
    if (window.BankSanNavegar) window.BankSanNavegar('carteira');
  });
  document.addEventListener('bs-carteira', desenhar);
  desenhar();
})();
