#!/usr/bin/env python3
"""Extract every claim-code column (CC 0-10) of CRA's T4032 bi-weekly tables,
plus each jurisdiction's claim-code chart, into tests/golden/t4032-<year>-claimcodes.json.

Why: claim code 1 (basic personal amount only) is what tests/golden/t4032-<year>.json
checks. Anyone who files a TD1 with more credits than that — the spouse amount
above all — is withheld under codes 2-10. CRA computes each code at the MIDPOINT
of its "total claim amount" range (measured 2026-09-26: midpoint worst $0.04,
lower or upper bound $7+ off).

Only January editions are extracted. BC, NL and PE changed rates on July 1 and
their July charts use prorated amounts; the engine models the annual figure, so
their provincial columns are compared on the January edition only where the
January table is the annual answer key (it is not for those three: see
scripts/goldenClaimCodes.ts, which checks their federal columns only).

Input: a directory of `pdftotext -layout` output of the T4032 PDFs from the
"Fetch T4032 tables" workflow (26pp tables and the -1-26e guides).
Usage: python3 scripts/buildClaimCodeFixture.py <txt-dir> [year]
"""
import json, os, re, sys
src = sys.argv[1]; year = int(sys.argv[2]) if len(sys.argv) > 2 else 2026
yy = str(year)[2:]
NAMES = {'AB':'Alberta','BC':'British Columbia','MB':'Manitoba','NB':'New Brunswick','NL':'Newfoundland and Labrador','NS':'Nova Scotia','NT':'Northwest Territories','NU':'Nunavut','ON':'Ontario','PE':'Prince Edward Island','SK':'Saskatchewan','YT':'Yukon'}
CODES = {'ab':'AB','bc':'BC','mb':'MB','nb':'NB','nl':'NL','ns':'NS','nt':'NT','nu':'NU','on':'ON','pe':'PE','qc':'QC','sk':'SK','yt':'YT'}
num = lambda s: float(s.replace(',', ''))
ROW = re.compile(r'^\s*([\d,]+)\s+-\s+([\d,]+)\s+(.*)$')
CHART_ROW = re.compile(r'^\s*([\d,]+\.\d\d)\s+([\d,]+\.\d\d)\s+(\d{1,2})\s*$')

def chart(path, title_re):
    """Claim-code ranges [(lo, hi)] indexed by code 1..10 from a guide chart."""
    lines = open(path, encoding='utf-8', errors='replace').read().split('\n')
    out = {}
    for i, l in enumerate(lines):
        if re.search(title_re, l) and '....' not in l and '...' not in l:
            for l2 in lines[i + 1:i + 20]:
                if 'Chart' in l2: break  # the next chart starts; do not read into it
                m = CHART_ROW.match(l2)
                if m: out[int(m.group(3))] = [num(m.group(1)), num(m.group(2))]
            if len(out) >= 10: return [out[k] for k in range(1, 11)]
            out = {}
    raise SystemExit(f'no chart {title_re} in {path}')

def tables(path):
    t, cur = {}, None
    for line in open(path, encoding='utf-8', errors='replace'):
        s = line.strip()
        if s == 'Federal tax deductions': cur = 'federal'; continue
        if re.search(r'(provincial|territorial) tax deductions$', s): cur = 'provincial'; continue
        m = ROW.match(line)
        if not (m and cur): continue
        vals = m.group(3).split()
        if not vals or not re.fullmatch(r'[\d,]*\.\d\d', vals[0]): continue
        nums = []
        for v in vals:
            if re.fullmatch(r'[\d,]*\.\d\d', v): nums.append(num(v))
            else: break
        # Trailing blank columns are codes whose tax is nil at this pay.
        nums += [0.0] * (11 - len(nums))
        t.setdefault(cur, {})[(num(m.group(1)), num(m.group(2)))] = nums[:11]
    return {k: sorted([lo, hi, v] for (lo, hi), v in rows.items()) for k, rows in t.items()}

out = {'source': f'Canada Revenue Agency, T4032 Payroll Deductions Tables, January {year}, bi-weekly (26 pay periods), claim codes 0-10',
       'rule': 'each claim code is computed at the midpoint of its total-claim-amount range', 'year': year, 'charts': {}, 'tables': {}}
fed_chart = None
for c, code in CODES.items():
    guide = os.path.join(src, f't4032-{c}-1-{yy}e.txt')
    if fed_chart is None:
        fed_chart = chart(guide, rf'Chart \d – {year} Federal claim codes')
    if code != 'QC':
        out['charts'][code] = chart(guide, rf'Chart \d – {year} {re.escape(NAMES[code])} claim codes')
    path = os.path.join(src, f't4032-{c}-26pp-{yy}-eng.txt')
    if not os.path.exists(path): print('missing', path); continue
    out['tables'][code] = tables(path)
    t = out['tables'][code]
    print(f"{code}: federal {len(t.get('federal', []))} rows, provincial {len(t.get('provincial', []))} rows")
out['charts']['federal'] = fed_chart
dest = f'tests/golden/t4032-{year}-claimcodes.json'
json.dump(out, open(dest, 'w'), separators=(',', ':'))
print('wrote', dest, os.path.getsize(dest) // 1024, 'KB')
