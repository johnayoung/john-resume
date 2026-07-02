# jyoung.dev

Personal site (`static/index.html`) + Hugo blog at `/blog`.

## Setup (once)

```bash
./scripts/install-hugo.sh   # installs Hugo extended, pinned to CI version
```

## Run locally

```bash
hugo serve                  # http://localhost:1313 — live reload
```

`scripts/dev.sh` does the same but regenerates the OG cards first (needs Go).

## Publish a blog post

Posts are authored in the private `john-content-engine` repo and land here as finished markdown: copy the draft to `content/blog/<slug>.md` with `draft: false`, commit, push. The slug in the filename becomes the URL: `/blog/my-post-slug/`.

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
├── hugo.toml               # Hugo config
└── .github/workflows/      # CI deploy
```

## Gotchas

- Hugo's home page is disabled (`disableKinds = ["home"]` in `hugo.toml`) so `static/index.html` wins at `/`. Don't add `layouts/index.html` — it would override the homepage.
- Bump `HUGO_VERSION` in **both** `scripts/install-hugo.sh` and `.github/workflows/hugo.yml` to keep local and CI in sync.
- `public/` and `resources/` are build artifacts — gitignored, safe to delete.
