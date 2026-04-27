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
