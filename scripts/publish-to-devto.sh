#!/usr/bin/env bash
# Publish a Hugo blog post to dev.to with a canonical URL pointing back to jyoung.dev.
#
# Usage:
#   DEVTO_API_KEY=xxxxx scripts/publish-to-devto.sh \
#     content/blog/anatomy-of-a-perfect-ai-agent-task.md \
#     --tags ai,programming,devops,productivity \
#     --publish
#
# Flags:
#   --tags a,b,c,d   Up to 4 dev.to tags (required). Lowercase alphanumeric.
#   --publish        Actually publish. Without it, creates a draft.
#   --canonical URL  Override canonical URL (default: https://jyoung.dev/blog/<slug>/).
#   --site URL       Override site base (default: https://jyoung.dev).
#   --cover URL      Override cover image URL (default: https://jyoung.dev/og/<slug>.png).
#   --no-cover       Don't send a cover image.
#   --update ID      PUT to update an existing dev.to article.
#   --dry-run        Print the payload without calling the API.

set -euo pipefail

API="https://dev.to/api/articles"
DEFAULT_SITE="https://jyoung.dev"

usage() {
  echo "Usage: publish-to-devto.sh <path-to-markdown> --tags a,b,c [--publish] [--update ID]" >&2
  exit 1
}

FILE=""
TAGS=""
PUBLISH=false
DRY_RUN=false
CANONICAL=""
SITE=""
COVER=""
NO_COVER=false
UPDATE_ID=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --publish)   PUBLISH=true; shift ;;
    --dry-run)   DRY_RUN=true; shift ;;
    --no-cover)  NO_COVER=true; shift ;;
    --tags)      TAGS="$2"; shift 2 ;;
    --canonical) CANONICAL="$2"; shift 2 ;;
    --site)      SITE="$2"; shift 2 ;;
    --cover)     COVER="$2"; shift 2 ;;
    --update)    UPDATE_ID="$2"; shift 2 ;;
    --*)         echo "Unknown flag: $1" >&2; exit 1 ;;
    *)           [[ -z "$FILE" ]] && FILE="$1" || usage; shift ;;
  esac
done

[[ -z "$FILE" ]] && usage
[[ -z "$TAGS" ]] && { echo "--tags is required (e.g. --tags ai,programming)" >&2; exit 1; }
[[ ! -f "$FILE" ]] && { echo "File not found: $FILE" >&2; exit 1; }

IFS=',' read -ra TAG_ARRAY <<< "$TAGS"
[[ ${#TAG_ARRAY[@]} -gt 4 ]] && { echo "dev.to allows max 4 tags, got ${#TAG_ARRAY[@]}" >&2; exit 1; }
for t in "${TAG_ARRAY[@]}"; do
  [[ "$t" =~ ^[a-z0-9]+$ ]] || { echo "Tag \"$t\" must be lowercase alphanumeric (no spaces or hyphens)" >&2; exit 1; }
done

SLUG="$(basename "$FILE" .md)"
SITE="${SITE:-$DEFAULT_SITE}"
SITE="${SITE%/}"
CANONICAL="${CANONICAL:-$SITE/blog/$SLUG/}"

# Front matter is between the first two `---` lines; body is everything after.
# Only the first two `---` lines are delimiters — `---` horizontal rules in the
# body must be preserved verbatim.
FRONTMATTER="$(awk 'c<2 && /^---$/ {c++; next} c==1' "$FILE")"
BODY="$(awk 'c<2 && /^---$/ {c++; next} c>=2' "$FILE" | awk 'NF{p=1} p' | tac | awk 'NF{p=1} p' | tac)"

extract_fm() {
  printf '%s\n' "$FRONTMATTER" | sed -nE "s/^$1:[[:space:]]+\"?([^\"]*)\"?[[:space:]]*\$/\1/p" | head -1
}

TITLE="$(extract_fm title)"
DESCRIPTION="$(extract_fm description)"
[[ -z "$TITLE" ]] && { echo "Front matter missing 'title'" >&2; exit 1; }

MAIN_IMAGE=""
if ! $NO_COVER; then
  if [[ -n "$COVER" ]]; then
    MAIN_IMAGE="$COVER"
  else
    REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
    OG_PATH="$REPO_ROOT/static/og/$SLUG.png"
    if [[ -f "$OG_PATH" ]]; then
      MAIN_IMAGE="$SITE/og/$SLUG.png"
    else
      echo "warn: no cover image at static/og/$SLUG.png — publishing without one" >&2
    fi
  fi
fi

TAGS_JSON="$(printf '%s\n' "${TAG_ARRAY[@]}" | jq -R . | jq -s .)"

PAYLOAD="$(jq -n \
  --arg title "$TITLE" \
  --arg body "$BODY" \
  --arg description "$DESCRIPTION" \
  --arg canonical "$CANONICAL" \
  --arg main_image "$MAIN_IMAGE" \
  --argjson published "$PUBLISH" \
  --argjson tags "$TAGS_JSON" \
  '{
    article: ({
      title: $title,
      body_markdown: $body,
      published: $published,
      canonical_url: $canonical,
      tags: $tags,
    }
    + (if $description  != "" then {description: $description} else {} end)
    + (if $main_image   != "" then {main_image:  $main_image}  else {} end))
  }')"

if $DRY_RUN; then
  echo "$PAYLOAD"
  exit 0
fi

[[ -z "${DEVTO_API_KEY:-}" ]] && { echo "DEVTO_API_KEY env var is required" >&2; exit 1; }

if [[ -n "$UPDATE_ID" ]]; then
  URL="$API/$UPDATE_ID"
  METHOD="PUT"
else
  URL="$API"
  METHOD="POST"
fi

TMP="$(mktemp)"
trap 'rm -f "$TMP"' EXIT

STATUS="$(curl -sS -o "$TMP" -w '%{http_code}' -X "$METHOD" "$URL" \
  -H "api-key: $DEVTO_API_KEY" \
  -H "content-type: application/json" \
  -H "accept: application/vnd.forem.api-v1+json" \
  -d "$PAYLOAD")"

if [[ "$STATUS" -ge 400 ]]; then
  echo "dev.to $METHOD $URL -> $STATUS" >&2
  cat "$TMP" >&2
  exit 1
fi

ID="$(jq -r '.id' "$TMP")"
PUBLISHED_AT="$(jq -r '.published_at // empty' "$TMP")"
ARTICLE_URL="$(jq -r '.url' "$TMP")"
RET_CANONICAL="$(jq -r '.canonical_url // empty' "$TMP")"
COVER_OUT="$(jq -r '.cover_image // .main_image // "(none)"' "$TMP")"
RET_TAGS="$(jq -r 'if (.tag_list|type) == "array" then .tag_list|join(", ") else (.tag_list // "") end' "$TMP")"

echo "$([[ -n "$UPDATE_ID" ]] && echo Updated || echo Created) dev.to article id=$ID"
echo "  state: $([[ -n "$PUBLISHED_AT" ]] && echo "published ($PUBLISHED_AT)" || echo draft)"
echo "  url:   $ARTICLE_URL"
echo "  canonical: $RET_CANONICAL"
echo "  cover: $COVER_OUT"
echo "  tags:  $RET_TAGS"
