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
