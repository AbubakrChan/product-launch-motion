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
# Prints two things:
#   1. WINDOW    mean and peak across the whole window (and the previous master's, if given)
#   2. ENVELOPE  peak per 100ms slice
#
# Read the ENVELOPE. A window peak only proves the cue is loud SOMEWHERE inside the window
# — it cannot see a cue that starts late. A levelled asset cut from a field recording often
# opens with room tone, so the sound lands hundreds of milliseconds after the animation it
# is supposed to punctuate. That defect passed a window-peak check in a real film: the peak
# was -1.4 dB and the first half of the typing was silent.
#
# For percussive cues (clicks, keystrokes, ticks) read PEAK, not mean: mean tells you a bed
# is present, peak tells you a transient is heard. A cue is audible when its transients land
# within roughly 12 dB of the narration in that window.

set -euo pipefail

FILE="${1:-}"
START="${2:-}"
DUR="${3:-}"
PREV="${4:-}"

if [[ -z "$FILE" || -z "$START" || -z "$DUR" ]]; then
  echo "usage: ./scripts/verify-cue.sh <master.mp4> <start_s> <dur_s> [previous-master.mp4]" >&2
  exit 1
fi
[[ -f "$FILE" ]] || { echo "no such file: $FILE" >&2; exit 1; }

measure() {
  ffmpeg -hide_banner -ss "$2" -t "$3" -i "$1" -vn -af volumedetect -f null /dev/null 2>&1 \
    | grep -E "mean_volume|max_volume" | sed -E 's/.*\] //' | tr '\n' ' '
}
peak_only() {
  ffmpeg -hide_banner -ss "$2" -t "$3" -i "$1" -vn -af volumedetect -f null /dev/null 2>&1 \
    | grep -E "max_volume" | sed -E 's/.*max_volume: //; s/ dB//'
}

END=$(awk -v s="$START" -v d="$DUR" 'BEGIN{printf "%.2f", s+d}')
printf 'window  %ss → %ss\n\n' "$START" "$END"

echo "WINDOW"
if [[ -n "$PREV" ]]; then
  [[ -f "$PREV" ]] || { echo "no such file: $PREV" >&2; exit 1; }
  printf '  %-26s %s\n' "$(basename "$PREV")" "$(measure "$PREV" "$START" "$DUR")"
fi
printf '  %-26s %s\n' "$(basename "$FILE")" "$(measure "$FILE" "$START" "$DUR")"

echo
echo "ENVELOPE (peak per 100ms — the cue should start where the animation starts)"
SLICES=$(awk -v d="$DUR" 'BEGIN{printf "%d", (d/0.1)+0.999}')
for ((i = 0; i < SLICES; i++)); do
  T=$(awk -v s="$START" -v i="$i" 'BEGIN{printf "%.3f", s + i*0.1}')
  P=$(peak_only "$FILE" "$T" 0.1)
  if [[ -n "$PREV" ]]; then
    PP=$(peak_only "$PREV" "$T" 0.1)
    printf '  t=%-8s %8s dB   (was %8s dB)\n' "$T" "$P" "$PP"
  else
    printf '  t=%-8s %8s dB\n' "$T" "$P"
  fi
done

echo
echo "If the first slices are much quieter than the rest, the cue starts LATE — the asset"
echo "probably has a silent head. Re-cut it from its first transient:"
echo "  node scripts/level-sfx.mjs <asset>            # auto-trims the head by default"
echo "If every slice is quiet, the SOURCE is too quiet for any cue volume to fix:"
echo "  node scripts/level-sfx.mjs <asset> --bed <narration dB in this window>"
