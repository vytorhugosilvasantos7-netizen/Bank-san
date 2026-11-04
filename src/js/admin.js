// Bank-San | Painel do administrador
// A segurança está no banco de dados: as funções admin_* só respondem para quem está na tabela "admins".
(function () {
  'use strict';

  var db = window.bankSanDb;
  var $ = function (id) { return document.getElementById(id); };
  var TELAS = {
    inicio: 'Início',
    config: 'Configurações',
    filtro: 'Filtro de ativos',
    carteira: 'Minha carteira / Simulador',
    calendar: 'Calendário de proventos',
    compare: 'Comparador de empresas',
    noticias: 'Notícias',
    conta: 'Planilha da conta'
  };

  var usuarios = [];

  function aviso(texto) {
    $('aviso').textContent = texto || '';
    $('aviso').hidden = !texto;
  }
  function status(id, texto, erro) {
    var elemento = $(id);
    elemento.textContent = texto || '';
    elemento.classList.toggle('is-error', Boolean(erro));
  }

  function ha(iso) {
    if (!iso) return 'nunca';
    var s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
    if (s < 60) return 'há ' + Math.round(s) + ' s';
    if (s < 3600) return 'há ' + Math.floor(s / 60) + ' min';
    if (s < 86400) return 'há ' + Math.floor(s / 3600) + ' h';
    return 'há ' + Math.floor(s / 86400) + ' d';
  }
  function dataBR(iso) {
    return iso ? new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : '-';
  }

  function celula(tr, conteudo, classe) {
    var td = document.createElement('td');
    if (classe) td.className = classe;
    if (conteudo instanceof Node) td.appendChild(conteudo); else td.textContent = conteudo;
    tr.appendChild(td);
  }
  function etiqueta(convidado) {
    var s = document.createElement('span');
    s.className = 'etiqueta' + (convidado ? ' convidado' : '');
    s.textContent = convidado ? 'Convidado' : 'Conta';
    return s;
  }
  function linhaVazia(tbody, colunas, texto) {
    var tr = document.createElement('tr');
    var td = document.createElement('td');
    td.colSpan = colunas;
    td.className = 'vazio';
    td.textContent = texto;
    tr.appendChild(td);
    tbody.appendChild(tr);
  }

  function svgElemento(nome, atributos) {
    var el = document.createElementNS('http://www.w3.org/2000/svg', nome);
    Object.keys(atributos).forEach(function (chave) { el.setAttribute(chave, atributos[chave]); });
    return el;
  }

  function desenharEvolucao(dados) {
    var container = $('graficoEvolucao');
    container.innerHTML = '';
    if (!dados.length) {
      var vazio = document.createElement('p');
      vazio.className = 'chart-empty';
      vazio.textContent = 'Ainda não há dados de evolução para mostrar.';
      container.appendChild(vazio);
      return;
    }

    var largura = 800, altura = 220, inicioX = 46, fimX = 776, topoY = 22, baseY = 166;
    var maximo = Math.max.apply(null, dados.map(function (d) {
      return Math.max(Number(d.contas) || 0, Number(d.convidados) || 0);
    }));
    var escala = Math.max(maximo, 1);
    var svg = svgElemento('svg', {
      viewBox: '0 0 ' + largura + ' ' + altura,
      role: 'img',
      'aria-label': 'Novos cadastros diários dos últimos 30 dias. Contas: ' +
        dados.reduce(function (soma, d) { return soma + Number(d.contas || 0); }, 0) +
        '. Convidados: ' + dados.reduce(function (soma, d) { return soma + Number(d.convidados || 0); }, 0) + '.'
    });
    var titulo = svgElemento('title', {});
    titulo.textContent = 'Evolução diária de contas e convidados';
    svg.appendChild(titulo);

    [0, 0.5, 1].forEach(function (fracao) {
      var y = baseY - fracao * (baseY - topoY);
      svg.appendChild(svgElemento('line', { x1: inicioX, y1: y, x2: fimX, y2: y, class: 'chart-grid' }));
      var rotulo = svgElemento('text', { x: inicioX - 10, y: y + 4, 'text-anchor': 'end', class: 'chart-axis' });
      rotulo.textContent = String(Math.round(escala * fracao));
      svg.appendChild(rotulo);
    });

    [
      { chave: 'contas', classe: 'chart-line-accounts' },
      { chave: 'convidados', classe: 'chart-line-guests' }
    ].forEach(function (serie) {
      var pontos = dados.map(function (d, i) {
        var x = inicioX + (dados.length === 1 ? 0 : i * (fimX - inicioX) / (dados.length - 1));
        var y = baseY - (Number(d[serie.chave]) || 0) * (baseY - topoY) / escala;
        return { x: x, y: y };
      });
      svg.appendChild(svgElemento('polyline', {
        points: pontos.map(function (p) { return p.x + ',' + p.y; }).join(' '),
        class: serie.classe
      }));
      var ultimo = pontos[pontos.length - 1];
      svg.appendChild(svgElemento('circle', { cx: ultimo.x, cy: ultimo.y, r: 4, class: serie.classe + '-dot' }));
    });

    [0, Math.floor((dados.length - 1) / 2), dados.length - 1].forEach(function (indice) {
      var data = new Date(dados[indice].dia + 'T12:00:00');
      var rotulo = svgElemento('text', {
        x: inicioX + (dados.length === 1 ? 0 : indice * (fimX - inicioX) / (dados.length - 1)),
        y: 198,
        'text-anchor': indice === 0 ? 'start' : indice === dados.length - 1 ? 'end' : 'middle',
        class: 'chart-axis'
      });
      rotulo.textContent = data.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
      svg.appendChild(rotulo);
    });
    container.appendChild(svg);
  }

  // ---------- Quem está online ----------
  function desenharOnline(lista) {
    var tb = $('tbOnline');
    tb.innerHTML = '';
    if (!lista.length) { linhaVazia(tb, 5, 'Ninguém online neste momento.'); return; }
    lista.forEach(function (o) {
      var tr = document.createElement('tr');
      celula(tr, o.convidado ? 'Convidado ' + String(o.usuario_id).slice(0, 4) : (o.nome || o.email || 'Sem nome') + (o.email && o.nome ? '  (' + o.email + ')' : ''));
      celula(tr, etiqueta(o.convidado));
      celula(tr, TELAS[o.pagina] || o.pagina || '-');
      celula(tr, String(o.sessoes));
      celula(tr, ha(o.visto_em));
      tb.appendChild(tr);
    });
  }

  async function carregarOnline() {
    status('statusOnline', 'Atualizando atividade...');
    try {
      var r = await Promise.all([db.rpc('admin_online'), db.rpc('admin_resumo')]);
      var erro = r[0].error || r[1].error;
      if (erro) throw erro;
      desenharOnline(r[0].data || []);
      var k = (r[1].data && r[1].data[0]) || {};
      $('kOnline').textContent = k.online_agora || 0;
      $('kContas').textContent = k.contas || 0;
      $('kConvidados').textContent = k.convidados || 0;
      $('k24h').textContent = k.novas_24h || 0;
      $('k7d').textContent = k.novas_7d || 0;
      status('statusOnline', 'Atualizado às ' + new Date().toLocaleTimeString('pt-BR'));
      $('atualizado').textContent = 'Painel atualizado às ' + new Date().toLocaleTimeString('pt-BR');
      return true;
    } catch (erro) {
      console.error('[Bank-San] Não foi possível atualizar a atividade do painel.', erro);
      status('statusOnline', 'Falha ao atualizar atividade. Tente novamente.', true);
      aviso('Não foi possível consultar a atividade. Confira a conexão e se src/admin.sql foi executado no Supabase.');
      return false;
    }
  }

  // ---------- Contas e convidados ----------
  function desenharLista() {
    var termo = $('busca').value.trim().toLowerCase();
    var tbContas = $('tbContas');
    var tbConvidados = $('tbConvidados');
    tbContas.innerHTML = '';
    tbConvidados.innerHTML = '';
    var vistos = usuarios.filter(function (u) {
      if (!termo) return true;
      return ((u.nome || '') + ' ' + (u.email || '')).toLowerCase().indexOf(termo) !== -1;
    });
    vistos.forEach(function (u) {
      var tr = document.createElement('tr');
      var st = document.createElement('span');
      st.className = 'status' + (u.online ? ' on' : '');
      var ponto = document.createElement('span');
      ponto.className = 'ponto';
      st.appendChild(ponto);
      st.appendChild(document.createTextNode(u.online ? 'Online' : (u.convidado || u.email_confirmado ? 'Offline' : 'E-mail não confirmado')));
      if (u.convidado) {
        celula(tr, 'Convidado ' + String(u.usuario_id).slice(0, 8));
        celula(tr, dataBR(u.criado_em));
        celula(tr, u.ultimo_login ? dataBR(u.ultimo_login) : 'nunca');
        celula(tr, st);
        tbConvidados.appendChild(tr);
      } else {
        celula(tr, u.nome || '-');
        celula(tr, u.email || '-');
        celula(tr, dataBR(u.criado_em));
        celula(tr, u.ultimo_login ? dataBR(u.ultimo_login) : 'nunca');
        celula(tr, st);
        tbContas.appendChild(tr);
      }
    });
    var contas = vistos.filter(function (u) { return !u.convidado; });
    var convidados = vistos.filter(function (u) { return u.convidado; });
    if (!contas.length) linhaVazia(tbContas, 5, termo ? 'Nenhuma conta encontrada.' : 'Nenhuma conta cadastrada.');
    if (!convidados.length) linhaVazia(tbConvidados, 4, termo ? 'Nenhum convidado encontrado.' : 'Nenhum convidado de teste.');
    $('contagemContas').textContent = String(contas.length);
    $('contagemConvidados').textContent = String(convidados.length);
    $('contagemLista').textContent = vistos.length + ' de ' + usuarios.length + (usuarios.length >= 500 ? ' (mostrando os 500 mais recentes)' : '') + ' cadastros exibidos';
  }

  async function carregarLista() {
    status('statusLista', 'Atualizando cadastros...');
    try {
      var r = await db.rpc('admin_usuarios');
      if (r.error) throw r.error;
      usuarios = r.data || [];
      desenharLista();
      status('statusLista', 'Atualizado às ' + new Date().toLocaleTimeString('pt-BR'));
      return true;
    } catch (erro) {
      console.error('[Bank-San] Não foi possível atualizar a lista de contas.', erro);
      status('statusLista', 'Falha ao atualizar cadastros. Tente novamente.', true);
      aviso('Não foi possível carregar os cadastros. Confira a conexão e se src/admin.sql foi executado no Supabase.');
      return false;
    }
  }

  async function carregarEvolucao() {
    status('statusEvolucao', 'Atualizando gráfico...');
    try {
      var r = await db.rpc('admin_evolucao');
      if (r.error) throw r.error;
      desenharEvolucao(r.data || []);
      status('statusEvolucao', 'Atualizado às ' + new Date().toLocaleTimeString('pt-BR'));
      return true;
    } catch (erro) {
      console.error('[Bank-San] Não foi possível atualizar a evolução dos cadastros.', erro);
      status('statusEvolucao', 'Falha ao carregar. Atualize src/admin.sql no Supabase.', true);
      $('graficoEvolucao').textContent = 'Não foi possível carregar a evolução dos cadastros.';
      return false;
    }
  }

  async function atualizarTudo() {
    var botao = $('btnAtualizar');
    botao.disabled = true;
    botao.setAttribute('aria-busy', 'true');
    var resultados = await Promise.all([carregarOnline(), carregarLista(), carregarEvolucao()]);
    if (resultados.every(Boolean)) aviso('');
    botao.disabled = false;
    botao.removeAttribute('aria-busy');
  }

  // ---------- Início ----------
  async function iniciar() {
    if (!window.bankSanConfigurado) {
      aviso('O Supabase ainda não está configurado em src/js/supabase-config.js.');
      $('atualizado').textContent = 'Sem conexão';
      return;
    }
    if (!db) {
      aviso('Não foi possível conectar ao Supabase. Confira sua conexão e tente novamente.');
      $('atualizado').textContent = 'Sem conexão';
      return;
    }
    try {
      var s = await db.auth.getSession();
      if (s.error) throw s.error;
      if (!s.data.session) { location.replace('entrada.html'); return; }

      var ok = await db.rpc('eh_admin');
      if (ok.error) throw ok.error;
      if (ok.data !== true) {
        aviso('Esta conta não tem permissão para ver o painel. Entre com o e-mail autorizado como administrador.');
        $('atualizado').textContent = 'Acesso não autorizado';
        return;
      }
      $('conteudo').hidden = false;
      await atualizarTudo();

      setInterval(function () { if (!document.hidden) carregarOnline(); }, 15000);
      setInterval(function () { if (!document.hidden) carregarLista(); }, 60000);
      setInterval(function () { if (!document.hidden) carregarEvolucao(); }, 60000);
      document.addEventListener('visibilitychange', function () {
        if (!document.hidden && !$('conteudo').hidden) atualizarTudo();
      });
    } catch (erro) {
      console.error('[Bank-San] Não foi possível verificar o acesso administrativo.', erro);
      aviso('Não foi possível verificar sua conta. Confira a conexão e tente entrar novamente.');
      $('atualizado').textContent = 'Falha ao verificar acesso';
    }
  }

  $('btnAtualizar').addEventListener('click', function () { if (!$('conteudo').hidden) atualizarTudo(); });
  $('busca').addEventListener('input', desenharLista);

  iniciar();
})();
