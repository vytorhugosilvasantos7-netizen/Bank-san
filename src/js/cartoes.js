// Bank-San | Cartões e gastos por cartão
// Modo demonstração: usa os dados de exemplo abaixo.
// Com o Supabase ligado, app-dados.js chama BankSanCartoes.definir(...) com os dados reais.
(function () {
  'use strict';

  // ---------- DADOS DE EXEMPLO ----------
  // bank: nome usado no CSS do cartão (itau, nubank, inter, c6, bradesco, santander, banco-do-brasil, caixa, bank-san)
  var titular = 'SEU NOME';
  var cartoes = [
    {
      id: 'nubank', bank: 'nubank', nome: 'Nubank', cor: '#8a05be', tipo: 'Crédito', final: '4521', bandeira: 'Mastercard',
      gastos: [
        { desc: 'Mercado', cat: 'Alimentação', data: '18/10', valor: 187.90 },
        { desc: 'Streaming', cat: 'Assinaturas', data: '15/10', valor: 39.90 },
        { desc: 'Restaurante', cat: 'Alimentação', data: '12/10', valor: 82.00 }
      ]
    },
    {
      id: 'itau', bank: 'itau', nome: 'Itaú', cor: '#f58220', tipo: 'Débito', final: '8870', bandeira: 'Visa',
      gastos: [
        { desc: 'Combustível', cat: 'Transporte', data: '20/10', valor: 210.00 },
        { desc: 'Farmácia', cat: 'Saúde', data: '14/10', valor: 64.50 }
      ]
    },
    {
      id: 'inter', bank: 'inter', nome: 'Inter', cor: '#ff7a00', tipo: 'Crédito', final: '1136', bandeira: 'Mastercard',
      gastos: []
    }
  ];

  var VISA = '<svg width="50" height="16" viewBox="0 0 72 23" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Visa"><path d="M35.6495 0.413261L30.841 22.6604H25.0219L29.8376 0.413261H35.6495ZM60.1288 14.7776L63.1897 6.42214L64.9541 14.7776H60.1288ZM66.6178 22.6604H72L67.3044 0.413261H62.3374C62.3302 0.413261 62.3206 0.413261 62.3134 0.413261C61.2115 0.413261 60.2657 1.08065 59.8672 2.02829L59.86 2.04492L51.1336 22.6604H57.2409L58.4556 19.3353H65.9192L66.6178 22.6604ZM51.4337 15.3975C51.4577 9.52396 43.2259 9.20095 43.2835 6.57652C43.3028 5.7785 44.0686 4.92823 45.749 4.7121C46.0611 4.68123 46.4212 4.66223 46.7861 4.66223C48.4929 4.66223 50.111 5.04698 51.5514 5.73575L51.4865 5.70725L52.5068 0.988022C50.8912 0.368134 49.0211 0.00712515 47.067 0H47.0646C41.3126 0 37.2675 3.02819 37.2315 7.35791C37.1955 10.5595 40.1195 12.3431 42.3257 13.4119C44.5943 14.5021 45.3553 15.2027 45.3433 16.1741C45.3289 17.6704 43.538 18.3259 41.8624 18.352C41.7855 18.3544 41.6919 18.3544 41.6007 18.3544C39.5097 18.3544 37.5412 17.8343 35.8224 16.9151L35.8872 16.946L34.8333 21.8196C36.7202 22.5677 38.9072 23 41.1974 23C41.2334 23 41.2694 23 41.3054 23H41.3006C47.4126 23 51.4097 20.0146 51.4313 15.3903L51.4337 15.3975ZM27.3361 0.413261L17.9112 22.6604H11.7607L7.1227 4.90211C7.03388 4.03759 6.49853 3.31557 5.75433 2.95456L5.73993 2.94744C4.08829 2.14467 2.16778 1.49153 0.158443 1.08065L0 1.05452L0.139237 0.410885H10.0395C11.3886 0.410885 12.5097 1.38703 12.7186 2.66243L12.721 2.67668L15.172 15.5518L21.2265 0.408509L27.3361 0.413261Z" fill="currentColor"/></svg>';

  function moeda(v) {
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  // ---------- ELEMENTOS ----------
  var card = document.getElementById('cartaoAtual');
  var abas = document.getElementById('cartaoTabs');
  var lista = document.getElementById('listaGastos');
  var titulo = document.getElementById('gastosTitulo');
  var total = document.getElementById('gastosTotal');
  if (!card || !abas || !lista) return;

  var EXEMPLOS = cartoes;      // usados também quando a conta ainda não tem cartões
  var modoExemplo = false;
  var atual = null;
  function campo(nome) { return card.querySelector('[data-card-' + nome + ']'); }
  function achar(id) { return cartoes.filter(function (x) { return x.id === id; })[0]; }

  function vazio(texto) {
    lista.innerHTML = '';
    var li = document.createElement('li');
    li.className = 'expenses-vazio';
    li.textContent = texto;
    lista.appendChild(li);
  }

  // ---------- MOSTRAR UM CARTÃO ----------
  function mostrar(id) {
    var aviso = document.getElementById('avisoExemplo');
    if (aviso) aviso.hidden = !modoExemplo;
    var c = achar(id);
    if (!c) {
      atual = null;
      card.hidden = true;
      titulo.textContent = 'Gastos do cartão';
      total.textContent = moeda(0);
      vazio('Nenhum cartão cadastrado. Use "Adicionar cartão" para começar.');
      abas.querySelectorAll('.cartao-tab').forEach(function (b) { b.setAttribute('aria-selected', 'false'); });
      return;
    }
    atual = id;
    card.hidden = false;
    card.setAttribute('data-bank', c.bank);
    card.setAttribute('aria-label', 'Cartão ' + c.nome + ' final ' + c.final);
    campo('mark').textContent = c.nome.charAt(0).toUpperCase();
    campo('wordmark').textContent = c.nome.toUpperCase();
    campo('bank').textContent = c.nome.toUpperCase();
    campo('type').textContent = c.tipo.toUpperCase();
    campo('holder').textContent = titular;
    campo('number').textContent = '•••• •••• •••• ' + c.final;
    var rede = campo('network');
    if (c.bandeira === 'Visa') { rede.innerHTML = VISA; } else { rede.textContent = c.bandeira.toUpperCase(); }

    abas.querySelectorAll('.cartao-tab').forEach(function (b) {
      b.setAttribute('aria-selected', b.dataset.id === id ? 'true' : 'false');
    });

    var soma = 0;
    if (!c.gastos.length) {
      vazio('Nenhum gasto registrado neste cartão. Use "Registrar gasto" para adicionar o primeiro.');
    } else {
      lista.innerHTML = '';
      c.gastos.forEach(function (g) {
        soma += g.valor;
        var li = document.createElement('li');
        li.className = 'expense';
        var info = document.createElement('span');
        info.className = 'expense-info';
        var forte = document.createElement('strong');
        forte.textContent = g.desc;
        var peq = document.createElement('small');
        peq.textContent = g.data + ', ' + (g.cat || 'Sem categoria');
        info.appendChild(forte);
        info.appendChild(peq);
        var val = document.createElement('span');
        val.className = 'expense-value';
        val.textContent = moeda(g.valor);
        li.appendChild(info);
        li.appendChild(val);
        lista.appendChild(li);
      });
    }
    titulo.textContent = c.tipo === 'Crédito' ? 'Fatura atual' : 'Gastos no débito';
    total.textContent = moeda(soma);
  }

  // ---------- ABAS (uma por cartão) ----------
  function montarAbas() {
    abas.innerHTML = '';
    cartoes.forEach(function (c) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'cartao-tab';
      b.dataset.id = c.id;
      b.setAttribute('role', 'tab');
      b.style.setProperty('--dot', c.cor);
      var ponto = document.createElement('span');
      ponto.className = 'cartao-tab-dot';
      b.appendChild(ponto);
      b.appendChild(document.createTextNode(c.nome + ' ' + c.final));
      b.addEventListener('click', function () { mostrar(c.id); });
      abas.appendChild(b);
    });
  }

  // Clicar no cartão passa para o próximo
  function proximo() {
    if (!cartoes.length) return;
    var i = cartoes.findIndex(function (x) { return x.id === atual; });
    mostrar(cartoes[(i + 1) % cartoes.length].id);
  }
  card.setAttribute('tabindex', '0');
  card.addEventListener('click', proximo);
  card.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); proximo(); }
  });

  // ---------- INCLINAÇÃO 3D (mesmo efeito do cadastro) ----------
  var LIMITE = 10, ESCALA = 1.05;
  var semMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!semMovimento) {
    card.addEventListener('pointermove', function (e) {
      var r = card.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5;
      var y = (e.clientY - r.top) / r.height - 0.5;
      card.style.setProperty('--tilt-x', (-y * 2 * LIMITE).toFixed(2) + 'deg');
      card.style.setProperty('--tilt-y', (x * 2 * LIMITE).toFixed(2) + 'deg');
      card.style.setProperty('--tilt-scale', ESCALA);
    });
    card.addEventListener('pointerleave', function () {
      card.style.setProperty('--tilt-x', '0deg');
      card.style.setProperty('--tilt-y', '0deg');
      card.style.setProperty('--tilt-scale', 1);
    });
  }

  // ---------- API PARA O BACKEND ----------
  window.BankSanCartoes = {
    definir: function (novaLista, nome, manterId) {
      modoExemplo = !novaLista.length;
      cartoes = modoExemplo ? EXEMPLOS : novaLista;
      if (nome) titular = nome;
      montarAbas();
      mostrar(achar(manterId) ? manterId : (cartoes[0] ? cartoes[0].id : null));
    },
    atual: function () { return atual; },
    temCartoes: function () { return !modoExemplo && cartoes.length > 0; }
  };

  montarAbas();
  mostrar(cartoes[0].id);
})();
