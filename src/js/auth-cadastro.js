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
  function aviso(texto, erro) { msg.textContent = texto; msg.style.color = erro ? '#ef4444' : 'inherit'; }

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

    try {
      var r = await window.bankSanDb.auth.signUp({
        email: form.elements.email.value.trim(),
        password: form.elements.password.value,
        options: {
          data: {
            nome: form.elements.fullName.value.trim(),
            data_nascimento: campoNasc.value,
            celular: form.elements.phone.value
          }
        }
      });

      if (r.error) {
        aviso('Não foi possível criar a conta. Confira os dados e tente novamente.', true);
        return;
      }
      if (r.data.user && r.data.user.identities && r.data.user.identities.length === 0) {
        aviso('Se o cadastro puder ser concluído, você receberá instruções por e-mail. Se já tiver conta, tente entrar.');
        return;
      }
      if (r.data.session) {
        if (window.bankSanSairDoModoTeste) window.bankSanSairDoModoTeste();
        location.href = '../../index.html';
      } else {
        aviso('O Supabase ainda está exigindo confirmação por e-mail. Para entrar direto, o administrador precisa desativar “Confirm email” em Authentication > Sign In / Providers > Email.', true);
      }
    } catch (erro) {
      aviso('Não foi possível conectar para criar a conta. Confira sua conexão e tente novamente.', true);
    } finally {
      botao.disabled = false;
    }
  });

  // ---------- Entrar para testar (sem criar conta) ----------
  var estilo = document.createElement('style');
  estilo.textContent =
    '.teste-bloco{margin-top:18px;padding-top:16px;border-top:1px solid rgba(255,255,255,.14);text-align:center}' +
    '.teste-bloco p{margin:0 0 10px;font-size:.88rem;color:rgba(255,255,255,.65)}' +
    '.teste-botao{width:100%;padding:12px 16px;border-radius:10px;border:1px solid rgba(255,255,255,.3);background:transparent;color:#fff;font:inherit;font-weight:600;cursor:pointer;transition:border-color .2s,background-color .2s,transform .2s}' +
    '.teste-botao:hover:not(:disabled){border-color:#fff;background:rgba(255,255,255,.06);transform:translateY(-1px)}' +
    '.teste-botao:disabled{opacity:.6;cursor:wait}';
  document.head.appendChild(estilo);

  var bloco = document.createElement('div');
  bloco.className = 'teste-bloco';
  var pergunta = document.createElement('p');
  pergunta.textContent = 'Quer só conhecer o site antes de criar sua conta?';
  var btnTeste = document.createElement('button');
  btnTeste.type = 'button';
  btnTeste.className = 'teste-botao';
  btnTeste.textContent = 'Entrar para testar';
  bloco.appendChild(pergunta);
  bloco.appendChild(btnTeste);
  form.insertAdjacentElement('afterend', bloco);

  btnTeste.addEventListener('click', async function () {
    btnTeste.disabled = true;
    btnTeste.textContent = 'Preparando o teste...';
    if (window.bankSanEntrarParaTestar) { await window.bankSanEntrarParaTestar(); }
    location.href = '../../index.html';
    setTimeout(function () { btnTeste.disabled = false; btnTeste.textContent = 'Entrar para testar'; }, 4000);
  });
})();
