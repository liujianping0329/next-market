create table if not exists public.f_user (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  phone text,
  raw_user_meta_data jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.sync_f_user_key_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (tg_op = 'DELETE') then
    delete from public.f_user where id = old.id;
    return old;
  end if;

  -- INSERT / UPDATE：统一用 upsert
  insert into public.f_user (id, email, phone, raw_user_meta_data, created_at, updated_at)
  values (
    new.id,
    new.email,
    new.phone,
    new.raw_user_meta_data,
    now(),
    now()
  )
  on conflict (id) do update
  set
    email = excluded.email,
    phone = excluded.phone,
    raw_user_meta_data = excluded.raw_user_meta_data,
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists trg_sync_f_user_key_fields on auth.users;

create trigger trg_sync_f_user_key_fields
after insert or update or delete on auth.users
for each row execute function public.sync_f_user_key_fields();

--init
insert into public.f_user (id, email, phone, raw_user_meta_data, created_at, updated_at)
select
  u.id,
  u.email,
  u.phone,
  u.raw_user_meta_data,
  now(),
  now()
from auth.users u
where not exists (
  select 1 from public.f_user f where f.id = u.id
);