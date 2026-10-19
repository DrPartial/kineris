#!/usr/bin/env python3
"""Composite the five peptide vial shots into the homepage hero lineup, on white
(the page shows it with mix-blend-multiply, so the white drops out on any light background).

    python3 tools/product-shots/lineup.py apps/web/public/products apps/web/public/home/range-lineup.webp
"""
import numpy as np, sys
from PIL import Image
P = sys.argv[1]
slugs = ['ghk-cu-50mg','tb-500-2mg','bpc-157-5mg','kpv-10mg','ss-31-10mg']
# vial occupies roughly x 380..820 in each 1200 shot; overlap neighbours slightly
step = 400
W = step*4 + 1200
canvas = np.full((1200, W, 3), 255.0)
# draw back-to-front: outer vials first, centre (bpc) last; outer ones shrunk a touch for depth
order = [0,4,1,3,2]
sizes = [0.86,0.93,1.0,0.93,0.86]
for i in order:
    img = Image.open(f'{P}/{slugs[i]}.webp').convert('RGB')
    s = sizes[i]
    n = int(1200*s)
    img = np.asarray(img.resize((n,n), Image.LANCZOS)).astype(float)
    x = i*step + (1200-n)//2
    y = 1200-n  # sit on same floor
    region = canvas[y:y+n, x:x+n]
    # multiply composite: white is transparent, shadows/vials darken
    canvas[y:y+n, x:x+n] = region*img/255.0
# crop to content
canvas = np.vstack([np.full((60, W, 3), 255.0), canvas])[0:1180, 300:W-300]
out = canvas
Image.fromarray(out.clip(0,255).astype(np.uint8)).save(sys.argv[2], 'WEBP', quality=90, method=6)
print(out.shape)
