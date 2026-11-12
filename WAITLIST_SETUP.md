# Neurovant waitlist setup

The public landing page waitlist uses Supabase email magic links, a verified-member table, referral attribution, and a public top-50 leaderboard.

## Supabase project

This uses the existing NeuroPortal Supabase project as requested. Waitlist signups share its Auth user pool but the signup_context=waitlist metadata prevents automatic app profile/workspace creation. Regular NeuroPortal signups keep the current provisioning behavior.

The migrations have already been applied to project aepiokzkmpqralnvrkvv, and waitlist-leaderboard is deployed with JWT verification disabled. The leaderboard database RPC is executable only by service_role; the public Edge Function returns rank, display name, and verified referral count without exposing email addresses.

## Remaining dashboard setup

1. Sign in to the Supabase Dashboard at https://supabase.com/dashboard and open project aepiokzkmpqralnvrkvv.
2. Under Authentication → URL Configuration, keep the Site URL set to the public landing page and add these Redirect URLs:
   - http://localhost:5173/
   - https://neurovant-technology.com/
3. Under Authentication → Sign In / Providers → Email, verify email signup and email confirmation are enabled. The form uses Supabase email OTP/magic-link sign-in and redirects back to the current landing-page path.
4. Under Authentication → SMTP Settings, configure Neurovant's verified sender, host, port, and credentials. The Supabase default sender is only for testing; public launch requires your own SMTP provider. Test delivery to multiple email providers.
5. The Pages workflow injects the project URL and publishable key at build time. The publishable key is designed for browser use and is protected by database RLS; do not use a secret/service-role key here.
6. Keep all Supabase service-role and SMTP credentials out of GitHub and frontend code. Supabase's built-in SUPABASE_SERVICE_ROLE_KEY is used only inside the leaderboard Edge Function.

## Local development

Copy .env.example to .env.local and set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to the same project values. .env.local is ignored by Git.

Run npm install, then npm run dev.

## Signup and referral rules

The form sends a display name, email, and optional referral code through Supabase email OTP. A database trigger creates a waitlist member only after Auth confirms the email. It resolves the referral code at verification time, so pending signups do not earn referral credit. The user ID is unique, preventing duplicate credits; self-referrals are rejected.

After confirmation, the signed-in member can read their own referral code and share a link with ?ref=<code>. The browser cannot insert waitlist rows directly. The public leaderboard contains only display names and counts, so users should choose a name they are comfortable making public.

## Existing app-account behavior

Waitlist members use the project's shared Auth user pool but do not receive an app profile or workspace. If a waitlist member later needs a full NeuroPortal account, add a server-controlled activation step during app onboarding.
