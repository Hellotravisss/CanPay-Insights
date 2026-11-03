"""Slice the two generated sheets into icons and trace each into a two-tone SVG (public/icons).

The sheets were generated from a prompt (white background, red #DC2625 slabs with a
#A51C1C facet, inukshuk-style). Needs potrace (brew install potrace), numpy, Pillow.
Run: python3 design/icons/build.py
"""
import re, subprocess, tempfile
from pathlib import Path
import numpy as np
from PIL import Image

NAMES = {
 'sheet1': ['coins','briefcase','raise','chart','box','receipt','folder','question',
            'face-lower','face-same','face-higher','office','home','hybrid','pin','compass'],
 'sheet2': ['bank','piggy','checklist','bulb','confetti','warning','calendar','lock',
            'link','camera','phone','book','save','globe','robot',None],
 'sheet3': ['stopwatch','check','checkbox','sparkle','maple',None],
}
# Each icon is written twice: red slabs with a darker facet (for light backgrounds),
# and white slabs with a light grey facet like the logo's inukshuk (for red or dark ones).
TONES = {'': ('#DC2625', '#A51C1C'), '-white': ('#FFFFFF', '#E3E3E3')}
HERE = Path(__file__).parent
OUT = HERE.parents[1] / 'public' / 'icons'; OUT.mkdir(exist_ok=True)
TMP = Path(tempfile.mkdtemp())

def cuts(mask, axis):
    prof = mask.sum(axis=axis); gaps=[]; start=None
    for i,v in enumerate(prof):
        if v < 3 and start is None: start = i
        if v >= 3 and start is not None: gaps.append((start,i)); start=None
    if start is not None: gaps.append((start,len(prof)))
    gaps = [g for g in gaps if g[1]-g[0] > 8]
    return [(gaps[k][1], gaps[k+1][0]) for k in range(len(gaps)-1)]

def trace(mask, name):
    pbm = TMP/f'{name}.pbm'
    Image.fromarray(((~mask)*255).astype('uint8')).convert('1').save(pbm)
    svg = subprocess.run(['potrace', str(pbm), '-b', 'svg', '--flat', '-t', '40', '-a', '0.5', '-O', '0.4', '-o', '-'],
                         capture_output=True, text=True, check=True).stdout
    g = re.search(r'<g transform="([^"]+)"[^>]*>\s*(<path[^>]*/>)', svg, re.S)
    return g.group(1), re.search(r' d="([^"]+)"', g.group(2)).group(1)

for sheet, names in NAMES.items():
    im = np.asarray(Image.open(HERE / f'{sheet}.png').convert('RGB')).astype(float)
    red = (im[...,0]-im[...,1]) > 60
    cols, rows = cuts(red, 0), cuts(red, 1)
    assert len(cols)*len(rows) == len(names), (sheet, cols, rows)
    k = 0
    for (y0,y1) in rows:
        for (x0,x1) in cols:
            name = names[k]; k += 1
            if name is None: continue      # empty or spare cell
            cell = im[y0:y1, x0:x1]; m = (cell[...,0]-cell[...,1]) > 60
            ys, xs = np.nonzero(m)
            cy0, cy1, cx0, cx1 = ys.min(), ys.max()+1, xs.min(), xs.max()+1
            side = int(max(cy1-cy0, cx1-cx0) * 1.08)
            oy = (cy0+cy1)//2 - side//2; ox = (cx0+cx1)//2 - side//2
            pad = np.full((side, side, 3), 255.0)
            sy0, sx0 = max(oy,0), max(ox,0); sy1, sx1 = min(oy+side, cell.shape[0]), min(ox+side, cell.shape[1])
            pad[sy0-oy:sy1-oy, sx0-ox:sx1-ox] = cell[sy0:sy1, sx0:sx1]
            # supersample before thresholding so traced edges are smooth
            S = 768
            chans = [np.asarray(Image.fromarray(pad[...,c].astype('uint8')).resize((S,S), Image.LANCZOS)).astype(float) for c in range(3)]
            r, g = chans[0], chans[1]
            sil = (r-g) > 60
            dark = sil & (r < 192)
            t1, d1 = trace(sil, name+'-base'); t2, d2 = trace(dark, name+'-dark')
            for suffix, (base, facet) in TONES.items():
                (OUT/f'{name}{suffix}.svg').write_text(
f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {S} {S}">
<g transform="{t1}" fill="{base}"><path d="{d1}"/></g>
<g transform="{t2}" fill="{facet}"><path d="{d2}"/></g>
</svg>
''')
print('built', len(list(OUT.glob('*.svg'))), 'svgs')
