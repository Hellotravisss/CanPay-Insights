# Monetization — what is wired, what needs an account

Last reviewed: 2026-08-09

## The honest position

At roughly 30 visits a day, no monetization method earns meaningful money. The
binding constraint is traffic, not the absence of ad slots. Everything here is
built so it pays off automatically when traffic arrives, without needing a
rebuild — and so that nothing on the site misleads a reader in the meantime.

Design rules that do not bend:

- A partner with no approved link renders **nothing**. No placeholder boxes.
- Every paid link carries a visible "paid referral link" marker and `rel="sponsored"`.
- Commercial links never touch the tax engine, the wage data, or any ranking.
- Display advertising is not coming back. AdSense rejected the site five times
  over its calculator format; Ezoic and Mediavine have traffic minimums far
  above where the site is. See [[canpay-monetization-status]].

## Live now

| Slot | Where | Status |
|---|---|---|
| Wealthsimple RRSP referral | Deep tax report, when RRSP contributions are zero | Live, personal invite link |
| Job searches at this salary | Every `$X-after-tax-<province>` page | Live as plain links — **earns nothing yet** |

The job links are deliberately live before they earn anything: someone checking
the take-home on a specific salary is usually weighing an offer, so the section
is useful on its own. A publisher id turns the same links into paid clicks.

## Needs an account (only Travis can do these)

Each one is a single environment variable in Vercel. Nothing else changes.

### 1. Tax season — highest value, deadline-driven

Canadian filing runs February to April 30, which is also when "what do I take
home" traffic peaks. The slot is already built and **hides itself outside those
months**, so it must be configured before February.

| Env var | Programme | Where to apply |
|---|---|---|
| `NEXT_PUBLIC_WS_TAX_URL` | Wealthsimple Tax referral | wealthsimple.com, same account as the invite link already in use |
| `NEXT_PUBLIC_TURBOTAX_URL` | TurboTax Canada affiliate | Impact (impact.com) — Intuit Canada programme |

### 2. Job feeds — monetizes the salary pages

| Env var | Programme | Notes |
|---|---|---|
| `NEXT_PUBLIC_TALENT_PUBLISHER` | Talent.com publisher | Pay-per-click; approval usually needs a live site with relevant content, which the 132 released salary pages now are |
| `NEXT_PUBLIC_JOOBLE_PUBLISHER` | Jooble publisher | Same model, second source so one rejection is not fatal |

## Deliberately not doing

- **Display ads** — would wreck the clean pages that make the site citable, for
  a few dollars a month. The whole GEO strategy depends on looking like a
  reference, not a content farm.
- **Subscriptions or a paywall** — free tools that add a paywall lose the
  traffic that made them worth paying for.
- **Selling the telemetry** — the dataset is years away from the scale where
  anyone would buy it. Its present value is that it makes the site citable.

## Review trigger

Revisit when organic traffic passes ~1,000 visits/month: at that point the
Wealthsimple **affiliate** programme (up to $1,250 per funded referral, versus
the small personal-invite bonus) becomes worth the application effort.
