-- Run once in the Supabase SQL Editor if 0001/0002 were applied before the
-- grant statements were added. Idempotent — safe to run more than once.

-- Server-side service role reads/writes all application tables.
grant select, insert, update, delete on
  users, sessions, xp_events, badge_states, lesson_progress, mission_progress,
  quiz_attempts, challenge_attempts, prompt_attempts, sim_runs, streaks,
  activity, notifications, final_results, audit_log
  to service_role;

-- Authenticated students may SELECT their own rows (RLS policies restrict
-- to auth.uid()). No insert/update/delete for any client role.
grant select on
  users, sessions, xp_events, badge_states, lesson_progress, mission_progress,
  quiz_attempts, challenge_attempts, prompt_attempts, sim_runs, streaks,
  activity, notifications, final_results
  to authenticated;

-- The atomic XP RPC is server-only.
revoke all on function aq_increment_xp(text, int) from public, anon, authenticated;
grant execute on function aq_increment_xp(text, int) to service_role;
