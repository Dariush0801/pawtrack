-- Lets a finder alert the owner of a pet that is reported missing, without an NFC tag scan.
-- Same notification shape as notify_owner_found, so the owner's app picks it up the same way.
-- Never returns owner details; only works while the pet is marked missing.

create or replace function public.notify_owner_found_by_pet(
  p_pet_id uuid, p_phone text, p_location text, p_notes text default null
) returns boolean
language plpgsql security definer set search_path = ''
as $$
declare
  v_pet public.registered_pets%rowtype;
begin
  if char_length(btrim(coalesce(p_phone, ''))) < 6 or char_length(p_phone) > 30 then
    raise exception 'Please enter a valid phone number';
  end if;
  if char_length(btrim(coalesce(p_location, ''))) < 2 or char_length(p_location) > 300 then
    raise exception 'Please enter where the pet was found';
  end if;
  if p_notes is not null and char_length(p_notes) > 1000 then
    raise exception 'Message is too long';
  end if;

  select * into v_pet from public.registered_pets where id = p_pet_id and status = 'missing';
  if not found then
    return false;
  end if;

  -- Stop this from being used to spam an owner
  if (select count(*) from public.notifications n
      where n.recipient_id is not distinct from v_pet.owner_id
        and n.pet_name = v_pet.name
        and n.type = 'sighting_verification'
        and n.created_at > now() - interval '1 hour') >= 5 then
    raise exception 'Too many alerts were sent for this pet recently. Please try again later.';
  end if;

  insert into public.notifications (recipient_id, type, title, message, pet_name, location)
  values (
    v_pet.owner_id,
    'sighting_verification',
    'GOOD SAMARITAN FOUND YOUR PET: "' || upper(v_pet.name) || '"!',
    'Someone found ' || v_pet.name || ' near ' || btrim(p_location)
      || '. Finder phone: ' || btrim(p_phone)
      || coalesce('. Message: "' || nullif(btrim(p_notes), '') || '"', ''),
    v_pet.name,
    btrim(p_location)
  );
  return true;
end;
$$;

revoke all on function public.notify_owner_found_by_pet(uuid, text, text, text) from public;
grant execute on function public.notify_owner_found_by_pet(uuid, text, text, text) to anon, authenticated;
