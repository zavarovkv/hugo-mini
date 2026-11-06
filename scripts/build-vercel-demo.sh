#!/usr/bin/env bash

# Build the theme's neutral exampleSite from the repository root on Vercel.
# Keep the Hugo binary and its verified checksum updated together.
set -euo pipefail

HUGO_VERSION="0.169.0"
HUGO_SHA256="c41672a0725d307758a132bc94a962e59760eb33f9ba08c991b81f9881d6fa7d"

if [[ -z "${VERCEL_URL:-}" ]]; then
  echo "VERCEL_URL is missing. Enable system environment variables in Vercel project settings." >&2
  exit 1
fi

if [[ "${VERCEL_ENV:-}" == "production" ]]; then
  demo_host="${VERCEL_PROJECT_PRODUCTION_URL:-${VERCEL_URL}}"
else
  demo_host="${VERCEL_URL}"
fi

temp_dir="$(mktemp -d)"
trap 'rm -rf "$temp_dir"' EXIT

archive="${temp_dir}/hugo.tar.gz"
curl --fail --location --silent --show-error --retry 3 \
  "https://github.com/gohugoio/hugo/releases/download/v${HUGO_VERSION}/hugo_extended_${HUGO_VERSION}_linux-amd64.tar.gz" \
  --output "$archive"

printf '%s  %s\n' "$HUGO_SHA256" "$archive" | sha256sum --check --status
tar --extract --gzip --file "$archive" --directory "$temp_dir" hugo

# Vercel checks out repositories into a generic directory (e.g. /vercel/path0).
# Hugo finds a theme by its directory name, so expose this checkout under the
# expected `hugo-mini` name without copying or mutating repository sources.
mkdir --parents "${temp_dir}/themes"
ln --symbolic "${PWD}" "${temp_dir}/themes/hugo-mini"

"${temp_dir}/hugo" version
"${temp_dir}/hugo" -s exampleSite --themesDir "${temp_dir}/themes" \
  --baseURL "https://${demo_host%/}/" --minify --panicOnWarning
