"""Email Travis when a workflow fails.

A failed deploy sat unnoticed for three days in October 2026 (OpenNext refused
Next 15 once its support window closed) because nobody looks at red crosses.
Sends through Cloudflare Email Sending with a token scoped to Email Sending only.
Env: CF_EMAIL_TOKEN, CF_ACCOUNT_ID, plus the GITHUB_* variables Actions sets.
"""
import email.utils, json, os, sys, urllib.request, uuid

to = os.environ.get("NOTIFY_TO", "qharbert@gmail.com")
g = lambda k: os.environ.get(k, "")
run = f"{g('GITHUB_SERVER_URL')}/{g('GITHUB_REPOSITORY')}/actions/runs/{g('GITHUB_RUN_ID')}"
subject = f"[CanPay] {g('GITHUB_WORKFLOW')} failed"
body = (
    f"Workflow: {g('GITHUB_WORKFLOW')}\n"
    f"Commit: {g('GITHUB_SHA')[:7]} on {g('GITHUB_REF_NAME')} "
    f"(event {g('GITHUB_EVENT_NAME')}, actor {g('GITHUB_ACTOR')})\n"
    f"Log: {run}\n\n"
    "If this is the deploy, production is still serving the previous version.\n"
)
raw = "\r\n".join([
    "From: CanPay Insights <info@canpayinsights.ca>", f"To: {to}", f"Subject: {subject}",
    f"Date: {email.utils.formatdate(usegmt=True)}", f"Message-ID: <{uuid.uuid4()}@canpayinsights.ca>",
    "MIME-Version: 1.0", "Content-Type: text/plain; charset=utf-8", "Content-Transfer-Encoding: 8bit",
    "", body.replace("\n", "\r\n"),
])
req = urllib.request.Request(
    f"https://api.cloudflare.com/client/v4/accounts/{os.environ['CF_ACCOUNT_ID']}/email/sending/send_raw",
    data=json.dumps({"from": "info@canpayinsights.ca", "recipients": [to], "mime_message": raw}).encode(),
    headers={"Authorization": f"Bearer {os.environ['CF_EMAIL_TOKEN']}", "Content-Type": "application/json"},
)
with urllib.request.urlopen(req, timeout=30) as r:
    res = json.load(r)
if not res.get("success"):
    sys.exit(f"failure email not sent: {res.get('errors')}")
print(f"failure email queued to {to}")
