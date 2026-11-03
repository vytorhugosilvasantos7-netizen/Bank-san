-- =====================================================================
-- Bank-San | Painel do administrador + convidados (conta de teste)
-- Rode DEPOIS do schema.sql: Supabase Studio > SQL Editor > New query > cole tudo > Run
-- Pode rodar de novo sem quebrar.
-- =====================================================================

-- ---------- 1. QUEM É ADMINISTRADOR ----------
-- Ninguém consegue ler nem escrever nesta tabela pela API do site (RLS ligada, sem políticas).
-- Só você, pelo SQL Editor, coloca alguém aqui (veja o passo no final do arquivo).
create table if not exists public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  criado_em  timestamptz not null default now()
);
alter table public.admins enable row level security;

create or replace function public.eh_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins where user_id = (select auth.uid()));
$$;
revoke execute on function public.eh_admin() from public, anon;
grant  execute on function public.eh_admin() to authenticated;

-- ---------- 2. ATIVIDADE (quem está online agora) ----------
-- O site manda um "sinal" a cada ~40 s enquanto a pessoa está logada. Cada aba tem uma "sessao".
-- Não guarda IP, localização nem nada do aparelho: só quem (user_id), em qual tela e quando.
create table if not exists public.atividade (
  user_id       uuid not null default auth.uid() references auth.users (id) on delete cascade,
  sessao        text not null check (char_length(sessao) between 8 and 64),
  pagina        text check (pagina is null or char_length(pagina) <= 40),
  ultimo_sinal  timestamptz not null default now(),
  primary key (user_id, sessao)
);
create index if not exists atividade_sinal_idx on public.atividade (ultimo_sinal desc);

alter table public.atividade enable row level security;

drop policy if exists "atividade: ler a propria"   on public.atividade;
drop policy if exists "atividade: criar a propria" on public.atividade;
drop policy if exists "atividade: mudar a propria" on public.atividade;
drop policy if exists "atividade: apagar a propria" on public.atividade;
create policy "atividade: ler a propria"    on public.atividade for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "atividade: criar a propria"  on public.atividade for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "atividade: mudar a propria"  on public.atividade for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "atividade: apagar a propria" on public.atividade for delete to authenticated
  using ((select auth.uid()) = user_id);

-- ---------- 3. CONVIDADOS: o perfil é criado sem pedir data de nascimento ----------
-- (Entrada de convidado = "conta de teste": cria um usuário temporário, sem e-mail.)
-- Contas normais continuam exigindo 18 anos.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  nasc date;
begin
  if coalesce(new.is_anonymous, false) then
    insert into public.profiles (id, nome) values (new.id, 'Convidado');
    return new;
  end if;

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
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- ---------- 4. FUNÇÕES DO PAINEL (só funcionam para administradores) ----------
-- Mostram nome, e-mail, tipo, datas e se está online. Não mostram senha, celular nem data de nascimento.

create or replace function public.admin_resumo()
returns table (contas bigint, convidados bigint, online_agora bigint, novas_24h bigint, novas_7d bigint)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.eh_admin() then
    raise exception 'Acesso negado';
  end if;

  return query
  select
    count(*) filter (where not coalesce(u.is_anonymous, false)),
    count(*) filter (where coalesce(u.is_anonymous, false)),
    (select count(distinct a.user_id) from public.atividade a where a.ultimo_sinal > now() - interval '90 seconds'),
    count(*) filter (where not coalesce(u.is_anonymous, false) and u.created_at > now() - interval '24 hours'),
    count(*) filter (where not coalesce(u.is_anonymous, false) and u.created_at > now() - interval '7 days')
  from auth.users u;
end;
$$;

create or replace function public.admin_usuarios()
returns table (usuario_id uuid, email text, nome text, convidado boolean,
               criado_em timestamptz, ultimo_login timestamptz, email_confirmado boolean, online boolean)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.eh_admin() then
    raise exception 'Acesso negado';
  end if;

  return query
  select
    u.id,
    u.email::text,
    p.nome,
    coalesce(u.is_anonymous, false),
    u.created_at,
    u.last_sign_in_at,
    (u.email_confirmed_at is not null),
    exists (select 1 from public.atividade a
            where a.user_id = u.id and a.ultimo_sinal > now() - interval '90 seconds')
  from auth.users u
  left join public.profiles p on p.id = u.id
  order by u.created_at desc
  limit 500;
end;
$$;

create or replace function public.admin_online()
returns table (usuario_id uuid, email text, nome text, convidado boolean,
               pagina text, sessoes bigint, visto_em timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.eh_admin() then
    raise exception 'Acesso negado';
  end if;

  -- limpeza: sinais com mais de 1 dia não servem para nada
  delete from public.atividade a where a.ultimo_sinal < now() - interval '1 day';

  return query
  select
    a.user_id,
    u.email::text,
    p.nome,
    coalesce(u.is_anonymous, false),
    (array_agg(a.pagina order by a.ultimo_sinal desc))[1],
    count(*),
    max(a.ultimo_sinal)
  from public.atividade a
  join auth.users u on u.id = a.user_id
  left join public.profiles p on p.id = a.user_id
  where a.ultimo_sinal > now() - interval '90 seconds'
  group by a.user_id, u.email, p.nome, u.is_anonymous
  order by max(a.ultimo_sinal) desc;
end;
$$;

revoke execute on function public.admin_resumo()   from public, anon;
revoke execute on function public.admin_usuarios() from public, anon;
revoke execute on function public.admin_online()   from public, anon;
grant  execute on function public.admin_resumo()   to authenticated;
grant  execute on function public.admin_usuarios() to authenticated;
grant  execute on function public.admin_online()   to authenticated;

-- ---------- 5. TORNAR VOCÊ ADMINISTRADOR (faça depois de criar sua conta no site) ----------
-- 1) Crie sua conta pela página de cadastro com o e-mail que será só seu.
-- 2) Troque o e-mail abaixo pelo seu, tire os dois traços do começo da linha e rode só esta linha:
--
-- insert into public.admins (user_id) select id from auth.users where email = 'SEU-EMAIL-AQUI@exemplo.com' on conflict do nothing;

-- ---------- 6. LIMPAR CONVIDADOS ANTIGOS (opcional, rode quando quiser) ----------
-- delete from auth.users where is_anonymous and created_at < now() - interval '30 days';
