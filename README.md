# Pratham MIS Tracker

A static site for the Pratham MIS Tracker. It runs directly from GitHub Pages and has no build step. GitHub Pages should publish the `main` branch from the repository root.

## Supabase setup

Case data is stored in Supabase. Sign in with an existing Supabase Auth account; public sign-ups stay disabled. Before using the updated site, run the additive SQL migration in `supabase/migrations/20261103121739_secure_allowed_users_and_audit_log.sql` using the steps in `supabase/SECURITY_CHECKLIST.md`.

New analysts need a Supabase Auth account and a matching row in `public.allowed_users`. The `mis_state` policies restrict each analyst to their own row. Database triggers create per-case History entries for edits and imports.

## Portfolio Excel

- **Import Excel** reads the Portfolio `ALL` sheet and shows new, changed, unchanged, and missing cases before applying changes. Deleting missing cases is unchecked by default.
- **Export Portfolio template…** asks you to choose a workbook and downloads a formatted copy. It does not edit the selected workbook.
- **Backup & restore** downloads a private JSON copy; restore shows a preview before applying it.

Keep downloaded case files in a private location outside this repository. Never commit Excel, CSV, Word, mail, JSON backup, database dump, password, or Supabase secret/service-role files.

## Date and view logic

Pure case, deadline, working-day, and Excel date parsing helpers live in `js/logic.js`. Dates are stored as `YYYY-MM-DD`; working dates use Asia/Kolkata for today, Saturdays and Sundays off by default, and the editable holiday list starts empty. Run the regression tests with `node --test tests/logic.test.cjs tests/phase1-security.test.mjs`.

## Historical data exposure

The public Git history contains an old workbook that was removed from the current tree. The purge procedure is documented in `supabase/SECURITY_CHECKLIST.md`. Treat that workbook as exposed until every Git ref has been rewritten and GitHub's cached views have been addressed.
