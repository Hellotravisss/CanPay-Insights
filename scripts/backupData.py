#!/usr/bin/env python3
"""
Copy every row out of Supabase into a git repository, one immutable file per day.

WHY THIS EXISTS
    The private data room reads from a single free-tier Postgres project. That
    project holds the only copy of ~14,000 rows of Search Console history —
    history Google itself deletes after 16 months, so it cannot be re-fetched
    once the window passes. A paused project, a billing lapse or a mistaken
    click would end the ten-year dataset before it is one year old.

    Git is the durable half: replicated to GitHub, to this machine, and to every
    clone, with history that makes silent corruption visible.

WHERE IT WRITES, AND WHY NOT THE APP REPO
    ~/canpay-data-archive (override with CANPAY_ARCHIVE_DIR).

    Two reasons it lives outside ~/Documents:
      1. macOS blocks launchd-spawned processes from touching ~/Documents
         without Full Disk Access. The scheduled GSC archiver failed silently
         for exactly this reason — every run logged "Operation not permitted" —
         so a backup that lived there would never have run either.
      2. A daily data commit forever would bury the application's own history.

CREDENTIALS
    The same narrow token as the ingest side (~/.canpay-secrets/gsc-ingest-token),
    which authorises two SECURITY DEFINER functions and nothing else. The anon
    key alone still cannot read these tables; the service_role key is not used.

USAGE
    python3 scripts/backupData.py             # back up any day not yet on disk,
                                              # plus re-pull the last 5 days
    python3 scripts/backupData.py --all       # re-pull every day
    python3 scripts/backupData.py --verify    # check files against the database
    python3 scripts/backupData.py --no-commit # write files, skip git
"""
import argparse
import datetime
import hashlib
import json
import os
import subprocess
import sys
import urllib.error
import urllib.request

TOKEN_FILE = os.path.expanduser("~/.canpay-secrets/gsc-ingest-token")
ARCHIVE_DIR = os.path.expanduser(os.environ.get("CANPAY_ARCHIVE_DIR", "~/canpay-data-archive"))
SUPABASE_URL = "https://csvauvgygdjgljgllter.supabase.co"
SUPABASE_ANON = (
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9."
    "eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzdmF1dmd5Z2RqZ2xqZ2xsdGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExOTE4MjYsImV4cCI6MjA4Njc2NzgyNn0."
    "cx26CLjejb2ZuFEeG3riGPFqrZiKXlQFdGKELQ4rxYk"
)
# Search Console revises the last few days after first publishing them, so recent
# files are rewritten on every run. Older files are treated as immutable.
MUTABLE_DAYS = 5


def die(msg):
    print(f"ERROR: {msg}", file=sys.stderr)
    sys.exit(1)


def rpc(name, payload):
    req = urllib.request.Request(
        f"{SUPABASE_URL}/rest/v1/rpc/{name}",
        data=json.dumps(payload).encode(),
        headers={
            "apikey": SUPABASE_ANON,
            "Authorization": f"Bearer {SUPABASE_ANON}",
            "Content-Type": "application/json",
        },
    )
    try:
        return json.load(urllib.request.urlopen(req, timeout=120))
    except urllib.error.HTTPError as e:
        die(f"{name} failed: {e.code} {e.read().decode()[:300]}")


def day_path(day):
    return os.path.join(ARCHIVE_DIR, "days", f"{day}.json")


def counts(blob):
    return {k: len(blob.get(k, [])) for k in ("gsc_daily", "gsc_queries", "gsc_pages", "calc_events")}


def write_day(token, day, force=False):
    """Returns (written, counts). Refuses to overwrite a file with less data."""
    path = day_path(day)
    blob = rpc("export_day", {"p_token": token, "p_date": day})
    new = counts(blob)

    if os.path.exists(path):
        old = counts(json.load(open(path)))
        shrank = {k: (old[k], new[k]) for k in old if new[k] < old[k]}
        if shrank and not force:
            # A backup that can silently lose rows is worse than no backup,
            # because it looks fine. Keep the fuller file and make noise.
            print(f"  {day}: REFUSED — would lose rows {shrank}", file=sys.stderr)
            return False, old
        if old == new:
            return False, old

    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w") as f:
        json.dump(blob, f, indent=1, sort_keys=True, default=str)
        f.write("\n")
    return True, new


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--all", action="store_true", help="re-pull every day, not just missing ones")
    ap.add_argument("--verify", action="store_true", help="compare files against the database")
    ap.add_argument("--no-commit", action="store_true")
    ap.add_argument("--force", action="store_true", help="allow a smaller file to overwrite a larger one")
    args = ap.parse_args()

    if not os.path.exists(TOKEN_FILE):
        die(f"missing {TOKEN_FILE}")
    token = open(TOKEN_FILE).read().strip()

    manifest = rpc("export_manifest", {"p_token": token})
    days = [d for d in manifest["days"] if d]
    db_counts = manifest["row_counts"]
    print(f"database holds {sum(db_counts.values())} rows across {len(days)} days")
    for k, v in sorted(db_counts.items()):
        print(f"   {k:<14} {v}")

    if args.verify:
        missing, mismatched, total = [], [], {"gsc_daily": 0, "gsc_queries": 0, "gsc_pages": 0, "calc_events": 0}
        for d in days:
            p = day_path(d)
            if not os.path.exists(p):
                missing.append(d)
                continue
            c = counts(json.load(open(p)))
            for k in total:
                total[k] += c[k]
        print("\nfiles on disk:")
        for k, v in sorted(total.items()):
            flag = "OK" if v == db_counts[k] else f"MISMATCH (db has {db_counts[k]})"
            print(f"   {k:<14} {v:<8} {flag}")
        if missing:
            print(f"\n{len(missing)} day(s) missing from disk: {missing[:10]}")
        ok = not missing and all(total[k] == db_counts[k] for k in total)
        print("\nVERIFIED" if ok else "\nINCOMPLETE")
        sys.exit(0 if ok else 1)

    today = datetime.date.today()
    cutoff = (today - datetime.timedelta(days=MUTABLE_DAYS)).isoformat()
    written = 0
    for d in days:
        needed = args.all or not os.path.exists(day_path(d)) or d >= cutoff
        if not needed:
            continue
        did, c = write_day(token, d, force=args.force)
        if did:
            written += 1
            print(f"  wrote {d}: {c}")

    # The manifest doubles as a checksum of the whole archive.
    files = sorted(f for f in os.listdir(os.path.join(ARCHIVE_DIR, "days")) if f.endswith(".json"))
    digest = hashlib.sha256()
    for f in files:
        digest.update(open(os.path.join(ARCHIVE_DIR, "days", f), "rb").read())
    summary = {
        "generated_at": datetime.datetime.utcnow().isoformat() + "Z",
        "days_archived": len(files),
        "first_day": files[0][:-5] if files else None,
        "last_day": files[-1][:-5] if files else None,
        "database_row_counts": db_counts,
        "sha256_of_all_days": digest.hexdigest(),
        "monthly_snapshots": manifest.get("monthly_snapshots", []),
    }
    with open(os.path.join(ARCHIVE_DIR, "manifest.json"), "w") as f:
        json.dump(summary, f, indent=1, sort_keys=True, default=str)
        f.write("\n")

    print(f"\n{written} day file(s) updated · {len(files)} total · {ARCHIVE_DIR}")

    if not args.no_commit:
        try:
            subprocess.run(["git", "add", "-A"], cwd=ARCHIVE_DIR, check=True)
            r = subprocess.run(
                ["git", "commit", "-m", f"backup {today}: {len(files)} days, {sum(db_counts.values())} rows"],
                cwd=ARCHIVE_DIR, capture_output=True, text=True,
            )
            if r.returncode == 0:
                print("committed")
                p = subprocess.run(["git", "push"], cwd=ARCHIVE_DIR, capture_output=True, text=True)
                print("pushed" if p.returncode == 0 else f"push skipped: {p.stderr.strip()[:120]}")
            else:
                print("nothing new to commit")
        except Exception as e:  # never let a git problem look like a backup problem
            print(f"git step failed (files are still written): {e}", file=sys.stderr)


if __name__ == "__main__":
    main()
