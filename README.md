# jyoung.dev

Personal site (`static/index.html`) + Hugo blog at `/blog`.

## Setup (once)

```bash
./scripts/install-hugo.sh   # installs Hugo extended, pinned to CI version
```

## Run locally

```bash
hugo serve -D               # http://localhost:1313 — live reload, includes drafts
```

`-D` shows posts where `draft: true`. Drop it to preview exactly what production will publish.

## Write a new blog post

```bash
hugo new content/blog/my-post-slug.md
```

This creates a file from `archetypes/default.md` with `draft: true`. Edit it, then flip the front matter:

```yaml
---
title: "My Post"
date: 2026-04-27
draft: false        # <- set to false to publish
description: "Short summary used in the post list and RSS."
---
```

The slug in the filename becomes the URL: `/blog/my-post-slug/`.

Code blocks use Chroma (Catppuccin Mocha). Use fenced blocks with a language tag:

    ```go
    func main() { ... }
    ```

## Deploy

Push to `master`. The GitHub Actions workflow (`.github/workflows/hugo.yml`) builds with `hugo --minify` and deploys to GitHub Pages. Custom domain (`jyoung.dev`) comes from `static/CNAME`.

```bash
git add content/blog/my-post-slug.md
git commit -m "post: my post"
git push
```

Watch the deploy in the **Actions** tab. Live in ~1–2 minutes.

## Cross-post to dev.to

`scripts/publish-to-devto.sh` republishes a Hugo post to dev.to with a canonical URL pointing back to `jyoung.dev`, so search engines credit this domain. It also wires the OG image from `static/og/<slug>.png` as the cover. Requires `curl` and `jq`.

```bash
export DEVTO_API_KEY=xxxxx   # dev.to → Settings → Extensions → DEV API Keys

# Preview the payload without calling the API
./scripts/publish-to-devto.sh content/blog/my-post-slug.md \
  --tags ai,programming,devops,productivity --dry-run

# Create as draft (review on dev.to before going live)
./scripts/publish-to-devto.sh content/blog/my-post-slug.md \
  --tags ai,programming,devops,productivity

# Publish immediately
./scripts/publish-to-devto.sh content/blog/my-post-slug.md \
  --tags ai,programming,devops,productivity --publish

# Update an existing dev.to article
./scripts/publish-to-devto.sh content/blog/my-post-slug.md \
  --tags ai,programming,devops,productivity --publish --update 1234567
```

Flags: `--tags` (required, max 4, lowercase alphanumeric), `--publish`, `--dry-run`, `--canonical URL`, `--cover URL`, `--no-cover`, `--site URL`, `--update ID`.

Defaults derived from the filename: canonical `https://jyoung.dev/blog/<slug>/`, cover `https://jyoung.dev/og/<slug>.png` (skipped with a warning if the file isn't in `static/og/`).

The body is sent as-is. **Forem only recognizes 3-backtick fences** — 4+ backticks and `~~~` tildes are rendered as literal text, which silently breaks the post (inner content escapes the code block). To show triple-backticks inside a code block on dev.to, use 4-space indentation for the inner block instead of nested fences.

After publishing, verify on dev.to that `<link rel="canonical">` points at jyoung.dev and the rendered body matches the source. To check the live HTML:

```bash
curl -s https://dev.to/<username>/<article-slug> | grep -i 'rel="canonical"'
```

If you rename a post's slug on jyoung.dev, immediately PUT-update the dev.to article with the new `--canonical` URL — a canonical pointing at a 404 is worse than no canonical.

## Editing the homepage

The homepage is plain HTML at `static/index.html`. Hugo doesn't process it — files in `static/` are copied verbatim to `public/`. CSS/JS/images live in `static/css/`, `static/js/`, `static/img/`.

The blog has its own minimal layouts (`layouts/_default/*.html`) and styling (`static/css/blog.css`). The two don't share templates.

## Resume

```bash
node convert-resume.js      # rebuilds static/output/John_Young_Resume.docx from resume.md
```

The download link in `static/index.html` points at `output/John_Young_Resume.docx`.

## Layout

```
.
├── static/                 # served at / verbatim (homepage, css, js, img, output, CNAME)
├── content/blog/           # blog posts (markdown)
├── layouts/_default/       # blog templates (baseof, list, single)
├── archetypes/default.md   # template for `hugo new`
├── hugo.toml               # Hugo config
└── .github/workflows/      # CI deploy
```

## Gotchas

- Hugo's home page is disabled (`disableKinds = ["home"]` in `hugo.toml`) so `static/index.html` wins at `/`. Don't add `layouts/index.html` — it would override the homepage.
- Bump `HUGO_VERSION` in **both** `scripts/install-hugo.sh` and `.github/workflows/hugo.yml` to keep local and CI in sync.
- `public/` and `resources/` are build artifacts — gitignored, safe to delete.
