// Bank-San | Calendário de proventos conectado à carteira manual
(function () {
  'use strict';
  var A = window.BankSanAreas;
  if (!A) return;
  var $ = A.$;
  var STORAGE_KEY = 'bs-proventos';
  var mes = new Date();
  mes.setDate(1);
  var diaSelecionado = '';
  var eventos = [];
  var erroLeitura = false;

  try {
    var salvos = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    eventos = Array.isArray(salvos) ? salvos.filter(eventoValido) : [];
  } catch (e) {
    erroLeitura = true;
  }

  A.view('calendar',
    '<article class="card dividend-calendar">' +
      '<header class="card-head calendar-heading"><div><p class="area-eyebrow">AGENDA DO INVESTIDOR</p><h2>Calendário de proventos</h2><p class="chart-name">Organize datas e estimativas dos ativos que você cadastrou na carteira.</p></div>' +
      '<div class="nav-mes"><button class="btn-small" id="mAnt" type="button" aria-label="Mês anterior">←</button><strong id="mNome" aria-live="polite"></strong><button class="btn-small" id="mProx" type="button" aria-label="Próximo mês">→</button></div></header>' +
      '<p class="aviso-edu calendar-data-note">As previsões são cadastradas por você e ficam salvas neste navegador. O Bank-San não está conectado à corretora nem confirma comunicados dos emissores. A estimativa usa a quantidade atual da carteira e não garante o recebimento.</p>' +
      '<div class="calendar-kpis" aria-label="Resumo do mês"><div><span>Proventos previstos</span><strong id="calendarTotal">R$ 0,00</strong></div><div><span>Eventos no mês</span><strong id="calendarEventCount">0</strong></div><div><span>Ativos acompanhados</span><strong id="calendarAssetCount">0</strong></div></div>' +
      '<div class="calendar-layout"><section class="calendar-month" aria-label="Calendário mensal"><div class="calendar-month-head"><span>Selecione um dia para filtrar a agenda</span><button class="btn-small" id="calendarClearDay" type="button" hidden>Limpar dia</button></div><div class="calendar-weekdays" aria-hidden="true"><span>Dom</span><span>Seg</span><span>Ter</span><span>Qua</span><span>Qui</span><span>Sex</span><span>Sáb</span></div><div id="calendarDays" class="calendar-days"></div><p class="calendar-legend"><i aria-hidden="true"></i> Dia com provento previsto</p></section>' +
      '<aside class="calendar-agenda"><div class="calendar-agenda-head"><div><p class="area-eyebrow">SUA AGENDA</p><h3 id="calendarAgendaTitle">Proventos do mês</h3></div><button class="btn-small" type="button" id="calendarPortfolioLink">Minha carteira</button></div><div id="calendarAgendaList" class="calendar-agenda-list" aria-live="polite"></div></aside></div>' +
      '<details class="calendar-form-details" id="calendarFormDetails"><summary>+ Registrar provento previsto</summary><form id="calendarForm" class="calendar-form">' +
        '<label for="calendarAsset">Ativo da carteira<select id="calendarAsset" required></select></label>' +
        '<label for="calendarType">Tipo<select id="calendarType"><option>Dividendo</option><option>JCP</option><option>Rendimento de FII</option><option>Outro</option></select></label>' +
        '<label for="calendarPaymentDate">Data prevista de pagamento<input id="calendarPaymentDate" type="date" required></label>' +
        '<label for="calendarRecordDate">Data-com (opcional)<input id="calendarRecordDate" type="date"></label>' +
        '<label for="calendarRate">Valor previsto por ação/cota (R$)<input id="calendarRate" type="number" min="0.0001" step="0.0001" inputmode="decimal" placeholder="Ex.: 0,50" required></label>' +
        '<button class="btn" type="submit" id="calendarSave">Adicionar à agenda</button></form><p class="calendar-form-note" id="calendarFormNote">O valor total estimado será calculado pela quantidade atual deste ativo na carteira.</p></details>' +
      '<p class="calendar-status" id="calendarStatus" role="status" aria-live="polite"></p>' +
    '</article>'
  );

  function eventoValido(evento) {
    return evento && typeof evento.id === 'string' && typeof evento.ticker === 'string' &&
      typeof evento.tipo === 'string' && dataValida(evento.pagamento) &&
      (evento.dataCom === '' || dataValida(evento.dataCom)) &&
      Number.isFinite(Number(evento.valorUnitario)) && Number(evento.valorUnitario) > 0;
  }

  function dataValida(valor) {
    if (typeof valor !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) return false;
    var partes = valor.split('-').map(Number);
    var data = new Date(partes[0], partes[1] - 1, partes[2]);
    return data.getFullYear() === partes[0] && data.getMonth() === partes[1] - 1 && data.getDate() === partes[2];
  }

  function dataLocal(valor) {
    var partes = valor.split('-').map(Number);
    return new Date(partes[0], partes[1] - 1, partes[2]);
  }

  function dataISO(data) {
    return [data.getFullYear(), String(data.getMonth() + 1).padStart(2, '0'), String(data.getDate()).padStart(2, '0')].join('-');
  }

  function formatarData(valor) {
    return dataLocal(valor).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function moeda(valor) {
    return Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function posicoes() {
    return Array.isArray(A.carteira) ? A.carteira : [];
  }

  function quantidadeDoAtivo(ticker) {
    return posicoes().filter(function (posicao) { return posicao.t === ticker; })
      .reduce(function (total, posicao) { return total + Number(posicao.q || 0); }, 0);
  }

  function nomesAtivos() {
    return posicoes().reduce(function (lista, posicao) {
      if (posicao.t && quantidadeDoAtivo(posicao.t) > 0 && lista.indexOf(posicao.t) === -1) lista.push(posicao.t);
      return lista;
    }, []);
  }

  function salvar() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(eventos));
      return true;
    } catch (e) {
      status('Não foi possível salvar neste navegador. Confira o espaço disponível e tente novamente.', true);
      return false;
    }
  }

  function status(mensagem, erro) {
    var elemento = $('#calendarStatus');
    elemento.textContent = mensagem;
    elemento.classList.toggle('is-error', Boolean(erro));
  }

  function listarEventosDoMes() {
    var ano = mes.getFullYear(), numeroMes = mes.getMonth();
    return eventos.filter(function (evento) {
      var data = dataLocal(evento.pagamento);
      return data.getFullYear() === ano && data.getMonth() === numeroMes;
    }).sort(function (a, b) {
      return a.pagamento.localeCompare(b.pagamento) || a.ticker.localeCompare(b.ticker);
    });
  }

  function atualizarAtivos() {
    var seletor = $('#calendarAsset');
    var ativos = nomesAtivos();
    seletor.replaceChildren();
    if (!ativos.length) {
      var vazio = document.createElement('option');
      vazio.value = '';
      vazio.textContent = 'Adicione um ativo na carteira primeiro';
      vazio.disabled = true;
      vazio.selected = true;
      seletor.appendChild(vazio);
      seletor.disabled = true;
      $('#calendarSave').disabled = true;
      $('#calendarFormNote').textContent = 'Cadastre uma posição em Minha carteira para vinculá-la a um provento.';
      return;
    }
    ativos.forEach(function (ticker) {
      var option = document.createElement('option');
      option.value = ticker;
      option.textContent = ticker + ' · ' + quantidadeDoAtivo(ticker).toLocaleString('pt-BR', { maximumFractionDigits: 6 }) + ' em carteira';
      seletor.appendChild(option);
    });
    seletor.disabled = false;
    $('#calendarSave').disabled = false;
    $('#calendarFormNote').textContent = 'O valor total estimado será calculado pela quantidade atual deste ativo na carteira.';
  }

  function desenharCalendario(lista) {
    var grade = $('#calendarDays');
    grade.replaceChildren();
    var primeiroDia = mes.getDay();
    var diasNoMes = new Date(mes.getFullYear(), mes.getMonth() + 1, 0).getDate();
    var hoje = new Date();
    var porDia = lista.reduce(function (grupos, evento) {
      var dia = dataLocal(evento.pagamento).getDate();
      grupos[dia] = (grupos[dia] || 0) + 1;
      return grupos;
    }, {});

    for (var vazio = 0; vazio < primeiroDia; vazio++) {
      var espaco = document.createElement('span');
      espaco.className = 'calendar-day is-empty';
      espaco.setAttribute('aria-hidden', 'true');
      grade.appendChild(espaco);
    }
    for (var dia = 1; dia <= diasNoMes; dia++) {
      var valorData = dataISO(new Date(mes.getFullYear(), mes.getMonth(), dia));
      var botao = document.createElement('button');
      botao.type = 'button';
      botao.className = 'calendar-day';
      botao.setAttribute('aria-label', dia + (porDia[dia] ? ', ' + porDia[dia] + (porDia[dia] === 1 ? ' provento previsto' : ' proventos previstos') : ''));
      if (hoje.getFullYear() === mes.getFullYear() && hoje.getMonth() === mes.getMonth() && hoje.getDate() === dia) botao.classList.add('is-today');
      if (valorData === diaSelecionado) {
        botao.classList.add('is-selected');
        botao.setAttribute('aria-pressed', 'true');
      } else {
        botao.setAttribute('aria-pressed', 'false');
      }
      var numero = document.createElement('span');
      numero.textContent = String(dia);
      botao.appendChild(numero);
      if (porDia[dia]) {
        botao.classList.add('has-event');
        var quantidade = document.createElement('small');
        quantidade.textContent = String(porDia[dia]);
        quantidade.setAttribute('aria-hidden', 'true');
        botao.appendChild(quantidade);
      }
      botao.dataset.date = valorData;
      grade.appendChild(botao);
    }
  }

  function desenharAgenda() {
    var lista = listarEventosDoMes();
    var ativos = nomesAtivos();
    var titulo = mes.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    $('#mNome').textContent = titulo.charAt(0).toLocaleUpperCase('pt-BR') + titulo.slice(1);
    $('#calendarAssetCount').textContent = String(ativos.length);
    $('#calendarEventCount').textContent = String(lista.length);
    $('#calendarTotal').textContent = moeda(lista.reduce(function (total, evento) {
      return total + quantidadeDoAtivo(evento.ticker) * Number(evento.valorUnitario);
    }, 0));
    $('#calendarAgendaTitle').textContent = diaSelecionado
      ? 'Dia ' + dataLocal(diaSelecionado).getDate() + ' · ' + titulo
      : 'Proventos do mês';
    $('#calendarClearDay').hidden = !diaSelecionado;
    desenharCalendario(lista);

    var agenda = $('#calendarAgendaList');
    agenda.replaceChildren();
    var filtrados = lista.filter(function (evento) { return !diaSelecionado || evento.pagamento === diaSelecionado; });
    if (!filtrados.length) {
      var vazio = document.createElement('p');
      vazio.className = 'calendar-empty';
      vazio.textContent = diaSelecionado ? 'Nenhum provento previsto neste dia.' : 'Nenhum evento cadastrado neste mês. Use “Registrar provento previsto” para adicionar um.';
      agenda.appendChild(vazio);
      return;
    }

    filtrados.forEach(function (evento) {
      var quantidade = quantidadeDoAtivo(evento.ticker);
      var item = document.createElement('article');
      item.className = 'calendar-event';
      var cabecalho = document.createElement('div');
      cabecalho.className = 'calendar-event-head';
      var ticker = document.createElement('strong');
      ticker.textContent = evento.ticker;
      var tipo = document.createElement('span');
      tipo.className = 'calendar-event-type';
      tipo.textContent = evento.tipo;
      cabecalho.append(ticker, tipo);

      var pagamento = document.createElement('p');
      pagamento.className = 'calendar-event-date';
      pagamento.textContent = 'Pagamento previsto: ' + formatarData(evento.pagamento);
      item.append(cabecalho, pagamento);
      if (evento.dataCom) {
        var dataCom = document.createElement('p');
        dataCom.className = 'calendar-event-date';
        dataCom.textContent = 'Data-com: ' + formatarData(evento.dataCom);
        item.appendChild(dataCom);
      }

      var valor = document.createElement('div');
      valor.className = 'calendar-event-value';
      var porUnidade = document.createElement('span');
      porUnidade.textContent = moeda(evento.valorUnitario) + ' por ação/cota';
      var estimativa = document.createElement('strong');
      estimativa.textContent = quantidade
        ? moeda(quantidade * Number(evento.valorUnitario)) + ' estimados'
        : 'Ativo não está na carteira atualmente';
      valor.append(porUnidade, estimativa);
      item.appendChild(valor);

      var remover = document.createElement('button');
      remover.type = 'button';
      remover.className = 'btn-small calendar-event-remove';
      remover.dataset.removeEvent = evento.id;
      remover.textContent = 'Remover';
      remover.setAttribute('aria-label', 'Remover previsão de ' + evento.ticker + ' em ' + formatarData(evento.pagamento));
      item.appendChild(remover);
      agenda.appendChild(item);
    });
  }

  function desenhar() {
    atualizarAtivos();
    desenharAgenda();
  }

  $('#calendarForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var ticker = $('#calendarAsset').value;
    var pagamento = $('#calendarPaymentDate').value;
    var dataCom = $('#calendarRecordDate').value;
    var valorUnitario = Number($('#calendarRate').value);
    if (!ticker || nomesAtivos().indexOf(ticker) === -1) {
      status('Escolha um ativo que esteja cadastrado atualmente na carteira.', true);
      return;
    }
    if (!dataValida(pagamento) || (dataCom && (!dataValida(dataCom) || dataCom > pagamento)) || !(valorUnitario > 0)) {
      status('Confira as datas e informe um valor por ação/cota maior que zero.', true);
      return;
    }
    eventos.push({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
      ticker: ticker,
      tipo: $('#calendarType').value,
      pagamento: pagamento,
      dataCom: dataCom,
      valorUnitario: valorUnitario
    });
    if (!salvar()) {
      eventos.pop();
      return;
    }
    mes = dataLocal(pagamento);
    mes.setDate(1);
    diaSelecionado = pagamento;
    $('#calendarForm').reset();
    atualizarAtivos();
    desenharAgenda();
    status('Provento previsto adicionado e salvo neste navegador.');
  });

  $('#calendarDays').addEventListener('click', function (e) {
    var dia = e.target.closest('[data-date]');
    if (!dia) return;
    diaSelecionado = diaSelecionado === dia.dataset.date ? '' : dia.dataset.date;
    desenharAgenda();
  });
  $('#calendarAgendaList').addEventListener('click', function (e) {
    var botao = e.target.closest('[data-remove-event]');
    if (!botao) return;
    var indice = eventos.findIndex(function (evento) { return evento.id === botao.dataset.removeEvent; });
    if (indice < 0) return;
    var removido = eventos.splice(indice, 1)[0];
    if (!salvar()) {
      eventos.splice(indice, 0, removido);
      return;
    }
    desenharAgenda();
    status('Previsão removida.');
  });
  $('#calendarClearDay').addEventListener('click', function () {
    diaSelecionado = '';
    desenharAgenda();
  });
  $('#mAnt').addEventListener('click', function () {
    mes.setMonth(mes.getMonth() - 1);
    diaSelecionado = '';
    desenharAgenda();
  });
  $('#mProx').addEventListener('click', function () {
    mes.setMonth(mes.getMonth() + 1);
    diaSelecionado = '';
    desenharAgenda();
  });
  $('#calendarPortfolioLink').addEventListener('click', function () {
    if (window.BankSanNavegar) window.BankSanNavegar('carteira');
  });
  document.addEventListener('bs-carteira', desenhar);

  if (erroLeitura) status('Não foi possível ler as previsões salvas. Os dados armazenados não foram apagados.', true);
  desenhar();
})();
