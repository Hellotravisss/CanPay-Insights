#!/bin/bash
# Install (or repair) the daily archive + backup job.
#
# THE PROBLEM THIS SOLVES
#   macOS protects ~/Documents, ~/Desktop and ~/Downloads. A launchd job cannot
#   read a script there without Full Disk Access, and the failure is silent
#   apart from a line in a log nobody reads. The original job pointed straight
#   at the repo and failed on EVERY run for months:
#       can't open file '.../scripts/archiveGsc.py': Operation not permitted
#   Nothing was being archived; the data that existed had been backfilled by hand.
#
#   Rather than asking for Full Disk Access — which would hand every future
#   python script the keys to the whole disk — this copies the two scripts to a
#   location launchd can read, and has them write to a repo outside ~/Documents.
#
# RUN THIS AGAIN after changing either script; the copies are what actually run.
set -e
REPO="$(cd "$(dirname "$0")/.." && pwd)"
RUNTIME="$HOME/Library/Application Support/CanPayArchive"
PLIST="$HOME/Library/LaunchAgents/ca.canpayinsights.gsc-archive.plist"
LOG="$HOME/.canpay-secrets/gsc-archive.log"

mkdir -p "$RUNTIME"
cp "$REPO/scripts/archiveGsc.py" "$RUNTIME/archiveGsc.py"
cp "$REPO/scripts/backupData.py" "$RUNTIME/backupData.py"

cat > "$RUNTIME/run.sh" <<'INNER'
#!/bin/bash
# Archive yesterday's Search Console data, then back everything up to git.
# Both steps are logged with a timestamp so a silent failure is visible.
set -o pipefail
RUNTIME="$HOME/Library/Application Support/CanPayArchive"
echo "=== $(date '+%Y-%m-%d %H:%M:%S') start ==="
/usr/bin/python3 "$RUNTIME/archiveGsc.py" 2>&1 || echo "!! archive step failed"
/usr/bin/python3 "$RUNTIME/backupData.py" 2>&1 || echo "!! backup step failed"
echo "=== $(date '+%Y-%m-%d %H:%M:%S') done ==="
INNER
chmod +x "$RUNTIME/run.sh"

cat > "$PLIST" <<PLISTEOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>ca.canpayinsights.gsc-archive</string>
  <key>ProgramArguments</key>
  <array>
    <string>/bin/bash</string>
    <string>$RUNTIME/run.sh</string>
  </array>
  <key>StartCalendarInterval</key>
  <dict><key>Hour</key><integer>14</integer><key>Minute</key><integer>10</integer></dict>
  <!-- Laptops are asleep at 14:10 more often than not; without this the job is
       simply skipped rather than run late. -->
  <key>RunAtLoad</key><false/>
  <key>StandardOutPath</key><string>$LOG</string>
  <key>StandardErrorPath</key><string>$LOG</string>
</dict>
</plist>
PLISTEOF

launchctl bootout "gui/$(id -u)/ca.canpayinsights.gsc-archive" 2>/dev/null || true
launchctl bootstrap "gui/$(id -u)" "$PLIST"
echo "installed:"
echo "  runner : $RUNTIME/run.sh"
echo "  plist  : $PLIST"
echo "  log    : $LOG"
echo
echo "run it now with:  launchctl kickstart -p gui/$(id -u)/ca.canpayinsights.gsc-archive"
