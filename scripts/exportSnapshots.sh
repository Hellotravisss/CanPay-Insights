#!/bin/bash
# Exports every stored monthly aggregate to data-archive/monthly/.
#
# Git is the durable copy of this dataset. A database on someone else's free
# tier can be paused, deleted or lost; a committed JSON file survives any of
# that, and it is the only reason a decade-long series can be promised.
#
# Uses the PUBLIC anon key only — no secrets. The RPC returns aggregates.
set -e
cd "$(dirname "$0")/.."
SUPABASE_URL="https://csvauvgygdjgljgllter.supabase.co"
ANON_KEY="$(grep -o 'eyJ[A-Za-z0-9._-]*' lib/supabase.ts | head -1)"
mkdir -p data-archive/monthly

# Rebuild the current month, then pull them all down.
curl -s -X POST "$SUPABASE_URL/rest/v1/rpc/build_monthly_snapshot" \
  -H "apikey: $ANON_KEY" -H "Content-Type: application/json" -d '{}' > /dev/null

curl -s -X POST "$SUPABASE_URL/rest/v1/rpc/get_monthly_snapshots" \
  -H "apikey: $ANON_KEY" -H "Content-Type: application/json" -d '{}' \
| python3 -c "
import json, sys, pathlib
rows = json.load(sys.stdin)
for r in rows:
    p = pathlib.Path('data-archive/monthly') / f\"{r['month']}.json\"
    p.write_text(json.dumps(r, indent=2, sort_keys=True) + '\n')
    print('wrote', p)
print(f'{len(rows)} month(s) archived')
"
