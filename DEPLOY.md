# Deploying the site

The site (`site/`) is a static Next.js export — plain HTML/CSS/JS, no server.
It can be hosted anywhere. Two paths are set up:

## Cloudflare Pages (recommended)

The site serves at the **root** of a `*.pages.dev` domain, so **do not** set
`AOG_BASE_PATH` for Cloudflare (basePath must be empty).

### Option A — connect the repo (auto-deploys on every push)

In the Cloudflare dashboard → **Workers & Pages → Create → Pages → Connect to Git**:

- Repository: `aog-necrology`
- Production branch: `main`
- Framework preset: **Next.js (Static HTML Export)**
- Root directory: `site`
- Build command: `npm run build`
- Build output directory: `out`
- Environment variables: **none** (leave `AOG_BASE_PATH` unset)

Every push to `main` then rebuilds and deploys automatically.

### Option B — deploy from the CLI now

```bash
npx wrangler login                 # one-time browser OAuth
cd site
npm run build                      # AOG_BASE_PATH unset -> serves at root
npx wrangler pages deploy          # uses site/wrangler.toml
```

`wrangler.toml` names the project `aog-necrology` and points at `./out`.

## GitHub Pages — LIVE (enabled 2026-07-04)

**The site is live at https://melonmelonz.github.io/aog-necrology/**

`.github/workflows/pages.yml` builds the site with `AOG_BASE_PATH=/<repo-name>`
(subpath serving) and deploys to Pages. Pages is **already enabled** (source =
GitHub Actions, set via `gh api --method POST repos/OWNER/REPO/pages -f
build_type=workflow`). It now redeploys automatically on every push that
touches `site/`, `dist/`, or the workflow — so after an extraction wave, the
merge/build/site_data + commit/push refreshes the live site with no extra step.

To force a rebuild without a push: `gh workflow run pages.yml`.

## Rebuilding the data first

The site reads `site/public/data/*`, generated from the dataset. After any
extraction batch, refresh it before deploying:

```bash
python pipeline/merge.py && python pipeline/build_db.py && python pipeline/site_data.py
```
