# Bank-San | Backend com Supabase

O backend usa o Supabase: login, banco de dados e regras de segurança já vêm prontos.
O site continua em HTML/CSS/JS no GitHub Pages.

## Passo a passo

1. Crie uma conta em supabase.com e um projeto novo (guarde a senha do banco).
2. Abra **SQL Editor > New query**, cole todo o conteúdo de `backend/supabase/schema.sql` e clique em **Run**.
   Isso cria as tabelas `profiles`, `cartoes` e `gastos`, as regras de segurança (cada pessoa só vê os próprios dados),
   o perfil automático no cadastro e a função de excluir a própria conta.
3. Abra **Project Settings > API Keys** e copie:
   - a **Project URL**
   - a chave **Publishable** (`sb_publishable_...`). Se o painel só mostrar as chaves antigas, use a `anon`.
4. Cole os dois valores em `src/js/supabase-config.js`.
5. Abra **Authentication > URL Configuration** e coloque em **Site URL** o endereço do seu site no GitHub Pages
   (algo como `https://SEU-USUARIO.github.io/NOME-DO-REPOSITORIO/`).
6. Em **Authentication > Sign In / Providers > Email**, decida se exige confirmar o e-mail (recomendado).
   Com a confirmação ligada, a pessoa só entra depois de clicar no link que chega por e-mail.

## Regras de ouro

- No site só entra a chave **publishable** (ou `anon`). A chave **secret** e a `service_role` ficam fora do GitHub, sempre.
- O número completo do cartão nunca é digitado nem guardado: só os 4 últimos dígitos.
- O cadastro pede a data de nascimento e só aceita maiores de 18 anos (a regra vale na tela e no banco de dados).

## Arquivos

- `backend/supabase/schema.sql`: tabelas, segurança e funções
- `src/js/supabase-config.js`: URL e chave do projeto (modo demonstração enquanto não preencher)
- `src/js/auth-cadastro.js` e `src/js/auth-entrada.js`: criar conta e entrar
- `src/js/app-dados.js`: cartões, gastos, sair, alterar senha, excluir conta, tema e notificações

## Painel do administrador e convidados (conta de teste)

Mostra só para você: quem criou conta, quem está online agora e quem entrou como convidado.

1. No SQL Editor, rode o `backend/supabase/admin.sql` (depois do `schema.sql`).
2. Crie a sua conta pela página de cadastro, com o e-mail que será só seu e uma senha forte.
3. No SQL Editor, rode esta linha, trocando pelo seu e-mail:
   `insert into public.admins (user_id) select id from auth.users where email = 'SEU-EMAIL@exemplo.com' on conflict do nothing;`
4. Entre no site com essa conta. Aparece o item **Painel do administrador** no menu (só para você).
   O endereço direto é `src/pages/admin.html`.
5. Para o botão **Entrar como convidado** funcionar: em **Authentication > Sign In / Providers**,
   ligue **Anonymous sign-ins**. Ligue também o CAPTCHA (Cloudflare Turnstile ou hCaptcha) para ninguém
   encher o banco de convidados falsos.

O que o painel mostra: nome, e-mail, tipo (conta ou convidado), data de criação, último acesso e se está online.
Não mostra senha, celular nem data de nascimento. Não guarda IP nem localização.
"Online" é quem mandou sinal nos últimos 90 segundos enquanto está logado.

Quem entra pelo modo demonstração (`?demo=1`), sem conta, não aparece: esse modo roda só no navegador da pessoa.

Privacidade (LGPD): como o site guarda e-mail e nome, vale ter um aviso curto de privacidade no cadastro
dizendo que o administrador consegue ver nome, e-mail e quando a conta está ativa.
