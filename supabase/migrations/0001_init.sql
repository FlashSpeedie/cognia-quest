-- AI Quest — initial schema (Supabase / PostgreSQL)
-- Rows are stored as jsonb documents per table mirroring lib/types.ts.
-- The server accesses these with the service role; RLS is enabled as
-- defense-in-depth so no direct client (anon/authenticated) access is
-- possible unless a policy explicitly allows it.

create or replace function aq_make_table(t text) returns void language plpgsql as $$
begin
  execute format($f$
    create table if not exists %I (
      pk uuid primary key default gen_random_uuid(),
      data jsonb not null,
      created_at timestamptz not null default now()
    );
    create unique index if not exists %I on %I ((data->>'id'));
  $f$, t, t || '_id_key', t);
  execute format('alter table %I enable row level security', t);
end $$;

select aq_make_table('users');
select aq_make_table('sessions');
select aq_make_table('xp_events');
select aq_make_table('badge_states');
select aq_make_table('lesson_progress');
select aq_make_table('mission_progress');
select aq_make_table('quiz_attempts');
select aq_make_table('challenge_attempts');
select aq_make_table('prompt_attempts');
select aq_make_table('sim_runs');
select aq_make_table('streaks');
select aq_make_table('activity');
select aq_make_table('notifications');
select aq_make_table('final_results');
select aq_make_table('audit_log');

drop function aq_make_table(text);

-- Grants: the server talks to these tables with the service role.
-- (create table in a migration doesn't grant anything by itself.)
grant select, insert, update, delete on
  users, sessions, xp_events, badge_states, lesson_progress, mission_progress,
  quiz_attempts, challenge_attempts, prompt_attempts, sim_runs, streaks,
  activity, notifications, final_results, audit_log
  to service_role;

-- Helpful indexes
create index if not exists xp_events_user_idx on xp_events ((data->>'userId'));
create index if not exists xp_events_source_idx on xp_events ((data->>'sourceType'), (data->>'sourceId'));
create index if not exists badge_states_user_idx on badge_states ((data->>'userId'));
create index if not exists lesson_progress_user_idx on lesson_progress ((data->>'userId'));
create index if not exists mission_progress_user_idx on mission_progress ((data->>'userId'));
create index if not exists quiz_attempts_user_idx on quiz_attempts ((data->>'userId'));
create index if not exists notifications_user_idx on notifications ((data->>'userId'));
create index if not exists activity_user_idx on activity ((data->>'userId'));
create index if not exists sessions_user_idx on sessions ((data->>'userId'));
create unique index if not exists users_email_key on users (lower(data->>'email'));

-- ── Row Level Security ─────────────────────────────────────────────────
-- Default posture: deny direct client access. All flows go through the
-- server (service role bypasses RLS). If client-side reads are ever
-- enabled, students may read ONLY their own rows, and never write
-- reward-bearing tables directly.

create policy "users_read_own" on users
  for select to authenticated
  using ((data->>'id') = auth.uid()::text);

create policy "sessions_own" on sessions
  for select to authenticated
  using ((data->>'userId') = auth.uid()::text);

-- Reward-bearing tables: read own only, NO client writes.
create policy "xp_read_own" on xp_events
  for select to authenticated
  using ((data->>'userId') = auth.uid()::text);

create policy "badges_read_own" on badge_states
  for select to authenticated
  using ((data->>'userId') = auth.uid()::text);

create policy "lesson_progress_read_own" on lesson_progress
  for select to authenticated
  using ((data->>'userId') = auth.uid()::text);

create policy "mission_progress_read_own" on mission_progress
  for select to authenticated
  using ((data->>'userId') = auth.uid()::text);

create policy "notifications_read_own" on notifications
  for select to authenticated
  using ((data->>'userId') = auth.uid()::text);

create policy "streaks_read_own" on streaks
  for select to authenticated
  using ((data->>'userId') = auth.uid()::text);

create policy "final_read_own" on final_results
  for select to authenticated
  using ((data->>'userId') = auth.uid()::text);

-- audit_log: no client access at all (service role only).
