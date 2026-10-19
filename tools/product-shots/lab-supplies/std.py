import numpy as np
from PIL import Image, ImageFilter
O='/mnt/project-files/website/lab-supplies-images/originals/'

def load(f):
    a = np.asarray(Image.open(O+f).convert('RGB')).astype(float)
    # lift the off-white backdrop to pure white without touching the product
    lum = a.min(axis=2, keepdims=True)
    t = np.clip((lum - 238) / (250 - 238), 0, 1)
    return a*(1-t) + 255*t

def crop(a):
    m = a.min(axis=2) < 248; ys, xs = np.where(m)
    return a[ys.min():ys.max()+1, xs.min():xs.max()+1]

def shadow(canvas, x0, x1, ybase, strength=0.13):
    H, W, _ = canvas.shape
    s = Image.new('L', (W, H), 0)
    from PIL import ImageDraw
    d = ImageDraw.Draw(s)
    w = x1-x0; h = max(10, int(min(w, 900)*0.05))
    d.ellipse([x0+w*0.06, ybase-h*0.5, x1-w*0.06, ybase+h*0.5], fill=255)
    s = s.filter(ImageFilter.GaussianBlur(min(w, 900)*0.025))
    sh = np.asarray(s).astype(float)[..., None]/255*strength
    canvas *= (1-sh)

def place(canvas, img, cx, floor, scale=1.0):
    im = img
    if scale != 1.0:
        im = np.asarray(Image.fromarray(img.clip(0,255).astype(np.uint8)).resize((int(img.shape[1]*scale), int(img.shape[0]*scale)), Image.LANCZOS)).astype(float)
    h, w, _ = im.shape
    x, y = int(cx-w/2), int(floor-h)
    canvas[y:y+h, x:x+w] *= im/255.0
    return x, x+w

def finish(canvas, name, pad=0.09, hfrac=0.82):
    m = canvas.min(axis=2) < 250; ys, xs = np.where(m)
    c = canvas[ys.min():ys.max()+1, xs.min():xs.max()+1]
    h, w, _ = c.shape
    side = int(max(w*(1+2*pad), h/hfrac))
    sq = np.full((side, side, 3), 255.0)
    x = (side-w)//2; y = min((side-h)//2 + int(side*0.04), int(side*0.935)-h)
    sq[y:y+h, x:x+w] = c
    img = Image.fromarray(sq.clip(0,255).astype(np.uint8)).resize((1200,1200), Image.LANCZOS)
    arr = np.asarray(img).astype(float); rows=50
    ramp = np.linspace(0,1,rows)[:,None,None]**1.5
    arr[-rows:] = arr[-rows:]*(1-ramp)+255*ramp
    Image.fromarray(arr.astype(np.uint8)).save(name)

def single(f, name, target_h, **kw):
    a = crop(load(f))
    sc = target_h / a.shape[0]
    c = np.full((int(target_h*1.6)+400, int(a.shape[1]*sc*1.6)+400, 3), 255.0)
    floor = c.shape[0]-200
    x0, x1 = place(c, a, c.shape[1]//2, floor, sc)
    shadow(c, x0, x1, floor-2)
    # re-multiply product over its own shadow so the shadow sits behind it
    finish(c, name, **kw)

single('peptide-storage-case.jpg', 'peptide-storage-case.png', 2000)
single('petri-dish.webp', 'petri-dishes-90mm.png', 800, pad=0.08)
single('glass-beaker.jpg', 'glass-beaker-set.png', 1400, hfrac=0.72)

# amber: five bottles in one overlapping row, centre largest (same as the 5 pack of vials)
a = crop(load('amber-dropper-bottle.webp'))
c = np.full((2600, 4200, 3), 255.0)
floor = 2300
xs = []
for i, sc in [(0,.84),(4,.84),(1,.92),(3,.92),(2,1.0)]:
    pass
for i, sc in [(0,.84),(4,.84),(1,.92),(3,.92),(2,1.0)]:
    xs += list(place(c, a, 1000+i*550, floor, sc*1.9))
shadow(c, min(xs), max(xs), floor-2, 0.10)
finish(c, 'amber-dropper-bottles-10ml.png')

single('glass-dropper-pipette.webp', 'glass-dropper-pipettes.png', 1500, hfrac=0.84)
