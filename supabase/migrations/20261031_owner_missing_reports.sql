-- Missing reports live in Supabase (the local JSON database is retired).
-- Signed-in guardians file their own reports in missing_pets, for a registered pet or one that is not
-- registered (pet_id null), and close them when the pet is found. Finders alert the reporter through
-- notify_missing_pet_reporter, which replaces the never-applied notify_owner_found_by_pet.

alter table public.missing_pets
  add column if not exists reporter_id uuid references auth.users (id) on delete set null default auth.uid(),
  add column if not exists reported_by_owner boolean not null default true,
  add column if not exists notes text,
  add column if not exists updated_at timestamptz not null default now();

alter table public.missing_pets
  add constraint missing_pets_notes_check check (notes is null or char_length(notes) <= 1000),
  add constraint missing_pets_description_check check (description is null or char_length(description) <= 1000),
  add constraint missing_pets_pet_name_check check (char_length(btrim(pet_name)) between 1 and 80);

comment on column public.missing_pets.reporter_id is 'Guardian who filed the report; finders alert them through notify_missing_pet_reporter. Their phone stays in guardians.';
comment on column public.missing_pets.reported_by_owner is 'False when someone reported a pet that is not theirs (a neighbour''s pet, a stray they look after).';

create index if not exists missing_pets_reporter_idx on public.missing_pets (reporter_id);
create index if not exists missing_pets_pet_idx on public.missing_pets (pet_id);
-- One open report per registered pet
create unique index if not exists missing_pets_one_open_per_pet
  on public.missing_pets (pet_id) where pet_id is not null and status in ('missing', 'sighted');

-- Guardians file reports: as themselves, open, and only for their own registered pets (or unregistered ones)
create policy "Guardians report missing pets" on public.missing_pets
  for insert to authenticated
  with check (
    reporter_id = (select auth.uid())
    and status = 'missing'
    and (pet_id is null or exists (
      select 1 from public.registered_pets p where p.id = pet_id and p.owner_id = (select auth.uid())))
  );

-- Reporters edit and close their own reports
create policy "Reporters update their missing reports" on public.missing_pets
  for update to authenticated
  using (reporter_id = (select auth.uid()))
  with check (reporter_id = (select auth.uid()));

-- Reporters confirm, dismiss or archive sightings of the pets they reported
create policy "Reporters review sightings of their missing pets" on public.community_sightings
  for update to authenticated
  using (exists (select 1 from public.missing_pets m
                 where m.id = community_sightings.missing_pet_id and m.reporter_id = (select auth.uid())))
  with check (exists (select 1 from public.missing_pets m
                      where m.id = community_sightings.missing_pet_id and m.reporter_id = (select auth.uid())));

-- A finder alerts the person who reported a missing pet ('found' from Found a Pet, 'sighting' from
-- "Seen this pet?"). Works for signed-out finders; never returns the reporter's details.
create or replace function public.notify_missing_pet_reporter(
  p_missing_pet_id uuid, p_kind text, p_phone text, p_location text, p_notes text default null
) returns boolean
language plpgsql security definer set search_path = ''
as $$
declare
  v_report public.missing_pets%rowtype;
begin
  if p_kind not in ('found', 'sighting') then
    raise exception 'Unknown alert type';
  end if;
  if char_length(btrim(coalesce(p_phone, ''))) < 6 or char_length(p_phone) > 30 then
    raise exception 'Please enter a valid phone number';
  end if;
  if char_length(btrim(coalesce(p_location, ''))) < 2 or char_length(p_location) > 300 then
    raise exception 'Please enter where the pet was seen';
  end if;
  if p_notes is not null and char_length(p_notes) > 1000 then
    raise exception 'Message is too long';
  end if;

  select * into v_report from public.missing_pets
  where id = p_missing_pet_id and status in ('missing', 'sighted');
  if not found or v_report.reporter_id is null then
    return false;
  end if;

  -- Stop this from being used to spam a reporter
  if (select count(*) from public.notifications n
      where n.recipient_id = v_report.reporter_id
        and n.pet_name = v_report.pet_name
        and n.type = 'sighting_verification'
        and n.created_at > now() - interval '1 hour') >= 10 then
    raise exception 'Too many alerts were sent for this pet recently. Please try again later.';
  end if;

  insert into public.notifications (recipient_id, type, title, message, pet_name, location)
  values (
    v_report.reporter_id,
    'sighting_verification',
    case
      when p_kind = 'sighting' then 'POSSIBLE SIGHTING: "' || upper(v_report.pet_name) || '"'
      when v_report.reported_by_owner then 'GOOD SAMARITAN FOUND YOUR PET: "' || upper(v_report.pet_name) || '"!'
      else 'GOOD SAMARITAN FOUND THE PET YOU REPORTED: "' || upper(v_report.pet_name) || '"!'
    end,
    case when p_kind = 'sighting' then 'Someone may have seen ' else 'Someone found ' end
      || v_report.pet_name || ' near ' || btrim(p_location)
      || '. Finder phone: ' || btrim(p_phone)
      || coalesce('. Message: "' || nullif(btrim(p_notes), '') || '"', ''),
    v_report.pet_name,
    btrim(p_location)
  );
  return true;
end;
$$;

revoke all on function public.notify_missing_pet_reporter(uuid, text, text, text, text) from public;
grant execute on function public.notify_missing_pet_reporter(uuid, text, text, text, text) to anon, authenticated;
