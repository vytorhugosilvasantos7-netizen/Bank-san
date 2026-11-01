// Bank-San | Filtro de ativos
(function () {
  'use strict';
  var A = window.BankSanAreas;
  if (!A) return;
  var M = A.M, $ = A.$, brl = A.brl, num = A.num, cor = A.cor, achar = A.achar, AVISO = A.AVISO, view = A.view, opcoes = A.opcoes;

  // ---------- FILTRO DE ATIVOS ----------
  var vF = view('filtro', '<article class="card"><header class="card-head"><h2>Filtro de ativos</h2></header>' + AVISO +
    '<div class="ctl"><label class="sr-only" for="fBusca">Buscar ativo por ticker ou nome</label><input id="fBusca" type="search" placeholder="Buscar ticker ou nome"><label class="sr-only" for="fTipo">Tipo de ativo</label><select id="fTipo"><option value="">Todos os tipos</option><option>Ação</option><option>FII</option><option>ETF</option></select>' +
    '<label>DY mín. (%)<input id="fDy" type="number" min="0" step="0.5" value="0"></label><label>P/L máx.<input id="fPl" type="number" min="0" step="1" placeholder="sem limite"></label></div>' +
    '<div class="tabela-area"><table class="tabela"><thead><tr><th>Ativo</th><th>Tipo</th><th>Preço</th><th>Dia</th><th>DY</th><th>P/L</th><th>P/VP</th></tr></thead><tbody id="fCorpo"></tbody></table></div><p class="nota" id="fQtd"></p></article>');
  function filtrar() {
    var b = $('#fBusca').value.trim().toLowerCase(), tp = $('#fTipo').value, dy = Number($('#fDy').value) || 0, pl = Number($('#fPl').value) || Infinity;
    var r = M.ativos.filter(function (a) {
      return (!b || (a.t + ' ' + a.nome).toLowerCase().indexOf(b) !== -1) && (!tp || a.tipo === tp) && a.dy >= dy && (a.pl == null || a.pl <= pl);
    });
    $('#fCorpo').innerHTML = r.map(function (a) {
      return '<tr><td><strong>' + a.t + '</strong> <small>' + a.nome + '</small></td><td>' + a.tipo + '</td><td>' + brl(a.preco) + '</td><td class="' + cor(a.dia) + '">' + num(a.dia) + '%</td><td>' + num(a.dy) + '%</td><td>' + num(a.pl, 1) + '</td><td>' + num(a.pvp) + '</td></tr>';
    }).join('') || '<tr><td colspan="7" class="vazio">Nenhum ativo com esses filtros.</td></tr>';
    $('#fQtd').textContent = r.length + ' de ' + M.ativos.length + ' ativos';
  }
  ['fBusca', 'fTipo', 'fDy', 'fPl'].forEach(function (i) {
    $('#' + i).addEventListener('input', filtrar);
    $('#' + i).addEventListener('change', filtrar);
  });
  filtrar();
})();
