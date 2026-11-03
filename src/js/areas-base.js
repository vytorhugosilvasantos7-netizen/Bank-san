// Bank-San | Base das áreas do menu (funções comuns usadas pelos arquivos de cada área)
(function () {
  'use strict';
  var M = window.BankSanMercado;
  if (!M) return;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var brl = function (v) { return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); };
  var num = function (v, d) { return v == null ? '-' : v.toLocaleString('pt-BR', { minimumFractionDigits: d == null ? 2 : d, maximumFractionDigits: d == null ? 2 : d }); };
  var cor = function (v) { return v > 0 ? 'pos' : v < 0 ? 'neg' : ''; };
  var achar = function (t) { return M.ativos.filter(function (a) { return a.t === t; })[0]; };
  var AVISO = '<p class="aviso-edu">Dados de exemplo (empresas fictícias) e conteúdo educativo. Não é recomendação de investimento.</p>';

  function view(id, html) {
    var s = $('#view-' + id);
    if (!s) {
      s = document.createElement('section');
      s.className = 'view'; s.id = 'view-' + id;
      $('.content').insertBefore(s, $('#view-config'));
    }
    s.innerHTML = html;
    return s;
  }
  function opcoes(lista) { return lista.map(function (a) { return '<option value="' + a.t + '">' + a.t + ' - ' + a.nome + '</option>'; }).join(''); }

  window.BankSanAreas = { M: M, $: $, brl: brl, num: num, cor: cor, achar: achar, AVISO: AVISO, view: view, opcoes: opcoes };
})();
