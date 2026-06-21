import type { Article } from './types';

// Original data studies computed with the CanPay Insights tax engine.
// These are designed to be citable: methodology, sources, and exact figures included.

export const studyArticles: Article[] = [
  {
    id: 'study-1',
    slug: 'minimum-wage-take-home-pay-canada-2026',
    title: 'Minimum Wage Take-Home Pay in Every Canadian Province (June 2026 Data)',
    subtitle:
      'We calculated what a full-time minimum wage worker actually keeps after federal tax, provincial tax, CPP, and EI in all 13 provinces and territories',
    excerpt:
      'Nunavut minimum wage workers take home $34,098 a year while Alberta workers keep $26,478 — a $7,620 gap. New 2026 data on what minimum wage is really worth after taxes in every province.',
    metaTitle: 'Minimum Wage After Tax by Province: 2026 Canadian Data Study',
    metaDescription:
      'Original 2026 data: full-time minimum wage take-home pay in all 13 Canadian provinces and territories. Nova Scotia workers lose 19.8% to deductions; Alberta workers lose 15.1%.',
    keywords: [
      'minimum wage after tax canada',
      'minimum wage take home pay',
      'minimum wage by province 2026',
      'minimum wage ontario after tax',
      'minimum wage bc after tax',
      'living on minimum wage canada',
    ],
    category: 'salary',
    tags: ['Minimum Wage', '2026', 'Data Study', 'All Provinces'],
    publishedAt: '2026-06-12',
    readTime: 9,
    imageUrl: '/blog/minimum-wage-take-home-2026.png',
    directAnswer:
      'As of June 2026, a full-time minimum wage worker takes home between $26,779 a year (Alberta, $15.00/hr) and $34,393 a year (Nunavut, $19.75/hr) after federal tax, provincial tax, CPP, and EI. In Ontario ($17.60/hr), full-time minimum wage works out to $30,516 a year or about $2,543 a month after deductions.',
    faq: [
      {
        question: 'How much does a minimum wage worker take home in Ontario in 2026?',
        answer:
          'At Ontario’s $17.60 minimum wage, a full-time worker (40 hours/week) grosses $36,608 a year and takes home approximately $30,516 after federal tax, provincial tax, CPP, and EI — about $2,543 per month, or a net hourly rate of $14.67. Ontario’s minimum wage rises to $17.95 on October 1, 2026.',
      },
      {
        question: 'Which province has the highest minimum wage take-home pay in Canada?',
        answer:
          'Nunavut, at $19.75/hr, produces the highest full-time take-home pay: about $34,393 a year. Among provinces (excluding territories), British Columbia leads at roughly $31,536 a year on its $18.25 minimum wage, followed by Ontario at $30,516.',
      },
      {
        question: 'How much tax does a minimum wage worker pay in Canada?',
        answer:
          'Combined deductions (income tax + CPP + EI) take between 14.2% (Alberta) and 19.2% (Nova Scotia) of a full-time minimum wage salary in 2026. Income tax alone is relatively small at these earnings levels; CPP and EI contributions make up a large share of the total deductions.',
      },
      {
        question: 'Is minimum wage in BC or Ontario worth more after tax?',
        answer:
          'BC’s $18.25 minimum wage nets about $31,536 a year for full-time work versus $30,516 in Ontario at $17.60 — a difference of roughly $1,020 a year or $85 a month in BC’s favour, before considering cost-of-living differences.',
      },
    ],
    content: `
## What Minimum Wage Is Really Worth in 2026

Minimum wage headlines always quote the hourly rate. But a $17.00 wage in one province and a $16.60 wage in another can leave a worker with almost the same money in the bank, because provincial taxes and payroll deductions differ sharply across Canada.

We ran every provincial and territorial minimum wage (current as of June 12, 2026) through the CanPay Insights tax engine to answer one question: **what does a full-time minimum wage worker actually keep?**

### Key findings

- **The national gap is $7,614 a year.** A full-time minimum wage worker in Nunavut takes home $34,393; in Alberta, $26,779.
- **Nova Scotia takes the biggest bite.** Deductions consume 19.2% of a minimum wage salary in Nova Scotia — the highest in Canada. Alberta takes the smallest share (14.2%), but its $15.00 wage is so low that Alberta workers still finish last in actual dollars.
- **PEI's higher wage mostly evaporates.** PEI's $17.00 wage is 40 cents above Quebec's $16.60, but after deductions the difference shrinks to about $44 a month.
- **Saskatchewan nearly catches Manitoba.** Saskatchewan pays 65 cents less per hour than Manitoba, but its lower deductions close the annual net gap to just $415.

### Full results: minimum wage take-home pay by province (June 2026)

Figures assume full-time hours (40 hours/week, 2,080 hours/year), basic personal amounts only, and 2026 tax rates.

| Province | Min. wage | Gross (full-time) | Take-home / year | Take-home / month | Net hourly | Deduction rate |
| --- | --- | --- | --- | --- | --- | --- |
| Nunavut | $19.75 | $41,080 | **$34,393** | $2,866 | $16.54 | 16.3% |
| Yukon | $18.51 | $38,501 | **$31,846** | $2,654 | $15.31 | 17.3% |
| British Columbia | $18.25 | $37,960 | **$31,536** | $2,628 | $15.16 | 16.9% |
| Ontario | $17.60 | $36,608 | **$30,516** | $2,543 | $14.67 | 16.6% |
| Northwest Territories | $16.95 | $35,256 | **$29,643** | $2,470 | $14.25 | 15.9% |
| Prince Edward Island | $17.00 | $35,360 | **$28,831** | $2,403 | $13.86 | 18.5% |
| Quebec | $16.60 | $34,528 | **$28,300** | $2,358 | $13.61 | 18.0% |
| Nova Scotia | $16.75 | $34,840 | **$28,137** | $2,345 | $13.53 | 19.2% |
| Newfoundland and Labrador | $16.35 | $34,008 | **$27,899** | $2,325 | $13.41 | 18.0% |
| Manitoba | $16.00 | $33,280 | **$27,294** | $2,275 | $13.12 | 18.0% |
| New Brunswick | $15.90 | $33,072 | **$27,160** | $2,263 | $13.06 | 17.9% |
| Saskatchewan | $15.35 | $31,928 | **$26,879** | $2,240 | $12.92 | 15.8% |
| Alberta | $15.00 | $31,200 | **$26,779** | $2,232 | $12.87 | 14.2% |

*Deduction rate = (federal tax + provincial tax + CPP/QPP + EI, and QPIP in Quebec) as a share of gross pay.*

### The hourly rate you never see on the poster

Translating take-home pay back into an hourly figure shows how much of every advertised minimum wage hour a worker actually keeps:

- **Nunavut:** $19.75 advertised → **$16.54 in the bank**
- **Ontario:** $17.60 advertised → **$14.67 in the bank**
- **Quebec:** $16.60 advertised → **$13.61 in the bank**
- **Alberta:** $15.00 advertised → **$12.87 in the bank**

No Canadian jurisdiction lets a full-time minimum wage worker keep more than 86% of their gross pay.

### Why the deduction rates differ so much

At minimum wage income levels ($31,000–$41,000 a year), three things drive the differences:

1. **Provincial basic personal amounts.** Provinces with low basic personal amounts — Nova Scotia ($11,932) and Ontario ($12,989) are among the lowest — start taxing income much earlier than Alberta ($22,769) or the territories, and Nova Scotia pairs that with the highest bottom-bracket rate in the country (8.79%).
2. **Quebec's separate system.** Quebec layers QPP (at a higher rate than CPP) and QPIP on top of income tax, partly offset by the federal Quebec abatement.
3. **CPP and EI are flat at this level.** CPP (5.95%) and EI (1.63%) apply almost uniformly, so they hit low earners proportionally harder than higher earners who exceed the contribution ceilings.

### Wage increases already scheduled for late 2026

Four provinces have announced October 1, 2026 increases that will shift these numbers:

- Ontario: $17.60 → $17.95
- Manitoba: $16.00 → $16.40
- Prince Edward Island: $17.00 → $17.30
- Nova Scotia: $16.75 → $17.00

We will update this study when the new rates take effect.

### Methodology

Calculations use the CanPay Insights tax engine with 2026 federal and provincial tax brackets, CPP/CPP2 (QPP/QPP2 and QPIP for Quebec), and EI premiums. We assume a single worker, full-time hours (2,080 hours/year), no RRSP contributions, no benefits, and basic personal amounts only. Real paycheques will vary with credits, benefits, and actual hours. Minimum wage rates are current as of June 12, 2026, sourced from the [Government of Canada minimum wage database](https://minwage-salairemin.service.canada.ca/en/general.html) and provincial announcements.

You can verify any figure with our [free payroll calculator](/) or the province pages, for example [$35,000 after tax in Ontario](/35000-after-tax-ontario) and the [hourly wage calculator](/hourly-wage-calculator).

*This study is free to cite and republish with attribution and a link to this page.*
`,
  },
  {
    id: 'study-2',
    slug: 'cpp2-second-additional-cpp-2026',
    title: 'CPP2 in 2026: The Second CPP Contribution Explained (With Real Numbers)',
    subtitle:
      'If you earn more than the first CPP ceiling, a second contribution called CPP2 comes off your paycheque. Here is exactly how much, and who pays it.',
    excerpt:
      'CPP2 is an extra 4% contribution on income above the first CPP ceiling. In 2025 that means up to about $396 more off your pay. Here is how CPP2 works in 2026, who pays it, and what it costs.',
    metaTitle: 'CPP2 2026 Explained: Second Additional CPP Contribution & Rates',
    metaDescription:
      'What is CPP2 in 2026? The second additional CPP contribution is 4% on earnings above the first ceiling. See who pays CPP2, how much it costs, and 2025 vs 2026 figures.',
    keywords: [
      'cpp2 2026',
      'second additional cpp contribution',
      'cpp2 contribution 2026',
      'cpp2 explained',
      'what is cpp2',
      'cpp second ceiling 2026',
    ],
    category: 'tax',
    tags: ['CPP', 'CPP2', '2026', 'Payroll Deductions'],
    publishedAt: '2026-06-13',
    readTime: 6,
    directAnswer:
      'CPP2 is a second CPP contribution of 4% (employee) on the part of your income that falls between the first earnings ceiling (YMPE) and a higher second ceiling (YAMPE). In 2026 it applies between $74,600 and $85,000, costing higher earners up to about $416 extra per year on top of regular CPP. You only pay it if you earn above the first ceiling.',
    faq: [
      {
        question: 'What is CPP2?',
        answer:
          'CPP2 (the second additional CPP contribution) is a 4% contribution on earnings between the first CPP ceiling (YMPE) and a higher second ceiling (YAMPE). It was phased in starting in 2024 as part of the CPP enhancement. It is separate from, and on top of, the regular 5.95% CPP contribution.',
      },
      {
        question: 'Who has to pay CPP2 in 2026?',
        answer:
          'Only people who earn more than the first CPP ceiling. If your annual pensionable income is below the YMPE ($74,600 in 2026), you pay no CPP2 at all. Above that, CPP2 applies to the portion between the two ceilings.',
      },
      {
        question: 'How much does CPP2 cost?',
        answer:
          'In 2026, CPP2 applies at 4% on income between $74,600 and $85,000 — a maximum of about $416 for the employee (employers match it). Use our calculator to see your exact figure.',
      },
      {
        question: 'Is CPP2 the same as the CPP enhancement?',
        answer:
          'CPP2 is the final piece of the CPP enhancement that began in 2019. The first part gradually raised the regular contribution rate to 5.95%; CPP2 added a second, higher earnings band starting in 2024. Together they mean higher earners contribute more and will receive a larger CPP pension in retirement.',
      },
    ],
    content: `
## What is CPP2?

If you earn a higher income, you may have noticed a new line on your pay stub: a second CPP contribution, often labelled **CPP2**. It is not an error — it is the final stage of the CPP enhancement that Canada has been phasing in since 2019.

Regular CPP takes 5.95% of your pensionable earnings up to the first ceiling. **CPP2 adds a second 4% contribution** on the slice of income between that first ceiling and a higher second ceiling. You only pay it if you earn above the first ceiling.

## CPP2 in 2025 vs 2026

The two ceilings have official names: the **YMPE** (Year's Maximum Pensionable Earnings — the first ceiling) and the **YAMPE** (Year's Additional Maximum Pensionable Earnings — the second ceiling).

| | First ceiling (YMPE) | Second ceiling (YAMPE) | CPP2 rate | Max CPP2 (employee) |
| --- | --- | --- | --- | --- |
| 2025 | $71,300 | $81,200 | 4% | ~$396 |
| 2026 | $74,600 | $85,000 | 4% | ~$416 |

The CRA announces the new ceilings each autumn for the year ahead. The 4% rate stays the same — only the earnings bands move up with average wages.

## Who actually pays CPP2

- **Earning under the first ceiling** (~$71,300 in 2025): you pay **no CPP2** at all.
- **Earning between the two ceilings**: you pay 4% on the amount above the first ceiling.
- **Earning above the second ceiling**: you pay the full maximum CPP2, then contributions stop for the year.

So CPP2 is purely a higher-earner deduction. Someone on $60,000 never sees it; someone on $90,000 pays the full amount.

## What CPP2 costs you on each paycheque

Because CPP2 is capped, the most an employee pays in 2025 is roughly **$396 for the year** — about $15 per bi-weekly cheque if spread evenly. Your employer pays the same amount again. It is modest, but it stacks on top of regular CPP, EI, and income tax, which is why your take-home pay can feel lower than expected once your salary crosses the first ceiling.

## CPP2 vs regular CPP

| | Regular CPP | CPP2 |
| --- | --- | --- |
| Rate (employee) | 5.95% | 4% |
| Applies to | $3,500 up to first ceiling | First ceiling up to second ceiling |
| Who pays | Almost all workers | Only higher earners |

Both are mandatory and both are matched by your employer. The upside: higher contributions today mean a larger CPP pension when you retire.

## See your own number

CPP2 is built into the CanPay Insights calculator. Enter your salary and province to see exactly how much CPP, CPP2, EI, and tax come off your pay for 2025 and 2026 — try the [free payroll calculator](/), or check a specific salary like [$90,000 after tax in Ontario](/90000-after-tax-ontario).

*Figures reflect 2025 CRA ceilings; 2026 ceilings are higher. Always confirm the current year's amounts with the CRA or use the calculator for an up-to-date estimate.*
`,
  },
  {
    id: 'study-3',
    slug: 'how-much-cpp-will-i-pay-2026',
    title: 'How Much CPP Will I Pay in 2026? (Contributions by Salary)',
    subtitle: 'Your exact CPP and CPP2 contribution at every income level, from $40,000 to $150,000.',
    excerpt:
      'On a $60,000 salary you pay about $3,362 in CPP for the year; CPP maxes out at roughly $4,341 once you earn around $90,000. Here is the full CPP contribution table by salary for 2025/2026.',
    metaTitle: 'How Much CPP Will I Pay in 2026? CPP Contributions by Salary',
    metaDescription:
      'See exactly how much CPP you pay by salary in 2025/2026 — from $40k to $150k, including CPP2. On $60,000 you pay about $3,362; CPP maxes out around $4,341.',
    keywords: [
      'how much cpp will i pay',
      'cpp contribution by salary',
      'how much cpp on 60000',
      'cpp deduction 2026',
      'maximum cpp contribution 2026',
      'cpp on 70000 ontario',
    ],
    category: 'tax',
    tags: ['CPP', '2026', 'Payroll Deductions'],
    publishedAt: '2026-06-13',
    readTime: 5,
    directAnswer:
      'In 2026, most workers pay 5.95% CPP on earnings between $3,500 and $74,600, plus 4% CPP2 between $74,600 and $85,000. On a $60,000 salary that is about $3,362 for the year; on $80,000 about $4,446; and CPP plus CPP2 maxes out at about $4,646 once you earn $85,000 or more. Quebec uses QPP instead, which is slightly higher.',
    faq: [
      {
        question: 'How much CPP do I pay on $60,000?',
        answer:
          'About $3,362 for the year in 2026 (roughly $129 per bi-weekly cheque), made up of 5.95% CPP on earnings above the $3,500 exemption. Your employer pays the same amount.',
      },
      {
        question: 'What is the maximum CPP contribution in 2026?',
        answer:
          'In 2026 the maximum employee contribution is about $4,646 including CPP2 ($4,230.45 regular CPP plus $416 CPP2). You hit the maximum once your pensionable income reaches the second ceiling ($85,000 in 2026).',
      },
      {
        question: 'Does everyone pay the same CPP?',
        answer:
          'No. CPP is a percentage of income up to a cap, so lower earners pay less in dollars. Quebec workers pay QPP (a higher rate) instead of CPP, plus QPIP. Everyone stops contributing once they reach the yearly maximum.',
      },
    ],
    content: `
## How much CPP you pay, by salary

CPP (the Canada Pension Plan) takes **5.95% of your earnings** between the $3,500 basic exemption and the first ceiling ($74,600 in 2026). Earn above that and you also pay **CPP2** — an extra 4% up to a second ceiling. Here is what that works out to at each income level for 2026:

| Annual salary | Your CPP contribution (incl. CPP2) | Per bi-weekly cheque |
| --- | --- | --- |
| $40,000 | $2,172 | $84 |
| $50,000 | $2,767 | $106 |
| $60,000 | $3,362 | $129 |
| $70,000 | $3,957 | $152 |
| $80,000 | $4,446 | $171 |
| $90,000+ | $4,646 (maximum) | $179 |

Your employer pays the same amount again on your behalf.

## When CPP "maxes out"

Notice the numbers stop climbing at about **$4,646**. Once your pensionable income passes the second ceiling ($85,000 in 2026), you have paid the full year's CPP and contributions stop until January. That is why a December paycheque can suddenly look bigger for higher earners.

## Quebec is different

Quebec workers pay **QPP** instead of CPP. The QPP rate is a little higher than CPP, and Quebec also has QPIP (parental insurance). So a Quebec worker on $60,000 pays more toward QPP than an Ontario worker pays toward CPP. See the [Quebec paycheck calculator](/quebec-paycheck-calculator) for exact figures.

## See your exact number

These are estimates with basic amounts only. For your real number — including income tax, EI, and your province — use the [free payroll calculator](/) or the [CPP & EI calculator](/cpp-ei-calculator). New to CPP2? Read [CPP2 explained for 2026](/blog/cpp2-second-additional-cpp-2026).

*Figures use 2026 CRA ceilings. Confirm current amounts with the CRA or use the calculator.*
`,
  },
  {
    id: 'study-4',
    slug: 'how-much-ei-will-i-pay-2026',
    title: 'How Much EI Will I Pay in 2026? (Premiums by Salary)',
    subtitle: 'Your Employment Insurance premium at every income level, and where it maxes out.',
    excerpt:
      'EI is 1.63% of insurable earnings in 2026, maxing out at about $1,123 once you earn around $68,900. On a $50,000 salary you pay about $815. Full EI premium table by salary, plus Quebec rates.',
    metaTitle: 'How Much EI Will I Pay in 2026? EI Premiums by Salary',
    metaDescription:
      'See how much EI you pay by salary in 2026. EI is 1.63% of insurable earnings, maxing out at about $1,123. Quebec pays a lower EI rate. Full table by income.',
    keywords: [
      'how much ei will i pay',
      'ei premium by salary',
      'maximum ei contribution 2026',
      'ei deduction 2026',
      'how much ei on 50000',
      'ei rate quebec',
    ],
    category: 'tax',
    tags: ['EI', '2026', 'Payroll Deductions'],
    publishedAt: '2026-06-13',
    readTime: 4,
    directAnswer:
      'In 2026, EI is deducted at 1.63% of insurable earnings outside Quebec, up to a maximum of about $1,123 per year (reached around $68,900 of income). On $50,000 you pay about $815; on $60,000 about $978. Quebec uses a lower EI rate (it runs QPIP separately), maxing out at about $896.',
    faq: [
      {
        question: 'How much EI do I pay on $50,000?',
        answer:
          'About $815 for the year in 2026 outside Quebec (1.63% of insurable earnings). In Quebec the EI rate is lower, so you would pay less but also contribute to QPIP separately.',
      },
      {
        question: 'What is the maximum EI premium in 2026?',
        answer:
          'In 2026 the maximum employee EI premium is about $1,123 outside Quebec, reached once your income hits the maximum insurable earnings (around $68,900). Quebec\'s EI maximum is lower at about $896.',
      },
      {
        question: 'Why is EI lower in Quebec?',
        answer:
          'Quebec runs its own parental insurance plan (QPIP), so the federal EI rate is reduced for Quebec workers. You pay less EI but contribute to QPIP instead, which together cover similar benefits.',
      },
    ],
    content: `
## How much EI you pay, by salary

Employment Insurance (EI) is deducted at **1.63% of insurable earnings** in 2026 (outside Quebec), up to a yearly maximum. Here is the premium at each income level for 2026:

| Annual salary | EI premium (most provinces) | EI premium (Quebec) |
| --- | --- | --- |
| $40,000 | $652 | $520 |
| $50,000 | $815 | $650 |
| $60,000 | $978 | $780 |
| $70,000+ | $1,123 (maximum) | $896 (maximum) |

## When EI "maxes out"

EI stops at about **$1,123** (outside Quebec) once your income reaches the maximum insurable earnings — around $68,900 in 2026. After that, no more EI comes off for the rest of the year, regardless of how much you earn.

## Quebec pays less EI

Because Quebec runs its own **QPIP** (Quebec Parental Insurance Plan), Quebec workers pay a lower federal EI rate — maxing out around $896 instead of $1,123 — but also contribute to QPIP separately. The [Quebec paycheck calculator](/quebec-paycheck-calculator) shows both.

## See your exact number

For your real take-home pay including income tax, CPP, and EI for your province, use the [free payroll calculator](/) or the [CPP & EI calculator](/cpp-ei-calculator). Curious how much CPP you pay? See [how much CPP you pay by salary](/blog/how-much-cpp-will-i-pay-2026).

*Figures use 2026 CRA rates. Confirm current rates with the CRA or use the calculator.*
`,
  },
];
