# Pratham MIS Tracker

Static site (HTML + CSS + JavaScript). Hosted on GitHub Pages. Company case data is stored in Supabase, not in this repository.

## Update the website

The website files live in the repository root. GitHub Pages should deploy the \`main\` branch from \`/\`.

## Analyst accounts and case transfers

Run \`supabase/analyst-transfer.sql\` once in the Supabase SQL Editor to move the existing shared MIS row to the owner account and enable per-login case ownership. Before running it, replace \`REPLACE_WITH_YOUR_SUPABASE_LOGIN_EMAIL\` in the script with the login email that should keep the current portfolio.

After the migration, each sign-in sees only its own cases. Edit a case and choose **Transfer to analyst…** to move it atomically to another Supabase Auth account. The case is removed from the sender and added to the recipient, with the recipient set as its analyst.

Transfer every case before deleting an analyst under Supabase **Authentication → Users**. Supabase blocks account deletion while cases remain; after the cases are transferred, deleting that user also removes its empty database state.

The current site remains compatible with the original shared database setup until the SQL migration has been run. New accounts must be created in Supabase Authentication before they appear in the transfer list.

Never commit Excel, CSV, JSON case data, passwords, or a Supabase secret/service_role key to this repository.
