#!/usr/bin/env bash
# Install and verify an exact reviewed Hugo Mini revision.
set -euo pipefail

theme_sha="5c7f2844904580e70fb78ee778615c651bdc51b4"
root_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
theme_dir="${root_dir}/themes/hugo-mini"

if [[ ! -d "${theme_dir}/.git" ]]; then
  if [[ -e "${theme_dir}" ]]; then
    echo "Refusing to overwrite existing theme path: ${theme_dir}" >&2
    exit 1
  fi

  mkdir -p -- "${root_dir}/themes"
  git init --quiet "${theme_dir}"
  git -C "${theme_dir}" remote add origin https://github.com/zavarovkv/hugo-mini.git
  git -C "${theme_dir}" fetch --quiet --depth 1 origin "${theme_sha}"
  git -C "${theme_dir}" checkout --quiet --detach FETCH_HEAD
fi

actual_sha="$(git -C "${theme_dir}" rev-parse HEAD)"
if [[ "${actual_sha}" != "${theme_sha}" ]]; then
  echo "Unexpected Hugo Mini revision: ${actual_sha}; expected ${theme_sha}" >&2
  exit 1
fi

echo "Hugo Mini verified (${actual_sha})"
