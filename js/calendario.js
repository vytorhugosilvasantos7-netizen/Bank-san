// Bank-San | Calendário de proventos
(function () {
  'use strict';
  var A = window.BankSanAreas;
  if (!A) return;
  var M = A.M, $ = A.$, brl = A.brl, num = A.num, cor = A.cor, achar = A.achar, AVISO = A.AVISO, view = A.view, opcoes = A.opcoes;

  // ---------- CALENDÁRIO DE PROVENTOS ----------
  var cart = A.carteira || [];
  var mes = new Date(); mes.setDate(1);
  view('calendar', '<article class="card"><header class="card-head"><h2>Calendário de proventos</h2><div class="nav-mes"><button class="btn-small" id="mAnt" type="button">&lt;</button><strong id="mNome"></strong><button class="btn-small" id="mProx" type="button">&gt;</button></div></header>' + AVISO +
    '<label class="chk"><input type="checkbox" id="mMeus"> Só os ativos da minha carteira</label><ul class="expenses" id="mLista"></ul><p class="total-linha">Estimado no mês (carteira): <strong id="mTotal">R$ 0,00</strong></p></article>');
  function eventos(ano, m) {
    var ev = [];
    M.ativos.forEach(function (a) {
      if (!a.dy) return;
      var fii = a.tipo === 'FII', h = a.t.charCodeAt(1) % 20 + 5;
      if (!fii && (m % 3) !== (a.t.charCodeAt(0) % 3)) return;
      ev.push({ a: a, dia: h, valor: a.preco * a.dy / 100 / (fii ? 12 : 4), tipo: fii ? 'Rendimento' : 'Dividendo' });
    });
    return ev.sort(function (x, y) { return x.dia - y.dia; });
  }
  function calendario() {
    $('#mNome').textContent = mes.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    var meus = $('#mMeus').checked, tot = 0;
    var ev = eventos(mes.getFullYear(), mes.getMonth()).filter(function (e) { return !meus || cart.some(function (p) { return p.t === e.a.t; }); });
    $('#mLista').innerHTML = ev.map(function (e) {
      var p = cart.filter(function (x) { return x.t === e.a.t; })[0], q = p ? p.q : 0; tot += e.valor * q;
      return '<li class="expense"><span class="expense-info"><strong>Dia ' + e.dia + ' - ' + e.a.t + '</strong><small>' + e.tipo + (q ? ', ' + q + ' cotas/ações' : '') + '</small></span><span class="expense-value">' + brl(e.valor) + ' / unid.</span></li>';
    }).join('') || '<li class="expenses-vazio">Nenhum provento previsto neste mês.</li>';
    $('#mTotal').textContent = brl(tot);
  }
  $('#mAnt').addEventListener('click', function () { mes.setMonth(mes.getMonth() - 1); calendario(); });
  $('#mProx').addEventListener('click', function () { mes.setMonth(mes.getMonth() + 1); calendario(); });
  $('#mMeus').addEventListener('change', calendario);
  document.addEventListener('bs-carteira', calendario);
  calendario();
})();
