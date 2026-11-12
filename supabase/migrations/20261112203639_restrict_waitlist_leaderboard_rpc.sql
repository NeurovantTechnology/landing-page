-- Keep leaderboard RPC access behind the public Edge Function.
revoke all on function public.waitlist_leaderboard() from public, anon, authenticated;
grant execute on function public.waitlist_leaderboard() to service_role;
