// Bank-San | Áreas: Filtro de ativos, Carteira/Simulador, Notícias, Calendário, Comparador
// Conteúdo educativo com dados de exemplo; não é recomendação de investimento.
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
    var s = document.createElement('section');
    s.className = 'view'; s.id = 'view-' + id; s.innerHTML = html;
    $('.content').insertBefore(s, $('#view-config'));
    return s;
  }
  function opcoes(lista) { return lista.map(function (a) { return '<option value="' + a.t + '">' + a.t + ' - ' + a.nome + '</option>'; }).join(''); }

  // ---------- FILTRO DE ATIVOS ----------
  var vF = view('filtro', '<article class="card"><header class="card-head"><h2>Filtro de ativos</h2></header>' + AVISO +
    '<div class="ctl"><input id="fBusca" placeholder="Buscar ticker ou nome"><select id="fTipo"><option value="">Todos os tipos</option><option>Ação</option><option>FII</option><option>ETF</option></select>' +
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
  ['fBusca', 'fTipo', 'fDy', 'fPl'].forEach(function (i) { $('#' + i).addEventListener('input', filtrar); });
  filtrar();

  // ---------- CARTEIRA / SIMULADOR ----------
  var cart = [];
  try { cart = JSON.parse(localStorage.getItem('bs-carteira') || '[]').filter(function (p) { return achar(p.t); }); } catch (e) {}
  function salvar() { try { localStorage.setItem('bs-carteira', JSON.stringify(cart)); } catch (e) {} }
  var vC = view('carteira', '<article class="card"><header class="card-head"><h2>Minha carteira</h2></header>' + AVISO +
    '<form class="ctl" id="cForm"><select id="cAtivo">' + opcoes(M.ativos) + '</select><label>Quantidade<input id="cQtd" type="number" min="1" step="1" value="10" required></label>' +
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
      return '<tr><td><strong>' + a.t + '</strong></td><td>' + p.q + '</td><td>' + brl(p.pm) + '</td><td>' + brl(a.preco) + '</td><td class="' + cor(res) + '">' + num(res) + '%</td><td>' + brl(v) + '</td><td><button class="btn-small" data-rm="' + i + '">Remover</button></td></tr>';
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
    cart.push({ t: t, q: q, pm: pm }); salvar(); desenharCarteira(); calendario();
  });
  $('#cCorpo').addEventListener('click', function (e) {
    var i = e.target.getAttribute && e.target.getAttribute('data-rm');
    if (i != null) { cart.splice(Number(i), 1); salvar(); desenharCarteira(); calendario(); }
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
  desenharCarteira(); simular();

  // ---------- NOTÍCIAS ----------
  var TEMAS = [
    ['Renda fixa', 'Você empresta dinheiro e recebe juros. É mais previsível, mas o retorno e o risco dependem do emissor e do prazo.'],
    ['CDB, LCI e LCA', 'Títulos de bancos. Veja a rentabilidade (% do CDI ou taxa fixa), o prazo, a liquidez e se há cobertura do FGC. Regras de imposto mudam: confira as atuais.'],
    ['Tesouro Direto', 'Títulos do governo. Selic, prefixado e IPCA+ reagem de formas diferentes aos juros; marcar a mercado pode gerar perda se vender antes do prazo.'],
    ['Fundos imobiliários (FIIs)', 'Cotas de fundos que investem em imóveis ou papéis e distribuem rendimentos. O preço da cota oscila e o rendimento não é garantido.'],
    ['Ações', 'Pedaços de empresas. Podem valorizar e pagar proventos, mas também cair. Olhe resultados, dívida e preço em relação ao lucro (P/L).'],
    ['ETFs', 'Fundos negociados em bolsa que copiam um índice. Uma forma simples de diversificar com uma única compra.'],
    ['Diversificação e risco', 'Não concentrar tudo em um só ativo reduz o impacto de um erro. Quanto maior o retorno esperado, em geral maior o risco.'],
    ['Reserva de emergência', 'Antes de arriscar, guarde dinheiro de fácil resgate para imprevistos, em geral em produtos de baixo risco e boa liquidez.']
  ];
  view('noticias', '<article class="card"><header class="card-head"><h2>Notícias</h2></header><div class="news-tabs" role="tablist"><button class="tab is-active" type="button" data-nt="invest">Notícias de investimento</button><button class="tab" type="button" data-nt="world">Sobre o mundo do investimento</button></div>' +
    '<div id="nInvest">' + AVISO + '<div class="news-grid">' + M.noticias.map(function (n) { return '<div class="news-item"><small>' + n.cat + ' - ' + n.quando + '</small><h3>' + n.titulo + '</h3><p>' + n.resumo + '</p></div>'; }).join('') + '</div></div>' +
    '<div id="nWorld" hidden><p class="aviso-edu">Conteúdo educativo. Não é recomendação de investimento.</p>' + TEMAS.map(function (t) { return '<details class="tema"><summary>' + t[0] + '</summary><p>' + t[1] + '</p></details>'; }).join('') + '</div></article>');
  function aba(nome) {
    document.querySelectorAll('[data-nt]').forEach(function (b) { b.classList.toggle('is-active', b.getAttribute('data-nt') === nome); });
    $('#nInvest').hidden = nome !== 'invest'; $('#nWorld').hidden = nome !== 'world';
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('[data-nt],[data-news-tab]') : null;
    if (b) aba(b.getAttribute('data-nt') || b.getAttribute('data-news-tab'));
  });

  // ---------- CALENDÁRIO DE PROVENTOS ----------
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
  calendario();

  // ---------- COMPARADOR DE EMPRESAS ----------
  var acoes = M.ativos.filter(function (a) { return a.tipo === 'Ação'; });
  view('compare', '<article class="card"><header class="card-head"><h2>Comparador de empresas</h2></header>' + AVISO +
    '<div class="ctl">' + [0, 1, 2].map(function (i) { return '<select class="cmp" data-i="' + i + '">' + (i === 2 ? '<option value="">(nenhuma)</option>' : '') + opcoes(acoes) + '</select>'; }).join('') + '</div>' +
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
