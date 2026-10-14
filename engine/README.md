# engine

The shared code for every film: springs and camera in the page, render, audio and QA outside it.
Node 20+ with Playwright, ffmpeg, Python 3 with numpy and pillow. Run `engine/preflight.sh` first.

| Step | Command |
|---|---|
| Check the machine | `engine/preflight.sh [--cdp http://127.0.0.1:9222]` |
| Serve the film folder (cache off) | `python3 engine/serve.py <dir> 8765` |
| Shortlist songs | `python3 engine/grid.py --scan songs/*.mp3` |
| Beat grid of the chosen song | `python3 engine/grid.py song.mp3 --json build/grid.json` |
| Stills, one per beat | `node engine/snap.mjs <url> build/beats --beat 0.4878 --beats 0:72` then `python3 engine/sheet.py build/beats build/beats.jpg` |
| Purity test | `node engine/pure.mjs <url>` |
| Export sound cues | `node engine/cues.mjs <url> build/cues.json` |
| Mix | your `mix.py`, using `engine/audio.py` (see its header) |
| Draft with sound | `node engine/render.mjs <url> --draft --audio build/mix.wav` |
| Final | `node engine/render.mjs <url> --audio build/mix.wav` |
| Verify the file | `python3 engine/verify.py build/film.mp4 --storyboard build/storyboard.jpg` |

Add `--cdp http://127.0.0.1:9222` to any `.mjs` command to use a Chrome you already run instead of
launching headless Chromium. `example/` is a 4-second film showing the API; serve `engine/` and open
`/example/`.

Tests: `python3 engine/test_grid.py` (beat grid on synthetic songs).
