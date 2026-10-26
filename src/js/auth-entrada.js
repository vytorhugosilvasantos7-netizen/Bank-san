// Bank-San | Entrada (Login) com Supabase Auth
(function () {
  'use strict';

  var form = document.getElementById('form-login');
  if (!form) return;

  var campoEmail = document.getElementById('email');
  var campoSenha = document.getElementById('password');
  var botao = form.querySelector('[type=submit]');
  var btnEsqueci = document.getElementById('btn-esqueci');

  var msg = document.createElement('p');
  msg.setAttribute('role', 'status');
  msg.style.cssText = 'margin-top:14px;font-size:.9rem;line-height:1.4;text-align:center;padding:10px;border-radius:8px;transition:all .2s ease;';
  form.appendChild(msg);

  function aviso(texto, tipo) {
    if (!texto) {
      msg.textContent = '';
      msg.style.display = 'none';
      return;
    }
    msg.style.display = 'block';
    msg.textContent = texto;
    if (tipo === 'erro') {
      msg.style.color = '#ef4444';
      msg.style.background = 'rgba(239, 68, 68, 0.12)';
      msg.style.border = '1px solid rgba(239, 68, 68, 0.3)';
    } else if (tipo === 'sucesso') {
      msg.style.color = '#22c55e';
      msg.style.background = 'rgba(34, 197, 94, 0.12)';
      msg.style.border = '1px solid rgba(34, 197, 94, 0.3)';
    } else {
      msg.style.color = '#f4f4f4';
      msg.style.background = 'rgba(255, 255, 255, 0.06)';
      msg.style.border = '1px solid rgba(255, 255, 255, 0.15)';
    }
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

  // Se já houver sessão ativa, vai direto para a tela inicial
  async function checarSessao() {
    if (!window.bankSanDb) return;
    try {
      var r = await window.bankSanDb.auth.getSession();
      if (r.data && r.data.session) {
        aviso('Você já está autenticado. Redirecionando...', 'sucesso');
        setTimeout(function () {
          location.href = '../../index.html';
        }, 600);
      }
    } catch (e) {
      // Sessão ausente ou offline
    }
  }

  checarSessao();

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    var email = campoEmail.value.trim();
    var password = campoSenha.value;

    if (!email || !password) {
      aviso('Preencha seu e-mail e sua senha para entrar.', 'erro');
      return;
    }

    if (!window.bankSanConfigurado || !window.bankSanDb) {
      aviso('Modo demonstração: configure as credenciais do Supabase em src/js/supabase-config.js.', 'erro');
      return;
    }

    botao.disabled = true;
    var textoOriginal = botao.querySelector('span:first-child').textContent;
    botao.querySelector('span:first-child').textContent = 'Entrando...';
    aviso('Validando dados de acesso...');

    try {
      var r = await window.bankSanDb.auth.signInWithPassword({
        email: email,
        password: password
      });

      botao.disabled = false;
      botao.querySelector('span:first-child').textContent = textoOriginal;

      if (r.error) {
        var m = r.error.message || '';
        if (/invalid login credentials/i.test(m)) {
          aviso('E-mail ou senha incorretos. Verifique suas informações e tente novamente.', 'erro');
        } else if (/email not confirmed/i.test(m)) {
          aviso('E-mail ainda não confirmado. Verifique o link de ativação enviado para sua caixa de entrada.', 'erro');
        } else if (/too many requests/i.test(m)) {
          aviso('Muitas tentativas em pouco tempo. Aguarde alguns minutos antes de tentar novamente.', 'erro');
        } else {
          aviso('Não foi possível entrar: ' + m, 'erro');
        }
        return;
      }

      if (r.data && r.data.session) {
        aviso('Login efetuado com sucesso! Entrando...', 'sucesso');
        setTimeout(function () {
          location.href = '../../index.html';
        }, 400);
      }
    } catch (err) {
      botao.disabled = false;
      botao.querySelector('span:first-child').textContent = textoOriginal;
      aviso('Erro de conexão ao tentar fazer login. Verifique sua internet.', 'erro');
    }
  });

  // Recuperação de senha
  if (btnEsqueci) {
    btnEsqueci.addEventListener('click', async function () {
      var email = campoEmail.value.trim();
      if (!email) {
        email = prompt('Digite seu e-mail cadastrado para receber o link de redefinição de senha:');
      }
      if (!email) return;

      if (!window.bankSanConfigurado || !window.bankSanDb) {
        aviso('Configure o Supabase em src/js/supabase-config.js para enviar o link de redefinição.', 'erro');
        return;
      }

      aviso('Enviando e-mail de recuperação...');
      try {
        var r = await window.bankSanDb.auth.resetPasswordForEmail(email.trim());
        if (r.error) {
          aviso('Não foi possível enviar o e-mail: ' + r.error.message, 'erro');
        } else {
          aviso('Se o e-mail estiver cadastrado, você receberá um link para redefinir sua senha.', 'sucesso');
        }
      } catch (err) {
        aviso('Erro ao enviar pedido de recuperação de senha.', 'erro');
      }
    });
  }
})();

