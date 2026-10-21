# Pratham MIS Tracker

Static site (HTML + CSS + JS). No server, no database, **no company data in this repo**.

## Deploy on GitHub Pages
1. Open https://github.com/PrathamDaya/MIS -> **Add file -> Upload files**.
2. Drag in the *contents* of this folder: `index.html`, `css/`, `js/`, `assets/`, `.nojekyll`, `.gitignore`. Commit to `main`.
3. **Settings -> Pages -> Build from branch -> main / (root) -> Save.**
4. Open https://prathamdaya.github.io/MIS/ (ready in about a minute) and bookmark it.

## Cross-device sync (private data repo)
1. Create a **private** repo, e.g. `PrathamDaya/MIS-data`, and upload your Excel there named `Portfolio.xlsx`.
2. GitHub -> Settings -> Developer settings -> Fine-grained tokens -> new token: repository access = only `MIS-data`, permission **Contents: Read and write**.
3. On each device open the site -> **Sync with GitHub** -> enter `PrathamDaya/MIS-data`, file `Portfolio.xlsx`, branch `main`, and the token. Done.
Everything (cases, notes, follow-ups, basket, dates) is saved to the private repo as `Portfolio.xlsx` + `mis-state.json`. Never put them in the public `MIS` repo.

## First use (local Excel alternative)
Open the site, click **Link Excel file**, pick `Portfolio.xlsx` (ALL + NCD sheets). From then on edits on the site are written to that Excel file automatically.

## Rules to avoid errors
- Make all edits on the website. Keep Excel closed while working (Excel locks the file and the write fails).
- If the browser asks, allow file access **on every visit**.
- Never upload Excel/CSV files or backups to this repo (`.gitignore` blocks them).
- To update the site later, replace the changed file on GitHub; your data is not touched because it lives in your browser and your Excel.
