#!/usr/bin/env python3
"""Build public/data/fsa-income.json — tax-filer income distribution by FSA.

Source: Canada Revenue Agency, "Individual Tax Statistics by Forward Sortation
Area (FSA)", Table 1b "FSA for All Returns, by Total Income" (Canada file).
Catalogued on open.canada.ca under the Open Government Licence – Canada.

The CSV itself is served from www.canada.ca, which drops HTTPS requests from
this machine after the TLS handshake (0 bytes, then timeout). The script
therefore tries the official URL first and falls back to the Internet
Archive's raw ("id_") capture of the very same file, byte-for-byte.

Usage:
    python3 scripts/buildFsaIncome.py            # writes public/data/fsa-income.json
    python3 scripts/buildFsaIncome.py --refresh  # ignore the cached download
    python3 scripts/buildFsaIncome.py --cache-dir /some/dir --out /some/file.json

Stdlib only. The download is cached OUTSIDE the repo (scratchpad / temp dir).
"""

from __future__ import annotations

import argparse
import csv
import json
import os
import re
import sys
import tempfile
import time
import urllib.error
import urllib.request
from pathlib import Path

# ---------------------------------------------------------------------------
# Source facts — bump these when CRA publishes a newer edition.
# As of 2026-09 the newest edition on open.canada.ca (and on the CRA index
# page) is the 2023 Edition covering the 2021 tax year.
# ---------------------------------------------------------------------------
TAX_YEAR = 2021
EDITION = "2023 Edition (2021 tax year)"
DATASET_ID = "8ef79681-b512-4adf-b75a-3783ff6ab48e"
DATASET_URL = f"https://open.canada.ca/data/en/dataset/{DATASET_ID}"
CSV_URL = (
    "https://www.canada.ca/content/dam/cra-arc/prog-policy/stats/"
    f"individual-tax-stats-fsa/{TAX_YEAR}-tax-year/tbl1b-en.csv"
)
# Pinned Internet Archive capture of CSV_URL (raw bytes, no rewriting).
WAYBACK_URL = f"https://web.archive.org/web/20250211051815id_/{CSV_URL}"
LICENCE = "Open Government Licence – Canada"
SOURCE = (
    "Canada Revenue Agency, Individual Tax Statistics by Forward Sortation "
    f"Area (FSA), {EDITION}, Table 1b: FSA for All Returns, by Total Income"
)

DEFAULT_CACHE_DIR = (
    "/private/tmp/claude-501/-Users-travis-Documents-Vibe-Coding-CanPay-Insights/"
    "484a3a79-39f3-4208-ba16-b29a22d2ab30/scratchpad"
)
USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
)
FSA_RE = re.compile(r"[A-Z]\d[A-Z]")
MONEY_RE = re.compile(r"\$\s*([\d,]+)")

REPO_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_OUT = REPO_ROOT / "public" / "data" / "fsa-income.json"


def log(msg: str) -> None:
    print(msg, file=sys.stderr, flush=True)


# ---------------------------------------------------------------------------
# Download
# ---------------------------------------------------------------------------
def looks_like_table_1b(blob: bytes) -> bool:
    head = blob[:4096].decode("latin-1")
    return '"FSA"' in head and "Total income" in head and "Under $5,000" in head


def fetch(url: str, timeout: float, retries: int = 5) -> bytes:
    """GET with a browser UA; back off on 429/5xx (archive.org rate-limits bursts)."""
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    delay = 15.0
    for attempt in range(1, retries + 1):
        try:
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                return resp.read()
        except urllib.error.HTTPError as exc:
            if exc.code not in (429, 500, 502, 503, 504) or attempt == retries:
                raise
            retry_after = exc.headers.get("Retry-After") if exc.headers else None
            wait = float(retry_after) if retry_after and retry_after.isdigit() else delay
            wait = min(wait, 90.0)
            log(f"  HTTP {exc.code}; retry {attempt}/{retries - 1} in {wait:.0f}s")
            time.sleep(wait)
            delay = min(delay * 2, 90.0)
    raise RuntimeError("unreachable")


def download(cache_dir: Path, refresh: bool) -> tuple[Path, str]:
    """Return (local csv path, url it actually came from)."""
    cache_dir.mkdir(parents=True, exist_ok=True)
    local = cache_dir / f"cra-fsa-tbl1b-{TAX_YEAR}-en.csv"
    stamp = cache_dir / f"cra-fsa-tbl1b-{TAX_YEAR}-en.source.txt"

    if local.exists() and not refresh and looks_like_table_1b(local.read_bytes()):
        origin = stamp.read_text().strip() if stamp.exists() else "cache"
        log(f"using cached download {local} (from {origin})")
        return local, origin

    attempts = [
        (CSV_URL, 20.0),      # official host; hangs after TLS from some networks
        (WAYBACK_URL, 180.0),  # byte-identical archived copy
    ]
    last_err: Exception | None = None
    for url, timeout in attempts:
        log(f"fetching {url} (timeout {timeout:.0f}s)")
        try:
            blob = fetch(url, timeout)
        except (urllib.error.URLError, OSError, TimeoutError) as exc:  # noqa: PERF203
            last_err = exc
            log(f"  failed: {type(exc).__name__}: {exc}")
            continue
        if not looks_like_table_1b(blob):
            last_err = RuntimeError(f"{url} did not return Table 1b (got {len(blob)} bytes)")
            log(f"  {last_err}")
            continue
        local.write_bytes(blob)
        stamp.write_text(url + "\n")
        log(f"  ok: {len(blob):,} bytes -> {local}")
        return local, url
    raise SystemExit(f"could not download Table 1b from any source: {last_err}")


# ---------------------------------------------------------------------------
# Parse
# ---------------------------------------------------------------------------
def bracket_upper_bound(label: str) -> int | None:
    """'Under $5,000' -> 5000; '$60,000 to $70,000' -> 70000; 'over $250,000' -> None."""
    text = label.strip().lower()
    amounts = [int(a.replace(",", "")) for a in MONEY_RE.findall(label)]
    if not amounts:
        raise ValueError(f"unrecognised income-class label: {label!r}")
    if text.startswith("over") or "and over" in text or "or more" in text:
        return None
    return amounts[-1]


def to_count(cell: str) -> int:
    """Suppressed / blank / odd cells become 0; everything else an integer."""
    s = cell.strip().replace(",", "")
    if not s or s in {"-", "--", "x", "X", ".", ".."}:
        return 0
    try:
        return int(round(float(s)))
    except ValueError:
        return 0


def parse(csv_path: Path) -> tuple[list[int | None], dict[str, dict]]:
    with open(csv_path, encoding="latin-1", newline="") as fh:
        rows = [r for r in csv.reader(fh)]

    # Skip the leading junk lines (a lone apostrophe, blank) until the header.
    header_idx = next(
        i for i, r in enumerate(rows) if len(r) > 4 and r[1].strip() == "FSA"
    )
    header = [h.strip() for h in rows[header_idx]]
    if header[:4] != ["Prov/Terr", "FSA", "Total", "Total income"]:
        raise SystemExit(f"unexpected header layout: {header[:4]}")
    labels = header[4:]
    brackets = [bracket_upper_bound(lbl) for lbl in labels]
    finite = [b for b in brackets if b is not None]
    if finite != sorted(finite) or brackets[-1] is not None:
        raise SystemExit(f"income classes are not ascending/open-ended: {brackets}")

    width = len(header)
    fsa: dict[str, dict] = {}
    skipped_total_rows = 0
    skipped_zero = []
    merged: list[str] = []
    for r in rows[header_idx + 1 :]:
        if len(r) != width:
            continue  # blank / footnote lines
        code = r[1].strip().strip('"').upper()
        if not FSA_RE.fullmatch(code):
            skipped_total_rows += 1  # province "Total", "Canada" total, etc.
            continue
        n = to_count(r[2])
        if n <= 0:
            skipped_zero.append(code)  # business/government FSAs with no filers
            continue
        counts = [to_count(c) for c in r[4:]]
        if code in fsa:
            # An FSA that straddles a provincial border (e.g. R8A, Flin Flon
            # MB/SK) is listed once per province of residence; fold them.
            prev = fsa[code]
            prev["n"] += n
            prev["c"] = [a + b for a, b in zip(prev["c"], counts)]
            merged.append(code)
            continue
        fsa[code] = {"n": n, "c": counts, "med": None}

    log(
        f"parsed {len(fsa)} FSAs; skipped {skipped_total_rows} total/summary rows "
        f"and {len(skipped_zero)} FSAs with no filers ({', '.join(skipped_zero[:8])}"
        f"{'…' if len(skipped_zero) > 8 else ''})"
    )
    if merged:
        log(f"merged cross-border duplicates: {', '.join(merged)}")
    return brackets, dict(sorted(fsa.items()))


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--cache-dir", default=os.environ.get("FSA_CACHE_DIR", DEFAULT_CACHE_DIR))
    ap.add_argument("--out", default=str(DEFAULT_OUT))
    ap.add_argument("--refresh", action="store_true", help="re-download even if cached")
    args = ap.parse_args()

    cache_dir = Path(args.cache_dir)
    try:
        cache_dir.mkdir(parents=True, exist_ok=True)
        (cache_dir / ".w").touch(); (cache_dir / ".w").unlink()
    except OSError:
        cache_dir = Path(tempfile.gettempdir()) / "canpay-fsa-income"
        log(f"cache dir not writable, using {cache_dir}")

    csv_path, origin = download(cache_dir, args.refresh)
    brackets, fsa = parse(csv_path)

    payload: dict = {
        "source": SOURCE,
        "url": DATASET_URL,
        "file": CSV_URL,
        "year": TAX_YEAR,
        "licence": LICENCE,
        "brackets": brackets,
        "fsa": fsa,
    }
    if origin != CSV_URL and origin != "cache":
        payload["archived"] = origin

    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    text = json.dumps(payload, separators=(",", ":"), ensure_ascii=False)
    out.write_text(text + "\n", encoding="utf-8")

    print(f"source url : {origin if origin != 'cache' else CSV_URL}")
    print(f"dataset    : {DATASET_URL}")
    print(f"tax year   : {TAX_YEAR}")
    print(f"brackets   : {len(brackets)} ({brackets[0]} … {brackets[-2]}, open-ended)")
    print(f"FSAs       : {len(fsa)}")
    print(f"wrote      : {out} ({out.stat().st_size:,} bytes)")
    for probe in ("V6X", "M5V", "H2X"):
        print(f"  {probe}: {json.dumps(fsa.get(probe), separators=(',', ':'))}")


if __name__ == "__main__":
    main()
