-- Tabla para cupones canjeados de la sorpresa final
create table if not exists public.cupones_canjeados (
  cupon_id int primary key,
  canjeado_en timestamptz not null default now(),
  canjeado_por uuid references auth.users(id) on delete set null
);

alter table public.cupones_canjeados enable row level security;

drop policy if exists "miembros comparten cupones" on public.cupones_canjeados;
create policy "miembros comparten cupones" on public.cupones_canjeados
  for all to authenticated using ((select private.es_miembro()))
  with check ((select private.es_miembro()));

grant select, insert, update, delete on public.cupones_canjeados to authenticated;

do $$ begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'cupones_canjeados') then
    alter publication supabase_realtime add table public.cupones_canjeados;
  end if;
end $$;
