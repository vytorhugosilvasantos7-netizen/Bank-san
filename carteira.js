// Bank-San | Minha carteira e simulador
(function () {
  'use strict';
  var A = window.BankSanAreas;
  if (!A) return;
  var M = A.M, $ = A.$, brl = A.brl, num = A.num, cor = A.cor, achar = A.achar, AVISO = A.AVISO, view = A.view, opcoes = A.opcoes;

  // ---------- CARTEIRA / SIMULADOR ----------
  var cart = [];
  try { cart = JSON.parse(localStorage.getItem('bs-carteira') || '[]').filter(function (p) { return achar(p.t); }); } catch (e) {}
  A.carteira = cart;   // o calendário lê esta lista
  function salvar() { try { localStorage.setItem('bs-carteira', JSON.stringify(cart)); } catch (e) {} }
  function notificarCarteira() { document.dispatchEvent(new CustomEvent('bs-carteira', { detail: cart.slice() })); }
  var vC = view('carteira', '<article class="card"><header class="card-head"><h2>Minha carteira</h2></header>' + AVISO +
    '<form class="ctl" id="cForm"><select id="cAtivo" aria-label="Ativo para adicionar à carteira">' + opcoes(M.ativos) + '</select><label>Quantidade<input id="cQtd" type="number" min="1" step="1" value="10" required></label>' +
    '<label>Preço médio (R$)<input id="cPm" type="number" min="0.01" step="0.01" required></label><button class="btn" type="submit">Adicionar</button></form>' +
    '<div class="tabela-area"><table class="tabela"><thead><tr><th>Ativo</th><th>Qtd</th><th>Preço médio</th><th>Atual</th><th>Resultado</th><th>Total</th><th></th></tr></thead><tbody id="cCorpo"></tbody></table></div>' +
    '<p class="total-linha">Total na carteira: <strong id="cTotal">R$ 0,00</strong> <span id="cRes"></span></p></article>' +
    '<article class="card"><header class="card-head"><h2>Simulador de juros compostos</h2></header>' +
    '<div class="ctl"><label>Valor inicial (R$)<input id="sIni" type="number" min="0" value="1000"></label><label>Aporte mensal (R$)<input id="sMes" type="number" min="0" value="300"></label>' +
    '<label>Taxa anual (%)<input id="sTaxa" type="number" min="0" step="0.1" value="10"></label><label>Prazo (anos)<input id="sAnos" type="number" min="1" max="50" value="10"></label></div>' +
    '<div class="kpis"><div><small>Valor final</small><strong id="sFinal"></strong></div><div><small>Total investido</small><strong id="sInv"></strong></div><div><small>Juros ganhos</small><strong id="sJuros" class="pos"></strong></div></div>' +
    '<div class="grafico-sim" id="sGraf"></div><p class="nota">Simulação com taxa constante, sem imposto e sem inflação. A taxa é um exemplo: edite.</p></article>');
  function desenharCarteira() {
    var tot = 0, custo = 0;
    $('#cCorpo').innerHTML = cart.map(function (p, i) {
      var a = achar(p.t), v = a.preco * p.q; tot += v; custo += p.pm * p.q;
      var res = (a.preco / p.pm - 1) * 100;
      return '<tr><td><strong>' + a.t + '</strong></td><td>' + p.q + '</td><td>' + brl(p.pm) + '</td><td>' + brl(a.preco) + '</td><td class="' + cor(res) + '">' + num(res) + '%</td><td>' + brl(v) + '</td><td><button class="btn-small" data-rm="' + i + '" aria-label="Remover ' + a.t + ' da carteira">Remover</button></td></tr>';
    }).join('') || '<tr><td colspan="7" class="vazio">Sua carteira está vazia. Adicione um ativo acima.</td></tr>';
    $('#cTotal').textContent = brl(tot);
    var r = custo ? (tot / custo - 1) * 100 : 0;
    $('#cRes').textContent = custo ? '(' + (r >= 0 ? '+' : '') + num(r) + '%)' : ''; $('#cRes').className = cor(r);
  }
  $('#cAtivo').addEventListener('change', function () { $('#cPm').value = achar(this.value).preco; });
  $('#cPm').value = M.ativos[0].preco;
  $('#cForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var t = $('#cAtivo').value, q = Math.floor(Number($('#cQtd').value)), pm = Number($('#cPm').value);
    if (!achar(t) || !(q > 0) || !(pm > 0)) return;
    cart.push({ t: t, q: q, pm: pm }); salvar(); desenharCarteira(); notificarCarteira();
  });
  $('#cCorpo').addEventListener('click', function (e) {
    var i = e.target.getAttribute && e.target.getAttribute('data-rm');
    if (i != null) { cart.splice(Number(i), 1); salvar(); desenharCarteira(); notificarCarteira(); }
  });
  function simular() {
    var ini = Math.max(0, Number($('#sIni').value) || 0), mes = Math.max(0, Number($('#sMes').value) || 0), taxa = Math.max(0, Number($('#sTaxa').value) || 0), anos = Math.min(50, Math.max(1, Math.floor(Number($('#sAnos').value) || 1)));
    var i = Math.pow(1 + taxa / 100, 1 / 12) - 1, saldo = ini, inv = ini, pts = [[ini, ini]];
    for (var m = 1; m <= anos * 12; m++) { saldo = saldo * (1 + i) + mes; inv += mes; if (m % 12 === 0) pts.push([inv, saldo]); }
    $('#sFinal').textContent = brl(saldo); $('#sInv').textContent = brl(inv); $('#sJuros').textContent = brl(saldo - inv);
    var max = Math.max(saldo, 1), W = 600, H = 160, x = function (k) { return (k / anos * W).toFixed(1); }, y = function (v) { return (H - 6 - v / max * (H - 12)).toFixed(1); };
    var l = function (n) { return pts.map(function (p, k) { return x(k) + ',' + y(p[n]); }).join(' '); };
    $('#sGraf').innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" role="img" aria-label="Evolução do patrimônio"><polygon class="sim-area" points="0,' + H + ' ' + l(1) + ' ' + W + ',' + H + '"/><polyline class="sim-inv" points="' + l(0) + '"/><polyline class="sim-total" points="' + l(1) + '"/></svg><div class="legenda"><span><i class="sim-total-i"></i>Total</span><span><i class="sim-inv-i"></i>Investido</span></div>';
  }
  ['sIni', 'sMes', 'sTaxa', 'sAnos'].forEach(function (i) { $('#' + i).addEventListener('input', simular); });
  desenharCarteira(); simular(); notificarCarteira();
})();
