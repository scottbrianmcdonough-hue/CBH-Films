#!/bin/bash
# Prepare a Claude Code on the web session to lint, analyse music and render hotel films.
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"

# Remotion and friends (npm install, not ci, so the cached container is reused).
npm install --no-audit --no-fund --loglevel=error

# Python tools: scripts/analyze-beats.py (librosa); Pillow for frame QA.
python3 -m pip install --quiet --disable-pip-version-check numpy pillow librosa 2>&1 \
  | grep -v "Running pip as the 'root' user" || true

# Remotion can't download its own Chrome here; use the preinstalled headless shell.
shell=$(ls -d /opt/pw-browsers/chromium_headless_shell-*/chrome-linux/headless_shell 2>/dev/null | head -1 || true)
if [ -n "$shell" ] && [ -n "${CLAUDE_ENV_FILE:-}" ]; then
  echo "export REMOTION_BROWSER_EXECUTABLE=\"$shell\"" >> "$CLAUDE_ENV_FILE"
fi
