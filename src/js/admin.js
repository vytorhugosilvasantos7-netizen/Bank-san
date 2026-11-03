// Bank-San | Painel do administrador
// A segurança está no banco de dados: as funções admin_* só respondem para quem está na tabela "admins".
(function () {
  'use strict';

  var db = window.bankSanDb;
  var $ = function (id) { return document.getElementById(id); };
  var TELAS = { inicio: 'Início', config: 'Configurações', filtro: 'Filtro de ativos', carteira: 'Carteira', calendar: 'Calendário', compare: 'Comparador' };

  var usuarios = [];
  var filtro = 'todos';
  var timerOnline = 0;
  var timerLista = 0;

  function aviso(texto) { $('aviso').textContent = texto || ''; $('aviso').hidden = !texto; }

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
    var r = await Promise.all([db.rpc('admin_online'), db.rpc('admin_resumo')]);
    if (r[0].error || r[1].error) { aviso('Não foi possível atualizar: ' + (r[0].error || r[1].error).message); return; }
    aviso('');
    desenharOnline(r[0].data || []);
    var k = (r[1].data && r[1].data[0]) || {};
    $('kOnline').textContent = k.online_agora || 0;
    $('kContas').textContent = k.contas || 0;
    $('kConvidados').textContent = k.convidados || 0;
    $('k24h').textContent = k.novas_24h || 0;
    $('k7d').textContent = k.novas_7d || 0;
    $('atualizado').textContent = 'Atualizado às ' + new Date().toLocaleTimeString('pt-BR');
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
    $('contagemLista').textContent = vistos.length + ' de ' + usuarios.length + (usuarios.length >= 500 ? ' (mostrando os 500 mais recentes)' : '');
  }

  async function carregarLista() {
    var r = await db.rpc('admin_usuarios');
    if (r.error) { aviso('Não foi possível carregar a lista: ' + r.error.message); return; }
    usuarios = r.data || [];
    desenharLista();
  }

  async function atualizarTudo() {
    await Promise.all([carregarOnline(), carregarLista()]);
  }

  // ---------- Início ----------
  async function iniciar() {
    if (!window.bankSanConfigurado) {
      aviso('O Supabase ainda não está configurado em src/js/supabase-config.js.');
      $('atualizado').textContent = 'Sem conexão';
      return;
    }
    var s = await db.auth.getSession();
    if (!s.data.session) { location.replace('entrada.html'); return; }

    var ok = await db.rpc('eh_admin');
    if (ok.error || ok.data !== true) {
      aviso('Esta conta não tem permissão para ver o painel.');
      $('atualizado').textContent = 'Acesso negado';
      return;
    }
    $('conteudo').hidden = false;
    await atualizarTudo();

    // Online a cada 15 s e a lista a cada 60 s (só com a aba visível)
    timerOnline = setInterval(function () { if (!document.hidden) carregarOnline(); }, 15000);
    timerLista = setInterval(function () { if (!document.hidden) carregarLista(); }, 60000);
  }

  $('btnAtualizar').addEventListener('click', function () { if (!$('conteudo').hidden) atualizarTudo(); });
  $('busca').addEventListener('input', desenharLista);
  document.querySelectorAll('[data-filtro]').forEach(function (b) {
    b.addEventListener('click', function () {
      filtro = b.dataset.filtro;
      document.querySelectorAll('[data-filtro]').forEach(function (x) { x.classList.toggle('is-active', x === b); });
      desenharLista();
    });
  });

  iniciar();
})();
