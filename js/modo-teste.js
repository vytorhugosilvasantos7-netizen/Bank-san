// Bank-San | "Entrar para testar" (usado na página de entrada e no cadastro)
// 1) Tenta criar um convidado de verdade (conta temporária, sem e-mail), que o administrador consegue ver.
// 2) Se o servidor não permitir (Supabase não configurado ou convidados desligados), abre a demonstração
//    com dados de exemplo, que roda só neste navegador.
(function () {
  'use strict';

  window.bankSanEntrarParaTestar = async function () {
    try {
      if (window.bankSanConfigurado) {
        var r = await window.bankSanDb.auth.signInAnonymously();
        if (!r.error) {
          try { sessionStorage.removeItem('bankSanDemo'); } catch (e) {}
          return 'convidado';
        }
      }
    } catch (e) { /* cai na demonstração */ }
    try { sessionStorage.setItem('bankSanDemo', 'true'); } catch (e) {}
    return 'demonstracao';
  };

  // Chamado depois de um login ou cadastro de verdade: a demonstração não vale mais
  window.bankSanSairDoModoTeste = function () {
    try { sessionStorage.removeItem('bankSanDemo'); } catch (e) {}
  };
})();
