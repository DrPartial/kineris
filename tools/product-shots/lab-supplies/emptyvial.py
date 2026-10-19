import numpy as np
from PIL import Image
im=np.asarray(Image.open('../assets/vial-plate.png').convert('RGB')).astype(float)
out=im.copy()
band=im[792:832]            # clear glass just above the label
prof=np.median(band,axis=0) # per-column profile of the empty cylinder
y0,y1=834,1796
rng=np.random.default_rng(1)
for y in range(y0,y1):
    out[y]=prof+rng.normal(0,0.6,prof.shape)
# blend into original base over 24 rows so the bottom curve stays natural
for i,y in enumerate(range(y1,y1+24)):
    t=(i+1)/25
    out[y]=prof*(1-t)+im[y]*t
Image.fromarray(out.clip(0,255).astype(np.uint8)).save('empty-plate.png')
Image.fromarray(out.clip(0,255).astype(np.uint8)).resize((768,768)).save('empty-preview.png')
