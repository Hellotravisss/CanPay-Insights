CanPay Insights - buyer sample, September 2026
Licence: CC BY-NC-SA 4.0 for this sample. Commercial use needs a licence: info@canpayinsights.ca

WHAT IT IS
Aggregates of anonymous calculations made on canpayinsights.ca in September 2026
(Canada only, test and bot traffic excluded). One row per cell; no individual records.
It is a self-selected sample of people who came to calculate, not a survey of the population.

PRIVACY FLOOR
Any cell with fewer than 20 calculations or sessions is shown as "<20".
A blank indicator means fewer than 20 observations behind it.

FILES
2026-09_volume_by_province_income_paytype.csv
  province x pay_type, then All Canada x income_range x pay_type
  calculations  number of results computed
  sessions      distinct visits (a random id per page load, never stored across visits)
  pay_type      hourly | salary | timesheet/shift
  income_range  annual gross: under-30k, 30-50k, 50-70k, 70-90k, 90-120k, 120-160k, 160k-plus

2026-09_province_language.csv
  language      interface language: en, fr, zh, other (ko, es, pa, hi, tl, uk, vi)

2026-09_monthly_indicators.csv
  raise_pricing_share_pct           of visits whose income changed, % that ended higher than they started
  multi_province_session_share_pct  % of visits that priced two or more provinces (Canada only)
  shift_start_before_7_share_pct    of shift entries the user edited, % starting before 7 a.m.
  non_english_share_pct             % of calculations in a language other than English

UNDER LICENCE (not in this sample)
Postal-area (FSA) cuts, province pairs compared, observed pay changes, expectation gap,
shift and overtime patterns by sector, monthly delivery.
Method: https://canpayinsights.ca/research/pay-calculator-behaviour
