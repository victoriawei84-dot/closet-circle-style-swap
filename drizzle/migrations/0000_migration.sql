create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '' check (char_length(display_name) <= 60),
  bio text not null default '' check (char_length(bio) <= 280),
  neighborhood text not null default '' check (char_length(neighborhood) <= 60),
  zip text not null default '' check (char_length(zip) <= 10),
  size text not null default '' check (char_length(size) <= 10),
  style_tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "Signed-in users can view profiles" on public.profiles for select to authenticated using (true);
create policy "Users insert own profile" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "Users update own profile" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

create table public.fit_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  unit text not null default 'in' check (unit in ('in','cm')),
  height numeric check (height is null or (height > 0 and height < 300)),
  bust numeric check (bust is null or (bust > 0 and bust < 300)),
  waist numeric check (waist is null or (waist > 0 and waist < 300)),
  hips numeric check (hips is null or (hips > 0 and hips < 300)),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.fit_profiles to authenticated;
grant all on public.fit_profiles to service_role;
alter table public.fit_profiles enable row level security;
create policy "Owner reads fit profile" on public.fit_profiles for select to authenticated using (auth.uid() = user_id);
create policy "Owner inserts fit profile" on public.fit_profiles for insert to authenticated with check (auth.uid() = user_id);
create policy "Owner updates fit profile" on public.fit_profiles for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Owner deletes fit profile" on public.fit_profiles for delete to authenticated using (auth.uid() = user_id);

create or replace function public.touch_updated_at() returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end $$;
create trigger profiles_touch before update on public.profiles for each row execute function public.touch_updated_at();
create trigger fit_profiles_touch before update on public.fit_profiles for each row execute function public.touch_updated_at();

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, left(coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)), 60))
  on conflict (id) do nothing;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();