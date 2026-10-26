// Bank-San | Cadastro com Supabase Auth
(function () {
  'use strict';

  var campoNome = document.getElementById('full-name');
  if (!campoNome) return;
  var form = campoNome.form;
  var botao = form.querySelector('[type=submit]');

  var msg = document.createElement('p');
  msg.setAttribute('role', 'status');
  msg.style.cssText = 'margin-top:12px;font-size:.9rem;line-height:1.4;';
  form.appendChild(msg);
  function aviso(texto, erro, isHtml) {
    if (isHtml) {
      msg.innerHTML = texto;
    } else {
      msg.textContent = texto;
    }
    msg.style.color = erro ? '#ef4444' : 'inherit';
  }

  // Alternar visualização da senha (ver / ocultar)
  document.querySelectorAll('.btn-toggle-pass').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var wrap = btn.closest('.password-wrap');
      if (!wrap) return;
      var input = wrap.querySelector('input');
      if (!input) return;

      var mostrar = input.type === 'password';
      input.type = mostrar ? 'text' : 'password';

      var openIcon = btn.querySelector('.eye-open');
      var closedIcon = btn.querySelector('.eye-closed');
      if (openIcon && closedIcon) {
        openIcon.style.display = mostrar ? 'none' : 'block';
        closedIcon.style.display = mostrar ? 'block' : 'none';
      }

      var rotulo = mostrar ? 'Ocultar senha' : 'Ver senha';
      btn.setAttribute('title', rotulo);
      btn.setAttribute('aria-label', rotulo);
    });
  });

  // Idade em anos completos a partir de "AAAA-MM-DD" (null se a data for inválida)
  function idade(iso) {
    var p = String(iso).split('-').map(Number);
    if (p.length !== 3 || !p[0] || !p[1] || !p[2]) return null;
    var h = new Date();
    var anos = h.getFullYear() - p[0];
    var meses = h.getMonth() + 1 - p[1];
    if (meses < 0 || (meses === 0 && h.getDate() < p[2])) anos -= 1;
    return anos;
  }

  // Não deixa escolher uma data no futuro
  var campoNasc = form.elements.birthDate;
  var hoje = new Date();
  campoNasc.max = hoje.getFullYear() + '-' + String(hoje.getMonth() + 1).padStart(2, '0') + '-' + String(hoje.getDate()).padStart(2, '0');

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    var anos = idade(campoNasc.value);
    if (anos === null || anos < 0 || anos > 120) {
      aviso('Informe uma data de nascimento válida.', true);
      return;
    }
    if (anos < 18) {
      aviso('Não é possível continuar com o cadastro, porque você é menor de idade.', true);
      return;
    }

    if (!window.bankSanConfigurado) {
      aviso('Modo demonstração: configure o Supabase em src/js/supabase-config.js para criar contas.', true);
      return;
    }
    botao.disabled = true;
    aviso('Criando sua conta...');

    var emailDigitado = form.elements.email.value.trim();
    var senhaDigitada = form.elements.password.value;

    var r = await window.bankSanDb.auth.signUp({
      email: emailDigitado,
      password: senhaDigitada,
      options: {
        data: {
          nome: form.elements.fullName.value.trim(),
          data_nascimento: campoNasc.value,
          celular: form.elements.phone.value
        }
      }
    });

    if (r.error) {
      botao.disabled = false;
      var m = r.error.message || '';
      if (/already registered/i.test(m) || /already exists/i.test(m)) {
        aviso('Este e-mail já tem uma conta. <a href="entrada.html" style="color:#f4f4f4; text-decoration:underline; font-weight:700; margin-left:4px;">Entrar agora →</a>', true, true);
      } else {
        aviso('Não foi possível criar a conta: ' + m, true);
      }
      return;
    }

    if (r.data.user && r.data.user.identities && r.data.user.identities.length === 0) {
      botao.disabled = false;
      aviso('Este e-mail já tem uma conta. <a href="entrada.html" style="color:#f4f4f4; text-decoration:underline; font-weight:700; margin-left:4px;">Entrar agora →</a>', true, true);
      return;
    }

    // Se já criou a sessão automaticamente
    if (r.data && r.data.session) {
      aviso('Conta criada com sucesso! Redirecionando para a tela inicial...', false);
      setTimeout(function () {
        location.href = '../../index.html';
      }, 400);
      return;
    }

    // Caso o Supabase não tenha retornado a sessão direto no signUp, realiza o login automático:
    try {
      var login = await window.bankSanDb.auth.signInWithPassword({
        email: emailDigitado,
        password: senhaDigitada
      });

      if (login.data && login.data.session) {
        aviso('Conta criada com sucesso! Entrando na sua conta...', false);
        setTimeout(function () {
          location.href = '../../index.html';
        }, 400);
        return;
      }

      if (login.error && /email not confirmed/i.test(login.error.message || '')) {
        botao.disabled = false;
        aviso('Conta criada! Como a confirmação de e-mail está ativa no Supabase, confirme o link enviado para seu e-mail (ou desative "Confirm email" nas configurações do Supabase para entrar direto).', false);
        return;
      }
    } catch (errLogin) {
      console.warn('Tentativa de login pós-cadastro:', errLogin);
    }

    // Se o usuário foi criado, vai direto para a tela inicial
    aviso('Conta criada com sucesso! Redirecionando...', false);
    setTimeout(function () {
      location.href = '../../index.html';
    }, 500);
  });
})();
