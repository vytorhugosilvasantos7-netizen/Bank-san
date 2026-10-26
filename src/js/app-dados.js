// Bank-San | Integração com Supabase (Perfil, Cartões, Gastos e Sessão)
(function () {
  'use strict';

  var CORES_BANCOS = {
    'nubank': '#8a05be',
    'itau': '#f58220',
    'inter': '#ff7a00',
    'c6': '#242424',
    'bradesco': '#cc092f',
    'santander': '#ec0000',
    'banco-do-brasil': '#fbe200',
    'caixa': '#0066b3',
    'bank-san': '#18181b'
  };

  var NOMES_BANCOS = {
    'nubank': 'Nubank',
    'itau': 'Itaú',
    'inter': 'Inter',
    'c6': 'C6 Bank',
    'bradesco': 'Bradesco',
    'santander': 'Santander',
    'banco-do-brasil': 'Banco do Brasil',
    'caixa': 'Caixa',
    'bank-san': 'BANK-SAN'
  };

  var usuarioAtual = null;

  async function obterSessao() {
    if (!window.bankSanDb || !window.bankSanConfigurado) return null;
    try {
      var r = await window.bankSanDb.auth.getSession();
      return r.data && r.data.session ? r.data.session : null;
    } catch (e) {
      console.warn('Erro ao obter sessão Supabase:', e);
      return null;
    }
  }

  async function carregarDadosUsuario(session) {
    if (!session || !session.user) return;
    usuarioAtual = session.user;

    // Buscar perfil
    var nome = session.user.user_metadata && session.user.user_metadata.nome;
    try {
      var rPerfil = await window.bankSanDb
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();

      if (rPerfil.data) {
        if (rPerfil.data.nome) nome = rPerfil.data.nome;
        if (rPerfil.data.foto_url) {
          var foto = document.getElementById('fotoPerfil');
          if (foto) {
            foto.textContent = '';
            foto.style.backgroundImage = 'url(' + rPerfil.data.foto_url + ')';
          }
        }
      }
    } catch (e) {
      console.warn('Erro ao carregar perfil:', e);
    }

    // Exibir nome no menu lateral
    var nomeExibicao = nome || session.user.email.split('@')[0];
    document.querySelectorAll('.profile-name').forEach(function (el) {
      el.textContent = nomeExibicao;
    });

    var fotoEl = document.getElementById('fotoPerfil');
    if (fotoEl && !fotoEl.style.backgroundImage) {
      fotoEl.textContent = nomeExibicao.charAt(0).toUpperCase();
    }

    // Carregar cartões e gastos reais
    await recarregarCartoes(nomeExibicao);
  }

  async function recarregarCartoes(nomeTitular) {
    if (!window.bankSanDb || !usuarioAtual) return;

    try {
      var resCartoes = await window.bankSanDb
        .from('cartoes')
        .select('*')
        .eq('user_id', usuarioAtual.id)
        .order('criado_em', { ascending: true });

      var cartoesDb = resCartoes.data || [];

      var resGastos = await window.bankSanDb
        .from('gastos')
        .select('*')
        .eq('user_id', usuarioAtual.id)
        .order('data', { ascending: false });

      var gastosDb = resGastos.data || [];

      var listaFormatada = cartoesDb.map(function (c) {
        var gastosDoCartao = gastosDb
          .filter(function (g) { return g.cartao_id === c.id; })
          .map(function (g) {
            var dataFormatada = g.data;
            if (dataFormatada && dataFormatada.indexOf('-') !== -1) {
              var partes = dataFormatada.split('-');
              dataFormatada = partes[2] + '/' + partes[1];
            }
            return {
              id: g.id,
              desc: g.descricao,
              cat: g.categoria || 'Geral',
              data: dataFormatada,
              valor: Number(g.valor)
            };
          });

        return {
          id: c.id,
          bank: c.banco,
          nome: NOMES_BANCOS[c.banco] || c.banco.toUpperCase(),
          cor: CORES_BANCOS[c.banco] || '#242424',
          tipo: c.tipo === 'credito' ? 'Crédito' : 'Débito',
          final: c.final,
          bandeira: c.bandeira || 'Visa',
          gastos: gastosDoCartao
        };
      });

      if (window.BankSanCartoes) {
        window.BankSanCartoes.definir(listaFormatada, nomeTitular);
      }
    } catch (err) {
      console.warn('Erro ao sincronizar cartões/gastos:', err);
    }
  }

  // ---------- Menu para usuário não autenticado ----------
  function configurarVisitante() {
    var pName = document.querySelector('.profile-name');
    if (pName) pName.textContent = 'Modo Demonstração';
    var nav = document.querySelector('.menu');
    if (nav && !nav.querySelector('[data-auth-link]')) {
      var linkEntrar = document.createElement('a');
      linkEntrar.href = 'src/pages/entrada.html';
      linkEntrar.className = 'menu-item';
      linkEntrar.setAttribute('data-auth-link', 'true');
      linkEntrar.textContent = 'Entrar na conta';
      linkEntrar.style.textDecoration = 'none';

      var linkCad = document.createElement('a');
      linkCad.href = 'src/pages/cadastro.html';
      linkCad.className = 'menu-item';
      linkCad.setAttribute('data-auth-link', 'true');
      linkCad.textContent = 'Criar conta';
      linkCad.style.textDecoration = 'none';

      nav.appendChild(linkEntrar);
      nav.appendChild(linkCad);
    }
  }

  // ---------- Sair da conta ----------
  var btnSair = document.getElementById('btnSair');
  if (btnSair) {
    btnSair.addEventListener('click', async function () {
      if (window.bankSanDb && usuarioAtual) {
        btnSair.disabled = true;
        btnSair.textContent = 'Saindo...';
        await window.bankSanDb.auth.signOut();
      }
      location.href = 'src/pages/entrada.html';
    });
  }

  // ---------- Adicionar Cartão ----------
  var formCartao = document.getElementById('formCartao');
  if (formCartao) {
    formCartao.addEventListener('submit', async function (e) {
      e.preventDefault();
      var errEl = formCartao.querySelector('.dlg-erro');
      if (errEl) errEl.textContent = '';

      if (!usuarioAtual || !window.bankSanDb) {
        if (errEl) errEl.textContent = 'Entre na sua conta para salvar cartões.';
        return;
      }

      var banco = formCartao.elements.banco.value;
      var tipo = formCartao.elements.tipo.value;
      var bandeira = formCartao.elements.bandeira.value;
      var final = formCartao.elements.final.value.trim();

      if (!/^\d{4}$/.test(final)) {
        if (errEl) errEl.textContent = 'Informe exatamente os 4 últimos dígitos numéricos.';
        return;
      }

      var btnSubmit = formCartao.querySelector('[type=submit]');
      btnSubmit.disabled = true;

      try {
        var r = await window.bankSanDb.from('cartoes').insert({
          user_id: usuarioAtual.id,
          banco: banco,
          tipo: tipo,
          bandeira: bandeira,
          final: final
        });

        btnSubmit.disabled = false;
        if (r.error) {
          if (errEl) errEl.textContent = 'Erro ao salvar cartão: ' + r.error.message;
          return;
        }

        formCartao.reset();
        var dlg = document.getElementById('dlgCartao');
        if (dlg) dlg.close();
        await recarregarCartoes();
      } catch (err) {
        btnSubmit.disabled = false;
        if (errEl) errEl.textContent = 'Erro ao se conectar ao banco.';
      }
    });
  }

  // ---------- Registrar Gasto ----------
  var formGasto = document.getElementById('formGasto');
  if (formGasto) {
    // Ao abrir modal, atualizar nome do cartão no subtítulo
    var btnNovoGasto = document.getElementById('btnNovoGasto');
    if (btnNovoGasto) {
      btnNovoGasto.addEventListener('click', function () {
        var sub = document.getElementById('gastoCartaoNome');
        if (sub) {
          var idCartao = window.BankSanCartoes ? window.BankSanCartoes.atual() : null;
          sub.textContent = idCartao ? 'Lançando no cartão selecionado' : 'Selecione um cartão primeiro';
        }
      });
    }

    formGasto.addEventListener('submit', async function (e) {
      e.preventDefault();
      var errEl = formGasto.querySelector('.dlg-erro');
      if (errEl) errEl.textContent = '';

      if (!usuarioAtual || !window.bankSanDb) {
        if (errEl) errEl.textContent = 'Entre na sua conta para registrar gastos.';
        return;
      }

      var cartaoId = window.BankSanCartoes ? window.BankSanCartoes.atual() : null;
      if (!cartaoId) {
        if (errEl) errEl.textContent = 'Nenhum cartão selecionado. Adicione um cartão primeiro.';
        return;
      }

      var desc = formGasto.elements.descricao.value.trim();
      var cat = formGasto.elements.categoria.value.trim();
      var val = parseFloat(formGasto.elements.valor.value);
      var data = formGasto.elements.data.value;

      if (!desc || isNaN(val) || val <= 0 || !data) {
        if (errEl) errEl.textContent = 'Preencha todos os campos obrigatórios corretamente.';
        return;
      }

      var btnSubmit = formGasto.querySelector('[type=submit]');
      btnSubmit.disabled = true;

      try {
        var r = await window.bankSanDb.from('gastos').insert({
          user_id: usuarioAtual.id,
          cartao_id: cartaoId,
          descricao: desc,
          categoria: cat || null,
          valor: val,
          data: data
        });

        btnSubmit.disabled = false;
        if (r.error) {
          if (errEl) errEl.textContent = 'Erro ao salvar gasto: ' + r.error.message;
          return;
        }

        formGasto.reset();
        var dlg = document.getElementById('dlgGasto');
        if (dlg) dlg.close();
        await recarregarCartoes();
      } catch (err) {
        btnSubmit.disabled = false;
        if (errEl) errEl.textContent = 'Erro ao conectar ao banco.';
      }
    });
  }

  // ---------- Alterar Senha ----------
  var formSenha = document.getElementById('formSenha');
  if (formSenha) {
    formSenha.addEventListener('submit', async function (e) {
      e.preventDefault();
      var errEl = formSenha.querySelector('.dlg-erro');
      if (errEl) errEl.textContent = '';

      var nova = formSenha.elements.nova.value;
      var repete = formSenha.elements.repete.value;

      if (nova.length < 8) {
        if (errEl) errEl.textContent = 'A senha deve ter pelo menos 8 caracteres.';
        return;
      }
      if (nova !== repete) {
        if (errEl) errEl.textContent = 'As duas senhas não coincidem.';
        return;
      }

      if (!usuarioAtual || !window.bankSanDb) {
        if (errEl) errEl.textContent = 'Você precisa estar conectado para alterar a senha.';
        return;
      }

      var btnSubmit = formSenha.querySelector('[type=submit]');
      btnSubmit.disabled = true;

      try {
        var r = await window.bankSanDb.auth.updateUser({ password: nova });
        btnSubmit.disabled = false;
        if (r.error) {
          if (errEl) errEl.textContent = 'Erro ao atualizar senha: ' + r.error.message;
          return;
        }
        alert('Senha alterada com sucesso!');
        formSenha.reset();
        var dlg = document.getElementById('dlgSenha');
        if (dlg) dlg.close();
      } catch (err) {
        btnSubmit.disabled = false;
        if (errEl) errEl.textContent = 'Erro de comunicação ao atualizar senha.';
      }
    });
  }

  // ---------- Excluir Conta ----------
  var btnExcluir = document.getElementById('btnExcluir');
  if (btnExcluir) {
    btnExcluir.addEventListener('click', async function () {
      if (!usuarioAtual || !window.bankSanDb) {
        alert('Nenhuma conta conectada para excluir.');
        return;
      }
      if (confirm('Tem certeza absoluta que deseja excluir sua conta? Todos os seus cartões e gastos serão apagados permanentemente.')) {
        btnExcluir.disabled = true;
        btnExcluir.textContent = 'Excluindo...';
        try {
          var r = await window.bankSanDb.rpc('delete_my_account');
          if (r.error) {
            alert('Não foi possível excluir a conta: ' + r.error.message);
            btnExcluir.disabled = false;
            btnExcluir.textContent = 'Excluir conta';
            return;
          }
          await window.bankSanDb.auth.signOut();
          alert('Sua conta foi excluída com sucesso.');
          location.href = 'src/pages/cadastro.html';
        } catch (err) {
          alert('Erro ao tentar excluir a conta.');
          btnExcluir.disabled = false;
          btnExcluir.textContent = 'Excluir conta';
        }
      }
    });
  }

  // Inicializar
  obterSessao().then(function (session) {
    if (session) {
      carregarDadosUsuario(session);
    } else {
      configurarVisitante();
    }
  });
})();

