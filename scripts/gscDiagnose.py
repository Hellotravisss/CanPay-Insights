#!/usr/bin/env python3
"""One-off Search Console diagnostics — the questions the archive cannot answer.

The daily archive keeps query×day and page×day, so it can never say WHICH page
collects a query, whether an impression came from Canada, or why a URL has
had zero impressions for four months. This asks Google directly:
  (a) URL Inspection for the hubs that have never shown an impression, with two
      healthy hubs as controls;
  (b) query × page × country for the head terms whose titles we are about to touch;
  (c) date × page for the September dip, to see where the extra clicks landed.
Run:  python3 scripts/gscDiagnose.py  →  writes docs/gsc-diagnostics-<date>.md
Reuses archiveGsc.py's service-account signing; needs no extra install.
"""
import importlib.util, json, os, sys, urllib.request, urllib.parse, datetime
spec = importlib.util.spec_from_file_location('arc', os.path.join(os.path.dirname(__file__), 'archiveGsc.py'))
arc = importlib.util.module_from_spec(spec); spec.loader.exec_module(arc)
SITE = 'https://canpayinsights.ca/'
token, via = arc.access_token()
H = {'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}
def post(url, body):
    req = urllib.request.Request(url, json.dumps(body).encode(), H)
    try: return json.load(urllib.request.urlopen(req, timeout=60))
    except urllib.error.HTTPError as e: return {'error': e.code, 'body': e.read().decode()[:300]}

out = []
today = datetime.date.today().isoformat()
# ── (a) URL Inspection ──
hubs = ['bc-paycheck-calculator','alberta-paycheck-calculator','hourly-wage-calculator','salary-calculator','cpp-ei-calculator','timesheet-tracker',
        'ontario-paycheck-calculator','nova-scotia-paycheck-calculator']
out.append('## (a) URL Inspection\n\n| URL | coverage | verdict | googleCanonical | lastCrawl | robots | referringUrls |\n|---|---|---|---|---|---|---|')
for h in hubs:
    r = post('https://searchconsole.googleapis.com/v1/urlInspection/index:inspect', {'inspectionUrl': SITE + h, 'siteUrl': SITE})
    ir = r.get('inspectionResult', {}).get('indexStatusResult', {})
    out.append(f"| /{h} | {ir.get('coverageState','?') if not r.get('error') else 'ERR '+str(r.get('error'))} | {ir.get('verdict','')} | {ir.get('googleCanonical','')} | {str(ir.get('lastCrawlTime',''))[:10]} | {ir.get('robotsTxtState','')} | {len(ir.get('referringUrls',[]))} |")
    if r.get('error'): out.append(f"    error body: {r.get('body')}")
# ── (b) query × page × country, last 28 days ──
end = datetime.date(2026,9,12); start = end - datetime.timedelta(days=27)
terms = ['payroll calculator','salary calculator canada','salary calculator ontario','ontario salary calculator','paycheck calculator ontario','take home pay calculator ontario','paycheck calculator']
out.append(f'\n## (b) query × page × country, {start}..{end}\n\n| query | page | country | clicks | impr | pos |\n|---|---|---|---|---|---|')
for t in terms:
    r = post(f'https://searchconsole.googleapis.com/webmasters/v3/sites/{urllib.parse.quote(SITE, safe="")}/searchAnalytics/query',
             {'startDate': start.isoformat(), 'endDate': end.isoformat(), 'dimensions': ['query','page','country'],
              'dimensionFilterGroups': [{'filters': [{'dimension': 'query', 'operator': 'equals', 'expression': t}]}], 'rowLimit': 50})
    rows = r.get('rows', [])
    if r.get('error'): out.append(f"| {t} | ERR {r.get('error')} {r.get('body')} | | | | |"); continue
    for row in sorted(rows, key=lambda x: -x['impressions'])[:8]:
        q, p, c = row['keys']; out.append(f"| {q} | {p.replace(SITE,'/')} | {c} | {row['clicks']} | {row['impressions']} | {row['position']:.1f} |")
    if not rows: out.append(f"| {t} | (no rows) | | | | |")
# ── (c) date × page, 2026-08-28..09-12 ──
r = post(f'https://searchconsole.googleapis.com/webmasters/v3/sites/{urllib.parse.quote(SITE, safe="")}/searchAnalytics/query',
         {'startDate': '2026-08-28', 'endDate': '2026-09-12', 'dimensions': ['date','page'], 'rowLimit': 5000})
rows = r.get('rows', [])
by_day = {}
for row in rows:
    d, p = row['keys']; by_day.setdefault(d, {'calc': 0, 'blog': 0, 'other': 0})
    kind = 'blog' if '/blog/' in p else ('calc' if p.rstrip('/') == SITE.rstrip('/') or p.endswith('-paycheck-calculator') or '/zh' in p else 'other')
    by_day[d][kind] += row['clicks']
out.append('\n## (c) clicks by day and page type, 2026-08-28..09-12\n\n| date | calculator pages | blog | other |\n|---|---|---|---|')
for d in sorted(by_day): out.append(f"| {d} | {by_day[d]['calc']} | {by_day[d]['blog']} | {by_day[d]['other']} |")
if r.get('error'): out.append(f"ERR {r.get('error')} {r.get('body')}")
doc = f"# Search Console diagnostics — {today}\n\nAuth: {'service account' if via else 'personal login'}. Site: {SITE}\n\n" + '\n'.join(out) + '\n'
os.makedirs('docs', exist_ok=True); path = f'docs/gsc-diagnostics-{today}.md'; open(path, 'w').write(doc); print(doc); print('→', path)
