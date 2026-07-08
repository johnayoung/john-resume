# jyoung.dev

Hugo site — writer-first homepage, essays at `/blog`, full record at `/about`. Ledger design system (Newsreader + IBM Plex Mono, single stylesheet `static/css/ledger.css`).

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

Post conventions the templates depend on:

- `pillar:` frontmatter slug must match an entry in `[[params.pillars]]` (hugo.toml) — drives the kicker, tags, and blog filters.
- `tldr:` list renders as the numbered Abstract and feeds JSON-LD.
- External links are auto-numbered as citations; the `## References` section (`N. [Title](url) — gloss`) is stripped from the body and feeds the Sources list + margin rail. Keep that exact format.
- Blockquote attribution as a trailing `> — [Source](url)` line renders as a `<footer>`.
- Code fences take an optional title: ` ```bash {title="The Ralph Loop"} ` renders the labeled code panel. Code is styled two-tone (ink + muted comments) by `ledger.css`.

## Deploy

Push to `master`. The GitHub Actions workflow (`.github/workflows/hugo.yml`) builds with `hugo --minify` and deploys to GitHub Pages. Custom domain (`jyoung.dev`) comes from `static/CNAME`.

Watch the deploy in the **Actions** tab. Live in ~1–2 minutes.

## Templates

- `layouts/index.html` — homepage (intro, ledger stats, 5 recent essays)
- `layouts/_default/list.html` — blog index with pillar filters
- `layouts/_default/single.html` — post: abstract, citation rail, sources
- `layouts/page/about.html` — about page incl. career git-graph (edit career/systems/education here)
- `layouts/_default/_markup/` — render hooks: link (citation numbering), blockquote (attribution footer), codeblock (titled panel)

The `design-explorations` branch archives the mockups this design was built from; `design-explorations/final/` there is the approved reference.

## Resume

```bash
node convert-resume.js      # rebuilds static/output/John_Young_Resume.docx from resume.md
```

The download link on `/about/` points at `output/John_Young_Resume.docx`.

## Gotchas

- Bump `HUGO_VERSION` in **both** `scripts/install-hugo.sh` and `.github/workflows/hugo.yml` to keep local and CI in sync.
- `public/` and `resources/` are build artifacts — gitignored, safe to delete.
- `data/research.json` `updated` date drives the "evidence base verified" badges site-wide.
