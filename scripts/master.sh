#!/usr/bin/env bash
# master.sh — two-pass loudness master for a rendered film.
#
#   pass 1  measure with loudnorm
#   pass 2  correct to target, LIMIT the true peak, re-encode the video
#   verify  measure the delivered file and report
#
# Three things this encodes, all of which cost real time to learn:
#
#   1. loudnorm's linear=true applies ONE gain for the whole file and does not back off
#      when a single transient exceeds the target. A master measured +1.1 dBFS — clipped —
#      after one sound effect was made louder. The limiter is not belt-and-braces.
#   2. alimiter applies makeup gain of level_out/limit unless you pass level=disabled.
#      Adding the limiter to fix (1) produced -13.0 LUFS / -0.0 dBFS: louder than the
#      target it was added to protect.
#   3. The video is RE-ENCODED, not copied. Film grain defeats inter-frame compression, so
#      -c:v copy preserves a bloated file; -crf 19 -tune film took 68 MB to 38 MB with no
#      visible loss.
#
# usage:
#   ./scripts/master.sh renders/video-v1-raw.mp4 renders/video-v1.mp4 [target_lufs]
#
# Defaults to -14 LUFS / -1.0 dBTP, which is what most social and web platforms normalise
# toward. Deliver louder and the platform turns you down, squashing your dynamics for free.

set -euo pipefail

IN="${1:-}"
OUT="${2:-}"
TARGET="${3:--14}"
TP="-1.0"
LRA="7"
# 0.891 ≈ -1.0 dBFS, the limiter ceiling
LIMIT="0.891"

if [[ -z "$IN" || -z "$OUT" ]]; then
  echo "usage: ./scripts/master.sh <in-raw.mp4> <out.mp4> [target_lufs]" >&2
  exit 1
fi
if [[ ! -f "$IN" ]]; then
  echo "no such file: $IN" >&2
  exit 1
fi
if [[ "$IN" == "$OUT" ]]; then
  echo "refusing to overwrite the raw. Version your renders: video-v2.mp4, not in place." >&2
  exit 1
fi
if [[ -f "$OUT" ]]; then
  echo "note: $OUT exists and will be replaced. Version renders rather than overwriting them." >&2
fi

echo "── pass 1 · measuring $IN"
MEASURE=$(ffmpeg -hide_banner -i "$IN" -af "loudnorm=I=${TARGET}:print_format=json" -f null - 2>&1 || true)

read -r M_I M_TP M_LRA M_THRESH <<EOF
$(printf '%s' "$MEASURE" | node -e '
let s = ""; process.stdin.on("data", d => s += d).on("end", () => {
  const m = s.match(/\{[\s\S]*?"target_offset"[\s\S]*?\}/);
  if (!m) { console.error("could not parse loudnorm output"); process.exit(1); }
  const j = JSON.parse(m[0]);
  process.stdout.write([j.input_i, j.input_tp, j.input_lra, j.input_thresh].join(" "));
});')
EOF

echo "   measured  I ${M_I} LUFS · TP ${M_TP} dBTP · LRA ${M_LRA} · thresh ${M_THRESH}"

# Keep the whole filter chain in ONE double-quoted string. Splitting or re-quoting it is
# how you get: Unable to parse "measured_I".
AF="loudnorm=I=${TARGET}:TP=${TP}:LRA=${LRA}:linear=true"
AF="${AF}:measured_I=${M_I}:measured_TP=${M_TP}:measured_LRA=${M_LRA}:measured_thresh=${M_THRESH}"
AF="${AF},alimiter=limit=${LIMIT}:level=disabled:attack=5:release=50"

echo "── pass 2 · correcting, limiting and re-encoding → $OUT"
ffmpeg -hide_banner -y -i "$IN" \
  -c:v libx264 -preset slow -crf 19 -tune film -pix_fmt yuv420p \
  -af "$AF" \
  -c:a aac -b:a 192k -movflags +faststart \
  "$OUT" 2>&1 | tail -1

echo "── verify · measuring the DELIVERED file (never trust the filter graph's own report)"
ffmpeg -hide_banner -i "$OUT" -af ebur128=peak=true:framelog=quiet -f null - 2>&1 \
  | grep -E "^\s+(I|Peak|LRA):" || true

SIZE=$(du -h "$OUT" | cut -f1)
echo "── $OUT · $SIZE"
echo
echo "Expected: I within 0.5 LUFS of ${TARGET}, Peak <= -0.8 dBFS."
echo "(AAC can land a hair above the limiter ceiling; that is normal.)"
echo "If I is ~1 dB HOT, something dropped level=disabled from the limiter."
