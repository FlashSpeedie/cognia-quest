-- AI Quest — hardening (atomic XP, complete RLS coverage)
-- Apply AFTER 0001_init.sql.

-- ── Atomic XP increment ─────────────────────────────────────────────────
-- One statement: concurrent award calls can never lost-update the cached
-- users.xpTotal (the event row + this increment are the only paths that
-- change it, called back-to-back by server/services/xp.ts).
create or replace function aq_increment_xp(p_user_id text, p_delta int)
returns jsonb language plpgsql security definer as $$
declare
  new_total int;
begin
  update users
    set data = jsonb_set(data, '{xpTotal}', to_jsonb(coalesce((data->>'xpTotal')::int, 0) + p_delta))
    where data->>'id' = p_user_id
    returning (data->>'xpTotal')::int into new_total;
  if not found then
    raise exception 'user not found: %', p_user_id;
  end if;
  return jsonb_build_object('xp_total', new_total);
end $$;

-- Only the server (secret/service key) may call it.
revoke all on function aq_increment_xp(text, int) from public, anon, authenticated;
grant execute on function aq_increment_xp(text, int) to service_role;

-- ── RLS: finish read-own coverage for remaining user-owned tables ────────
-- (users, sessions, xp_events, badge_states, lesson_progress,
--  mission_progress, notifications, streaks, final_results got policies in
--  0001. These were missing read policies — deny-by-default covered them,
--  but an explicit policy documents intent and enables future client reads.)

create policy "quiz_attempts_read_own" on quiz_attempts
  for select to authenticated
  using ((data->>'userId') = auth.uid()::text);

create policy "challenge_attempts_read_own" on challenge_attempts
  for select to authenticated
  using ((data->>'userId') = auth.uid()::text);

create policy "prompt_attempts_read_own" on prompt_attempts
  for select to authenticated
  using ((data->>'userId') = auth.uid()::text);

create policy "sim_runs_read_own" on sim_runs
  for select to authenticated
  using ((data->>'userId') = auth.uid()::text);

create policy "activity_read_own" on activity
  for select to authenticated
  using ((data->>'userId') = auth.uid()::text);

-- Extra supporting indexes for the hot user-scoped reads.
create index if not exists challenge_attempts_user_idx on challenge_attempts ((data->>'userId'));
create index if not exists prompt_attempts_user_idx on prompt_attempts ((data->>'userId'));
create index if not exists sim_runs_user_idx on sim_runs ((data->>'userId'));
create index if not exists quiz_attempts_user_quiz_idx on quiz_attempts ((data->>'quizId'));
