#!/usr/bin/env python3
"""Extract CRA T4032 bi-weekly tax tables (claim code 1) into a JSON fixture.

Input: a directory of T4032 PDFs as downloaded by the "Fetch T4032 tables"
GitHub workflow (canada.ca is not reachable from the owner's Mac), already
converted to text with `pdftotext -layout`.
Output: tests/golden/t4032-<year>.json — every row of every federal and
provincial/territorial table, for claim code 1 (basic personal amount only),
which is exactly what the calculator models.

Usage: python3 scripts/buildT4032Fixture.py <dir-with-txt> [year]

The directory also needs cpp.txt, ei.txt, eiqc.txt (T4032 CPP/EI tables) and
annexD.txt (Revenu Québec TP-1015.TI.26, downloadable from this Mac) — all via
`pdftotext -layout`. Refresh every January and July edition, then run
`npm run audit:engine`.
"""
import json, re, sys, os, glob

src = sys.argv[1]; year = int(sys.argv[2]) if len(sys.argv) > 2 else 2026
CODES = {'ab':'AB','bc':'BC','mb':'MB','nb':'NB','nl':'NL','ns':'NS','nt':'NT','nu':'NU','on':'ON','pe':'PE','qc':'QC','sk':'SK','yt':'YT'}
ROW = re.compile(r'^\s*([\d,]+)\s+-\s+([\d,]+)\s+([\d,]*\.\d\d)\s+([\d,]*\.\d\d)')
num = lambda s: float(s.replace(',', ''))

def parse(path):
    tables = {}
    current = None
    for line in open(path, encoding='utf-8', errors='replace'):
        t = line.strip()
        if t == 'Federal tax deductions': current = 'federal'; continue
        if re.search(r'(provincial|territorial) tax deductions$', t): current = 'provincial'; continue
        m = ROW.match(line)
        if m and current:
            lo, hi, cc0, cc1 = num(m.group(1)), num(m.group(2)), num(m.group(3)), num(m.group(4))
            tables.setdefault(current, {})[(lo, hi)] = cc1
    return {k: sorted([lo, hi, v] for (lo, hi), v in rows.items()) for k, rows in tables.items()}

out = {'source': 'Canada Revenue Agency, T4032 Payroll Deductions Tables, bi-weekly (26 pay periods), claim code 1',
       'year': year, 'editions': {}}
for path in sorted(glob.glob(os.path.join(src, '*.txt'))):
    name = os.path.basename(path)
    m = re.match(r't4032-?([a-z]{2})(-7)?-26pp-\d\d-eng\.txt$', name)
    if not m or m.group(1) not in CODES: continue
    code = CODES[m.group(1)]; edition = 'july' if m.group(2) else 'january'
    t = parse(path)
    out['editions'].setdefault(edition, {})[code] = t
    print(f"{edition:8} {code}: federal {len(t.get('federal', []))} rows, provincial {len(t.get('provincial', []))} rows")
# Contribution tables: four "from - to amount" triples per printed line.
TRIPLE = re.compile(r'([\d,]*\.\d\d)\s+-\s+([\d,]*\.\d\d)\s+([\d,]*\.\d\d)')
def triples(path, every=40):
    rows = []
    for line in open(path, encoding='utf-8', errors='replace'):
        for m in TRIPLE.finditer(line):
            rows.append([num(m.group(1)), num(m.group(2)), num(m.group(3))])
    rows.sort()
    # Every row is a one-cent step of the same linear formula; a spread
    # sample keeps the fixture small without losing coverage of the range.
    return [r for i, r in enumerate(rows) if i % every == 0 or i == len(rows) - 1]
for key, fname in [('cpp', 'cpp.txt'), ('ei', 'ei.txt'), ('ei_qc', 'eiqc.txt')]:
    path = os.path.join(src, fname)
    if os.path.exists(path):
        out.setdefault('contributions', {})[key] = triples(path)
        print(key, len(out['contributions'][key]), 'sampled rows, up to', out['contributions'][key][-1][1])
# Revenu Québec, TP-1015.TI.26 annexe D (26 pay periods), code A column, as
# text from `pdftotext -layout` saved as annexD.txt. French number format.
# Rows whose code-A cell is blank (pay below the basic amount) are skipped:
# a blank column shifts every later token, so only complete rows are safe.
rq = os.path.join(src, 'annexD.txt')
if os.path.exists(rq):
    MONEY = r'(?:\d{1,3} )?\d{1,3},\d{2}'
    fr = lambda x: float(x.replace(' ', '').replace(',', '.'))
    qrows = []
    for line in open(rq, encoding='utf-8', errors='replace'):
        m = re.match(r'^\s*(' + MONEY + r')\s+–\s+(' + MONEY + r')\s+(.*)$', line.replace('\t', ' '))
        if not m: continue
        toks = re.findall(MONEY, m.group(3))
        if len(toks) < 17: continue
        qrows.append([fr(m.group(1)), fr(m.group(2)), fr(toks[1])])
    out['quebec'] = {'source': f'Revenu Québec, TP-1015.TI.26 ({year}-01), annexe D — 26 pay periods, withholding code A (basic personal amount only)', 'provincial': qrows}
    print('quebec', len(qrows), 'rows')
dest = f'tests/golden/t4032-{year}.json'
json.dump(out, open(dest, 'w'), separators=(',', ':'))
print('wrote', dest, os.path.getsize(dest), 'bytes')
