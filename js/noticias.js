// Bank-San | Notícias
(function () {
  'use strict';
  var A = window.BankSanAreas;
  if (!A) return;
  var $ = A.$, view = A.view;

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
  view('noticias', '<article class="card news-card"><header class="card-head news-head"><div><h2>Notícias de investimento</h2><p class="section-subtitle">Manchetes atuais com links para as fontes originais.</p></div><button class="btn-small news-refresh" type="button" data-news-view-refresh>Atualizar notícias</button></header><p class="news-feed-disclosure">Fontes: Money Times, Valor Econômico e Agência Brasil (EBC). Feeds convertidos pelo RSS2JSON; as matérias abrem nos sites originais.</p><div class="news-tabs" role="tablist" aria-label="Categorias de notícias"><button class="tab is-active" type="button" role="tab" aria-selected="true" aria-controls="news-invest" data-nt="invest">Notícias de investimento</button><button class="tab" type="button" role="tab" aria-selected="false" aria-controls="news-world" data-nt="world">Sobre o mundo do investimento</button></div>' +
    '<div id="news-invest" role="tabpanel" tabindex="0"><p class="news-status" data-news-view-status role="status" aria-live="polite">Carregando manchetes...</p><div class="news-grid" data-news-view-list aria-live="polite" aria-busy="true"><p class="news-message">Buscando as últimas notícias...</p></div></div>' +
    '<div id="news-world" role="tabpanel" tabindex="0" hidden><h3 class="news-section-title">Mercados internacionais</h3><p class="news-status" data-news-world-status role="status" aria-live="polite">Carregando manchetes...</p><div class="news-grid" data-news-world-list aria-live="polite" aria-busy="true"><p class="news-message">Buscando notícias internacionais...</p></div><h3 class="news-section-title">Entenda os conceitos</h3><p class="aviso-edu">Conteúdo educativo. Não é recomendação de investimento.</p>' + TEMAS.map(function (t) { return '<details class="tema"><summary>' + t[0] + '</summary><p>' + t[1] + '</p></details>'; }).join('') + '</div></article>');

  var newsList = $('[data-news-view-list]');
  var newsStatus = $('[data-news-view-status]');
  var worldList = $('[data-news-world-list]');
  var worldStatus = $('[data-news-world-status]');
  var newsRefresh = $('[data-news-view-refresh]');
  var newsCount = 12;
  var worldNewsCount = 9;

  function renderizarFeed(lista, status, items, estado, limite) {
    lista.replaceChildren();
    lista.setAttribute('aria-busy', String(estado.loading));
    newsRefresh.disabled = estado.loading;
    newsRefresh.setAttribute('aria-busy', String(estado.loading));
    if (!items.length) {
      var vazio = document.createElement('p');
      vazio.className = 'news-message';
      vazio.textContent = estado.loading
        ? 'Buscando as últimas notícias...'
        : estado.error
          ? 'Não foi possível carregar as notícias. Tente atualizar ou confira sua conexão.'
          : 'Nenhuma manchete disponível nesta categoria no momento.';
      lista.appendChild(vazio);
    } else {
      items.slice(0, limite).forEach(function (item) {
        var link = document.createElement('a');
        link.className = 'news-item';
        link.href = item.url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        var meta = document.createElement('span');
        meta.className = 'news-meta';
        var categoria = document.createElement('span');
        categoria.className = 'news-category';
        categoria.textContent = item.label;
        var fonte = document.createElement('span');
        fonte.className = 'news-source';
        fonte.textContent = item.source;
        meta.append(categoria, fonte);
        var titulo = document.createElement('h3');
        titulo.textContent = item.title;
        var rodape = document.createElement('span');
        rodape.className = 'news-item-foot';
        var data = document.createElement('time');
        data.textContent = item.timestamp
          ? new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(item.timestamp))
          : 'Data indisponível';
        if (item.timestamp) data.dateTime = new Date(item.timestamp).toISOString();
        var chamada = document.createElement('span');
        chamada.className = 'news-read-more';
        chamada.textContent = 'Ler no site original ↗';
        rodape.append(data, chamada);
        link.append(meta, titulo, rodape);
        lista.appendChild(link);
      });
    }

    if (estado.loading) {
      status.textContent = 'Atualizando fontes...';
      status.classList.remove('is-error');
    } else if (items.length && estado.error && estado.unavailableSources >= estado.totalSources) {
      status.textContent = 'Falha ao atualizar. Exibindo as manchetes carregadas anteriormente.';
      status.classList.add('is-error');
    } else if (items.length) {
      var quantidade = Math.min(items.length, limite);
      var resumo = quantidade + (quantidade === 1 ? ' manchete exibida' : ' manchetes exibidas');
      if (estado.updatedAt) resumo += ' · atualizado às ' + new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(estado.updatedAt);
      if (estado.unavailableSources) resumo += ' · ' + estado.unavailableSources + (estado.unavailableSources === 1 ? ' fonte indisponível' : ' fontes indisponíveis');
      status.textContent = resumo;
      status.classList.toggle('is-error', Boolean(estado.error));
    } else {
      status.textContent = estado.loading ? 'Atualizando fontes...' : 'Não foi possível atualizar as fontes.';
      status.classList.toggle('is-error', Boolean(estado.error));
    }
  }

  function renderizarFeeds(items, estado) {
    renderizarFeed(newsList, newsStatus, items.filter(function (item) { return item.category !== 'world'; }), estado, newsCount);
    renderizarFeed(worldList, worldStatus, items.filter(function (item) { return item.category === 'world'; }), estado, worldNewsCount);
  }

  if (!newsList || !newsStatus || !worldList || !worldStatus || !newsRefresh) throw new Error('A área de notícias não contém os controles esperados.');
  newsRefresh.addEventListener('click', function () { window.BankSanNewsFeed.refresh(); });
  if (!window.BankSanNewsFeed) throw new Error('O serviço de notícias ainda não foi carregado.');
  window.BankSanNewsFeed.subscribe(renderizarFeeds);
  function aba(nome) {
    document.querySelectorAll('[data-nt]').forEach(function (b) {
      var ativa = b.getAttribute('data-nt') === nome;
      b.classList.toggle('is-active', ativa);
      b.setAttribute('aria-selected', ativa);
    });
    $('#news-invest').hidden = nome !== 'invest'; $('#news-world').hidden = nome !== 'world';
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('[data-nt],[data-news-tab]') : null;
    if (b) aba(b.getAttribute('data-nt') || b.getAttribute('data-news-tab'));
  });
})();
