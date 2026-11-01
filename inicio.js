// Bank-San | Início
(function () {
  'use strict';

  // ---------- Troca de telas (Início e Configurações) ----------
  var menuItems = document.querySelectorAll('.menu-item[data-view]');

  function mostrar(nome) {
    // consulta a cada troca porque as áreas são preenchidas por scripts separados
    document.querySelectorAll('.view').forEach(function (v) { v.classList.toggle('is-active', v.id === 'view-' + nome); });
    menuItems.forEach(function (b) { b.classList.toggle('is-active', b.dataset.view === nome); });
    var menuNoticias = document.querySelector('[data-news-menu]');
    if (menuNoticias) menuNoticias.classList.toggle('is-active', nome === 'noticias');
  }
  menuItems.forEach(function (b) {
    b.addEventListener('click', function () { mostrar(b.dataset.view); });
  });
  document.querySelectorAll('.submenu-item[data-view]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      mostrar(link.dataset.view);
      var aba = document.querySelector('[data-nt="' + link.dataset.newsTab + '"]');
      if (aba) aba.click();
      if (link.hash) history.replaceState(null, '', link.hash);
    });
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
})();
