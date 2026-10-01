# CanPay Insights

Source of [canpayinsights.ca](https://canpayinsights.ca), a free take-home pay calculator for people who work in Canada: net pay after federal and provincial income tax, CPP/CPP2 (QPP and QPIP in Quebec) and EI, for all 13 provinces and territories, 2026 rates.

It is not a payroll service or a payment processor; it only estimates.

## Why the numbers can be trusted

Every build runs the engine against the CRA's published payroll deduction tables (T4032, claim code 1, bi-weekly, 13 jurisdictions) and Revenu Québec's source-deduction table: 10,260 rows. A build that disagrees with them does not deploy.

```bash
npm ci
npm run audit:engine   # T4032 golden test
npm run prebuild       # every pre-build gate
```

## Layout

- `utils/taxEngine.ts`: the calculation engine
- `tests/golden/`: fixtures built from the official tables (never edited by hand)
- `scripts/`: the audit gates
- `app/`: Next.js pages, deployed to Cloudflare Workers

## Open data

The take-home dataset (455 rows, CSV and JSON, CC BY 4.0) is at [canpayinsights.ca/data](https://canpayinsights.ca/data), mirrored in [canpay-open-data](https://github.com/Hellotravisss/canpay-open-data).

Contact: info@canpayinsights.ca
