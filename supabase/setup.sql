-- Ejecuta este archivo en Supabase > SQL Editor, después de crear las dos cuentas.
-- En la sección final cambia los dos UUID por los ID de tus usuarios.

create schema if not exists private;

create table if not exists public.pareja_miembros (
  user_id uuid primary key references auth.users(id) on delete cascade,
  creado_en timestamptz not null default now()
);

create or replace function private.es_miembro()
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1 from public.pareja_miembros
    where user_id = (select auth.uid())
  );
$$;

revoke all on function private.es_miembro() from public;
grant usage on schema private to authenticated;
grant execute on function private.es_miembro() to authenticated;

create table if not exists public.recuerdos (
  id uuid primary key default gen_random_uuid(),
  fecha date not null,
  titulo text not null,
  texto text not null default '',
  lugar text not null default '',
  foto_path text,
  latitud double precision,
  longitud double precision,
  origen_local text unique,
  creado_en timestamptz not null default now()
);

create table if not exists public.fechas_importantes (
  id uuid primary key default gen_random_uuid(),
  fecha date not null,
  titulo text not null,
  texto text not null default '',
  origen_local text unique,
  creado_en timestamptz not null default now()
);

alter table public.pareja_miembros enable row level security;
alter table public.recuerdos enable row level security;
alter table public.fechas_importantes enable row level security;

drop policy if exists "cada uno ve su pertenencia" on public.pareja_miembros;
create policy "cada uno ve su pertenencia" on public.pareja_miembros
  for select to authenticated using (user_id = (select auth.uid()));

drop policy if exists "miembros comparten recuerdos" on public.recuerdos;
create policy "miembros comparten recuerdos" on public.recuerdos
  for all to authenticated using ((select private.es_miembro()))
  with check ((select private.es_miembro()));

drop policy if exists "miembros comparten fechas" on public.fechas_importantes;
create policy "miembros comparten fechas" on public.fechas_importantes
  for all to authenticated using ((select private.es_miembro()))
  with check ((select private.es_miembro()));

grant select on public.pareja_miembros to authenticated;
grant select, insert, update, delete on public.recuerdos to authenticated;
grant select, insert, update, delete on public.fechas_importantes to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('recuerdos-pareja', 'recuerdos-pareja', false, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = false, file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

drop policy if exists "miembros ven fotos privadas" on storage.objects;
create policy "miembros ven fotos privadas" on storage.objects
  for select to authenticated using (bucket_id = 'recuerdos-pareja' and (select private.es_miembro()));
drop policy if exists "miembros suben fotos privadas" on storage.objects;
create policy "miembros suben fotos privadas" on storage.objects
  for insert to authenticated with check (bucket_id = 'recuerdos-pareja' and (select private.es_miembro()));
drop policy if exists "miembros actualizan fotos privadas" on storage.objects;
create policy "miembros actualizan fotos privadas" on storage.objects
  for update to authenticated using (bucket_id = 'recuerdos-pareja' and (select private.es_miembro()))
  with check (bucket_id = 'recuerdos-pareja' and (select private.es_miembro()));
drop policy if exists "miembros borran fotos privadas" on storage.objects;
create policy "miembros borran fotos privadas" on storage.objects
  for delete to authenticated using (bucket_id = 'recuerdos-pareja' and (select private.es_miembro()));

do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'recuerdos') then
    alter publication supabase_realtime add table public.recuerdos;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'fechas_importantes') then
    alter publication supabase_realtime add table public.fechas_importantes;
  end if;
end $$;

-- Reemplaza ambos valores por los ID de las cuentas que creaste en Authentication > Users.
insert into public.pareja_miembros (user_id) values
  ('REEMPLAZA-ESTE-UUID-CON-TU-USUARIO'),
  ('REEMPLAZA-ESTE-UUID-CON-EL-USUARIO-DE-ALI');
