#!/usr/bin/env bash
# Vercel's build runs without npm or a preinstalled Hugo executable.
set -euo pipefail

hugo_version="0.169.0"
hugo_sha256="c41672a0725d307758a132bc94a962e59760eb33f9ba08c991b81f9881d6fa7d"
root_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"

bash "${root_dir}/scripts/setup-theme.sh"

temp_dir="$(mktemp -d)"
trap 'rm -rf "${temp_dir}"' EXIT
archive="${temp_dir}/hugo.tar.gz"
curl --fail --location --silent --show-error --retry 3 \
  "https://github.com/gohugoio/hugo/releases/download/v${hugo_version}/hugo_extended_${hugo_version}_linux-amd64.tar.gz" \
  --output "${archive}"

printf '%s  %s\n' "${hugo_sha256}" "${archive}" | sha256sum --check --status
tar --extract --gzip --file "${archive}" --directory "${temp_dir}" hugo

# Absolute canonical URLs are used when Vercel system variables are enabled.
# Otherwise the site still works on a new project's generated domain.
base_url="/"
if [[ -n "${VERCEL_URL:-}" ]]; then
  hostname="${VERCEL_URL}"
  if [[ "${VERCEL_ENV:-}" == "production" ]]; then
    hostname="${VERCEL_PROJECT_PRODUCTION_URL:-${VERCEL_URL}}"
  fi
  base_url="https://${hostname%/}/"
fi

"${temp_dir}/hugo" --source "${root_dir}" \
  --baseURL "${base_url}" --minify --panicOnWarning
