#!/usr/bin/env bash
# verify-cue.sh — prove a sound cue is actually present in the film you are shipping.
#
# Law 6, operationalised. A cue can be correct in the source, present in the assembled
# index, and still contribute nothing to the mix — that is exactly how an inaudible typing
# effect survived a release. The composition is not evidence. The delivered file is.
#
# usage:
#   ./scripts/verify-cue.sh <master.mp4> <start_s> <dur_s> [previous-master.mp4]
#
#   With a previous master, it prints both so you can see the delta the change made.
#
# Read PEAK, not mean, for percussive cues (clicks, keystrokes, ticks): mean tells you a
# bed is present, peak tells you a transient is heard. A cue is audible when its transients
# land within roughly 12 dB of the narration in that window.

set -euo pipefail

FILE="${1:-}"
START="${2:-}"
DUR="${3:-}"
PREV="${4:-}"

if [[ -z "$FILE" || -z "$START" || -z "$DUR" ]]; then
  echo "usage: ./scripts/verify-cue.sh <master.mp4> <start_s> <dur_s> [previous-master.mp4]" >&2
  exit 1
fi

measure() {
  local f="$1"
  ffmpeg -hide_banner -ss "$START" -t "$DUR" -i "$f" -vn -af volumedetect -f null /dev/null 2>&1 \
    | grep -E "mean_volume|max_volume" \
    | sed -E 's/.*\] //' \
    | tr '\n' ' '
}

printf 'window  %ss → %ss\n\n' "$START" "$(echo "$START + $DUR" | bc -l | xargs printf '%.2f')"

if [[ -n "$PREV" ]]; then
  if [[ ! -f "$PREV" ]]; then echo "no such file: $PREV" >&2; exit 1; fi
  printf '%-28s %s\n' "$(basename "$PREV")" "$(measure "$PREV")"
fi
printf '%-28s %s\n' "$(basename "$FILE")" "$(measure "$FILE")"

echo
echo "If the peak barely moved after you raised a cue's volume, the SOURCE is too quiet:"
echo "  node scripts/level-sfx.mjs <asset> --bed <narration dB in this window>"
