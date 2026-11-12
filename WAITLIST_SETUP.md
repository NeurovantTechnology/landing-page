# Neurovant waitlist setup

The landing page waitlist uses Supabase Auth magic links, a verified-member table, referral attribution, and a public top-50 leaderboard.

## Use a dedicated Supabase project

Do not use the NeuroPortal app project. Its auth trigger creates an app profile and workspace for every new Auth user. Create a separate project for the marketing waitlist so waitlist signups do not become NeuroPortal app accounts.

## Configure the project

1. Apply `supabase/migrations/20261112000100_waitlist_referrals.sql`.
2. In Authentication settings, enable email signups and email confirmation. Configure the email template to send either the confirmation link or OTP code.
3. Add local and live callback URLs to the Auth redirect allowlist. Local development uses `http://localhost:5173/`; add the deployed landing page origin and path once known.
4. Configure Custom SMTP before public launch and test delivery to multiple providers.
5. Deploy `waitlist-leaderboard` with JWT verification disabled. It returns only rank, display name, and verified referral count; its database RPC is separately restricted to those fields.
6. Copy the project URL and publishable key to `.env.local` based on `.env.example`. Never put the service role key in the website environment.

## Signup and referral rules

The form submits a display name, email, and optional referral code through Supabase email OTP. A database trigger creates the waitlist member only once Auth confirms the email. It resolves the referral code at verification time and stores the referrer on that verified member, so unverified signups do not earn credit. A unique user key prevents duplicate credits; the constraint and trigger reject self-referral.

After confirmation, the signed-in member can read their own referral code and share a link with `?ref=<code>`. The public leaderboard contains no email addresses. The browser inserts no waitlist rows directly.

## Deployment values still needed

- Dedicated waitlist Supabase project URL and publishable key.
- Live landing-page URL for Auth redirects.
- Custom SMTP host, port, sender address, and credentials entered in the Supabase Dashboard.
