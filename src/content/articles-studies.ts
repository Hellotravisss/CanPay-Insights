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
      'As of June 2026, a full-time minimum wage worker takes home between $26,478 a year (Alberta, $15.00/hr) and $34,098 a year (Nunavut, $19.75/hr) after federal tax, provincial tax, CPP, and EI. In Ontario ($17.60/hr), full-time minimum wage works out to $30,301 a year or about $2,525 a month after deductions.',
    faq: [
      {
        question: 'How much does a minimum wage worker take home in Ontario in 2026?',
        answer:
          'At Ontario’s $17.60 minimum wage, a full-time worker (40 hours/week) grosses $36,608 a year and takes home approximately $30,301 after federal tax, provincial tax, CPP, and EI — about $2,525 per month, or a net hourly rate of $14.57. Ontario’s minimum wage rises to $17.95 on October 1, 2026.',
      },
      {
        question: 'Which province has the highest minimum wage take-home pay in Canada?',
        answer:
          'Nunavut, at $19.75/hr, produces the highest full-time take-home pay: about $34,098 a year. Among provinces (excluding territories), British Columbia leads at roughly $31,269 a year on its $18.25 minimum wage, followed by Ontario at $30,301.',
      },
      {
        question: 'How much tax does a minimum wage worker pay in Canada?',
        answer:
          'Combined deductions (income tax + CPP + EI) take between 15.1% (Alberta) and 19.8% (Nova Scotia) of a full-time minimum wage salary in 2026. Income tax alone is relatively small at these earnings levels; CPP and EI contributions make up a large share of the total deductions.',
      },
      {
        question: 'Is minimum wage in BC or Ontario worth more after tax?',
        answer:
          'BC’s $18.25 minimum wage nets about $31,269 a year for full-time work versus $30,301 in Ontario at $17.60 — a difference of roughly $968 a year or $81 a month in BC’s favour, before considering cost-of-living differences.',
      },
    ],
    content: `
## What Minimum Wage Is Really Worth in 2026

Minimum wage headlines always quote the hourly rate. But a $17.00 wage in one province and a $16.60 wage in another can leave a worker with almost the same money in the bank, because provincial taxes and payroll deductions differ sharply across Canada.

We ran every provincial and territorial minimum wage (current as of June 12, 2026) through the CanPay Insights tax engine to answer one question: **what does a full-time minimum wage worker actually keep?**

### Key findings

- **The national gap is $7,620 a year.** A full-time minimum wage worker in Nunavut takes home $34,098; in Alberta, $26,478.
- **Nova Scotia takes the biggest bite.** Deductions consume 19.8% of a minimum wage salary in Nova Scotia — the highest in Canada. Alberta takes the smallest share (15.1%), but its $15.00 wage is so low that Alberta workers still finish last in actual dollars.
- **PEI's higher wage mostly evaporates.** PEI's $17.00 wage is 40 cents above Quebec's $16.60, but after deductions the difference shrinks to about $36 a month.
- **Saskatchewan nearly catches Manitoba.** Saskatchewan pays 65 cents less per hour than Manitoba, but its lower deductions close the annual net gap to just $599.

### Full results: minimum wage take-home pay by province (June 2026)

Figures assume full-time hours (40 hours/week, 2,080 hours/year), basic personal amounts only, and 2025/2026 tax rates.

| Province | Min. wage | Gross (full-time) | Take-home / year | Take-home / month | Net hourly | Deduction rate |
| --- | --- | --- | --- | --- | --- | --- |
| Nunavut | $19.75 | $41,080 | **$34,098** | $2,842 | $16.39 | 17.0% |
| Yukon | $18.51 | $38,501 | **$31,580** | $2,632 | $15.18 | 18.0% |
| British Columbia | $18.25 | $37,960 | **$31,269** | $2,606 | $15.03 | 17.6% |
| Ontario | $17.60 | $36,608 | **$30,301** | $2,525 | $14.57 | 17.2% |
| Northwest Territories | $16.95 | $35,256 | **$29,404** | $2,450 | $14.14 | 16.6% |
| Prince Edward Island | $17.00 | $35,360 | **$28,464** | $2,372 | $13.68 | 19.5% |
| Quebec | $16.60 | $34,528 | **$28,038** | $2,336 | $13.48 | 18.8% |
| Nova Scotia | $16.75 | $34,840 | **$27,950** | $2,329 | $13.44 | 19.8% |
| Newfoundland and Labrador | $16.35 | $34,008 | **$27,547** | $2,296 | $13.24 | 19.0% |
| Manitoba | $16.00 | $33,280 | **$27,164** | $2,264 | $13.06 | 18.4% |
| New Brunswick | $15.90 | $33,072 | **$26,984** | $2,249 | $12.97 | 18.4% |
| Saskatchewan | $15.35 | $31,928 | **$26,565** | $2,214 | $12.77 | 16.8% |
| Alberta | $15.00 | $31,200 | **$26,478** | $2,206 | $12.73 | 15.1% |

*Deduction rate = (federal tax + provincial tax + CPP/QPP + EI, and QPIP in Quebec) as a share of gross pay.*

### The hourly rate you never see on the poster

Translating take-home pay back into an hourly figure shows how much of every advertised minimum wage hour a worker actually keeps:

- **Nunavut:** $19.75 advertised → **$16.39 in the bank**
- **Ontario:** $17.60 advertised → **$14.57 in the bank**
- **Quebec:** $16.60 advertised → **$13.48 in the bank**
- **Alberta:** $15.00 advertised → **$12.73 in the bank**

No Canadian jurisdiction lets a full-time minimum wage worker keep more than 85% of their gross pay.

### Why the deduction rates differ so much

At minimum wage income levels ($31,000–$41,000 a year), three things drive the differences:

1. **Provincial basic personal amounts.** Provinces with low basic personal amounts — PEI ($11,385) and Nova Scotia ($12,544) are among the lowest — start taxing income much earlier than Alberta ($22,783) or the territories, and Nova Scotia pairs that with the highest bottom-bracket rate in the country (8.79%).
2. **Quebec's separate system.** Quebec layers QPP (at a higher rate than CPP) and QPIP on top of income tax, partly offset by the federal Quebec abatement.
3. **CPP and EI are flat at this level.** CPP (5.95%) and EI (1.64%) apply almost uniformly, so they hit low earners proportionally harder than higher earners who exceed the contribution ceilings.

### Wage increases already scheduled for late 2026

Four provinces have announced October 1, 2026 increases that will shift these numbers:

- Ontario: $17.60 → $17.95
- Manitoba: $16.00 → $16.40
- Prince Edward Island: $17.00 → $17.30
- Nova Scotia: $16.75 → $17.00

We will update this study when the new rates take effect.

### Methodology

Calculations use the CanPay Insights tax engine with 2025/2026 federal and provincial tax brackets, CPP/CPP2 (QPP/QPP2 and QPIP for Quebec), and EI premiums. We assume a single worker, full-time hours (2,080 hours/year), no RRSP contributions, no benefits, and basic personal amounts only. Real paycheques will vary with credits, benefits, and actual hours. Minimum wage rates are current as of June 12, 2026, sourced from the [Government of Canada minimum wage database](https://minwage-salairemin.service.canada.ca/en/general.html) and provincial announcements.

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
      'CPP2 is a second CPP contribution of 4% (employee) on the part of your income that falls between the first earnings ceiling (YMPE) and a higher second ceiling (YAMPE). In 2025 it applies between $71,300 and $81,200, costing higher earners up to about $396 extra per year on top of regular CPP. The ceilings rise again in 2026, so anyone earning above the first ceiling will see CPP2 on their pay.',
    faq: [
      {
        question: 'What is CPP2?',
        answer:
          'CPP2 (the second additional CPP contribution) is a 4% contribution on earnings between the first CPP ceiling (YMPE) and a higher second ceiling (YAMPE). It was phased in starting in 2024 as part of the CPP enhancement. It is separate from, and on top of, the regular 5.95% CPP contribution.',
      },
      {
        question: 'Who has to pay CPP2 in 2026?',
        answer:
          'Only people who earn more than the first CPP ceiling. If your annual pensionable income is below the YMPE (about $71,300 in 2025, higher in 2026), you pay no CPP2 at all. Above that, CPP2 applies to the portion between the two ceilings.',
      },
      {
        question: 'How much does CPP2 cost?',
        answer:
          'In 2025, CPP2 applied at 4% on income between $71,300 and $81,200 — a maximum of about $396 for the employee (employers match it). The 2026 ceilings are higher, so the maximum CPP2 amount increases slightly. Use our calculator to see your exact figure.',
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
| 2026 | Higher (set by CRA) | Higher (set by CRA) | 4% | Slightly higher |

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
      'In 2025, most workers pay 5.95% CPP on earnings between $3,500 and $71,300, plus 4% CPP2 above that. On a $60,000 salary that is about $3,362 for the year; on $80,000 about $4,293; and CPP maxes out at roughly $4,341 once you earn around $90,000. Quebec uses QPP instead, which is slightly higher.',
    faq: [
      {
        question: 'How much CPP do I pay on $60,000?',
        answer:
          'About $3,362 for the year in 2025 (roughly $129 per bi-weekly cheque), made up of 5.95% CPP on earnings above the $3,500 exemption. Your employer pays the same amount.',
      },
      {
        question: 'What is the maximum CPP contribution in 2026?',
        answer:
          'In 2025 the maximum employee contribution is about $4,341 including CPP2. You hit the maximum once your pensionable income reaches the second ceiling (around $81,200 in 2025). The 2026 maximum is slightly higher as the ceilings rise.',
      },
      {
        question: 'Does everyone pay the same CPP?',
        answer:
          'No. CPP is a percentage of income up to a cap, so lower earners pay less in dollars. Quebec workers pay QPP (a higher rate) instead of CPP, plus QPIP. Everyone stops contributing once they reach the yearly maximum.',
      },
    ],
    content: `
## How much CPP you pay, by salary

CPP (the Canada Pension Plan) takes **5.95% of your earnings** between the $3,500 basic exemption and the first ceiling ($71,300 in 2025). Earn above that and you also pay **CPP2** — an extra 4% up to a second ceiling. Here is what that works out to at each income level for 2025/2026:

| Annual salary | Your CPP contribution (incl. CPP2) | Per bi-weekly cheque |
| --- | --- | --- |
| $40,000 | $2,172 | $84 |
| $50,000 | $2,767 | $106 |
| $60,000 | $3,362 | $129 |
| $70,000 | $3,957 | $152 |
| $80,000 | $4,293 | $165 |
| $90,000+ | $4,341 (maximum) | $167 |

Your employer pays the same amount again on your behalf.

## When CPP "maxes out"

Notice the numbers stop climbing at about **$4,341**. Once your pensionable income passes the second ceiling (around $81,200 in 2025), you have paid the full year's CPP and contributions stop until January. That is why a December paycheque can suddenly look bigger for higher earners.

## Quebec is different

Quebec workers pay **QPP** instead of CPP. The QPP rate is a little higher than CPP, and Quebec also has QPIP (parental insurance). So a Quebec worker on $60,000 pays more toward QPP than an Ontario worker pays toward CPP. See the [Quebec paycheck calculator](/quebec-paycheck-calculator) for exact figures.

## See your exact number

These are estimates with basic amounts only. For your real number — including income tax, EI, and your province — use the [free payroll calculator](/) or the [CPP & EI calculator](/cpp-ei-calculator). New to CPP2? Read [CPP2 explained for 2026](/blog/cpp2-second-additional-cpp-2026).

*Figures use 2025 CRA ceilings; 2026 ceilings are slightly higher. Confirm current amounts with the CRA or use the calculator.*
`,
  },
  {
    id: 'study-4',
    slug: 'how-much-ei-will-i-pay-2026',
    title: 'How Much EI Will I Pay in 2026? (Premiums by Salary)',
    subtitle: 'Your Employment Insurance premium at every income level, and where it maxes out.',
    excerpt:
      'EI is 1.64% of insurable earnings in 2025, maxing out at about $1,077 once you earn around $65,700. On a $50,000 salary you pay about $820. Full EI premium table by salary, plus Quebec rates.',
    metaTitle: 'How Much EI Will I Pay in 2026? EI Premiums by Salary',
    metaDescription:
      'See how much EI you pay by salary in 2025/2026. EI is 1.64% of insurable earnings, maxing out at about $1,077. Quebec pays a lower EI rate. Full table by income.',
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
      'In 2025, EI is deducted at 1.64% of insurable earnings outside Quebec, up to a maximum of about $1,077 per year (reached around $65,700 of income). On $50,000 you pay about $820; on $60,000 about $984. Quebec uses a lower EI rate (it runs QPIP separately), maxing out at about $834.',
    faq: [
      {
        question: 'How much EI do I pay on $50,000?',
        answer:
          'About $820 for the year in 2025 outside Quebec (1.64% of insurable earnings). In Quebec the EI rate is lower, so you would pay less but also contribute to QPIP separately.',
      },
      {
        question: 'What is the maximum EI premium in 2026?',
        answer:
          'In 2025 the maximum employee EI premium is about $1,077 outside Quebec, reached once your income hits the maximum insurable earnings (around $65,700). Quebec\'s EI maximum is lower at about $834. The 2026 figures rise slightly.',
      },
      {
        question: 'Why is EI lower in Quebec?',
        answer:
          'Quebec runs its own parental insurance plan (QPIP), so the federal EI rate is reduced for Quebec workers. You pay less EI but contribute to QPIP instead, which together cover similar benefits.',
      },
    ],
    content: `
## How much EI you pay, by salary

Employment Insurance (EI) is deducted at **1.64% of insurable earnings** in 2025 (outside Quebec), up to a yearly maximum. Here is the premium at each income level for 2025/2026:

| Annual salary | EI premium (most provinces) | EI premium (Quebec) |
| --- | --- | --- |
| $40,000 | $656 | $508 |
| $50,000 | $820 | $635 |
| $60,000 | $984 | $762 |
| $70,000+ | $1,077 (maximum) | $834 (maximum) |

## When EI "maxes out"

EI stops at about **$1,077** (outside Quebec) once your income reaches the maximum insurable earnings — around $65,700 in 2025. After that, no more EI comes off for the rest of the year, regardless of how much you earn.

## Quebec pays less EI

Because Quebec runs its own **QPIP** (Quebec Parental Insurance Plan), Quebec workers pay a lower federal EI rate — maxing out around $834 instead of $1,077 — but also contribute to QPIP separately. The [Quebec paycheck calculator](/quebec-paycheck-calculator) shows both.

## See your exact number

For your real take-home pay including income tax, CPP, and EI for your province, use the [free payroll calculator](/) or the [CPP & EI calculator](/cpp-ei-calculator). Curious how much CPP you pay? See [how much CPP you pay by salary](/blog/how-much-cpp-will-i-pay-2026).

*Figures use 2025 CRA rates; 2026 amounts rise slightly. Confirm current rates with the CRA or use the calculator.*
`,
  },
];
