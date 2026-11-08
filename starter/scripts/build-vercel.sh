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

# An explicit domain wins over Vercel's generated hostname. Without either,
# leave baseURL to Hugo's config instead of silently replacing it with '/'.
base_url="${HUGO_BASEURL:-}"
if [[ -z "${base_url}" && -n "${VERCEL_URL:-}" ]]; then
  hostname="${VERCEL_URL}"
  if [[ "${VERCEL_ENV:-}" == "production" ]]; then
    hostname="${VERCEL_PROJECT_PRODUCTION_URL:-${VERCEL_URL}}"
  fi
  base_url="https://${hostname%/}/"
fi

build_args=(--source "${root_dir}" --minify --panicOnWarning)
if [[ -n "${base_url}" ]]; then
  build_args+=(--baseURL "${base_url}")
fi
"${temp_dir}/hugo" "${build_args[@]}"
