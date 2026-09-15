#!/usr/bin/env python3
"""
Build public/data/fsa-centroids.json: one [lat, lon] per Forward Sortation Area.

WHY THIS EXISTS
    Anything keyed on the first three characters of a postal code (the FSA)
    needs a point on the map per FSA, and the only authoritative shape of an
    FSA is Statistics Canada's census boundary file. 1,643 FSAs at two decimals
    (about 1 km) fit in ~35 KB — small enough to ship to the browser.

SOURCE
    Statistics Canada, 2021 Census "Forward Sortation Area Boundary File",
    catalogue 92-179-X, ESRI shapefile in NAD83 / Statistics Canada Lambert
    (EPSG:3347). Released under the Statistics Canada Open Licence.
    Two variants exist and either works here:
        lfsa000a21a_e.zip  digital boundary file      (~22 MB)  <- default
        lfsa000b21a_e.zip  cartographic boundary file (~162 MB, coast-clipped)
    Override with FSA_FILE=lfsa000b21a_e.zip if land-only centroids matter.

METHOD
    For every FSA polygon take its largest outer ring (holes and smaller
    islands ignored), compute the area centroid, reproject to WGS84 with
    pyproj, round to 2 decimals. A centroid can fall outside a crescent-shaped
    polygon; that is acceptable for a representative point at this precision.

USAGE
    python3 -m venv /tmp/fsa-venv && /tmp/fsa-venv/bin/pip install pyshp pyproj
    /tmp/fsa-venv/bin/python scripts/buildFsaCentroids.py
    FSA_CACHE_DIR=~/Downloads ...   # where the zip is kept (default: temp dir)

The zip is downloaded once to the cache dir (never into the repo) and re-used
on later runs. Pure Python: pyshp reads the shapefile, pyproj reprojects.
"""

import io
import json
import os
import sys
import tempfile
import urllib.request
import zipfile

try:
    import shapefile  # pyshp
    from pyproj import Transformer
except ImportError as exc:  # pragma: no cover
    sys.exit(f"missing dependency ({exc}); see USAGE in the docstring")

BASE_URL = (
    "https://www12.statcan.gc.ca/census-recensement/2021/geo/sip-pis/"
    "boundary-limites/files-fichiers/"
)
FILE_NAME = os.environ.get("FSA_FILE", "lfsa000a21a_e.zip")
SOURCE_URL = BASE_URL + FILE_NAME
CACHE_DIR = os.environ.get("FSA_CACHE_DIR", tempfile.gettempdir())

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_PATH = os.path.join(ROOT, "public", "data", "fsa-centroids.json")

# Every FSA lies inside Canada; anything outside this box means a projection
# or parsing mistake, and we would rather fail than publish it.
LAT_RANGE = (41.0, 84.0)
LON_RANGE = (-141.5, -52.0)
EXPECTED_COUNT = (1550, 1750)


def download(url: str, dest: str) -> str:
    if os.path.exists(dest) and os.path.getsize(dest) > 0:
        print(f"using cached {dest}")
        return dest
    print(f"downloading {url}")
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    part = dest + ".part"
    with urllib.request.urlopen(req, timeout=120) as resp, open(part, "wb") as fh:
        while True:
            chunk = resp.read(1 << 20)
            if not chunk:
                break
            fh.write(chunk)
    os.replace(part, dest)
    return dest


def ring_area_centroid(pts):
    """Signed shoelace area and area centroid of one closed ring."""
    n = len(pts)
    area2 = cx = cy = 0.0
    for i in range(n):
        x0, y0 = pts[i]
        x1, y1 = pts[(i + 1) % n]
        cross = x0 * y1 - x1 * y0
        area2 += cross
        cx += (x0 + x1) * cross
        cy += (y0 + y1) * cross
    if area2 == 0.0:
        return 0.0, (sum(p[0] for p in pts) / n, sum(p[1] for p in pts) / n)
    return area2 / 2.0, (cx / (3.0 * area2), cy / (3.0 * area2))


def representative_point(shape):
    """Centroid of the largest outer ring. Shapefile outer rings run clockwise
    (negative shoelace area); counter-clockwise rings are holes."""
    bounds = list(shape.parts) + [len(shape.points)]
    rings = []
    for start, end in zip(bounds, bounds[1:]):
        ring = shape.points[start:end]
        if len(ring) < 3:
            continue
        area, centroid = ring_area_centroid(ring)
        rings.append((abs(area), area < 0, centroid))
    outer = [r for r in rings if r[1]] or rings
    if not outer:
        x0, y0, x1, y1 = shape.bbox
        return (x0 + x1) / 2.0, (y0 + y1) / 2.0
    return max(outer, key=lambda r: r[0])[2]


def main() -> None:
    os.makedirs(CACHE_DIR, exist_ok=True)
    zip_path = download(SOURCE_URL, os.path.join(CACHE_DIR, FILE_NAME))

    with zipfile.ZipFile(zip_path) as z:
        shp_name = next(n for n in z.namelist() if n.lower().endswith(".shp"))
        stem = shp_name[:-4]
        parts = {ext: io.BytesIO(z.read(stem + ext)) for ext in (".shp", ".shx", ".dbf")}

    # The DBF is latin-1 ("Nouvelle-Écosse"), not UTF-8.
    reader = shapefile.Reader(
        shp=parts[".shp"], shx=parts[".shx"], dbf=parts[".dbf"], encoding="latin-1"
    )
    to_wgs84 = Transformer.from_crs("EPSG:3347", "EPSG:4326", always_xy=True)

    fsa = {}
    for sr in reader.iterShapeRecords():
        code = str(sr.record["CFSAUID"]).strip()
        x, y = representative_point(sr.shape)
        lon, lat = to_wgs84.transform(x, y)
        if not (LAT_RANGE[0] <= lat <= LAT_RANGE[1] and LON_RANGE[0] <= lon <= LON_RANGE[1]):
            sys.exit(f"{code}: {lat:.4f},{lon:.4f} is outside Canada; refusing to write")
        if code in fsa:
            sys.exit(f"{code}: duplicate FSA in boundary file")
        fsa[code] = [round(lat, 2), round(lon, 2)]

    count = len(fsa)
    if not EXPECTED_COUNT[0] <= count <= EXPECTED_COUNT[1]:
        sys.exit(f"{count} FSAs parsed, expected {EXPECTED_COUNT[0]}-{EXPECTED_COUNT[1]}")

    out = {
        "source": "Statistics Canada, 2021 FSA boundary file (92-179-X)",
        "url": SOURCE_URL,
        "licence": "Statistics Canada Open Licence",
        "fsa": dict(sorted(fsa.items())),
    }
    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
    with open(OUT_PATH, "w", encoding="ascii") as fh:
        fh.write(json.dumps(out, separators=(",", ":"), ensure_ascii=True))

    print(f"source url: {SOURCE_URL}")
    print(f"file name:  {os.path.basename(zip_path)} ({os.path.getsize(zip_path):,} bytes)")
    print(f"fsa count:  {count}")
    print(f"wrote:      {OUT_PATH} ({os.path.getsize(OUT_PATH):,} bytes)")
    for code in ("V6X", "M5V", "H2X", "T2P", "K1A"):
        print(f"  {code}: {fsa.get(code)}")


if __name__ == "__main__":
    main()
