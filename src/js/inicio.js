// Bank-San | Início
(function () {
  'use strict';

  // ---------- Troca de telas (Início e Configurações) ----------
  var views = document.querySelectorAll('.view');
  var menuItems = document.querySelectorAll('.menu-item');

  function mostrar(nome) {
    views.forEach(function (v) { v.classList.toggle('is-active', v.id === 'view-' + nome); });
    menuItems.forEach(function (b) { b.classList.toggle('is-active', b.dataset.view === nome); });
  }
  menuItems.forEach(function (b) {
    b.addEventListener('click', function () { mostrar(b.dataset.view); });
  });
  document.getElementById('btnPerfil').addEventListener('click', function () { mostrar('config'); });

  // ---------- Tema preto e branco ----------
  var swTema = document.getElementById('swTema');
  function aplicarTema(t) {
    document.documentElement.setAttribute('data-theme', t);
    swTema.classList.toggle('is-on', t === 'light');
    swTema.setAttribute('aria-checked', t === 'light');
  }
  try { aplicarTema(localStorage.getItem('bs-tema') || 'dark'); } catch (e) { aplicarTema('dark'); }
  swTema.addEventListener('click', function () {
    var novo = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    aplicarTema(novo);
    try { localStorage.setItem('bs-tema', novo); } catch (e) {}
  });

  // ---------- Notificações ----------
  var swNotif = document.getElementById('swNotif');
  swNotif.addEventListener('click', function () {
    var on = swNotif.classList.toggle('is-on');
    swNotif.setAttribute('aria-checked', on);
  });

  // ---------- Foto de perfil ----------
  document.getElementById('inputFoto').addEventListener('change', function (e) {
    var arq = e.target.files[0];
    if (!arq) return;
    var leitor = new FileReader();
    leitor.onload = function () {
      var foto = document.getElementById('fotoPerfil');
      foto.textContent = '';
      foto.style.backgroundImage = 'url(' + leitor.result + ')';
    };
    leitor.readAsDataURL(arq);
  });

  // ---------- Diálogos / Janelas modais ----------
  document.querySelectorAll('[data-fechar]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var dlg = btn.closest('dialog');
      if (dlg) dlg.close();
    });
  });

  var btnNovoCartao = document.getElementById('btnNovoCartao');
  if (btnNovoCartao) {
    btnNovoCartao.addEventListener('click', function () {
      var dlg = document.getElementById('dlgCartao');
      if (dlg) dlg.showModal();
    });
  }

  var btnNovoGasto = document.getElementById('btnNovoGasto');
  if (btnNovoGasto) {
    btnNovoGasto.addEventListener('click', function () {
      var dlg = document.getElementById('dlgGasto');
      if (dlg) dlg.showModal();
    });
  }

  var btnSenha = document.getElementById('btnSenha');
  if (btnSenha) {
    btnSenha.addEventListener('click', function () {
      var dlg = document.getElementById('dlgSenha');
      if (dlg) dlg.showModal();
    });
  }
})();
