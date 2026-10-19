#!/usr/bin/env python3
"""python3 tools/banner-film/build_film.py [scenes.json]

Assemble the Kineris banner film: normalise + grade each scene, chain with xfade transitions,
fade from/to black so it loops cleanly. No audio, no text."""
import json
import os
import subprocess
import sys
from pathlib import Path

# Scratch folder: drop the downloaded scene clips in <work>/src, outputs land in <work>/out.
HERE = Path(__file__).resolve().parent
ROOT = Path(os.environ.get("FILM_WORK", HERE / "work"))
SRC, TMP, OUT = ROOT / "src", ROOT / "tmp", ROOT / "out"
for d in (SRC, TMP, OUT):
    d.mkdir(parents=True, exist_ok=True)

W, H, FPS = 1920, 1080, 24

# Shared look: pine-green shadows, restrained saturation, gentle contrast, vignette, fine grain.
BASE_GRADE = (
    "eq=contrast=1.07:saturation=0.94:gamma=0.98,"
    "colorbalance=rs=-0.02:gs=0.03:bs=0.015:rm=-0.01:gm=0.01,"
    "vignette=angle=PI/5.5,"
    "noise=alls=5:allf=t"
)

# name, file, trim start, duration, extra grade, transition INTO this clip (name, seconds)
SCENES = json.loads(Path(sys.argv[1] if len(sys.argv) > 1 else HERE / "scenes.json").read_text())


def sh(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode:
        print(" ".join(map(str, cmd)))
        print(r.stderr[-1500:])
        raise SystemExit(1)
    return r


def normalise(scene):
    out = TMP / f"{scene['name']}.mp4"
    vf = (
        f"trim=start={scene['ss']}:duration={scene['dur']},setpts=PTS-STARTPTS,"
        f"scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},setsar=1,fps={FPS},"
        f"{BASE_GRADE}" + (f",{scene['grade']}" if scene.get("grade") else "")
    )
    sh(["ffmpeg", "-v", "error", "-y", "-i", str(SRC / scene["file"]), "-an", "-vf", vf,
        "-c:v", "libx264", "-preset", "slow", "-crf", "12", "-pix_fmt", "yuv420p", str(out)])
    return out


def main():
    files = [normalise(s) for s in SCENES]
    cmd = ["ffmpeg", "-v", "error", "-y"]
    for f in files:
        cmd += ["-i", str(f)]

    chain, cur_len, prev = [], SCENES[0]["dur"], "[0:v]"
    for i, s in enumerate(SCENES[1:], start=1):
        t_name, t_dur = s["transition"]
        offset = round(cur_len - t_dur, 3)
        label = f"[x{i}]"
        chain.append(f"{prev}[{i}:v]xfade=transition={t_name}:duration={t_dur}:offset={offset}{label}")
        cur_len = cur_len + s["dur"] - t_dur
        prev = label
    total = round(cur_len, 3)
    chain.append(f"{prev}fade=t=in:st=0:d=0.9,fade=t=out:st={round(total - 1.1, 3)}:d=1.1,format=yuv420p[v]")

    master = OUT / "kineris-banner-film.mp4"
    cmd += ["-filter_complex", ";".join(chain), "-map", "[v]", "-an", "-r", str(FPS),
            "-c:v", "libx264", "-preset", "slow", "-crf", "20", "-pix_fmt", "yuv420p",
            "-movflags", "+faststart", str(master)]
    sh(cmd)

    small = OUT / "kineris-banner-film-720.mp4"
    sh(["ffmpeg", "-v", "error", "-y", "-i", str(master), "-an", "-vf", "scale=1280:-2",
        "-c:v", "libx264", "-preset", "slow", "-crf", "24", "-pix_fmt", "yuv420p",
        "-movflags", "+faststart", str(small)])
    print(json.dumps({"total_s": total, "master": str(master), "small": str(small)}))


if __name__ == "__main__":
    main()
