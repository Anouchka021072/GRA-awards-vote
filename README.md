# GRA Staff Awards

Anonymous voting platform for The Compass, The Quiet Force and The Fair Play Award.
Each staff member receives a personal code that can vote once per award; votes are stored without the code.

## What is in the folder

| Path | Purpose |
|---|---|
| `public/index.html` | The voting page staff use |
| `public/admin.html` | The jury results page (password protected) |
| `public/styles.css` | Look and feel; GRA colours are the tokens at the top |
| `public/common.js` | Shared helpers and the three award emblems |
| `lib/config.js` | Awards, criteria, values, vision, departments, staff list, closing date |
| `lib/store.js` | Database connection, code hashing, attempt limits |
| `api/config.js`, `api/enter.js`, `api/vote.js`, `api/results.js` | Serverless functions |
| `scripts/generate-codes.mjs` | Creates the voting codes and the CSV for HR |

## Deploy on Vercel

1. Put this folder in a new GitHub repository (or deploy with the Vercel CLI).
2. In Vercel, choose **Add New Project**, import the repository, framework preset **Other**. No build command is needed.
3. In the project, open **Storage**, add **Upstash Redis** from the Marketplace and connect it to the project. This creates the database variables automatically (the code accepts either the `KV_REST_API_*` or the `UPSTASH_REDIS_REST_*` names).
4. In **Settings > Environment Variables**, add:
   - `CODE_SALT`: a long random text (for example 40 mixed characters). Set it once and never change it during the vote, or all codes stop working.
   - `ADMIN_KEY`: the jury password for `/admin.html`.
5. Redeploy so the new variables are picked up.
6. Optional: in **Settings > Domains**, add a subdomain such as `awards.` on your EDGE domain.

## Create the voting codes

On your own computer, with Node.js 20.6 or later:

```
cp .env.example .env        # then paste the four values from the Vercel project
npm install
npm run codes -- 100        # creates 100 codes and a file codes-YYYY-MM-DD.csv
```

Give the CSV to HR to pair each code with a staff member and send it individually, then delete the CSV. The database holds only hashed codes, so a lost code cannot be recovered, only replaced by generating an extra one (`npm run codes -- 1`).

## Test before launch

Generate 3 codes, vote with them, check `/admin.html`, then wipe everything and create the real codes:

```
npm run codes -- 3
npm run codes -- 100 --reset   # clears all test codes and votes, then creates the real 100
```

Never run `--reset` once voting has started.

## Customise

- Logo: add `public/logo.png` (the placeholder disappears automatically).
- Colours: edit `--brand`, `--gold`, `--compass`, `--quiet`, `--fair` at the top of `public/styles.css` (light and dark values).
- Departments, staff name suggestions, closing date, criteria and wording: `lib/config.js`, then redeploy. Adding more criteria to an award is just more lines in its `criteria` list.

## How the rules are enforced

- A code is valid only if its salted hash is in the database.
- The first vote for an award adds the code's hash to that award's "used" list in one atomic step, so a second attempt (even simultaneous) is refused.
- The vote record holds the nominee, department and answers only: no code, no time, no device detail. The jury page shows votes in random order.
- Votes are refused after the closing date (1 December 2026, 17:00 Mauritius time).
- 15 wrong codes from one connection within an hour blocks further attempts for that hour.
