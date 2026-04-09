#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

# Claude Code — optional; Docker proxies / offline builds often block claude.ai.
if curl -fsSL https://claude.ai/install.sh | bash -s stable; then
  echo "Claude Code installed. Run 'claude' to sign in."
else
  echo "Warning: Claude Code install failed (network/proxy). You can install it later inside the container." >&2
fi

# Avoid `corepack enable` as non-root: it tries to symlink into /usr/local/bin and often exits EACCES.
corepack prepare pnpm@9.6.0 --activate || npm install -g pnpm@9.6.0

pnpm install --frozen-lockfile

if ! grep -q '\.local/bin' ~/.bashrc 2>/dev/null; then
  printf '\nexport PATH="$HOME/.local/bin:$PATH"\n' >> ~/.bashrc
fi

echo "Dev container setup finished."
