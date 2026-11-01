// Bank-San | Comparador de empresas
(function () {
  'use strict';
  var A = window.BankSanAreas;
  if (!A) return;
  var M = A.M, $ = A.$, brl = A.brl, num = A.num, cor = A.cor, achar = A.achar, AVISO = A.AVISO, view = A.view, opcoes = A.opcoes;

  // ---------- COMPARADOR DE EMPRESAS ----------
  var acoes = M.ativos.filter(function (a) { return a.tipo === 'Ação'; });
  view('compare', '<article class="card"><header class="card-head"><h2>Comparador de empresas</h2></header>' + AVISO +
    '<div class="ctl">' + [0, 1, 2].map(function (i) { return '<select class="cmp" data-i="' + i + '" aria-label="Empresa ' + (i + 1) + '">' + (i === 2 ? '<option value="">(nenhuma)</option>' : '') + opcoes(acoes) + '</select>'; }).join('') + '</div>' +
    '<div class="tabela-area"><table class="tabela" id="cmpTab"></table></div><p class="nota">Verde = melhor valor da linha. Em P/L e P/VP, menor é melhor; nos outros, maior é melhor. Um indicador sozinho não diz se vale a pena.</p></article>');
  var CAMPOS = [['preco', 'Preço', 0, 'brl'], ['dy', 'Dividend yield (%)', 1], ['pl', 'P/L', -1], ['pvp', 'P/VP', -1], ['roe', 'ROE (%)', 1]];
  function comparar() {
    var sel = Array.prototype.map.call(document.querySelectorAll('.cmp'), function (s) { return achar(s.value); }).filter(Boolean);
    var h = '<thead><tr><th></th>' + sel.map(function (a) { return '<th>' + a.t + '<br><small>' + a.nome + '</small></th>'; }).join('') + '</tr></thead><tbody>';
    CAMPOS.forEach(function (c) {
      var vals = sel.map(function (a) { return a[c[0]]; }), melhor = null;
      if (c[2] && sel.length > 1) { var v = vals.filter(function (x) { return x != null; }); melhor = c[2] > 0 ? Math.max.apply(null, v) : Math.min.apply(null, v); }
      h += '<tr><td>' + c[1] + '</td>' + vals.map(function (x) { return '<td class="' + (melhor != null && x === melhor ? 'pos' : '') + '">' + (c[3] ? brl(x) : num(x)) + '</td>'; }).join('') + '</tr>';
    });
    $('#cmpTab').innerHTML = h + '</tbody>';
  }
  document.querySelectorAll('.cmp').forEach(function (s, i) { if (i < 2) s.selectedIndex = i; s.addEventListener('change', comparar); });
  comparar();
})();
