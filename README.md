# Bank-San | Backend com Supabase

O backend usa o Supabase: login, banco de dados e regras de segurança já vêm prontos.
O site continua em HTML/CSS/JS no GitHub Pages.

## Passo a passo

1. Crie uma conta em supabase.com e um projeto novo (guarde a senha do banco).
2. Abra **SQL Editor > New query**, cole todo o conteúdo de `schema.sql` (na raiz deste projeto) e clique em **Run**.
   Isso cria as tabelas `profiles`, `cartoes` e `gastos`, as regras de segurança (cada pessoa só vê os próprios dados),
   o perfil automático no cadastro e a função de excluir a própria conta. Se já tinha instalado uma versão anterior,
   rode o arquivo novamente para permitir cadastrar cartões sem informar dígitos.
3. Abra **Project Settings > API Keys** e copie:
   - a **Project URL**
   - a chave **Publishable** (`sb_publishable_...`). Se o painel só mostrar as chaves antigas, use a `anon`.
4. Cole os dois valores em `src/js/supabase-config.js`.
5. Abra **Authentication > URL Configuration** e coloque em **Site URL** o endereço do seu site no GitHub Pages
   (algo como `https://SEU-USUARIO.github.io/NOME-DO-REPOSITORIO/`).
6. Para a pessoa entrar direto após o cadastro, abra **Authentication > Sign In / Providers > Email**
   e desative **Confirm email**. Essa opção é uma configuração do projeto no Supabase e não pode ser
   alterada pelo código do site. Com ela desligada, o Supabase cria a sessão no cadastro e o site
   encaminha a pessoa para a página inicial. Cadastros já existentes que aguardam confirmação podem
   precisar ser confirmados ou recriados no Supabase.

## Regras de ouro

- No site só entra a chave **publishable** (ou `anon`). A chave **secret** e a `service_role` ficam fora do GitHub, sempre.
- O cadastro de cartões não pede número, últimos dígitos, senha nem código de segurança.
- O cadastro pede a data de nascimento e só aceita maiores de 18 anos (a regra vale na tela e no banco de dados).

## Arquivos

- `schema.sql`: tabelas, segurança e funções
- `src/js/supabase-config.js`: URL e chave do projeto (modo demonstração enquanto não preencher)
- `src/js/auth-cadastro.js` e `src/js/auth-entrada.js`: criar conta e entrar
- `src/js/app-dados.js`: cartões, gastos, sair, alterar senha, excluir conta, tema e notificações
- `src/js/news-feed.js`: manchetes atuais dos feeds RSS de mercados do Money Times, finanças e mundo do Valor Econômico e economia da Agência Brasil (EBC), processados pelo RSS2JSON para compatibilidade com o site estático

## Bancos e notícias do mercado

- A área de bancos e corretoras direciona aos sites oficiais. Não exibe taxas estimadas ou rentabilidade fixa; consulte sempre as condições atuais com a instituição.
- As manchetes vêm dos feeds RSS públicos de Money Times, Valor Econômico e Agência Brasil (EBC). O RSS2JSON converte os feeds para funcionar no site estático; são enviadas ao serviço somente as URLs públicas dos feeds, nunca dados da conta. É necessária uma conexão com a internet; se uma fonte estiver indisponível, as demais continuam disponíveis.
- As notícias são atualizadas ao abrir a página, manualmente pelo botão ou automaticamente a cada 15 minutos enquanto o site estiver aberto. Isso atualiza a consulta aos feeds; a publicação de novas matérias depende de cada veículo e não é garantida em tempo real.
- Quando o feed traz uma foto editorial segura do próprio veículo, uma manchete em destaque pode exibi-la com crédito. As outras manchetes continuam em texto; não são usados logotipos ou imagens genéricas como se fossem fotos da matéria. Os links abrem no veículo original. O conteúdo é informativo e não constitui recomendação de investimento.
- O gráfico BTC/USD usa uma série histórica demonstrativa informada no projeto, de maio de 2025 a abril de 2026. Não são cotações em tempo real nem indicação de compra ou venda.

## Radar e filtro de ativos

- O radar permite buscar por ticker, nome e setor; filtrar por classe (ação, FII ou ETF), faixa de preço, DY, P/L, P/VP e ROE; e ordenar os resultados pelas principais colunas.
- O resumo, a média de DY e a distribuição por setor acompanham os filtros aplicados. A distribuição mostra quantidade de ativos, não alocação ou peso de carteira.
- O universo atual de ativos e seus indicadores são fictícios e demonstrativos. Não são cotações atuais, avaliações de empresas nem recomendação de compra ou venda.

## Contas conectadas: painel do administrador e convidados (conta de teste)

O menu **Contas conectadas** aparece apenas para a conta autorizada como administradora no Supabase. Ele mostra quem criou conta, quem está online agora e quem entrou como convidado de teste. Isso monitora sessões no site; não conecta nem mostra contas bancárias.

1. No SQL Editor, rode o `src/admin.sql` (depois do `schema.sql`). Para atualizar o painel com o gráfico
   de evolução, rode novamente a versão mais recente de `src/admin.sql`; isso instala a função protegida
   `admin_evolucao()`.
2. Crie sua própria conta pela página **Criar conta** do site com o e-mail que será seu. Defina e guarde sua senha diretamente no site; não a envie por mensagem nem a coloque no código ou no SQL.
3. No SQL Editor, rode a linha abaixo trocando o endereço pelo mesmo e-mail cadastrado:
   `insert into public.admins (user_id) select id from auth.users where email = 'SEU-EMAIL@exemplo.com' on conflict do nothing;`
4. Saia e entre novamente no site. O item **Contas conectadas** aparecerá no menu dessa conta.
   O endereço direto é `src/pages/admin.html`.
5. Para o botão **Entrar como convidado** funcionar: em **Authentication > Sign In / Providers**,
   ligue **Anonymous sign-ins**. Ligue também o CAPTCHA (Cloudflare Turnstile ou hCaptcha) para ninguém
   encher o banco de convidados falsos.

O painel separa a lista de contas cadastradas da lista de convidados de teste e inclui um gráfico diário dos novos cadastros dos últimos 30 dias. O gráfico e as listas consultam dados reais do Supabase. O painel mostra nome, e-mail, tipo, data de criação, último acesso e se está online. O acesso é validado no banco de dados; conhecer o endereço do painel ou alterar o menu no navegador não concede permissão.
Não mostra senha, celular nem data de nascimento. Não guarda IP nem localização.
"Online" é quem mandou sinal nos últimos 90 segundos enquanto está logado. O site atualiza o sinal a cada 40 segundos e registra a tela aberta; ao ocultar a aba, encerra o sinal daquela sessão. O painel atualiza a atividade a cada 15 segundos e a lista de contas a cada 60 segundos.

Quem entra pelo modo demonstração (`?demo=1`), sem conta, não aparece: esse modo roda só no navegador da pessoa.

Privacidade (LGPD): como o site guarda e-mail e nome, vale ter um aviso curto de privacidade no cadastro
dizendo que o administrador consegue ver nome, e-mail e quando a conta está ativa.

## Contas manuais e planilha

- Os cartões cadastrados aparecem em **Minhas contas**. Ao abrir um cartão, o painel lista os gastos registrados nele e permite baixar a tabela em CSV, compatível com planilhas.
- Isso não conecta ao banco: não são solicitados login, senha bancária ou acesso à conta.
- A carteira de investimentos é preenchida manualmente e salva no navegador. Ela é exibida como carteira geral, sem associação a um banco ou cartão; os preços disponíveis são dados demonstrativos.
