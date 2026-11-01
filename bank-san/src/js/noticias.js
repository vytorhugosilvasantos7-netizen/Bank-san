// Bank-San | Notícias
(function () {
  'use strict';
  var A = window.BankSanAreas;
  if (!A) return;
  var M = A.M, $ = A.$, brl = A.brl, num = A.num, cor = A.cor, achar = A.achar, AVISO = A.AVISO, view = A.view, opcoes = A.opcoes;

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
})();
