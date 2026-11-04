// Bank-San | Entrar com Supabase Auth
(function () {
  'use strict';

  var form = document.getElementById('formEntrada');
  var msg = document.getElementById('msgEntrada');
  var botao = form.querySelector('[type=submit]');
  var campoSenha = document.getElementById('senhaEntrada');
  var alternarSenha = document.getElementById('alternarSenha');
  function aviso(texto, erro) { msg.textContent = texto; msg.style.color = erro ? 'var(--down)' : 'inherit'; }

  alternarSenha.addEventListener('click', function () {
    var mostrar = campoSenha.type === 'password';
    campoSenha.type = mostrar ? 'text' : 'password';
    alternarSenha.textContent = mostrar ? 'Ocultar' : 'Mostrar';
    alternarSenha.setAttribute('aria-label', mostrar ? 'Ocultar senha' : 'Mostrar senha');
    alternarSenha.setAttribute('aria-pressed', String(mostrar));
  });

  // Quem já está logado vai direto para o início
  if (window.bankSanConfigurado) {
    window.bankSanDb.auth.getSession().then(function (r) {
      if (r.error) throw r.error;
      if (r.data.session) location.replace('../../index.html');
    }).catch(function () {
      aviso('Não foi possível verificar sua sessão. Confira sua conexão e tente novamente.', true);
    });
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    if (!window.bankSanConfigurado) {
      aviso('Modo demonstração: configure o Supabase em src/js/supabase-config.js para entrar.', true);
      return;
    }
    botao.disabled = true;
    aviso('Entrando...');
    try {
      var r = await window.bankSanDb.auth.signInWithPassword({
        email: form.elements.email.value.trim(),
        password: form.elements.password.value
      });
      if (r.error) {
        aviso(/invalid login/i.test(r.error.message) ? 'E-mail ou senha incorretos.' : /not confirmed/i.test(r.error.message) ? 'Esta conta ainda aguarda confirmação. O administrador precisa desativar “Confirm email” no Supabase e resolver o cadastro pendente.' : 'Não foi possível entrar. Confira seus dados e tente novamente.', true);
        return;
      }
      window.bankSanSairDoModoTeste();
      location.href = '../../index.html';
    } catch (erro) {
      aviso('Não foi possível conectar para entrar. Confira sua conexão e tente novamente.', true);
    } finally {
      botao.disabled = false;
    }
  });

  // Entrar para testar: convidado de verdade, ou demonstração se o servidor não permitir
  var btnTeste = document.getElementById('btnConvidado');
  var msgTeste = document.getElementById('msgConvidado');
  var textoOriginal = msgTeste.textContent;
  btnTeste.addEventListener('click', async function () {
    btnTeste.disabled = true;
    msgTeste.style.color = 'inherit';
    msgTeste.textContent = 'Preparando o teste...';
    try {
      await window.bankSanEntrarParaTestar();
      location.href = '../../index.html';
    } catch (erro) {
      msgTeste.style.color = 'var(--down)';
      msgTeste.textContent = 'Não foi possível iniciar o teste. Confira sua conexão e tente novamente.';
      btnTeste.disabled = false;
    }
  });
})();
