// Bank-San | Ligação da página inicial com o Supabase
// Sem configurar o supabase-config.js, a página roda em modo demonstração.
(function () {
  'use strict';

  var db = window.bankSanDb;
  // Demonstração: Supabase não configurado, ou a pessoa escolheu "Entrar para testar" sem convidado real
  var modoTeste = false;
  try { modoTeste = sessionStorage.getItem('bankSanDemo') === 'true' || location.search.indexOf('demo=1') !== -1; } catch (e) {}
  var demo = !window.bankSanConfigurado || modoTeste;
  var PAGINA_ENTRADA = 'src/pages/entrada.html';
  var PAGINA_CADASTRO = 'src/pages/cadastro.html';

  var NOMES = { 'bank-san': 'Bank-San', itau: 'Itaú', bradesco: 'Bradesco', santander: 'Santander', 'banco-do-brasil': 'Banco do Brasil', caixa: 'Caixa', nubank: 'Nubank', inter: 'Inter', c6: 'C6 Bank' };
  var CORES = { 'bank-san': '#9a9a9a', itau: '#f58220', bradesco: '#cc092f', santander: '#ec0000', 'banco-do-brasil': '#f9d21c', caixa: '#0070af', nubank: '#8a05be', inter: '#ff7a00', c6: '#bdbdbd' };
  var TIPOS = { credito: 'Crédito', debito: 'Débito' };

  function $(id) { return document.getElementById(id); }

  // ---------- Janelas ----------
  document.querySelectorAll('.dlg [data-fechar]').forEach(function (b) {
    b.addEventListener('click', function () { b.closest('dialog').close(); });
  });
  function abrir(dlg) {
    var erro = dlg.querySelector('.dlg-erro');
    if (erro) erro.textContent = '';
    dlg.showModal();
  }
  function mostrarErro(form, msg) { form.querySelector('.dlg-erro').textContent = msg; }

  // ---------- Modo demonstração ----------
  if (demo) {
    var aviso = window.bankSanConfigurado
      ? 'Você está no modo de teste. Crie uma conta para usar isto de verdade.'
      : 'Modo demonstração: configure o Supabase em src/js/supabase-config.js para isto funcionar.';
    ['btnSenha', 'btnExcluir', 'btnNovoGasto', 'btnNovoCartao'].forEach(function (id) {
      $(id).addEventListener('click', function () { alert(aviso); });
    });
    $('btnRemoverCartao').addEventListener('click', function () {
      var id = window.BankSanCartoes.atual();
      if (!id || !confirm('Remover este cartão de demonstração e seus lançamentos?')) return;
      if (window.BankSanCartoes.removerCartao(id)) {
        $('avisoExemplo').textContent = 'Cartão removido da demonstração. Os exemplos voltam ao recarregar a página.';
      }
    });
    $('listaGastos').addEventListener('click', function (e) {
      var botao = e.target.closest ? e.target.closest('[data-remover-gasto]') : null;
      if (!botao || !confirm('Remover este lançamento de demonstração?')) return;
      if (window.BankSanCartoes.removerGasto(window.BankSanCartoes.atual(), botao.dataset.removerGasto)) {
        $('avisoExemplo').textContent = 'Lançamento removido da demonstração. Os exemplos voltam ao recarregar a página.';
      }
    });
    $('btnSair').addEventListener('click', function () {
      try { sessionStorage.removeItem('bankSanDemo'); } catch (e) {}
      location.replace(PAGINA_ENTRADA);
    });
    return;
  }

  // ---------- Estado ----------
  var user = null;
  var titular = 'SEU NOME';
  var lista = [];
  window.BankSanCartoes.definir([], titular);

  function dataBR(iso) { var p = String(iso).split('-'); return p[2] + '/' + p[1]; }
  function hojeISO() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function irParaEntrada() { location.replace(PAGINA_ENTRADA); }

  // ---------- Carregar dados ----------
  async function carregarPerfil() {
    var r = await db.from('profiles').select('nome, tema, notificacoes').eq('id', user.id).maybeSingle();
    if (r.error || !r.data) return;
    if (r.data.nome) {
      document.querySelector('.profile-name').textContent = r.data.nome.split(' ')[0];
      document.getElementById('fotoPerfil').textContent = r.data.nome.charAt(0).toUpperCase();
      titular = r.data.nome.toUpperCase().slice(0, 24);
    }
    document.documentElement.setAttribute('data-theme', r.data.tema);
    $('swTema').classList.toggle('is-on', r.data.tema === 'light');
    $('swTema').setAttribute('aria-checked', r.data.tema === 'light');
    try { localStorage.setItem('bs-tema', r.data.tema); } catch (e) {}
    $('swNotif').classList.toggle('is-on', r.data.notificacoes);
    $('swNotif').setAttribute('aria-checked', r.data.notificacoes);
  }

  async function carregarCartoes(manterId) {
    var r = await db.from('cartoes')
      .select('id, banco, tipo, bandeira, gastos(id, descricao, categoria, valor, data)')
      .order('criado_em');
    if (r.error) {
      lista = [];
      window.BankSanCartoes.definir([], titular);
      alert('Não foi possível carregar os cartões: ' + r.error.message);
      return;
    }
    lista = r.data.map(function (c) {
      return {
        id: c.id, bank: c.banco, nome: NOMES[c.banco] || c.banco, cor: CORES[c.banco] || '#888',
        tipo: TIPOS[c.tipo], bandeira: c.bandeira,
        gastos: (c.gastos || [])
          .sort(function (a, b) { return a.data < b.data ? 1 : -1; })
          .map(function (g) { return { id: g.id, desc: g.descricao, cat: g.categoria, data: dataBR(g.data), valor: Number(g.valor) }; })
      };
    });
    window.BankSanCartoes.definir(lista, titular, manterId);
  }

  // ---------- Registrar gasto ----------
  $('btnNovoGasto').addEventListener('click', function () {
    var id = window.BankSanCartoes.atual();
    var c = lista.filter(function (x) { return x.id === id; })[0];
    if (!c) { alert('Adicione um cartão primeiro.'); return; }
    $('gastoCartaoNome').textContent = 'Cartão: ' + c.nome;
    var f = $('formGasto');
    f.reset();
    f.elements.data.value = hojeISO();
    abrir($('dlgGasto'));
  });

  $('formGasto').addEventListener('submit', async function (e) {
    e.preventDefault();
    var f = e.target, botao = f.querySelector('[type=submit]'), id = window.BankSanCartoes.atual();
    botao.disabled = true;
    var r = await db.from('gastos').insert({
      cartao_id: id,
      descricao: f.elements.descricao.value.trim(),
      categoria: f.elements.categoria.value.trim() || null,
      valor: Number(f.elements.valor.value),
      data: f.elements.data.value
    });
    botao.disabled = false;
    if (r.error) { mostrarErro(f, 'Não foi possível salvar: ' + r.error.message); return; }
    $('dlgGasto').close();
    await carregarCartoes(id);
  });

  // ---------- Adicionar cartão ----------
  $('btnNovoCartao').addEventListener('click', function () {
    $('formCartao').reset();
    abrir($('dlgCartao'));
  });

  $('formCartao').addEventListener('submit', async function (e) {
    e.preventDefault();
    var f = e.target, botao = f.querySelector('[type=submit]');
    botao.disabled = true;
    var r = await db.from('cartoes').insert({
      banco: f.elements.banco.value,
      tipo: f.elements.tipo.value,
      bandeira: f.elements.bandeira.value
    }).select('id').single();
    botao.disabled = false;
    if (r.error) { mostrarErro(f, 'Não foi possível salvar: ' + r.error.message); return; }
    $('dlgCartao').close();
    await carregarCartoes(r.data.id);
  });

  // ---------- Remover cartão ou lançamento ----------
  $('btnRemoverCartao').addEventListener('click', async function () {
    var id = window.BankSanCartoes.atual();
    var c = lista.filter(function (x) { return x.id === id; })[0];
    if (!c || !confirm('Remover o cartão ' + c.nome + ' e todos os lançamentos vinculados? Esta ação não pode ser desfeita.')) return;
    var botao = $('btnRemoverCartao');
    botao.disabled = true;
    var r = await db.from('cartoes').delete().eq('id', id).select('id').maybeSingle();
    botao.disabled = false;
    if (r.error) { alert('Não foi possível remover o cartão: ' + r.error.message); return; }
    if (!r.data) { alert('O cartão não foi encontrado ou não pode ser removido. Atualize a página e tente novamente.'); return; }
    await carregarCartoes();
  });

  $('listaGastos').addEventListener('click', async function (e) {
    var botao = e.target.closest ? e.target.closest('[data-remover-gasto]') : null;
    var cartaoId = window.BankSanCartoes.atual();
    if (!botao || !cartaoId || !confirm('Remover este lançamento? Esta ação não pode ser desfeita.')) return;
    botao.disabled = true;
    var r = await db.from('gastos')
      .delete()
      .eq('id', botao.dataset.removerGasto)
      .eq('cartao_id', cartaoId)
      .select('id')
      .maybeSingle();
    if (r.error) { botao.disabled = false; alert('Não foi possível remover o lançamento: ' + r.error.message); return; }
    if (!r.data) { botao.disabled = false; alert('O lançamento não foi encontrado. Atualize a página e tente novamente.'); return; }
    await carregarCartoes(cartaoId);
  });

  // ---------- Configurações ----------
  $('swTema').addEventListener('click', function () {
    var t = document.documentElement.getAttribute('data-theme');
    db.from('profiles').update({ tema: t }).eq('id', user.id);
  });
  $('swNotif').addEventListener('click', function () {
    db.from('profiles').update({ notificacoes: $('swNotif').classList.contains('is-on') }).eq('id', user.id);
  });

  $('btnSair').addEventListener('click', async function () {
    await db.auth.signOut();
    irParaEntrada();
  });

  $('btnSenha').addEventListener('click', function () {
    $('formSenha').reset();
    abrir($('dlgSenha'));
  });
  $('formSenha').addEventListener('submit', async function (e) {
    e.preventDefault();
    var f = e.target, botao = f.querySelector('[type=submit]');
    if (f.elements.nova.value !== f.elements.repete.value) { mostrarErro(f, 'As senhas não são iguais.'); return; }
    botao.disabled = true;
    var r = await db.auth.updateUser({ password: f.elements.nova.value });
    botao.disabled = false;
    if (r.error) { mostrarErro(f, 'Não foi possível alterar: ' + r.error.message); return; }
    $('dlgSenha').close();
    alert('Senha alterada.');
  });

  $('btnExcluir').addEventListener('click', async function () {
    if (!confirm('Excluir sua conta, seus cartões e seus gastos? Isso não pode ser desfeito.')) return;
    if (prompt('Para confirmar, digite EXCLUIR') !== 'EXCLUIR') return;
    var r = await db.rpc('delete_my_account');
    if (r.error) { alert('Não foi possível excluir: ' + r.error.message); return; }
    await db.auth.signOut();
    location.replace(PAGINA_CADASTRO);
  });

  // ---------- Atividade (quem está online) e painel do administrador ----------
  var sessaoId = (function () {
    try {
      var s = sessionStorage.getItem('bs-sessao');
      if (!s) {
        s = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : String(Math.random()).slice(2) + String(Date.now());
        sessionStorage.setItem('bs-sessao', s);
      }
      return s;
    } catch (e) { return String(Date.now()) + String(Math.random()).slice(2); }
  })();

  function telaAtual() {
    var v = document.querySelector('.view.is-active');
    return v ? v.id.replace('view-', '') : 'inicio';
  }
  function sinal() {
    if (document.hidden || !user) return;
    db.from('atividade')
      .upsert({ user_id: user.id, sessao: sessaoId, pagina: telaAtual(), ultimo_sinal: new Date().toISOString() }, { onConflict: 'user_id,sessao' })
      .then(function () {}, function () {});
  }
  function iniciarAtividade() {
    sinal();
    setInterval(sinal, 40000);
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { db.from('atividade').delete().eq('sessao', sessaoId).then(function () {}, function () {}); }
      else { sinal(); }
    });
    document.querySelectorAll('.menu-item[data-view], #btnPerfil').forEach(function (b) {
      b.addEventListener('click', function () { setTimeout(sinal, 50); });
    });
  }

  async function mostrarLinkAdmin() {
    var r = await db.rpc('eh_admin');
    if (r.error || r.data !== true) return;
    var menu = document.querySelector('.menu');
    if (!menu) return;
    var a = document.createElement('a');
    a.className = 'menu-item';
    a.href = 'src/pages/admin.html';
    a.style.cssText = 'display:block;text-decoration:none;';
    a.textContent = 'Contas conectadas';
    menu.appendChild(a);
  }

  // ---------- Início ----------
  (async function iniciar() {
    var s = await db.auth.getSession();
    if (!s.data.session) { irParaEntrada(); return; }
    user = s.data.session.user;
    db.auth.onAuthStateChange(function (evento) { if (evento === 'SIGNED_OUT') irParaEntrada(); });
    await carregarPerfil();
    await carregarCartoes();
    iniciarAtividade();
    mostrarLinkAdmin();
  })();
})();
