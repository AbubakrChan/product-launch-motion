#!/usr/bin/env bash
# preflight.sh [--cdp http://127.0.0.1:9222]: is this machine ready to render? One line per check, then GO or NO-GO.
# Run it before writing any film code; every miss here once cost a session time mid-render.
here="$(cd "$(dirname "$0")" && pwd)"; bad=0
ok() { printf '  ok    %s\n' "$1"; }; no() { printf '  MISS  %s\n        fix: %s\n' "$1" "$2"; bad=1; }
v=$(node -e 'console.log(process.versions.node.split(".")[0])' 2>/dev/null)
[[ -n $v && $v -ge 20 ]] && ok "node $v" || no "node >= 20" "install Node 20+"
node -e "import('$here/browser.mjs').then(m=>m.loadPlaywright()).then(()=>process.exit(0),()=>process.exit(1))" 2>/dev/null \
  && ok "playwright" || no "playwright" "npm i playwright && npx playwright install chromium (or attach to your Chrome with --cdp)"
if command -v ffmpeg >/dev/null; then
  ffmpeg -hide_banner -encoders 2>/dev/null | grep -q libx264 && ok "ffmpeg with libx264" || no "ffmpeg has no libx264" "use a full static build"
else no "ffmpeg" "install ffmpeg (static builds work; put it on PATH)"; fi
command -v ffprobe >/dev/null && ok "ffprobe" || no "ffprobe" "comes with ffmpeg"
PY=${PYTHON:-python3}
$PY -c 'import numpy, PIL' 2>/dev/null && ok "python numpy + pillow ($PY)" || no "python numpy + pillow" "uv venv .venv && uv pip install numpy pillow, then PYTHON=.venv/bin/python"
free_gb=$(df -Pk . | awk 'NR==2{print int($4/1048576)}')
[[ $free_gb -ge 8 ]] && ok "disk: ${free_gb} GB free" || no "disk: only ${free_gb} GB free" "free space; a 1080p chunk of PNG subframes is ~2-4 GB before it is encoded"
if [[ ${1:-} == --cdp ]]; then
  curl -s --max-time 2 "${2:-http://127.0.0.1:9222}/json/version" >/dev/null && ok "Chrome on ${2:-http://127.0.0.1:9222}" || no "no Chrome on ${2:-http://127.0.0.1:9222}" "start Chrome with --remote-debugging-port"
fi
[[ $(uname) == Darwin ]] && echo "  note  macOS: render.mjs writes frames to a *.noindex folder so Spotlight leaves them alone"
[[ $bad == 0 ]] && echo "GO" || { echo "NO-GO"; exit 1; }
