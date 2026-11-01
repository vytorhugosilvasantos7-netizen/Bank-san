// Bank-San | Entrar com Supabase Auth
(function () {
  'use strict';

  var form = document.getElementById('formEntrada');
  var msg = document.getElementById('msgEntrada');
  var botao = form.querySelector('[type=submit]');
  function aviso(texto, erro) { msg.textContent = texto; msg.style.color = erro ? 'var(--down)' : 'inherit'; }

  // Quem já está logado vai direto para o início
  if (window.bankSanConfigurado) {
    window.bankSanDb.auth.getSession().then(function (r) {
      if (r.data.session) location.replace('../../index.html');
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
    var r = await window.bankSanDb.auth.signInWithPassword({
      email: form.elements.email.value.trim(),
      password: form.elements.password.value
    });
    botao.disabled = false;
    if (r.error) {
      aviso(/invalid login/i.test(r.error.message) ? 'E-mail ou senha incorretos.' : /not confirmed/i.test(r.error.message) ? 'Confirme seu e-mail antes de entrar.' : 'Não foi possível entrar: ' + r.error.message, true);
      return;
    }
    window.bankSanSairDoModoTeste();
    location.href = '../../index.html';
  });

  // Entrar para testar: convidado de verdade, ou demonstração se o servidor não permitir
  var btnTeste = document.getElementById('btnConvidado');
  var msgTeste = document.getElementById('msgConvidado');
  var textoOriginal = msgTeste.textContent;
  btnTeste.addEventListener('click', async function () {
    btnTeste.disabled = true;
    msgTeste.style.color = 'inherit';
    msgTeste.textContent = 'Preparando o teste...';
    await window.bankSanEntrarParaTestar();
    location.href = '../../index.html';
    setTimeout(function () { btnTeste.disabled = false; msgTeste.textContent = textoOriginal; }, 4000);
  });
})();
