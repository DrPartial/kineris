#!/usr/bin/env python3
"""Build Kineris product-page vial images.

Pipeline: typeset a flat label (HTML -> PNG in headless Chromium, real Sora/Manrope and the
real logo) -> wrap it around the blank vial plate with a cylindrical map, carrying the
plate's own lighting through -> crop square -> write WebP.

The vial itself is an AI-generated photo (Higgsfield) with a *blank* label; all text is
typeset here so spelling, logo and type are exact and identical across every SKU.

    python3 tools/product-shots/build.py                 # every SKU in products.json
    python3 tools/product-shots/build.py bpc-157 pt-141  # just these slugs

Needs: Pillow, numpy, and a Chromium (set CHROME_PATH, or it is auto-detected).
"""
import glob
import html
import json
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

import numpy as np
from PIL import Image

HERE = Path(__file__).resolve().parent
ASSETS = HERE / "assets"
OUT_DIR = HERE.parent.parent / "apps" / "web" / "public" / "products"
MANIFEST = HERE.parent.parent / "apps" / "web" / "src" / "lib" / "product-images.generated.ts"

# ---- Brand tokens (KINERIS_BRAND_GUIDE.md section 3) -------------------------------------
PINE, BONE, JADE, EMBER, STONE = "#1C2B24", "#F6F4EE", "#3E6F56", "#E07B54", "#6B665C"
BONE_RGB = np.array([246.0, 244.0, 238.0])

# ---- Flat label canvas --------------------------------------------------------------------
# The label wraps the visible half-circumference of the vial, so it is wider than tall. Key
# content stays in the central ~1080px; cylindrical foreshortening squeezes the edges.
W, H = 2192, 1676

# ---- Label region measured on assets/vial-plate.png (glass-to-glass, full label height) ---
X0, X1, Y0, Y1 = 675, 1374, 838, 1677

# Square crop of the 2048px plate (vial bbox y 200-1870, x 643-1405; equal margins top and bottom), then downscale.
CROP = (74, 85, 1974, 1985)
OUT_SIZE = 1200

ICON_PATH = (
    "M100,6 C128,20 134,36 128,54 C123,70 112,84 100,94 "
    "C88,84 77,70 72,54 C66,36 72,20 100,6 Z"
)


def find_chrome() -> str:
    env = os.environ.get("CHROME_PATH")
    if env:
        return env
    for name in ("chromium", "chromium-browser", "google-chrome", "chrome"):
        found = shutil.which(name)
        if found:
            return found
    hits = sorted(glob.glob("/opt/pw-browsers/chromium-*/chrome-linux/chrome"))
    if hits:
        return hits[-1]
    sys.exit("No Chromium found; set CHROME_PATH.")


def logo_svg(color: str) -> str:
    # Inlined (not <img>) so the live <text> wordmark picks up the page's Sora @font-face.
    return f"""
<svg xmlns="http://www.w3.org/2000/svg" viewBox="2 14 456 122" class="logo">
  <svg x="8" y="21" width="108" height="108" viewBox="0 0 200 200">
    <path d="{ICON_PATH}" fill="{color}"/>
    <path d="{ICON_PATH}" fill="{color}" transform="rotate(120 100 100)"/>
    <path d="{ICON_PATH}" fill="{color}" transform="rotate(240 100 100)"/>
  </svg>
  <text x="152" y="103" font-family="Sora" font-weight="700" font-size="88"
        letter-spacing="-1" fill="{color}">kineris</text>
</svg>"""


def label_html(name_lines, sub, strength, eyebrow="Lyophilised powder", footer="For research use only"):
    fonts = (ASSETS / "fonts").as_uri()
    name_html = "".join(f'<span class="nl">{html.escape(l)}</span>' for l in name_lines)
    # Always reserve the subtitle slot so the name sits at the same height across products.
    sub_html = (f'<div class="sub">{html.escape(sub)}</div>' if sub
                else '<div class="sub" style="visibility:hidden">&nbsp;</div>')
    return f"""<!doctype html><html><head><meta charset="utf-8"><style>
@font-face {{ font-family: Sora;    src: url("{fonts}/Sora-VF.woff2");    font-weight: 100 800; }}
@font-face {{ font-family: Manrope; src: url("{fonts}/Manrope-VF.woff2"); font-weight: 200 800; }}
* {{ margin: 0; padding: 0; box-sizing: border-box; }}
html, body {{ width: {W}px; height: {H}px; background: {BONE}; overflow: hidden; }}
.label {{ position: relative; width: {W}px; height: {H}px; background: {BONE};
          font-family: Manrope; color: {PINE}; }}
.col {{ position: absolute; left: 0; right: 0; display: flex; flex-direction: column;
        align-items: center; text-align: center; }}
.logo {{ width: 640px; height: auto; display: block; }}
.eyebrow {{ font-weight: 700; font-size: 44px; letter-spacing: .24em; text-transform: uppercase;
            color: {STONE}; padding-left: .24em; }}
.name {{ font-family: Sora; font-weight: 700; letter-spacing: -.02em; line-height: 1.04;
         color: {PINE}; display: flex; flex-direction: column; align-items: center; }}
.nl {{ display: inline-block; white-space: nowrap; }}
.sub {{ margin-top: 30px; font-weight: 700; font-size: 74px; letter-spacing: .01em; color: {STONE}; }}
.pill {{ background: {JADE}; color: {BONE}; font-family: Sora; font-weight: 600; font-size: 128px;
         letter-spacing: -.01em; line-height: 1; padding: 44px 104px 50px; border-radius: 28px; }}
.band {{ position: absolute; left: 0; right: 0; bottom: 0; height: 232px; background: {PINE};
         display: flex; align-items: center; justify-content: center; }}
.band::before {{ content: ""; position: absolute; left: 0; right: 0; top: 0; height: 14px; background: {EMBER}; }}
.band span {{ color: {BONE}; font-weight: 700; font-size: 60px; letter-spacing: .26em;
              text-transform: uppercase; padding-left: .26em; margin-top: 14px; }}
</style></head><body><div class="label">
  <div class="col" style="top:112px">{logo_svg(PINE)}</div>
  <div class="col" style="top:372px"><div class="eyebrow">{html.escape(eyebrow)}</div></div>
  <div class="col" style="top:480px;height:620px;justify-content:center">
    <div class="name" id="name">{name_html}</div>{sub_html}
  </div>
  <div class="col" style="top:1110px"><div class="pill">{html.escape(strength)}</div></div>
  <div class="band"><span>{html.escape(footer)}</span></div>
</div>
<script>
  // Shrink the whole name block together until its widest line fits the central safe zone.
  const MAXW = 1080, name = document.getElementById('name');
  let f = 290; name.style.fontSize = f + 'px';
  const widest = () => Math.max(...[...name.querySelectorAll('.nl')].map(e => e.getBoundingClientRect().width));
  document.fonts.ready.then(() => {{
    while (widest() > MAXW && f > 80) {{ f -= 4; name.style.fontSize = f + 'px'; }}
  }});
</script></body></html>"""


def render_label(chrome, tmp: Path, key, name_lines, sub, strength) -> Image.Image:
    html_path, png_path = tmp / f"{key}.html", tmp / f"{key}.png"
    html_path.write_text(label_html(name_lines, sub, strength), encoding="utf-8")
    subprocess.run(
        [chrome, "--headless=new", "--no-sandbox", "--disable-gpu", "--hide-scrollbars",
         "--allow-file-access-from-files", "--force-device-scale-factor=1",
         f"--window-size={W},{H + 240}", "--virtual-time-budget=4000",
         f"--screenshot={png_path}", html_path.as_uri()],
        check=True, capture_output=True, timeout=90,
    )
    # New-headless viewport is shorter than the window; render taller then crop to the label.
    return Image.open(png_path).convert("RGB").crop((0, 0, W, H))


def wrap(plate: np.ndarray, art_img: Image.Image, contrast=1.35, sheen=34.0, ss=2) -> np.ndarray:
    art = np.asarray(art_img).astype(np.float64)
    Hf, Wf, _ = art.shape
    w, h = X1 - X0, Y1 - Y0

    # Inverse cylindrical map at ss x plate resolution (box-downsampled for antialiasing):
    # screen x in (-1, 1) -> arc position via arcsin, so text foreshortens toward the glass edge.
    ow, oh = w * ss, h * ss
    s = (np.arange(ow) + 0.5) / ow * 2 - 1
    u = np.arcsin(np.clip(s, -1, 1)) / (np.pi / 2)
    sx = (u + 1) / 2 * Wf - 0.5
    x0 = np.clip(np.floor(sx).astype(int), 0, Wf - 2)
    fx = (sx - x0)[None, :, None]
    sy = (np.arange(oh) + 0.5) / oh * Hf - 0.5
    y0 = np.clip(np.floor(sy).astype(int), 0, Hf - 2)
    fy = (sy - y0)[:, None, None]
    top = art[y0][:, x0] * (1 - fx) + art[y0][:, x0 + 1] * fx
    bot = art[y0 + 1][:, x0] * (1 - fx) + art[y0 + 1][:, x0 + 1] * fx
    mapped = (top * (1 - fy) + bot * fy).reshape(h, ss, w, ss, 3).mean(axis=(1, 3))

    # Lighting comes from the plate's own blank label: luminance -> shading (lit side = 1.0),
    # plus a soft sheen where the plate catches light, visible on dark ink/jade, invisible on bone.
    lum = plate[Y0:Y1, X0:X1].mean(axis=2)
    lit = np.percentile(lum, 90)
    shade = np.clip((lum / lit) ** contrast, 0, 1.06)[..., None]
    p50, p995 = np.percentile(lum, 50), np.percentile(lum, 99.5)
    hi = np.clip((lum - p50) / (p995 - p50), 0, 1)[..., None]
    out = plate.copy()
    out[Y0:Y1, X0:X1] = np.clip(mapped * shade + sheen * hi ** 2, 0, 255)
    return out


def feather_bottom(img: Image.Image, rows=50) -> Image.Image:
    """Fade the last rows to pure white so the floor shadow never leaves a hard edge on a white card."""
    arr = np.asarray(img).astype(np.float64)
    ramp = np.linspace(0, 1, rows)[:, None, None] ** 1.5
    arr[-rows:] = arr[-rows:] * (1 - ramp) + 255.0 * ramp
    return Image.fromarray(arr.astype(np.uint8))


def write_manifest(products):
    """The web app imports this to know which (slug, size) images exist; keep it generated."""
    lines = [
        "// GENERATED by tools/product-shots/build.py, do not edit by hand.",
        "// Sizes that have a product image at /products/<slug>-<size>.webp.",
        "export const PRODUCT_IMAGE_SIZES: Record<string, string[]> = {",
    ]
    for p in products:
        sizes = ", ".join(f"'{s}'" for s in p["sizes"])
        lines.append(f"  '{p['slug']}': [{sizes}],")
    lines += ["}", ""]
    MANIFEST.write_text("\n".join(lines), encoding="utf-8")
    print(f"{MANIFEST.relative_to(HERE.parent.parent)}")


def strength_label(size: str) -> str:
    digits = "".join(c for c in size if c.isdigit() or c == ".")
    return f"{digits} {size[len(digits):]}"


def main(only):
    all_products = json.loads((HERE / "products.json").read_text(encoding="utf-8"))
    products = all_products
    if only:
        products = [p for p in all_products if p["slug"] in only]
        missing = set(only) - {p["slug"] for p in products}
        if missing:
            sys.exit(f"Unknown slug(s): {', '.join(sorted(missing))}")
    chrome = find_chrome()
    plate = np.asarray(Image.open(ASSETS / "vial-plate.png").convert("RGB")).astype(np.float64)
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory() as t:
        tmp = Path(t)
        for p in products:
            for size in p["sizes"]:
                key = f"{p['slug']}-{size}"
                art = render_label(chrome, tmp, key, p["name"], p["sub"], strength_label(size))
                img = Image.fromarray(wrap(plate, art).astype(np.uint8)).crop(CROP)
                img = img.resize((OUT_SIZE, OUT_SIZE), Image.LANCZOS)
                img = feather_bottom(img)
                dest = OUT_DIR / f"{key}.webp"
                img.save(dest, "WEBP", quality=92, method=6)
                print(f"{dest.relative_to(HERE.parent.parent)}  {dest.stat().st_size // 1024} KB")
    # Always the full list, even for a partial rebuild: it describes what exists on disk.
    write_manifest(all_products)


if __name__ == "__main__":
    main(sys.argv[1:])
