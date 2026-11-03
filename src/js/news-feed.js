// Bank-San | Manchetes de fontes financeiras e públicas
(function () {
  'use strict';

  var FEEDS = [
    {
      name: 'Money Times',
      publisher: 'Money Times',
      category: 'markets',
      label: 'Mercados',
      url: 'https://www.moneytimes.com.br/mercados/feed/',
      hosts: ['moneytimes.com.br'],
      imageHosts: ['moneytimes.com.br']
    },
    {
      name: 'Valor Econômico',
      publisher: 'Valor Econômico',
      category: 'markets',
      label: 'Mercados',
      url: 'https://valor.globo.com/rss/valor/financas/',
      hosts: ['valor.globo.com'],
      imageHosts: ['glbimg.com']
    },
    {
      name: 'Valor Econômico · Mundo',
      publisher: 'Valor Econômico',
      category: 'world',
      label: 'Internacional',
      url: 'https://valor.globo.com/rss/valor/mundo/',
      hosts: ['valor.globo.com'],
      imageHosts: ['glbimg.com']
    },
    {
      name: 'Agência Brasil (EBC)',
      publisher: 'Agência Brasil (EBC)',
      category: 'economy',
      label: 'Economia',
      url: 'https://agenciabrasil.ebc.com.br/rss/economia/feed.xml',
      hosts: ['agenciabrasil.ebc.com.br'],
      imageHosts: ['agenciabrasil.ebc.com.br']
    }
  ];
  var MAX_NEWS = 15;
  var INTERVALO_ATUALIZACAO = 15 * 60 * 1000;
  var lista = document.querySelector('[data-news-list]');
  var status = document.querySelector('[data-news-status]');
  var atualizar = document.querySelector('[data-news-refresh]');
  var filtros = document.querySelectorAll('[data-news-filter]');
  var noticias = [];
  var filtroAtivo = 'all';
  var carregando = false;
  var ultimoUpdate = null;
  var ultimaTentativa = 0;
  var fontesIndisponiveis = 0;
  var houveErro = false;
  var assinantes = [];

  if (!lista || !status || !atualizar || !filtros.length) {
    throw new Error('A área de notícias não contém os controles esperados.');
  }

  function ehDominioPermitido(host, dominios) {
    return dominios.some(function (dominio) {
      return host === dominio || host.slice(-(dominio.length + 1)) === '.' + dominio;
    });
  }

  function imagemPermitida(valor, feed) {
    if (typeof valor !== 'string' || !valor.trim() || valor.length > 2048) return '';
    try {
      var url = new URL(valor.trim());
      if (url.protocol !== 'https:' || url.username || url.password || !ehDominioPermitido(url.hostname.toLowerCase(), feed.imageHosts)) return '';
      return url.href;
    } catch (erro) {
      return '';
    }
  }

  function imagemDoItem(feed, item) {
    var candidatos = [];
    if (typeof item.thumbnail === 'string') candidatos.push(item.thumbnail);
    if (item.enclosure && typeof item.enclosure.link === 'string') candidatos.push(item.enclosure.link);

    for (var i = 0; i < candidatos.length; i += 1) {
      var imagemDireta = imagemPermitida(candidatos[i], feed);
      if (imagemDireta) return imagemDireta;
    }

    [item.content, item.description].forEach(function (html) {
      if (typeof html !== 'string' || !html) return;
      var imagens = html.match(/<img\b[^>]*>/gi) || [];
      imagens.forEach(function (tag) {
        var atributos = ['data-src', 'src'];
        atributos.forEach(function (nome) {
          var padrao = new RegExp('\\b' + nome + '\\s*=\\s*(?:"([^"]+)"|\'([^\']+)\'|([^\\s>]+))', 'i');
          var correspondencia = tag.match(padrao);
          if (correspondencia) candidatos.push(correspondencia[1] || correspondencia[2] || correspondencia[3]);
        });
      });
    });

    for (var j = 0; j < candidatos.length; j += 1) {
      var imagem = imagemPermitida(candidatos[j], feed);
      if (imagem) return imagem;
    }
    return '';
  }

  function lerFeed(feed, resposta) {
    if (!resposta || resposta.status !== 'ok' || !Array.isArray(resposta.items)) {
      throw new Error('O feed de ' + feed.name + ' não pôde ser convertido.');
    }

    var artigos = resposta.items.map(function (item) {
      var titulo = typeof item.title === 'string' ? item.title.trim() : '';
      var link = typeof item.link === 'string' ? item.link.trim() : '';
      var data = typeof item.pubDate === 'string' ? item.pubDate : '';
      if (!titulo || !link) return null;

      var url;
      try {
        url = new URL(link);
      } catch (erro) {
        return null;
      }
      if (url.protocol !== 'https:' || !ehDominioPermitido(url.hostname.toLowerCase(), feed.hosts)) return null;

      var dataNormalizada = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(data) ? data.replace(' ', 'T') + 'Z' : data;
      var timestamp = data ? Date.parse(dataNormalizada) : NaN;
      return {
        title: titulo,
        url: url.href,
        source: feed.name,
        publisher: feed.publisher,
        category: feed.category,
        label: feed.label,
        timestamp: Number.isFinite(timestamp) ? timestamp : 0,
        image: imagemDoItem(feed, item)
      };
    }).filter(Boolean);

    if (!artigos.length) {
      throw new Error('O feed de ' + feed.name + ' não trouxe manchetes válidas.');
    }
    return artigos;
  }

  function carregarFeed(feed) {
    var controle = new AbortController();
    var timeout = window.setTimeout(function () { controle.abort(); }, 15000);
    var url = 'https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent(feed.url);
    return fetch(url, {
      headers: { Accept: 'application/json' },
      signal: controle.signal
    }).then(function (resposta) {
      if (!resposta.ok) throw new Error('Falha ao consultar ' + feed.name + ' (HTTP ' + resposta.status + ').');
      return resposta.json();
    }).then(function (dados) {
      return lerFeed(feed, dados);
    }).finally(function () {
      window.clearTimeout(timeout);
    });
  }

  function equilibrarFontes(itens) {
    var contagem = Object.create(null);
    return itens.filter(function (item) {
      contagem[item.publisher] = contagem[item.publisher] || 0;
      if (contagem[item.publisher] >= 8) return false;
      contagem[item.publisher] += 1;
      return true;
    });
  }

  function formatarData(timestamp) {
    if (!timestamp) return 'Data indisponível';
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(timestamp));
  }

  function criarNoticia(item, destaque) {
    var link = document.createElement('a');
    link.className = 'news-item' + (destaque ? ' news-item--featured' : '');
    link.href = item.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';

    if (destaque && item.image) {
      var moldura = document.createElement('span');
      moldura.className = 'news-image-wrap';
      var imagem = document.createElement('img');
      imagem.className = 'news-image';
      imagem.src = item.image;
      imagem.alt = 'Imagem relacionada à matéria: ' + item.title;
      imagem.loading = 'lazy';
      imagem.decoding = 'async';
      imagem.referrerPolicy = 'no-referrer';
      var credito = document.createElement('span');
      credito.className = 'news-image-credit';
      credito.textContent = 'Imagem: ' + item.publisher;
      moldura.append(imagem, credito);
      imagem.addEventListener('error', function () {
        moldura.remove();
        link.classList.remove('news-item--featured');
      }, { once: true });
      link.appendChild(moldura);
    }

    var meta = document.createElement('span');
    meta.className = 'news-meta';
    var categoria = document.createElement('span');
    categoria.className = 'news-category';
    categoria.textContent = item.label;
    var origem = document.createElement('span');
    origem.className = 'news-source';
    origem.textContent = item.source;
    meta.append(categoria, origem);

    var titulo = document.createElement('h3');
    titulo.textContent = item.title;
    var rodape = document.createElement('span');
    rodape.className = 'news-item-foot';
    var data = document.createElement('time');
    data.textContent = formatarData(item.timestamp);
    if (item.timestamp) data.dateTime = new Date(item.timestamp).toISOString();
    var chamada = document.createElement('span');
    chamada.className = 'news-read-more';
    chamada.textContent = 'Ler no site original ↗';
    rodape.append(data, chamada);
    link.append(meta, titulo, rodape);
    return link;
  }

  function renderizar() {
    var exibidas = noticias.filter(function (item) {
      return filtroAtivo === 'all' || item.category === filtroAtivo;
    }).slice(0, MAX_NEWS);
    lista.replaceChildren();

    if (!exibidas.length) {
      var mensagem = document.createElement('p');
      mensagem.className = 'news-message';
      mensagem.textContent = noticias.length
        ? 'Não há manchetes nesta categoria no momento.'
        : 'Não foi possível carregar as manchetes. Verifique sua conexão e tente atualizar.';
      lista.appendChild(mensagem);
      return;
    }

    var destaque = exibidas.filter(function (item) { return item.image; })[0];
    exibidas.forEach(function (item) {
      lista.appendChild(criarNoticia(item, item === destaque));
    });
  }

  function definirStatus(mensagem, erro) {
    status.textContent = mensagem;
    status.classList.toggle('is-error', Boolean(erro));
  }

  function atualizarResumo() {
    if (!ultimoUpdate) return;
    var quantidade = noticias.filter(function (item) {
      return filtroAtivo === 'all' || item.category === filtroAtivo;
    }).length;
    var exibidas = Math.min(quantidade, MAX_NEWS);
    if (!exibidas) {
      definirStatus('Nenhuma manchete nesta categoria no momento.', false);
      return;
    }
    var horario = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(ultimoUpdate);
    var resumo = exibidas + (exibidas === 1 ? ' manchete exibida' : ' manchetes exibidas') + ' · atualizado às ' + horario;
    if (fontesIndisponiveis) resumo += ' · ' + fontesIndisponiveis + (fontesIndisponiveis === 1 ? ' fonte indisponível' : ' fontes indisponíveis');
    definirStatus(resumo, Boolean(fontesIndisponiveis));
  }

  function notificarAssinantes() {
    var estado = {
      loading: carregando,
      updatedAt: ultimoUpdate,
      unavailableSources: fontesIndisponiveis,
      totalSources: FEEDS.length,
      error: houveErro
    };
    assinantes.slice().forEach(function (assinante) {
      assinante(noticias.slice(), estado);
    });
  }

  function buscarNoticias() {
    if (carregando) return;
    carregando = true;
    ultimaTentativa = Date.now();
    atualizar.disabled = true;
    atualizar.setAttribute('aria-busy', 'true');
    lista.setAttribute('aria-busy', 'true');
    definirStatus('Atualizando fontes...', false);
    houveErro = false;
    notificarAssinantes();

    var resultados = FEEDS.map(carregarFeed);

    Promise.allSettled(resultados).then(function (respostas) {
      var disponiveis = [];
      var falhas = 0;
      respostas.forEach(function (resposta) {
        if (resposta.status === 'fulfilled') disponiveis = disponiveis.concat(resposta.value);
        else falhas += 1;
      });

      if (!disponiveis.length) {
        houveErro = true;
        fontesIndisponiveis = FEEDS.length;
        definirStatus(noticias.length ? 'Falha ao atualizar. Exibindo as manchetes carregadas anteriormente.' : 'Não foi possível atualizar as fontes. Tente novamente.', true);
        renderizar();
        notificarAssinantes();
        return;
      }

      var unicas = new Map();
      disponiveis.forEach(function (item) {
        if (!unicas.has(item.url)) unicas.set(item.url, item);
      });
      noticias = equilibrarFontes(Array.from(unicas.values()).sort(function (a, b) { return b.timestamp - a.timestamp; }));
      ultimoUpdate = new Date();
      fontesIndisponiveis = falhas;
      houveErro = Boolean(falhas);
      renderizar();
      atualizarResumo();
      notificarAssinantes();
    }).catch(function (erro) {
      houveErro = true;
      fontesIndisponiveis = FEEDS.length;
      definirStatus('Erro ao carregar notícias: ' + erro.message, true);
      if (!noticias.length) renderizar();
      notificarAssinantes();
    }).finally(function () {
      carregando = false;
      atualizar.disabled = false;
      atualizar.removeAttribute('aria-busy');
      lista.setAttribute('aria-busy', 'false');
      notificarAssinantes();
    });
  }

  filtros.forEach(function (botao) {
    botao.addEventListener('click', function () {
      filtroAtivo = botao.getAttribute('data-news-filter');
      filtros.forEach(function (item) {
        var ativo = item === botao;
        item.classList.toggle('is-active', ativo);
        item.setAttribute('aria-pressed', String(ativo));
      });
      renderizar();
      atualizarResumo();
    });
  });
  atualizar.addEventListener('click', buscarNoticias);
  window.setInterval(function () {
    if (!document.hidden && Date.now() - ultimaTentativa >= INTERVALO_ATUALIZACAO) buscarNoticias();
  }, INTERVALO_ATUALIZACAO);
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden && Date.now() - ultimaTentativa >= INTERVALO_ATUALIZACAO) buscarNoticias();
  });
  window.BankSanNewsFeed = {
    subscribe: function (assinante) {
      if (typeof assinante !== 'function') throw new TypeError('O assinante do feed de notícias deve ser uma função.');
      assinantes.push(assinante);
      assinante(noticias.slice(), {
        loading: carregando,
        updatedAt: ultimoUpdate,
        unavailableSources: fontesIndisponiveis,
        totalSources: FEEDS.length,
        error: houveErro
      });
      return function () {
        assinantes = assinantes.filter(function (item) { return item !== assinante; });
      };
    },
    refresh: buscarNoticias,
    createArticle: criarNoticia
  };
  buscarNoticias();
})();
