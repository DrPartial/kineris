# Banner film

A 23-second, silent, text-free banner film: eight object-only scenes cut with a different
transition at each join, one shared colour grade, fading in from and out to black so it loops
without a visible jump. Output is 1920x1080, 24 fps, H.264.

```sh
# put the downloaded scene clips in tools/banner-film/work/src/ (names as in scenes.json), then
python3 tools/banner-film/build_film.py          # writes work/out/kineris-banner-film{,-720}.mp4
```

Needs `ffmpeg` (with libx264) and Python 3. `scenes.json` holds the order, trims, per-scene grade
and the transition into each scene; edit it and re-run.

The master is ~29 MB (it carries film grain), so the web files in `apps/web/public/home/` are
re-encoded from it:

```sh
ffmpeg -i work/out/kineris-banner-film.mp4 -an -c:v libx264 -preset slow -crf 26 \
  -maxrate 5M -bufsize 10M -pix_fmt yuv420p -movflags +faststart banner-film-1080.mp4   # 3.7 MB
ffmpeg -i work/out/kineris-banner-film.mp4 -an -vf scale=1280:-2 -c:v libx264 -preset slow \
  -crf 27 -maxrate 2.5M -bufsize 5M -pix_fmt yuv420p -movflags +faststart banner-film-720.mp4   # 1.4 MB
```

## Where the scenes come from

Each scene is a Higgsfield still (Nano Banana Pro, with the real vial renders as image references
so the labels stay exact) animated with Kling 3.0 (pro, 5 s, sound off) from that still as the start
frame. The scenes: wet-basalt trio with an ember horizon, steel lab bench, condensation macro,
frost-and-ice (the original hero clip), a levitating vial in a jade ring, an overhead shot on black
glass, a mirror-floored pedestal hall, and a monolith above a sea of cloud at sunrise. Objects only,
no people (pack 2.4).

## Rules learned the hard way

- **Check every visible label at 100% in every clip, at several timestamps.** The animation models
  keep the labels remarkably well, but not always: in the macro clip a condensation droplet slides
  over the hyphen in "BPC-157" from about 4.5 s and wipes it out, so that scene is trimmed to its
  clean first 3.4 s. The overhead clip's tiny rotated "LYOPHILISED POWDER" line is soft in motion
  (blurry, not misspelled), so it stays short and between fast cuts.
- Some xfade transitions look worse than they sound: `zoomin` passes through a flat colour frame and
  `dissolve` is a grainy pixel dissolve. Look at a mid-transition frame before keeping one.
- Higgsfield may answer with a suggested preset instead of generating. Decline it
  (`declined_preset_id`) to keep your own prompt.
