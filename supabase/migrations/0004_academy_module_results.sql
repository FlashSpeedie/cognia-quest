-- Cognia Quest - Academy module assessment results
-- Apply AFTER 0001_init.sql (and companions 0002/0003).
--
-- Why this table exists: the public Academy (Module 1) adds module-level
-- mastery assessments. A module test result has a different shape from
-- lesson_progress: best score across attempts, attempt count, and a
-- pass/fail decision against the module's mastery threshold. Rather than
-- overloading the per-section lesson_progress documents, we add one
-- dedicated table in the same document-store pattern (pk + data jsonb +
-- unique id index) with the same security posture:
--   - RLS enabled, read-own-only for authenticated users
--   - no client write grants - all writes go through the server
--     (route handlers using the service key / local store)

create table if not exists academy_module_results (
  pk uuid primary key default gen_random_uuid(),
  data jsonb not null,
  created_at timestamptz not null default now()
);
create unique index if not exists academy_module_results_id_key
  on academy_module_results ((data->>'id'));

alter table academy_module_results enable row level security;

-- Read-own only (writes are server-side; there are no write policies).
create policy "academy_module_results_read_own" on academy_module_results
  for select to authenticated
  using ((data->>'userId') = auth.uid()::text);

grant select on academy_module_results to authenticated;

-- Hot path: a student's latest result for resume/mastery surfaces.
create index if not exists academy_module_results_user_idx
  on academy_module_results ((data->>'userId'));
