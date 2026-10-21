# Pratham MIS Tracker

Static site (HTML + CSS + JS). Hosted on GitHub Pages. **No company data is stored in this repository.**
Data is stored in a login-protected Supabase database; every device that signs in sees the same cases.

## Update the website
Upload the files in this folder (index.html, css/, js/, assets/, .nojekyll) to the repo root and commit.
Settings -> Pages -> Deploy from branch -> main / (root).

## Connect the database (once per device)
Open the site -> menu -> Database sync -> Project URL, publishable (anon) key, email, password -> Connect.
Never use the secret / service_role key. Never commit Excel, CSV or JSON data files to this repo.

