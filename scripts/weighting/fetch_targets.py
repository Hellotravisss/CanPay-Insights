#!/usr/bin/env python3
"""Build the weighting targets fixture from Statistics Canada.

The calculator's sample is self-selected. To publish weighted estimates beside
the raw ones, the sample is raked to two official margins for full-time
workers: province, and annual employment income. Both come from one table so
their definitions agree:

  11-10-0240-01  Distribution of employment income of individuals by gender
                 and work activity (Canadian Income Survey), full-year
                 full-time workers, total gender. Latest reference year.

Income is a 2024 figure; calculations are made in 2026. The bins are moved
forward by the growth in the LFS median weekly wage of full-time employees
(14-10-0063-01, vector v2132677): reference-year average against the latest
twelve months. The open "$100,000 and over" bin is never interpolated into.

Output: scripts/weighting/targets.ca.json. Commit it with the retrieval date;
refresh when StatCan publishes a new reference year (spring).

Usage: python3 scripts/weighting/fetch_targets.py
"""
import csv, io, json, os, sys, urllib.request, zipfile
from datetime import date

PID = 11100240
LFS_COORD = '1.5.2.1.1.1.0.0.0.0'  # Canada · median weekly wage · full-time · all industries · total gender · 15+
WDS = 'https://www150.statcan.gc.ca/t1/wds/rest'
OUT = os.path.join(os.path.dirname(__file__), 'targets.ca.json')

PROVINCES = ['Newfoundland and Labrador', 'Prince Edward Island', 'Nova Scotia', 'New Brunswick', 'Quebec',
             'Ontario', 'Manitoba', 'Saskatchewan', 'Alberta', 'British Columbia', 'Yukon',
             'Northwest Territories', 'Nunavut']
# CIS bins in thousands of dollars; None = open top bin.
BINS = [('Percentage under $5,000 (including losses)', 0, 5), ('$5,000 to $9,999', 5, 10),
        ('$10,000 to $19,999', 10, 20), ('$20,000 to $29,999', 20, 30), ('$30,000 to $39,999', 30, 40),
        ('$40,000 to $49,999', 40, 50), ('$50,000 to $59,999', 50, 60), ('$60,000 to $69,999', 60, 70),
        ('$70,000 to $79,999', 70, 80), ('$80,000 to $89,999', 80, 90), ('$90,000 to $99,999', 90, 100),
        ('$100,000 and over', 100, None)]
# The calculator's brackets (lib/brackets.ts), with its top three merged: the
# CIS table stops at $100,000 and over, so nothing above $90k can be targeted.
CUTS = [('under-30k', 30), ('30-50k', 50), ('50-70k', 70), ('70-90k', 90), ('90k-plus', None)]
# Provinces whose own distribution is complete and large enough to serve as
# the holdout check (never used as a weighting target).
HOLDOUT = ['Ontario', 'Quebec', 'British Columbia', 'Alberta']


def get_json(url, body=None):
    req = urllib.request.Request(url, data=json.dumps(body).encode() if body else None,
                                 headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.load(r)


def growth_factor():
    res = get_json(f'{WDS}/getDataFromCubePidCoordAndLatestNPeriods',
                   [{'productId': 14100063, 'coordinate': LFS_COORD, 'latestN': 48}])[0]['object']
    pts = {p['refPer'][:7]: p['value'] for p in res['vectorDataPoint']}
    return res['vectorId'], pts


def cdf(bins, x):
    """Share below x (thousands), uniform within a bin."""
    total = 0.0
    for lo, hi, pct in bins:
        if hi is None:
            if x > lo: sys.exit(f'cut {x:.1f}k falls in the open top bin; cannot interpolate')
            break
        if x >= hi: total += pct
        elif x > lo: total += pct * (x - lo) / (hi - lo)
    return total


def to_brackets(bins, g):
    s = sum(p for _, _, p in bins)
    bins = [(lo, hi, p / s) for lo, hi, p in bins]
    out, prev = {}, 0.0
    for name, cut in CUTS:
        c = 1.0 if cut is None else cdf(bins, cut / g)
        out[name] = round(c - prev, 6); prev = c
    return out


def main():
    meta = get_json(f'{WDS}/getFullTableDownloadCSV/{PID}/en')
    with urllib.request.urlopen(meta['object'], timeout=120) as r:
        z = zipfile.ZipFile(io.BytesIO(r.read()))
    rows = list(csv.DictReader(io.TextIOWrapper(z.open(f'{PID}.csv'), encoding='utf-8-sig')))
    year = max(int(r['REF_DATE']) for r in rows)
    rows = [r for r in rows if int(r['REF_DATE']) == year and r['Gender'] == 'Total - Gender'
            and r['Work activity'] == 'Full-year full-time workers']
    val = {(r['GEO'], r['Statistics']): r['VALUE'] for r in rows}

    vector, pts = growth_factor()
    base = [v for k, v in pts.items() if k.startswith(str(year))]
    recent_months = sorted(pts)[-12:]
    if len(base) != 12: sys.exit(f'LFS series lacks a full {year}')
    base_avg = sum(base) / 12
    recent_avg = sum(pts[m] for m in recent_months) / 12
    g = recent_avg / base_avg

    persons = {p: float(val[(p, 'Number of persons')]) for p in PROVINCES}
    tot = sum(persons.values())

    def bins_for(geo):
        b = [(lo, hi, val.get((geo, name), '')) for name, lo, hi in BINS]
        if any(v == '' for _, _, v in b): sys.exit(f'{geo}: a bin is suppressed; cannot use it')
        return [(lo, hi, float(v)) for lo, hi, v in b]

    out = {
        'retrieved': date.today().isoformat(),
        'population': 'Full-year full-time workers with employment income, all genders',
        'income_source': {'table': '11-10-0240-01', 'reference_year': year,
                          'url': 'https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=1110024001'},
        'growth': {'table': '14-10-0063-01', 'vector': f'v{vector}',
                   'series': 'Median weekly wage, full-time employees, Canada, all industries',
                   'base': f'{year} average', 'base_value': round(base_avg, 2),
                   'recent': f'{recent_months[0]} to {recent_months[-1]} average', 'recent_value': round(recent_avg, 2),
                   'factor': round(g, 5)},
        'brackets_note': 'Calculator brackets with 90-120k, 120-160k and 160k-plus merged into 90k-plus.',
        'margins': {
            'province': {p: round(persons[p] / tot, 6) for p in PROVINCES},
            'income': to_brackets(bins_for('Canada'), g),
        },
        'holdout': {p: to_brackets(bins_for(p), g) for p in HOLDOUT},
    }
    with open(OUT, 'w') as f:
        json.dump(out, f, indent=2, ensure_ascii=False); f.write('\n')
    print(f'wrote {OUT}: reference year {year}, growth x{g:.4f}')


if __name__ == '__main__':
    main()
