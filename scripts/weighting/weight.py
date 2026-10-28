#!/usr/bin/env python3
"""Rake full-time calculations to Statistics Canada margins, then check the
result against a figure the weighting never saw.

Scope: calculations whose employment shape is full time ('salaried' or
'full-time-hourly'), matching the CIS full-year full-time population in
targets.ca.json. Margins: province and income (five brackets). Raking matches
the two margins only, so each holdout province's own income distribution is
left free: if the weights bring it closer to that province's official
distribution, the correction holds beyond the figures it was fitted to. If
they don't, weighted figures are not published.

Weights are an estimate's correction, never a licence to call the sample
national statistics: they fix what province and income can see, not who
chooses to open a pay calculator.

Usage (needs `pip install balance`, Python 3.11+):
  python3 scripts/weighting/weight.py                 # reads D1 through wrangler
  python3 scripts/weighting/weight.py counts.json     # or a saved wrangler --json result
  ... --out report.json
"""
import json, os, subprocess, sys

import numpy as np
import pandas as pd
from balance.weighting_methods.rake import rake

HERE = os.path.dirname(__file__)
TARGETS = json.load(open(os.path.join(HERE, 'targets.ca.json')))
MERGE = {'90-120k': '90k-plus', '120-160k': '90k-plus', '160k-plus': '90k-plus'}
QUERY = ("SELECT province, income_bracket, has_rrsp, COUNT(*) n FROM events "
         "WHERE excluded IS NOT 1 AND product_interest IS NULL "
         "AND employment_shape IN ('salaried','full-time-hourly') GROUP BY 1,2,3")
# The weights may not shrink the sample below this share of itself.
MIN_ESS_SHARE = 0.25


def load(path):
    if path:
        raw = json.load(open(path))
    else:
        root = os.path.abspath(os.path.join(HERE, '..', '..'))
        raw = json.loads(subprocess.run(['npx', 'wrangler', 'd1', 'execute', 'canpay', '--remote', '--json',
                                         '--command', QUERY], cwd=root, capture_output=True, text=True,
                                        check=True).stdout)
    rows = raw[0]['results'] if isinstance(raw, list) else raw
    d = pd.DataFrame(rows)
    d['income'] = d['income_bracket'].map(lambda b: MERGE.get(b, b))
    return d[d['province'].isin(TARGETS['margins']['province'])]


def tvd(a, b):
    keys = set(a) | set(b)
    return round(0.5 * sum(abs(a.get(k, 0) - b.get(k, 0)) for k in keys), 4)


def dist(d, w, col):
    s = d.groupby(col)[w].sum()
    return {k: round(v / s.sum(), 4) for k, v in s.items()}


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    out_path = sys.argv[sys.argv.index('--out') + 1] if '--out' in sys.argv else None
    d = load(args[0] if args and args[0] != out_path else None)

    # One row per cell; the cell count is its design weight.
    d = d.reset_index(drop=True)
    fit = rake(d[['province', 'income']].astype(str), d['n'].astype(float), None, None,
               variables=['province', 'income'], transformations=None,
               target_margins=TARGETS['margins'],
               # Realised as rows; 10k (the default) rounds the territories' shares to 1e-4.
               target_margins_max_length=1_000_000)
    d['raw'] = d['n'].astype(float)
    w = fit['weight'].to_numpy()
    d['w'] = w * d['raw'].sum() / w.sum()  # rescaled to sum to the sample size
    per_calc = d['w'] / d['raw']           # 1.0 = counts as one calculation

    n = d['raw'].sum()
    ess = d['w'].sum() ** 2 / (d['raw'] * per_calc ** 2).sum()
    report = {
        'scope': 'Full-time calculations (salaried + full-time hourly)',
        'targets': {'income': TARGETS['income_source'], 'growth': TARGETS['growth'], 'retrieved': TARGETS['retrieved']},
        'calculations': int(n),
        'effective_sample_size': int(round(ess)),
        'design_effect': round(n / ess, 2),
        'weight_per_calculation': {'min': round(per_calc.min(), 3), 'max': round(per_calc.max(), 3)},
        'margins_after_weighting': {
            'income_tvd_raw': tvd(dist(d, 'raw', 'income'), TARGETS['margins']['income']),
            'income_tvd_weighted': tvd(dist(d, 'w', 'income'), TARGETS['margins']['income']),
            'province_tvd_raw': tvd(dist(d, 'raw', 'province'), TARGETS['margins']['province']),
            'province_tvd_weighted': tvd(dist(d, 'w', 'province'), TARGETS['margins']['province']),
        },
        'income': {'raw': dist(d, 'raw', 'income'), 'weighted': dist(d, 'w', 'income'),
                   'official': TARGETS['margins']['income']},
        'holdout': {},
        'estimates': {},
    }

    # Two holdout checks per province. In-model: the fitted weights themselves.
    # Leave-one-out (the one that decides): the income correction is learned on
    # the other provinces only, against their own official distribution, then
    # applied to this one. Ontario is most of the sample, so only this version
    # is a real test for it.
    ok = True
    shares = TARGETS['margins']['province']
    nat = TARGETS['margins']['income']
    for p, official in TARGETS['holdout'].items():
        sub, rest = d[d['province'] == p], d[d['province'] != p]
        sp = shares[p]
        rest_target = {k: (nat[k] - sp * official[k]) / (1 - sp) for k in nat}
        rest_raw = dist(rest, 'raw', 'income')
        factor = {k: rest_target[k] / rest_raw[k] for k in nat}
        loo = sub.assign(l=sub['raw'] * sub['income'].map(factor))
        r = tvd(dist(sub, 'raw', 'income'), official)
        w = tvd(dist(sub, 'w', 'income'), official)
        o = tvd(dist(loo, 'l', 'income'), official)
        report['holdout'][p] = {'calculations': int(sub['raw'].sum()), 'tvd_raw': r, 'tvd_weighted': w,
                                'tvd_leave_one_out': o, 'improved': bool(o < r)}
        ok &= bool(o < r)
    ok &= bool(ess >= MIN_ESS_SHARE * n)

    rr = d[d['has_rrsp'].notna()]
    report['estimates']['rrsp_contribution_share'] = {
        'raw': round(float((rr['raw'] * rr['has_rrsp']).sum() / rr['raw'].sum()), 4),
        'weighted': round(float((rr['w'] * rr['has_rrsp']).sum() / rr['w'].sum()), 4),
    }
    report['verdict'] = 'PASS' if ok else 'FAIL'
    report['rule'] = (f'Weighted figures may be published only if, for every holdout province, an income correction '
                      f'learned on the other provinces brings it closer to its official distribution than the raw sample, and the effective sample size stays at or '
                      f'above {MIN_ESS_SHARE:.0%} of the calculations.')

    text = json.dumps(report, indent=2, ensure_ascii=False)
    if out_path:
        open(out_path, 'w').write(text + '\n')
    print(text)
    sys.exit(0 if ok else 1)


if __name__ == '__main__':
    main()
