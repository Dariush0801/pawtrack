-- Let a guardian change their email from Settings.
-- The email is confirmed by a 6-digit code sent to the NEW address (Supabase Auth, type "email_change").
-- Once Auth has changed auth.users.email, the same address is copied onto the guardians row.
-- guardians_before_write still refuses any other email change, so a guardian cannot set an address
-- that Auth has not verified.

create or replace function private.guardians_before_write()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
begin
  new.full_name := btrim(new.full_name);
  new.phone := coalesce(private.normalize_ph_mobile(new.phone), new.phone);
  new.updated_at := now();
  if tg_op = 'INSERT' then
    new.created_at := now();
    if (select auth.uid()) is not null then
      new.id := (select auth.uid());
      new.email := lower(coalesce((select auth.jwt()) ->> 'email', ''));
    end if;
    new.email := lower(new.email);
  elsif new.id <> old.id or new.created_at <> old.created_at then
    raise exception 'Account identity cannot be changed';
  elsif new.email <> old.email
        and new.email is distinct from (select lower(u.email) from auth.users u where u.id = new.id) then
    raise exception 'Account identity cannot be changed';
  end if;
  return new;
end;
$function$;

create or replace function private.sync_guardian_email()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
begin
  update public.guardians
     set email = lower(new.email)
   where id = new.id
     and email is distinct from lower(new.email);
  return new;
end;
$function$;

drop trigger if exists on_auth_user_email_changed on auth.users;
create trigger on_auth_user_email_changed
  after update of email on auth.users
  for each row
  when (old.email is distinct from new.email)
  execute function private.sync_guardian_email();
