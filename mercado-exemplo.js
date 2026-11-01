// Bank-San | Dados de EXEMPLO (empresas fictícias). Troque por dados reais quando o backend de mercado existir.
window.BankSanMercado = {
  ativos: [
    { t: 'ALFA3',  nome: 'Alfa Energia',      tipo: 'Ação', setor: 'Energia',     preco: 32.40,  dia: 1.2,  dy: 6.1, pl: 8.4,  pvp: 1.3,  roe: 15.5 },
    { t: 'BETA4',  nome: 'Beta Bancos',       tipo: 'Ação', setor: 'Financeiro',  preco: 41.10,  dia: -0.8, dy: 7.5, pl: 7.1,  pvp: 1.1,  roe: 16.0 },
    { t: 'GAMA3',  nome: 'Gama Varejo',       tipo: 'Ação', setor: 'Varejo',      preco: 12.80,  dia: 2.4,  dy: 1.2, pl: 21.0, pvp: 2.2,  roe: 6.0 },
    { t: 'DELT3',  nome: 'Delta Mineração',   tipo: 'Ação', setor: 'Materiais',   preco: 68.90,  dia: -1.5, dy: 9.3, pl: 5.9,  pvp: 1.6,  roe: 22.0 },
    { t: 'ZETA11', nome: 'Zeta Logística',    tipo: 'FII',  setor: 'Logística',   preco: 98.20,  dia: 0.3,  dy: 8.8, pl: null, pvp: 0.95, roe: null },
    { t: 'OMEG11', nome: 'Ômega Shoppings',   tipo: 'FII',  setor: 'Shoppings',   preco: 104.50, dia: -0.2, dy: 7.9, pl: null, pvp: 0.9,  roe: null },
    { t: 'TETA11', nome: 'Teta Índice Brasil', tipo: 'ETF', setor: 'Índice',      preco: 118.30, dia: 0.7,  dy: 0,   pl: null, pvp: null, roe: null }
  ],
  noticias: [
    { cat: 'Juros', titulo: 'Exemplo: Copom mantém o rumo da taxa básica', resumo: 'Texto ilustrativo. As notícias reais entram quando o feed for conectado.', quando: 'hoje' },
    { cat: 'Bolsa', titulo: 'Exemplo: Ibovespa fecha o dia em alta moderada', resumo: 'Texto ilustrativo sobre o movimento do mercado de ações.', quando: 'hoje' },
    { cat: 'FIIs', titulo: 'Exemplo: fundos imobiliários anunciam rendimentos do mês', resumo: 'Texto ilustrativo sobre distribuição de rendimentos.', quando: 'ontem' },
    { cat: 'Cripto', titulo: 'Exemplo: bitcoin oscila após dados de inflação', resumo: 'Texto ilustrativo sobre criptomoedas.', quando: 'ontem' }
  ]
};
