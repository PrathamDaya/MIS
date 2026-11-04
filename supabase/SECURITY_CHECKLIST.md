# Supabase security setup

The MIS signs in through Supabase Auth. Public sign-ups were already disabled during the audit. The migration adds an explicit allow-list and seeds it from current MIS owners, so those accounts keep access.

## Apply the database migration before using the updated site

1. Open the [Supabase Dashboard](https://supabase.com/dashboard) and select **PrathamDaya's Project**.
2. In the left sidebar, click **SQL Editor**.
3. Click **New query**.
4. Open `supabase/migrations/20261103121739_secure_allowed_users_and_audit_log.sql` in GitHub and copy the complete file into the SQL editor.
5. Click **Run** and wait for the success message.
6. In the left sidebar, click **Table Editor**. Confirm `allowed_users` contains the current account and `audit_log` exists.
7. Open **Authentication** → **Users**. Confirm each analyst who needs access has an account. Copy a new analyst's **User UID**.
8. In **SQL Editor**, add a row to `public.allowed_users` for each new account. Use that UID and a display name; do not enable public sign-ups.

The migration only adds tables, policies, indexes, and trigger functions. It does not rename or remove any existing column. It also replaces the analyst-list function so it returns enabled analyst names rather than exposing auth email addresses.

## Enable live updates

The site also refreshes changes with 30-second polling if Realtime is not enabled. To turn on immediate updates, open **Database** → **Publications** → **supabase_realtime**, find `public.mis_state`, and enable it. Do not add `audit_log` or `allowed_users` to the publication. Supabase requires each subscribed table to be included in `supabase_realtime` before Postgres Changes can stream it.

## Check sign-ups and row security

1. In **Authentication** → **Sign In / Providers**, confirm **Allow new users to sign up** is off.
2. In **Table Editor**, open `allowed_users`, `audit_log`, and `mis_state`. Confirm Row Level Security is enabled for each table.
3. In `supabase/policies.sql`, review the policy reference. There must be no policy for the `anon` role.

The client contains only the public Supabase publishable key. Sign out clears the saved session, case cache, and any old workbook handle. The app signs out after 30 minutes without activity and requires a new sign-in.

## Nightly snapshot alternative

Supabase creates automatic daily backups on Pro, Team, and Enterprise projects. In the Dashboard, open **Database** → **Backups** to review them. A restore replaces the project database and causes downtime, so use that for disaster recovery rather than an individual-case undo.

If the project is on Free, Supabase recommends regular exports with the CLI. Keep those exports in a private, encrypted folder outside this repository and its Git history. Do not use a workflow that commits `data.sql` or backup files to GitHub: database dumps contain confidential MIS data and may include auth information. The app's **Backup & restore** menu also creates a portable JSON file; store that outside the repo and use its in-app preview before restoring it.

## Optional password protection

The security advisor found leaked-password protection disabled. If the project plan exposes the option, open **Authentication** → **Attack Protection** and enable **Leaked password protection**.

## Historical workbook purge plan

The public Git history contains `Portfolio (1) - Copy.xlsx` (added in `b1096ec`, removed from the working tree in `f735b37`). The file was inspected in memory and was not copied into this repository. To purge it, coordinate a maintenance window with collaborators, rewrite every branch and tag with `git-filter-repo --path "Portfolio (1) - Copy.xlsx" --invert-paths`, verify that the path is absent from every ref, and force-push the rewritten refs. Then ask GitHub Support about cached commit/file views. Treat the workbook as exposed because the repository was public. The audit found no common service-role, private-key, or token patterns in the scanned history.
