// Bank-San | Radar e filtros de ativos
(function () {
  'use strict';
  var A = window.BankSanAreas;
  if (!A) return;

  var M = A.M;
  var $ = A.$;
  var brl = A.brl;
  var num = A.num;
  var cor = A.cor;
  var view = A.view;
  var ativos = M.ativos || [];
  var ordenacao = { campo: 't', direcao: 1 };

  var vF = view('filtro', '<article class="card asset-screen-card">' +
    '<header class="card-head asset-screen-head"><div><p class="asset-kicker">CENTRAL DE ANÁLISE</p><h2>Radar de ativos</h2><p class="section-subtitle">Explore ações, fundos imobiliários e ETFs. Combine filtros para encontrar os indicadores que quer analisar.</p></div><span class="asset-live-label"><i aria-hidden="true"></i> Universo demonstrativo</span></header>' +
    A.AVISO +
    '<section class="asset-filter-panel" aria-label="Filtros de ativos">' +
    '<label class="asset-search"><span>Buscar por ticker ou nome</span><input id="fBusca" type="search" placeholder="Ex.: ALFA3, energia..." autocomplete="off"></label>' +
    '<div class="asset-type-filter" role="group" aria-label="Filtrar por tipo de ativo"><button type="button" class="asset-chip is-active" data-asset-type="" aria-pressed="true">Todos <span data-type-count="all"></span></button><button type="button" class="asset-chip" data-asset-type="Ação" aria-pressed="false">Ações <span data-type-count="Ação"></span></button><button type="button" class="asset-chip" data-asset-type="FII" aria-pressed="false">FIIs <span data-type-count="FII"></span></button><button type="button" class="asset-chip" data-asset-type="ETF" aria-pressed="false">ETFs <span data-type-count="ETF"></span></button></div>' +
    '<details class="asset-advanced" open><summary>Refinar indicadores <span>Preço, dividendos e fundamentos</span></summary><div class="asset-filter-grid">' +
    '<label>Setor<select id="fSetor"><option value="">Todos os setores</option></select></label>' +
    '<label>Preço mínimo<input id="fPrecoMin" type="number" min="0" step="0.01" placeholder="Sem mínimo"></label>' +
    '<label>Preço máximo<input id="fPrecoMax" type="number" min="0" step="0.01" placeholder="Sem máximo"></label>' +
    '<label>DY mínimo (%)<input id="fDy" type="number" min="0" step="0.1" placeholder="Sem mínimo"></label>' +
    '<label>P/L máximo<input id="fPl" type="number" min="0" step="0.1" placeholder="Sem máximo"></label>' +
    '<label>P/VP máximo<input id="fPvp" type="number" min="0" step="0.1" placeholder="Sem máximo"></label>' +
    '<label>ROE mínimo (%)<input id="fRoe" type="number" min="0" step="0.1" placeholder="Sem mínimo"></label>' +
    '<label class="asset-yield-toggle"><input id="fComDy" type="checkbox"><span>Mostrar apenas ativos com DY informado</span></label>' +
    '</div></details></section></article>' +
    '<div class="asset-screen-kpis" aria-label="Resumo dos resultados"><article class="card asset-kpi"><span>Ativos encontrados</span><strong id="fKpiAtivos">0</strong><small id="fKpiUniverso">de 0 disponíveis</small></article><article class="card asset-kpi"><span>Tipos no resultado</span><strong id="fKpiTipos">0</strong><small>Ações, FIIs e ETFs</small></article><article class="card asset-kpi"><span>DY médio do recorte</span><strong id="fKpiDy">—</strong><small>Entre os ativos com indicador informado</small></article></div>' +
    '<article class="card asset-sector-card"><header class="card-head"><div><h2>Distribuição por setor</h2><p class="section-subtitle">Quantidade de ativos no resultado atual; não representa peso de carteira.</p></div><span class="asset-sector-total" id="fSetorResumo">—</span></header><div class="asset-sector-chart" id="fSetorGrafico" role="group" aria-label="Distribuição dos resultados por setor"></div></article>' +
    '<article class="card asset-results-card"><header class="card-head asset-results-head"><div><h2>Resultados do filtro</h2><p class="section-subtitle" id="fQtd" aria-live="polite">Carregando ativos...</p></div><div class="asset-results-actions"><label>Ordenar por<select id="fOrdenar"><option value="t">Ticker (A–Z)</option><option value="setor">Setor (A–Z)</option><option value="dia">Variação do dia</option><option value="dy">DY</option><option value="preco">Preço</option><option value="pl">P/L</option><option value="pvp">P/VP</option><option value="roe">ROE</option></select></label><button class="btn-small" type="button" id="fLimpar">Limpar filtros</button></div></header>' +
    '<div class="tabela-area asset-table-wrap"><table class="tabela asset-table"><thead><tr><th scope="col"><button type="button" data-sort="t" aria-label="Ordenar por ticker">Ativo</button></th><th scope="col"><button type="button" data-sort="setor" aria-label="Ordenar por setor">Setor</button></th><th scope="col"><button type="button" data-sort="preco" aria-label="Ordenar por preço">Preço</button></th><th scope="col"><button type="button" data-sort="dia" aria-label="Ordenar por variação do dia">Dia</button></th><th scope="col"><button type="button" data-sort="dy" aria-label="Ordenar por dividend yield">DY</button></th><th scope="col"><button type="button" data-sort="pl" aria-label="Ordenar por preço sobre lucro">P/L</button></th><th scope="col"><button type="button" data-sort="pvp" aria-label="Ordenar por preço sobre valor patrimonial">P/VP</button></th><th scope="col"><button type="button" data-sort="roe" aria-label="Ordenar por ROE">ROE</button></th></tr></thead><tbody id="fCorpo"></tbody></table></div>' +
    '<p class="asset-table-note">— indica que o indicador não se aplica ou não está informado no conjunto demonstrativo.</p></article>');

  var busca = $('#fBusca', vF);
  var tipo = '';
  var setores = $('#fSetor', vF);
  var corpo = $('#fCorpo', vF);
  var campos = {
    fPrecoMin: $('#fPrecoMin', vF),
    fPrecoMax: $('#fPrecoMax', vF),
    fDy: $('#fDy', vF),
    fPl: $('#fPl', vF),
    fPvp: $('#fPvp', vF),
    fRoe: $('#fRoe', vF)
  };

  function adicionarCelula(linha, valor, classe) {
    var td = document.createElement('td');
    td.textContent = valor;
    if (classe) td.className = classe;
    linha.appendChild(td);
  }

  function numeroCampo(campo) {
    if (!campo.value.trim()) return null;
    var valor = Number(campo.value);
    return Number.isFinite(valor) ? valor : null;
  }

  function atualizarSetores() {
    var selecionado = setores.value;
    var nomes = Array.from(new Set(ativos.map(function (ativo) { return ativo.setor; }).filter(Boolean))).sort();
    setores.replaceChildren(new Option('Todos os setores', ''));
    nomes.forEach(function (nome) { setores.add(new Option(nome, nome)); });
    if (nomes.indexOf(selecionado) !== -1) setores.value = selecionado;
  }

  function passarFiltros() {
    var termo = busca.value.trim().toLocaleLowerCase('pt-BR');
    var precoMin = numeroCampo(campos.fPrecoMin);
    var precoMax = numeroCampo(campos.fPrecoMax);
    var dyMin = numeroCampo(campos.fDy);
    var plMax = numeroCampo(campos.fPl);
    var pvpMax = numeroCampo(campos.fPvp);
    var roeMin = numeroCampo(campos.fRoe);
    var somenteComDy = $('#fComDy', vF).checked;

    return ativos.filter(function (ativo) {
      var texto = (ativo.t + ' ' + ativo.nome + ' ' + (ativo.setor || '')).toLocaleLowerCase('pt-BR');
      return (!termo || texto.indexOf(termo) !== -1) &&
        (!tipo || ativo.tipo === tipo) &&
        (!setores.value || ativo.setor === setores.value) &&
        (precoMin === null || ativo.preco >= precoMin) &&
        (precoMax === null || ativo.preco <= precoMax) &&
        (dyMin === null || (ativo.dy !== null && ativo.dy !== undefined && ativo.dy >= dyMin)) &&
        (!somenteComDy || (ativo.dy !== null && ativo.dy !== undefined && ativo.dy > 0)) &&
        (plMax === null || (ativo.pl !== null && ativo.pl !== undefined && ativo.pl <= plMax)) &&
        (pvpMax === null || (ativo.pvp !== null && ativo.pvp !== undefined && ativo.pvp <= pvpMax)) &&
        (roeMin === null || (ativo.roe !== null && ativo.roe !== undefined && ativo.roe >= roeMin));
    }).sort(function (a, b) {
      var valorA = a[ordenacao.campo];
      var valorB = b[ordenacao.campo];
      if (valorA === null || valorA === undefined) return valorB === null || valorB === undefined ? 0 : 1;
      if (valorB === null || valorB === undefined) return -1;
      if (typeof valorA === 'string') return ordenacao.direcao * valorA.localeCompare(valorB, 'pt-BR');
      return ordenacao.direcao * (valorA - valorB);
    });
  }

  function desenharResumo(resultados) {
    var dy = resultados.filter(function (ativo) { return Number.isFinite(ativo.dy); });
    var tipos = new Set(resultados.map(function (ativo) { return ativo.tipo; }));
    $('#fKpiAtivos', vF).textContent = String(resultados.length);
    $('#fKpiUniverso', vF).textContent = 'de ' + ativos.length + ' disponíveis';
    $('#fKpiTipos', vF).textContent = String(tipos.size);
    $('#fKpiDy', vF).textContent = dy.length
      ? num(dy.reduce(function (soma, ativo) { return soma + ativo.dy; }, 0) / dy.length) + '%'
      : '—';
    $('#fQtd', vF).textContent = resultados.length === ativos.length
      ? resultados.length + (resultados.length === 1 ? ' ativo no universo demonstrativo' : ' ativos no universo demonstrativo')
      : resultados.length + (resultados.length === 1 ? ' ativo encontrado' : ' ativos encontrados') + ' de ' + ativos.length;
  }

  function desenharDistribuicao(resultados) {
    var grafico = $('#fSetorGrafico', vF);
    grafico.replaceChildren();
    var grupos = Object.create(null);
    resultados.forEach(function (ativo) {
      var nome = ativo.setor || 'Sem setor';
      grupos[nome] = (grupos[nome] || 0) + 1;
    });
    var linhas = Object.keys(grupos).map(function (nome) {
      return { nome: nome, quantidade: grupos[nome] };
    }).sort(function (a, b) { return b.quantidade - a.quantidade || a.nome.localeCompare(b.nome, 'pt-BR'); });
    $('#fSetorResumo', vF).textContent = linhas.length + (linhas.length === 1 ? ' setor' : ' setores');

    if (!linhas.length) {
      var vazio = document.createElement('p');
      vazio.className = 'asset-chart-empty';
      vazio.textContent = 'Ajuste os filtros para ver a distribuição por setor.';
      grafico.appendChild(vazio);
      return;
    }

    var maximo = linhas[0].quantidade;
    linhas.forEach(function (item) {
      var linha = document.createElement('div');
      linha.className = 'asset-sector-row';
      var rotulo = document.createElement('div');
      rotulo.className = 'asset-sector-label';
      var nome = document.createElement('span');
      nome.textContent = item.nome;
      var total = document.createElement('strong');
      total.textContent = String(item.quantidade);
      rotulo.append(nome, total);
      var trilha = document.createElement('div');
      trilha.className = 'asset-sector-track';
      var barra = document.createElement('span');
      barra.style.width = Math.max(4, item.quantidade / maximo * 100) + '%';
      trilha.appendChild(barra);
      linha.append(rotulo, trilha);
      grafico.appendChild(linha);
    });
  }

  function desenharTabela(resultados) {
    corpo.replaceChildren();
    if (!resultados.length) {
      var linhaVazia = document.createElement('tr');
      var mensagem = document.createElement('td');
      mensagem.colSpan = 8;
      mensagem.className = 'vazio';
      mensagem.textContent = 'Nenhum ativo corresponde a esses critérios. Tente ampliar ou limpar os filtros.';
      linhaVazia.appendChild(mensagem);
      corpo.appendChild(linhaVazia);
      return;
    }

    resultados.forEach(function (ativo) {
      var linha = document.createElement('tr');
      var identificacao = document.createElement('td');
      var ticker = document.createElement('strong');
      ticker.textContent = ativo.t;
      var nome = document.createElement('small');
      nome.textContent = ativo.nome + ' · ' + ativo.tipo;
      identificacao.append(ticker, nome);
      linha.appendChild(identificacao);
      adicionarCelula(linha, ativo.setor || '—');
      adicionarCelula(linha, brl(ativo.preco));
      adicionarCelula(linha, ativo.dia == null ? '—' : num(ativo.dia) + '%', cor(ativo.dia));
      adicionarCelula(linha, ativo.dy == null ? '—' : num(ativo.dy) + '%');
      adicionarCelula(linha, num(ativo.pl, 1));
      adicionarCelula(linha, num(ativo.pvp));
      adicionarCelula(linha, ativo.roe == null ? '—' : num(ativo.roe) + '%');
      corpo.appendChild(linha);
    });
  }

  function atualizar() {
    var resultados = passarFiltros();
    desenharResumo(resultados);
    desenharDistribuicao(resultados);
    desenharTabela(resultados);
    document.querySelectorAll('[data-asset-type]').forEach(function (botao) {
      var valor = botao.getAttribute('data-asset-type');
      var quantidade = valor
        ? ativos.filter(function (ativo) { return ativo.tipo === valor; }).length
        : ativos.length;
      var contador = botao.querySelector('[data-type-count]');
      if (contador) contador.textContent = String(quantidade);
      var selecionado = valor === tipo;
      botao.classList.toggle('is-active', selecionado);
      botao.setAttribute('aria-pressed', String(selecionado));
    });
    document.querySelectorAll('[data-sort]').forEach(function (botao) {
      var ativo = botao.getAttribute('data-sort') === ordenacao.campo;
      botao.parentElement.setAttribute('aria-sort', ativo ? (ordenacao.direcao > 0 ? 'ascending' : 'descending') : 'none');
    });
  }

  function limparFiltros() {
    busca.value = '';
    tipo = '';
    setores.value = '';
    Object.keys(campos).forEach(function (chave) { campos[chave].value = ''; });
    $('#fComDy', vF).checked = false;
    $('#fOrdenar', vF).value = 't';
    ordenacao = { campo: 't', direcao: 1 };
    atualizar();
  }

  busca.addEventListener('input', atualizar);
  setores.addEventListener('change', atualizar);
  Object.keys(campos).forEach(function (chave) {
    campos[chave].addEventListener('input', atualizar);
  });
  $('#fComDy', vF).addEventListener('change', atualizar);
  $('#fOrdenar', vF).addEventListener('change', function (evento) {
    var campo = evento.target.value;
    ordenacao = { campo: campo, direcao: campo === 't' || campo === 'setor' ? 1 : -1 };
    atualizar();
  });
  $('#fLimpar', vF).addEventListener('click', limparFiltros);
  vF.querySelectorAll('[data-asset-type]').forEach(function (botao) {
    botao.addEventListener('click', function () {
      tipo = botao.getAttribute('data-asset-type');
      atualizar();
    });
  });
  vF.querySelectorAll('[data-sort]').forEach(function (botao) {
    botao.addEventListener('click', function () {
      var campo = botao.getAttribute('data-sort');
      if (ordenacao.campo === campo) ordenacao.direcao *= -1;
      else ordenacao = { campo: campo, direcao: campo === 't' || campo === 'setor' ? 1 : -1 };
      $('#fOrdenar', vF).value = ativos.length && campo in ativos[0] ? campo : 't';
      atualizar();
    });
  });

  atualizarSetores();
  atualizar();
})();
