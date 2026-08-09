#!/usr/bin/env python3
"""
Archive Google Search Console into Supabase, one day at a time.

WHY THIS EXISTS
    Search Console keeps 16 months and then discards. "What Canadians searched
    about their pay, day by day, for a decade" cannot be bought or backfilled
    later — it only exists if it is copied out before the window closes.

CREDENTIALS
    Google:   Application Default Credentials from `gcloud auth application-default
              login --scopes=...webmasters.readonly,...cloud-platform`. Local file,
              never committed, never leaves this machine.
    Supabase: a shared token in ~/.canpay-secrets/gsc-ingest-token (chmod 600) that
              authorises one narrow SECURITY DEFINER function. The service_role key
              is deliberately not used anywhere.

USAGE
    python3 scripts/archiveGsc.py                # yesterday and the 2 days before
    python3 scripts/archiveGsc.py --days 480     # backfill the full GSC window
    python3 scripts/archiveGsc.py --dry-run      # fetch and report, write nothing

GSC finalises a day's numbers a few days late, so recent days are re-fetched on
every run and upserted; that is why re-running is always safe.
"""
import argparse
import datetime
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

ADC = os.path.expanduser("~/.config/gcloud/application_default_credentials.json")
TOKEN_FILE = os.path.expanduser("~/.canpay-secrets/gsc-ingest-token")
QUOTA_PROJECT = "canpay-insights"

# The property that actually holds the data. The www variant exists but is
# nearly empty — 65 impressions against 25,782 on this one over the same 28
# days — so anything reading the wrong property concludes the site is dead.
SITE = "https://canpayinsights.ca/"

SUPABASE_URL = "https://csvauvgygdjgljgllter.supabase.co"
SUPABASE_ANON = (
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9."
    "eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzdmF1dmd5Z2RqZ2xqZ2xsdGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExOTE4MjYsImV4cCI6MjA4Njc2NzgyNn0."
    "cx26CLjejb2ZuFEeG3riGPFqrZiKXlQFdGKELQ4rxYk"
)


def die(msg):
    print(f"ERROR: {msg}", file=sys.stderr)
    sys.exit(1)


def access_token():
    if not os.path.exists(ADC):
        die(
            "no Application Default Credentials. Run:\n"
            "  gcloud auth application-default login "
            '--scopes="https://www.googleapis.com/auth/webmasters.readonly,'
            'https://www.googleapis.com/auth/cloud-platform"'
        )
    c = json.load(open(ADC))
    body = urllib.parse.urlencode(
        {
            "client_id": c["client_id"],
            "client_secret": c["client_secret"],
            "refresh_token": c["refresh_token"],
            "grant_type": "refresh_token",
        }
    ).encode()
    return json.load(urllib.request.urlopen("https://oauth2.googleapis.com/token", body))[
        "access_token"
    ]


def gsc_query(token, day, dimensions, row_limit=1000):
    url = (
        "https://searchconsole.googleapis.com/webmasters/v3/sites/"
        f"{urllib.parse.quote(SITE, safe='')}/searchAnalytics/query"
    )
    payload = {
        "startDate": day,
        "endDate": day,
        "dimensions": dimensions,
        "rowLimit": row_limit,
        # Fresh, un-finalised data would otherwise be silently mixed with settled
        # data; asking for FINAL keeps the series internally consistent.
        "dataState": "final",
    }
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode(),
        headers={
            "Authorization": f"Bearer {token}",
            "x-goog-user-project": QUOTA_PROJECT,
            "Content-Type": "application/json",
        },
    )
    for attempt in range(4):
        try:
            return json.load(urllib.request.urlopen(req))
        except urllib.error.HTTPError as e:
            if e.code in (429, 500, 503) and attempt < 3:
                time.sleep(2 ** attempt)
                continue
            die(f"GSC {e.code} on {day} {dimensions}: {e.read().decode()[:300]}")


def rows(result):
    out = []
    for r in result.get("rows", []):
        out.append(
            {
                "key": r["keys"][0],
                "clicks": r.get("clicks", 0),
                "impressions": r.get("impressions", 0),
                "ctr": r.get("ctr", 0),
                "position": r.get("position", 0),
            }
        )
    return out


def ingest(payload):
    token = open(TOKEN_FILE).read().strip()
    req = urllib.request.Request(
        f"{SUPABASE_URL}/rest/v1/rpc/gsc_ingest",
        data=json.dumps({"p_token": token, "p_payload": payload}).encode(),
        headers={
            "apikey": SUPABASE_ANON,
            "Authorization": f"Bearer {SUPABASE_ANON}",
            "Content-Type": "application/json",
        },
    )
    try:
        return json.load(urllib.request.urlopen(req))
    except urllib.error.HTTPError as e:
        die(f"ingest failed: {e.code} {e.read().decode()[:200]}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--days", type=int, default=3, help="how many days back to fetch")
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    token = access_token()
    # GSC lags ~2 days; starting at today-2 avoids archiving empty days forever.
    end = datetime.date.today() - datetime.timedelta(days=2)

    total_clicks = 0
    written = 0
    for i in range(args.days):
        day = str(end - datetime.timedelta(days=i))
        totals = gsc_query(token, day, [])
        trow = (totals.get("rows") or [{}])[0]
        if not trow:
            print(f"{day}  (no data)")
            continue
        payload = {
            "date": day,
            "totals": {
                "clicks": int(trow.get("clicks", 0)),
                "impressions": int(trow.get("impressions", 0)),
                "ctr": trow.get("ctr", 0),
                "position": trow.get("position", 0),
            },
            "queries": rows(gsc_query(token, day, ["query"])),
            "pages": rows(gsc_query(token, day, ["page"])),
        }
        total_clicks += payload["totals"]["clicks"]
        if args.dry_run:
            print(
                f"{day}  clicks={payload['totals']['clicks']:>4} "
                f"impr={payload['totals']['impressions']:>6} "
                f"queries={len(payload['queries']):>4} pages={len(payload['pages']):>4}  (dry run)"
            )
            continue
        res = ingest(payload)
        written += 1
        print(
            f"{day}  clicks={payload['totals']['clicks']:>4} "
            f"impr={payload['totals']['impressions']:>6} "
            f"queries={res['queries']:>4} pages={res['pages']:>4}"
        )

    print(f"\ndone: {written} days written, {total_clicks} clicks in range")


if __name__ == "__main__":
    main()
