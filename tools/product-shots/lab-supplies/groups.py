import numpy as np
from PIL import Image
plate = np.asarray(Image.open('empty-plate.png').convert('RGB')).astype(float)
# tight vial crop on the 2048 plate (vial bbox x 643-1405, y 200-1870) plus shadow room
V = plate[180:1900, 600:1450]

def place(canvas, img, cx, floor, scale):
    h, w, _ = img.shape
    im = np.asarray(Image.fromarray(img.astype(np.uint8)).resize((int(w*scale), int(h*scale)), Image.LANCZOS)).astype(float)
    h, w, _ = im.shape
    x, y = int(cx - w/2), int(floor - h)
    canvas[y:y+h, x:x+w] *= im/255.0   # multiply: white drops out, glass layers darken naturally

def finish(canvas, name, pad=0.08):
    mask = canvas.min(axis=2) < 250
    ys, xs = np.where(mask)
    crop = canvas[ys.min():ys.max()+1, xs.min():xs.max()+1]
    h, w, _ = crop.shape
    side = int(max(w*(1+2*pad), h/0.82))
    sq = np.full((side, side, 3), 255.0)
    x = (side-w)//2; y = min((side-h)//2 + int(side*0.04), int(side*0.935) - h)
    sq[y:y+h, x:x+w] = crop
    img = Image.fromarray(sq.clip(0,255).astype(np.uint8)).resize((1200,1200), Image.LANCZOS)
    arr = np.asarray(img).astype(float); rows=50
    ramp = np.linspace(0,1,rows)[:,None,None]**1.5
    arr[-rows:] = arr[-rows:]*(1-ramp)+255*ramp
    Image.fromarray(arr.astype(np.uint8)).save(name)

# 5 pack: one overlapping row, centre vial largest (same look as the homepage lineup)
c = np.full((2400, 4400, 3), 255.0)
for i, sc in [(0, .84), (4, .84), (1, .92), (3, .92), (2, 1.0)]:
    place(c, V, 900 + i*650, 2200, sc)
finish(c, 'sterile-vials-10ml-5pack.png')

# 10 pack: five at the back, five in front
c = np.full((2700, 6400, 3), 255.0)
for i in range(5): place(c, V, 1500 + i*860, 2150, 0.88)
for i in range(5): place(c, V, 1070 + i*860, 2600, 0.98)
finish(c, 'sterile-vials-10ml-10pack.png', pad=0.06)

# kit: three vials, centre one forward
c = np.full((2700, 4200, 3), 255.0)
for cx in (1450, 2750): place(c, V, cx, 2150, 0.92)
place(c, V, 2100, 2450, 1.0)
finish(c, 'vial-stopper-cap-kit.png')
