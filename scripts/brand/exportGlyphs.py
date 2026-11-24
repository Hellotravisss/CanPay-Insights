"""Export brand-font outlines + advances + pair kerning to lib/brand/glyphs.json, so covers can set type as
paths with nothing but Node + sharp (the article routine runs on Linux without these fonts or a browser).

Run locally (needs fontTools + brotli and the HarfBuzz CLI `hb-shape`) after adding characters to CHARS:
  python3 scripts/brand/exportGlyphs.py
Kerning is measured, not parsed: each first character is shaped against every second one with hb-shape,
so the values are exactly what the font's GPOS applies (pair and class kerning alike).
"""
import json, pathlib, subprocess, sys, tempfile
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen

ROOT = pathlib.Path(__file__).resolve().parents[2]
FONTS = {  # key: woff2 in public/fonts
    "display": "fraunces-latin-600-normal.woff2",
    "text": "instrument-sans-latin-400-normal.woff2",
    "textBold": "instrument-sans-latin-600-normal.woff2",
}
CHARS = "".join(chr(c) for c in range(32, 127)) + "¢·àâçèéêëîïôöùûüÀÉÈÊÇ–—‘’“”…→−×÷≈€£%«»"
OUT = ROOT / "lib/brand/glyphs.json"


def ttf_of(woff2):
    f = TTFont(ROOT / "public/fonts" / woff2); f.flavor = None
    p = pathlib.Path(tempfile.gettempdir()) / (woff2 + ".ttf"); f.save(p); return p


def shape(path, text):
    js = subprocess.run(["hb-shape", "--output-format=json", "--no-glyph-names", "--features=-liga,-clig,-dlig,-calt", str(path), "--text=" + text],
                        capture_output=True, text=True, check=True).stdout
    return json.loads(js)


out = {}
for key, woff2 in FONTS.items():
    path = ttf_of(woff2); font = TTFont(path); upem = font["head"].unitsPerEm
    cmap = font.getBestCmap(); gs = font.getGlyphSet(); hmtx = font["hmtx"]
    chars = [c for c in CHARS if ord(c) in cmap]
    glyphs = {}
    for c in chars:
        name = cmap[ord(c)]; pen = SVGPathPen(gs, lambda v: str(round(v)))
        gs[name].draw(TransformPen(pen, (1, 0, 0, -1, 0, 0)))   # y down, baseline at 0
        glyphs[c] = {"d": pen.getCommands(), "w": hmtx[name][0]}
    # The latin subsets carry no arrow. Synthesise "→" from the font's own hyphen (same stroke weight and height),
    # so card copy like "5.06% → 5.60%" keeps working; everything else missing still fails loudly in type.mjs.
    if "→" not in glyphs and "-" in glyphs:
        bp = BoundsPen(gs); gs[cmap[ord("-")]].draw(bp); x0, y0, x1, y1 = bp.bounds
        t, yc, em = y1 - y0, (y0 + y1) / 2, upem
        L, R, hh = 0.08 * em, 0.84 * em, 0.26 * em            # shaft start/end, half head height
        hx = R - hh * 1.05                                     # where the head's back corners sit
        d = (f"M{L:.0f} {-(yc + t / 2):.0f}H{R - t:.0f}L{hx:.0f} {-(yc + hh):.0f}L{hx + t * 1.2:.0f} {-(yc + hh):.0f}"
             f"L{R + t * 0.2:.0f} {-yc:.0f}L{hx + t * 1.2:.0f} {-(yc - hh):.0f}L{hx:.0f} {-(yc - hh):.0f}L{R - t:.0f} {-(yc - t / 2):.0f}H{L:.0f}Z")
        glyphs["→"] = {"d": d, "w": round(0.95 * em)}
        chars.append("→")
    kern = {}
    for a in chars:
        if a == " ": continue
        seq = "".join(a + b for b in chars if b != " ")
        res = shape(path, seq)
        if len(res) != len(seq): continue          # a mapping we don't expect: skip rather than guess
        for i in range(0, len(res), 2):
            b = seq[i + 1]; dk = res[i]["ax"] - glyphs[a]["w"]
            if dk: kern[a + b] = dk
    out[key] = {"upem": upem, "ascender": font["hhea"].ascent, "descender": font["hhea"].descent,
                "capHeight": getattr(font["OS/2"], "sCapHeight", 0), "glyphs": glyphs, "kern": kern}
    print(key, len(glyphs), "glyphs", len(kern), "kern pairs", file=sys.stderr)
OUT.write_text(json.dumps(out, separators=(",", ":"), ensure_ascii=False))
print(OUT, OUT.stat().st_size // 1024, "KB", file=sys.stderr)
