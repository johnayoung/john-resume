#!/usr/bin/env bash
# Install Hugo extended on Ubuntu/Debian/WSL2.
# Pinned to the same version as .github/workflows/hugo.yml so local == CI.

set -euo pipefail

HUGO_VERSION="0.140.0"

if command -v hugo >/dev/null 2>&1; then
  current="$(hugo version | awk '{print $2}' | sed 's/^v//' | cut -d'-' -f1)"
  if [[ "${current}" == "${HUGO_VERSION}" ]]; then
    echo "hugo ${HUGO_VERSION} already installed."
    exit 0
  fi
  echo "hugo ${current} installed; upgrading to ${HUGO_VERSION}."
fi

arch="$(dpkg --print-architecture)"
case "${arch}" in
  amd64|arm64) ;;
  *) echo "unsupported arch: ${arch}"; exit 1 ;;
esac

deb="hugo_extended_${HUGO_VERSION}_linux-${arch}.deb"
url="https://github.com/gohugoio/hugo/releases/download/v${HUGO_VERSION}/${deb}"
tmp="$(mktemp -d)"
trap 'rm -rf "${tmp}"' EXIT

echo "downloading ${url}"
curl -fsSL -o "${tmp}/hugo.deb" "${url}"

echo "installing (sudo)"
sudo dpkg -i "${tmp}/hugo.deb"

hugo version
