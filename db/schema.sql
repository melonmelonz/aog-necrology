-- AOG Necrology database schema (Postgres / Supabase)

create extension if not exists pgcrypto;

do $$ begin
  create type entry_status as enum ('draft', 'published');
exception when duplicate_object then null; end $$;

do $$ begin
  create type entry_kind as enum ('obituary', 'death_notice');
exception when duplicate_object then null; end $$;

create table if not exists entries (
  id                 uuid primary key default gen_random_uuid(),

  -- person
  last_name          text not null,
  first_name         text,
  middle_name        text,
  name_raw           text,          -- name exactly as printed
  class_year         int,           -- graduation year, e.g. 1861
  class_label        text,          -- printed label when not a plain year, e.g. "May 1861"
  cullum_number      text,          -- register number; text due to formatting variants

  -- death
  date_of_death      date,
  date_of_death_raw  text,          -- original string, kept for partial/uncertain dates
  location_of_death  text,
  age_at_death       int,
  date_of_birth      date,          -- when stated in the obituary
  date_of_birth_raw  text,
  interment_location text,

  -- obituary
  entry_type         entry_kind not null default 'obituary',
  obit_text          text,          -- full transcribed memorial; FTS runs on this
  author             text,          -- obituary author/signatory

  -- provenance
  source_report_year int not null,  -- which annual report (1870-1941)
  page_number        int,           -- page where the entry begins
  page_end           int,
  obit_link          text,          -- deep link into the USMA Digital Library
  source_item_id     text,          -- CONTENTdm page pointer, for rebuilds

  -- reserved for future use
  class_crest        text,
  images             jsonb,

  -- review workflow
  status             entry_status not null default 'draft',
  confidence         text,          -- AI self-reported: high | medium | low
  confidence_notes   text,
  needs_vision       boolean not null default false,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  edited_by          text,

  -- full-text search: names weighted above obituary body
  search tsvector generated always as (
    setweight(to_tsvector('english',
      coalesce(first_name,'') || ' ' || coalesce(middle_name,'') || ' ' ||
      coalesce(last_name,'')  || ' ' || coalesce(name_raw,'')), 'A') ||
    setweight(to_tsvector('english', coalesce(obit_text,'')), 'B')
  ) stored
);

create index if not exists entries_search_idx      on entries using gin (search);
create index if not exists entries_last_name_idx   on entries (last_name);
create index if not exists entries_class_year_idx  on entries (class_year);
create index if not exists entries_report_year_idx on entries (source_report_year);
create index if not exists entries_cullum_idx      on entries (cullum_number);
create index if not exists entries_status_idx      on entries (status);

create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end $$ language plpgsql;

drop trigger if exists entries_updated_at on entries;
create trigger entries_updated_at
  before update on entries
  for each row execute function set_updated_at();

-- Public site reads only published rows (Supabase RLS)
alter table entries enable row level security;

drop policy if exists "public read published" on entries;
create policy "public read published" on entries
  for select using (status = 'published');
