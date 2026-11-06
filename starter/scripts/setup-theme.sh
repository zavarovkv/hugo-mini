#!/usr/bin/env bash
# Install the exact reviewed Hugo Mini release; keep its tag and SHA in sync.
set -euo pipefail

theme_tag="v3.4.0"
theme_sha="33ec3a78259fa6c5221fd22f320aefcb1ad2828d"
root_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
theme_dir="${root_dir}/themes/hugo-mini"

if [[ ! -d "${theme_dir}/.git" ]]; then
  if [[ -e "${theme_dir}" ]]; then
    echo "Refusing to overwrite existing theme path: ${theme_dir}" >&2
    exit 1
  fi

  mkdir -p -- "${root_dir}/themes"
  git clone --quiet --depth 1 --branch "${theme_tag}" \
    https://github.com/zavarovkv/hugo-mini.git "${theme_dir}"
fi

actual_sha="$(git -C "${theme_dir}" rev-parse HEAD)"
if [[ "${actual_sha}" != "${theme_sha}" ]]; then
  echo "Unexpected Hugo Mini revision: ${actual_sha}; expected ${theme_sha}" >&2
  exit 1
fi

echo "Hugo Mini ${theme_tag} verified (${actual_sha})"
