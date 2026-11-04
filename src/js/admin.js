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
  var filtro = 'todos';

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

  // ---------- Lista de contas ----------
  function desenharLista() {
    var termo = $('busca').value.trim().toLowerCase();
    var tb = $('tbUsuarios');
    tb.innerHTML = '';
    var vistos = usuarios.filter(function (u) {
      if (filtro === 'contas' && u.convidado) return false;
      if (filtro === 'convidados' && !u.convidado) return false;
      if (!termo) return true;
      return ((u.nome || '') + ' ' + (u.email || '')).toLowerCase().indexOf(termo) !== -1;
    });
    if (!vistos.length) linhaVazia(tb, 6, 'Nada encontrado.');
    vistos.forEach(function (u) {
      var tr = document.createElement('tr');
      celula(tr, u.convidado ? 'Convidado ' + String(u.usuario_id).slice(0, 4) : (u.nome || '-'));
      celula(tr, u.convidado ? '(sem e-mail)' : (u.email || '-'));
      celula(tr, etiqueta(u.convidado));
      celula(tr, dataBR(u.criado_em));
      celula(tr, u.ultimo_login ? dataBR(u.ultimo_login) : 'nunca');
      var st = document.createElement('span');
      st.className = 'status' + (u.online ? ' on' : '');
      var ponto = document.createElement('span');
      ponto.className = 'ponto';
      st.appendChild(ponto);
      st.appendChild(document.createTextNode(u.online ? 'Online' : (u.convidado || u.email_confirmado ? 'Offline' : 'E-mail não confirmado')));
      celula(tr, st);
      tb.appendChild(tr);
    });
    $('contagemLista').textContent = vistos.length + ' de ' + usuarios.length + (usuarios.length >= 500 ? ' (mostrando os 500 mais recentes)' : '') + ' exibidos';
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

  async function atualizarTudo() {
    var botao = $('btnAtualizar');
    botao.disabled = true;
    botao.setAttribute('aria-busy', 'true');
    var resultados = await Promise.all([carregarOnline(), carregarLista()]);
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
  document.querySelectorAll('[data-filtro]').forEach(function (b) {
    b.addEventListener('click', function () {
      filtro = b.dataset.filtro;
      document.querySelectorAll('[data-filtro]').forEach(function (x) {
        var ativo = x === b;
        x.classList.toggle('is-active', ativo);
        x.setAttribute('aria-pressed', String(ativo));
      });
      desenharLista();
    });
  });

  iniciar();
})();
