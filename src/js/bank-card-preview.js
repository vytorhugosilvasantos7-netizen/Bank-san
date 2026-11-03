// Bank-San | Prévia do cartão no cadastro (versão à prova de falhas)
// - Não trava se faltar algum elemento: usa o que existe e avisa no Console qual faltou.
// - Roda dentro de uma função, então não dá conflito se o arquivo for incluído duas vezes.
(function () {
    "use strict";

    var banks = {
        itau: { name: "Itaú", mark: "IT", wordmark: "Itaú" },
        bradesco: { name: "Bradesco", mark: "B", wordmark: "Bradesco" },
        santander: { name: "Santander", mark: "S", wordmark: "Santander" },
        "banco-do-brasil": { name: "Banco do Brasil", mark: "BB", wordmark: "Banco do Brasil" },
        caixa: { name: "Caixa", mark: "C", wordmark: "CAIXA" },
        nubank: { name: "Nubank", mark: "nu", wordmark: "Nubank" },
        inter: { name: "Inter", mark: "i", wordmark: "inter" },
        c6: { name: "C6 Bank", mark: "C6", wordmark: "C6 Bank" },
        "bank-san": { name: "BANK-SAN", mark: "B", wordmark: "BANK-SAN" }
    };

    var area = document.querySelector("[data-card-preview]") || document;

    function achar(seletor, descricao, obrigatorio) {
        var el = area.querySelector(seletor) || document.querySelector(seletor);
        if (!el) {
            console.warn("[Bank-San] Prévia do cartão: não encontrei " + descricao + " (" + seletor + ") no HTML." + (obrigatorio ? " Sem ele a prévia não funciona." : ""));
        }
        return el;
    }

    var bankSelect = achar("#bank-select", "o campo de escolha do banco", true);
    var previewCard = achar("[data-tilt-card]", "o cartão", true);
    var holderInput = achar("#card-holder-input", "o campo de nome", false);
    var placeholder = achar("[data-card-placeholder]", "o aviso 'selecione um banco'", false);
    var cardHolder = achar("[data-card-holder]", "o nome no cartão", false);
    var cardBank = achar("[data-card-bank]", "o nome do banco no cartão", false);
    var cardMark = achar("[data-card-mark]", "a marca do banco no cartão", false);
    var cardWordmark = achar("[data-card-wordmark]", "o logotipo do banco no cartão", false);

    if (!bankSelect || !previewCard) return;

    function texto(el, valor) { if (el) el.textContent = valor; }

    function updatePreview() {
        var bank = banks[bankSelect.value];

        if (!bank) {
            if (placeholder) placeholder.hidden = false;
            previewCard.hidden = true;
            return;
        }

        if (placeholder) placeholder.hidden = true;
        texto(cardBank, bank.name);
        texto(cardMark, bank.mark);
        texto(cardWordmark, bank.wordmark);
        texto(cardHolder, holderInput && holderInput.value.trim() ? holderInput.value.trim() : "SEU NOME");
        previewCard.dataset.bank = bankSelect.value;
        previewCard.setAttribute("aria-label", "Prévia ilustrativa de cartão " + bank.name);
        previewCard.hidden = false;
    }

    bankSelect.addEventListener("change", updatePreview);
    if (holderInput) holderInput.addEventListener("input", updatePreview);

    // Estado inicial: mostra o que já está escolhido no campo
    updatePreview();
})();
