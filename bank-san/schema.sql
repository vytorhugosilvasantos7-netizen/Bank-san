-- =====================================================================
-- Bank-San | Banco de dados (Supabase / Postgres)
-- Como usar: Supabase Studio > SQL Editor > New query > cole tudo > Run
-- Pode rodar de novo sem quebrar (usa "if not exists" / "or replace").
-- =====================================================================

-- ---------- 1. PERFIL (dados da pessoa; a senha fica no Supabase Auth) ----------
create table if not exists public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  nome          text,
  celular       text,
  data_nascimento date check (data_nascimento is null or data_nascimento <= current_date),
  foto_url      text,
  notificacoes  boolean not null default true,
  tema          text    not null default 'dark' check (tema in ('dark', 'light')),
  criado_em     timestamptz not null default now()
);

-- Se você já tinha rodado uma versão anterior deste arquivo (com CPF), isto atualiza a tabela:
alter table public.profiles add column if not exists data_nascimento date;
alter table public.profiles drop column if exists cpf;

-- ---------- 2. CARTÕES (nunca guarda o número completo, só os 4 últimos dígitos) ----------
create table if not exists public.cartoes (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  banco      text not null check (banco in
               ('bank-san','itau','bradesco','santander','banco-do-brasil','caixa','nubank','inter','c6')),
  apelido    text,
  tipo       text not null check (tipo in ('credito', 'debito')),
  final      text not null check (final ~ '^[0-9]{4}$'),
  bandeira   text not null default 'Visa' check (bandeira in ('Visa', 'Mastercard', 'Elo', 'Outra')),
  criado_em  timestamptz not null default now()
);
create index if not exists cartoes_user_idx on public.cartoes (user_id);

-- ---------- 3. GASTOS (cada gasto pertence a um cartão) ----------
create table if not exists public.gastos (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  cartao_id  uuid not null references public.cartoes (id) on delete cascade,
  descricao  text not null check (char_length(descricao) between 1 and 80),
  categoria  text,
  valor      numeric(12,2) not null check (valor > 0),
  data       date not null default current_date,
  criado_em  timestamptz not null default now()
);
create index if not exists gastos_cartao_idx on public.gastos (cartao_id, data desc);
create index if not exists gastos_user_idx   on public.gastos (user_id);

-- ---------- 4. SEGURANÇA: cada pessoa só enxerga e mexe no que é dela ----------
alter table public.profiles enable row level security;
alter table public.cartoes  enable row level security;
alter table public.gastos   enable row level security;

drop policy if exists "perfil: ler o proprio"        on public.profiles;
drop policy if exists "perfil: editar o proprio"     on public.profiles;
create policy "perfil: ler o proprio"    on public.profiles for select to authenticated
  using ((select auth.uid()) = id);
create policy "perfil: editar o proprio" on public.profiles for update to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
-- (o perfil é criado pelo gatilho abaixo; não há política de insert nem delete)

drop policy if exists "cartoes: tudo do proprio" on public.cartoes;
create policy "cartoes: tudo do proprio" on public.cartoes for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "gastos: tudo do proprio" on public.gastos;
create policy "gastos: tudo do proprio" on public.gastos for all to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and exists (select 1 from public.cartoes c
                where c.id = cartao_id and c.user_id = (select auth.uid()))
  );

-- ---------- 5. CRIAR O PERFIL AUTOMATICAMENTE NO CADASTRO ----------
-- O site manda nome, data_nascimento e celular junto do cadastro (options.data no signUp).
-- Só maiores de 18 anos conseguem criar conta: a regra vale aqui no banco, não só na tela.
-- (Se criar um usuário de teste direto pelo painel, preencha "data_nascimento" no User Metadata.)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  nasc date;
begin
  begin
    nasc := (new.raw_user_meta_data ->> 'data_nascimento')::date;
  exception when others then
    nasc := null;
  end;

  if nasc is null or nasc > current_date or age(current_date, nasc) < interval '18 years' then
    raise exception 'Cadastro permitido apenas para maiores de 18 anos.';
  end if;

  insert into public.profiles (id, nome, celular, data_nascimento)
  values (
    new.id,
    nullif(new.raw_user_meta_data ->> 'nome', ''),
    nullif(regexp_replace(coalesce(new.raw_user_meta_data ->> 'celular', ''), '\D', '', 'g'), ''),
    nasc
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- ---------- 6. EXCLUIR A PRÓPRIA CONTA (botão das configurações) ----------
-- Apaga o usuário; perfil, cartões e gastos somem junto (on delete cascade).
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Não autenticado';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;

revoke execute on function public.delete_my_account() from public, anon;
grant  execute on function public.delete_my_account() to authenticated;
