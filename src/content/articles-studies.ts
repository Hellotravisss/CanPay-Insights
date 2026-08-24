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

You can verify any figure with our [free payroll calculator](/) or the province pages, for example the [Ontario paycheck calculator](/ontario-paycheck-calculator) and the [hourly wage calculator](/hourly-wage-calculator).

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

- **Earning under the first ceiling** ($74,600 in 2026): you pay **no CPP2** at all.
- **Earning between the two ceilings**: you pay 4% on the amount above the first ceiling.
- **Earning above the second ceiling**: you pay the full maximum CPP2, then contributions stop for the year.

So CPP2 is purely a higher-earner deduction. Someone on $60,000 never sees it; someone on $90,000 pays the full amount.

## What CPP2 costs you on each paycheque

Because CPP2 is capped, the most an employee pays in 2026 is **$416 for the year** — about $16 per bi-weekly cheque if spread evenly. Your employer pays the same amount again. It is modest, but it stacks on top of regular CPP, EI, and income tax, which is why your take-home pay can feel lower than expected once your salary crosses the first ceiling.

## CPP2 vs regular CPP

| | Regular CPP | CPP2 |
| --- | --- | --- |
| Rate (employee) | 5.95% | 4% |
| Applies to | $3,500 up to first ceiling | First ceiling up to second ceiling |
| Who pays | Almost all workers | Only higher earners |

Both are mandatory and both are matched by your employer. The upside: higher contributions today mean a larger CPP pension when you retire.

## See your own number

CPP2 is built into the CanPay Insights calculator. Enter your salary and province to see exactly how much CPP, CPP2, EI, and tax come off your pay for 2025 and 2026 — try the [free payroll calculator](/), or check any salary with [salary after tax in Canada](/salary-after-tax-canada).

*Figures reflect 2025 CRA ceilings; 2026 ceilings are higher. Always confirm the current year's amounts with the CRA or use the calculator for an up-to-date estimate.*
`,
  },
  {
    id: 'study-3',
    slug: 'how-much-cpp-will-i-pay-2026',
    title: 'CPP Contributions 2026: Rates, Maximums, and What You Pay by Salary',
    subtitle: 'Your exact CPP and CPP2 contribution at every income level, from $40,000 to $150,000.',
    excerpt:
      'CPP costs 5.95% between $3,500 and $74,600 — a maximum of $4,230.45 — plus 4% CPP2 up to $85,000, another $416. The most anyone pays in 2026 is $4,646.45, reached at a salary of $85,000.',
    metaTitle: 'CPP 2026: Rates, Maximum Contribution and Cost by Salary',
    metaDescription:
      'The 2026 CPP maximum is $4,230.45 on earnings to $74,600, plus $416 of CPP2 to $85,000 — $4,646.45 in total. See what you pay at every salary level.',
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
## 2026 CPP rates and maximums at a glance

| | Rate | Applies to | Maximum you pay |
| --- | --- | --- | --- |
| **CPP** | 5.95% | $3,500 – $74,600 | **$4,230.45** |
| **CPP2** | 4.00% | $74,600 – $85,000 | **$416.00** |
| **Combined** | | | **$4,646.45** |

Those are the employee amounts. Your employer pays the same again, so twice that
goes into your CPP account. Self-employed workers pay both halves — $9,292.90 at
the maximum.

You hit the maximum once you earn $85,000; below that you pay less, and the table
below shows exactly how much at each salary.

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
  {
    id: 'study-5',
    slug: 'commission-tax-canada-2026',
    title: 'Commission Tax in Canada 2026: How Much You Actually Take Home',
    subtitle: 'Commission is not taxed higher than salary — it is withheld higher. Here is what you really keep.',
    excerpt:
      'Commission is taxed at the same rates as salary in Canada — it just gets withheld more on lump-sum cheques. An Ontario salesperson on a $50,000 base keeps about 67% of each commission dollar after tax. Real take-home by province, the bonus-method withholding explained, and the Line 22900 deductions only commission employees can claim.',
    metaTitle: 'Commission Tax in Canada 2026: How Much You Take Home',
    metaDescription:
      'Is commission taxed higher than salary in Canada? No — it is withheld higher, not taxed higher. See how much commission you actually keep after tax by province, plus CPP/EI, the bonus method, and commission-employee deductions.',
    keywords: [
      'commission tax calculator canada',
      'how is commission taxed in canada',
      'is commission taxed higher than salary canada',
      'why is my commission taxed so much',
      'how much of my commission do i keep',
      'commission take home pay canada',
      'real estate commission tax canada',
      'base plus commission tax',
    ],
    category: 'tax',
    tags: ['Commission', 'Sales', '2026', 'Take-Home Pay'],
    publishedAt: '2026-06-24',
    readTime: 9,
    directAnswer:
      'No — commission is not taxed at a higher rate than salary in Canada. A dollar of commission is taxed at the exact same federal and provincial brackets as a dollar of salary, and CPP and EI apply the same way. It only feels higher because lump-sum commission cheques are often withheld at a higher rate, which you reconcile when you file. In Ontario, someone on a $50,000 base keeps roughly two-thirds — about 67% — of every commission dollar after tax.',
    faq: [
      {
        question: 'Is commission taxed higher than salary in Canada?',
        answer:
          'No. Commission earned as an employee is ordinary employment income, taxed at the same federal and provincial brackets as salary. There is no special commission tax rate. It can feel higher because lump-sum commission is often withheld at a higher rate up front, but the actual tax is identical to salary and is settled when you file.',
      },
      {
        question: 'Why was so much tax taken off my commission cheque?',
        answer:
          'When commission or a bonus is paid as a separate lump sum, employers use the CRA "bonus method," which annualizes the payment to estimate withholding. On a big cheque that can look like a lot, but it is only an estimate of tax, not the final amount. You reconcile the difference at filing — sometimes a refund, sometimes a balance owing.',
      },
      {
        question: 'How much of my commission do I actually keep?',
        answer:
          'In Ontario, a salesperson on a $50,000 base keeps roughly 67-71% of each commission dollar after federal tax, provincial tax, CPP and EI — for example, about $20,200 of a $30,000 commission. The exact share depends on your total income and province.',
      },
      {
        question: 'Do I pay CPP and EI on commission?',
        answer:
          'Yes. For an employee, commission is pensionable and insurable just like salary, so CPP (and CPP2 above the first ceiling) and EI come off, up to the same annual maximums. Once you hit the yearly CPP/EI maximum, no more is deducted. Self-employed commission earners pay both halves of CPP and generally no EI.',
      },
      {
        question: 'Is commission self-employment income?',
        answer:
          'It depends. A T4 employee paid commission has employment income with tax, CPP and EI withheld at source. An independent contractor (often issued a T4A, like many real estate agents) has self-employment business income: no tax is withheld, you pay by instalments, you pay both halves of CPP, no EI, and you may need to charge GST/HST once revenue passes $30,000.',
      },
      {
        question: 'What can commission employees deduct to lower their tax?',
        answer:
          'If your pay varies with sales and you have a signed Form T2200 from your employer, you can claim commission-employee expenses on Form T777 (Line 22900) that salaried employees cannot — such as advertising, client meals (50%), and a portion of home insurance and property tax. The total is capped at the commission you earned that year, except for interest and capital cost allowance on your vehicle. A T2200 is required but does not by itself make an expense deductible.',
      },
    ],
    content: `
## Is commission taxed higher than salary? (No)

This is the biggest myth in sales pay: **commission is not taxed at a higher rate than salary.** A dollar of commission and a dollar of salary are taxed at the exact same federal and provincial brackets, and the same CPP and EI rules apply.

On your T4, commissions show up in Box 42 — but that amount is **already included** in Box 14 (total employment income). It is shown separately only so the CRA can see how much of your pay was commission. It is **not** added on top of your income.

So why does your commission cheque feel like it gets hammered? Because of **withholding**, not the tax rate.

## How much of your commission do you actually keep?

Here is the real math for an **Ontario** salesperson on a **$50,000 base salary**. The table shows how much of each commission you keep after federal tax, provincial tax, CPP and EI (2026):

| Commission earned | Total income | You keep (after tax) | Keep rate |
| --- | --- | --- | --- |
| $10,000 | $60,000 | $7,135 | 71% |
| $30,000 | $80,000 | $20,209 | 67% |
| $60,000 | $110,000 | $40,881 | 68% |

So a big commission year nets you roughly **two-thirds of the commission** — not the half-or-less that a lump-sum cheque's withholding makes it look like.

## Why your commission cheque looks so heavily taxed

When commission (or a bonus) is paid as a **separate lump-sum cheque**, the CRA tells employers to use the **"bonus method"** so they do not massively over-withhold. In short, it annualizes the payment: spread the commission across your pay periods, calculate the tax on your regular pay plus that slice, and withhold the difference.

The key point: **withholding is only an estimate of your tax, not the final tax.** Your real tax is always calculated on your **total** annual income when you file. CRA's own illustration shows a $5,000 payment withholding roughly $1,000 under the bonus method versus about $1,800 under the plain periodic method — but actual amounts vary by pay frequency, province and your regular pay.

Because commission is lumpy and can push you into a higher bracket, withholding often does not match your real tax:

- **Over-withheld** → you get a **refund** at filing.
- **Under-withheld** → you have a **balance owing.**

Neither is "extra tax" — it is just settling up. If you regularly come up short, ask your employer about **Form TD1X**, which can base your withholding on your estimated net annual commission.

## Do you pay CPP and EI on commission?

Yes. For an employee, commission is pensionable and insurable exactly like salary, so **CPP** (plus **CPP2** above the first ceiling) and **EI** are deducted up to the same annual maximums. Once you hit the yearly maximum, deductions stop for the rest of the year.

## Employee (T4) vs. self-employed (T4A) — realtors, contractors, agents

The tax **rate** is the same either way. What changes is everything around it:

| | T4 employee | Self-employed (T4A) |
| --- | --- | --- |
| Income type | Employment income | Business income |
| Tax withheld? | Yes, at source | No — pay by instalments |
| CPP | You + employer split | You pay **both** halves |
| EI | Yes | No (optional only) |
| GST/HST | No | Register once over $30,000 |
| Expenses | Limited (T2200 / T777) | Broad business expenses (T2125) |

Many **real estate agents** are self-employed, so they typically owe a larger balance at filing (no tax withheld) and pay both halves of CPP. **Insurance and financial commissions** are often GST/HST-exempt — a separate wrinkle from the $30,000 rule.

## Lower your tax: the commission-employee deduction (Line 22900)

This is the one real tax break unique to commission **employees**. With a signed **Form T2200** from your employer, you can deduct employment expenses on **Form T777** (Line 22900) that salaried employees cannot. To qualify, **all** of these must be true:

1. Your pay **varies with sales** volume or contracts (a fixed "commission" does not count);
2. Your contract requires you to **pay your own expenses**;
3. You **normally work away** from the employer's place of business;
4. You did **not** get a tax-free travel allowance.

What you can deduct that salaried employees cannot includes **advertising and promotion**, **client meals and entertainment** (50%), licences and liability insurance, and a portion of **home insurance and property tax** for a work-space at home.

The catch: except for **interest and capital cost allowance on your vehicle**, your total deductions cannot exceed the **commission you earned** that year — you cannot use sales expenses to create a loss. And a T2200 is **necessary but not sufficient**: each expense still has to genuinely qualify, be unreimbursed, and be receipted.

## Same $80,000, different province

A salesperson earning **$50,000 base + $30,000 commission = $80,000** keeps a different amount depending on where they live (2026 take-home):

| Province | Take-home on $80,000 |
| --- | --- |
| British Columbia | $61,038 |
| Ontario | $60,744 |
| Alberta | $60,409 |
| Quebec | $57,077 |
| Nova Scotia | $56,095 |

## See your own number

Add your **base + expected commission** together and drop the total into the [free take-home calculator](/) to see your real net pay for your province — it is the same math the tables above use. You can also [compare provinces](/compare-provinces) or see [how much CPP](/blog/how-much-cpp-will-i-pay-2026) and [EI](/blog/how-much-ei-will-i-pay-2026) come off.

*General information for 2026, not tax advice. Commission tax rules (the bonus method, the four T2200 conditions, Line 22900) are stable year to year, but dollar thresholds like the CPP/EI ceilings change annually — confirm current figures with the CRA.*
`,
  },
  {
    id: 'study-6',
    slug: 'canada-groceries-essentials-benefit-2026',
    title: 'Canada Groceries and Essentials Benefit 2026: Who Gets How Much (and When)',
    subtitle: 'The GST/HST credit becomes the Groceries and Essentials Benefit on July 3, 2026 — with maximum payments rising 25% a year for five years.',
    excerpt:
      'Ottawa is replacing the GST/HST credit with the Canada Groceries and Essentials Benefit starting July 3, 2026. Here is what changes, how much you can get, the one-time June top-up, and the 2026 payment dates.',
    metaTitle: 'Canada Groceries and Essentials Benefit 2026: Amounts, Dates & Eligibility',
    metaDescription:
      'The Canada Groceries and Essentials Benefit replaces the GST/HST credit on July 3, 2026, with maximums up 25% a year for five years. Amounts, the June top-up, payment dates, and who qualifies.',
    keywords: [
      'canada groceries and essentials benefit',
      'groceries and essentials benefit 2026',
      'GST HST credit replacement 2026',
      'CRA grocery rebate 2026',
      'when is the groceries benefit paid',
      'how much is the groceries and essentials benefit',
    ],
    category: 'news',
    tags: ['CRA', 'benefits', 'GST/HST credit', 'cost of living', '2026'],
    publishedAt: '2026-06-26',
    readTime: 5,
    imageUrl: '/blog/groceries-essentials-benefit-2026.svg',
    directAnswer:
      'The Canada Groceries and Essentials Benefit (CGEB) replaces the GST/HST credit starting with the July 3, 2026 payment. It keeps the same eligibility and quarterly schedule, but maximum amounts rise 25% per year for five years — so a couple with two children could receive up to about $1,890 in 2026, versus roughly $1,066 under the old GST/HST credit. Most people get it automatically once they have filed their taxes, and there is also a one-time top-up landing by June 2026 equal to 50% of your 2025–26 GST/HST credit.',
    faq: [
      {
        question: 'When does the Canada Groceries and Essentials Benefit start?',
        answer:
          'It replaces the GST/HST credit starting with the July 3, 2026 quarterly payment, then continues quarterly (the next payment is October 5, 2026).',
      },
      {
        question: 'How much is the Groceries and Essentials Benefit?',
        answer:
          'It depends on your income and family size. Maximums rise 25% per year for five years from July 2026 — for example, a couple with two children could receive up to about $1,890 in 2026, versus roughly $1,066 under the old GST/HST credit.',
      },
      {
        question: 'Do I need to apply for the Groceries and Essentials Benefit?',
        answer:
          'No. It is automatic once you have filed your tax return, even if you had no income. New residents of Canada may need to file a one-time form (RC151) to start receiving it.',
      },
      {
        question: 'Is the Groceries and Essentials Benefit taxable?',
        answer:
          'No. Like the GST/HST credit it replaces, the benefit is tax-free and does not count as income on your tax return.',
      },
      {
        question: 'What is the one-time top-up in June 2026?',
        answer:
          'Before the switch, the CRA is sending a one-time payment no later than June 2026 equal to 50% of your 2025–26 GST/HST credit — reported as up to about $267 for a single adult and up to about $717 for a family of four.',
      },
      {
        question: 'Does the benefit change my take-home pay?',
        answer:
          'No. It is a separate, tax-free payment from the CRA, not a payroll deduction, so it does not change your paycheque — it is extra money toward your budget.',
      },
    ],
    content: `
## What is the Groceries and Essentials Benefit?

The **Canada Groceries and Essentials Benefit (CGEB)** is the federal government's new, larger version of the **GST/HST credit**. It starts with the **July 3, 2026** quarterly payment and is meant to help offset the cost of groceries and everyday essentials.

The parts you already know stay the same: it is **tax-free**, paid **quarterly**, and you do **not** apply for it — the Canada Revenue Agency (CRA) works out your amount from your tax return. What changes is the size: **maximum payments rise 25% per year for five years**, beginning July 2026.

## How much can you get?

Your amount depends on your **income, marital status, and number of children**, exactly like the old GST/HST credit. The headline change is how much bigger the maximums get. Using the government's own illustration:

| Household | Old GST/HST credit (max) | Groceries & Essentials Benefit, 2026 (max) |
| --- | --- | --- |
| Couple with two children | ~$1,066 | up to ~$1,890 |

That is roughly an **$824 increase** for that family — and because the maximum keeps growing 25% a year through 2030, the gap widens every year.

Your own amount depends on your income and family size: lower-income households get the full amount, and it phases out as income rises, the same way the GST/HST credit always has.

## The one-time top-up landing by June 2026

Ahead of the switch, the CRA is sending a **one-time top-up** no later than **June 2026**, equal to **50% of the annual value of your 2025–26 GST/HST credit**. Reported figures put this at up to about **$267 for a single adult** and up to about **$717 for a family of four** — a bonus on top of your regular payment. You don't need to do anything; if you qualified for the GST/HST credit, it arrives automatically.

## 2026 payment dates

| Date | Payment |
| --- | --- |
| April 2, 2026 | Final GST/HST credit (no increase) |
| July 3, 2026 | First Groceries & Essentials Benefit (increased) |
| October 5, 2026 | Groceries & Essentials Benefit |

Payments continue quarterly after that.

## Do you need to apply?

**No.** For almost everyone the benefit is **automatic** once you have filed your income tax return — even if you had no income. **New residents** of Canada may need to submit a one-time form (RC151) to get started. The single most important thing you can do to keep receiving it is **file your taxes on time every year**.

## What it means for your budget

The CGEB is money **on top of** your paycheque, not a payroll deduction — so it does not change your take-home pay, but it does change how far that pay goes. To see what you actually keep from work first, use the [free take-home pay calculator](/) for your province, then treat the benefit as a separate, tax-free top-up to your monthly budget. You can also check [how much CPP](/blog/how-much-cpp-will-i-pay-2026) and [EI](/blog/how-much-ei-will-i-pay-2026) come off your pay.

## Sources & disclaimer

Based on Government of Canada / CRA announcements and reporting on the Canada Groceries and Essentials Benefit (2026). Amounts and dates are as announced and can change; your exact payment depends on your income and family situation. This is general information, not tax or financial advice — confirm current figures with the [CRA](https://www.canada.ca/en/revenue-agency.html).
`,
  },
  {
    id: 'study-7',
    slug: 'canada-child-benefit-increase-2026',
    title: 'Canada Child Benefit Increase 2026: New Amounts From the July 20 Payment',
    subtitle: 'The new CCB benefit year starts this month — up to $8,157 per child under 6 and $6,883 per child aged 6–17, tax-free.',
    excerpt:
      'The Canada Child Benefit rises 2% for the July 2026–June 2027 benefit year. Here are the new monthly and annual maximums, the income cut-off for the full amount, and when the higher payments start.',
    metaTitle: 'Canada Child Benefit Increase 2026: New CCB Amounts & July 20 Payment',
    metaDescription:
      'CCB rises 2% for 2026-27: up to $8,157/year per child under 6 and $6,883 for ages 6-17, starting with the July 20, 2026 payment. New amounts, income thresholds, and dates.',
    keywords: [
      'canada child benefit increase 2026',
      'CCB payment july 2026',
      'how much is CCB 2026',
      'canada child benefit amount 2026',
      'CCB payment dates 2026',
      'CCB income threshold 2026',
    ],
    category: 'news',
    tags: ['CRA', 'benefits', 'CCB', 'families', '2026'],
    publishedAt: '2026-07-15',
    readTime: 5,
    imageUrl: '/blog/canada-child-benefit-2026.svg',
    directAnswer:
      'For the new benefit year starting July 2026, the Canada Child Benefit rises 2%: up to $8,157 per year ($679.75 per month) for each child under 6, and up to $6,883 per year ($573.58 per month) for each child aged 6 to 17. Families with adjusted family net income under $38,237 (from the 2025 tax return) get the full amount; it phases down above that. The first payment at the new rates lands July 20, 2026, and the money is tax-free and automatic once you have filed your taxes.',
    faq: [
      {
        question: 'How much is the Canada Child Benefit in 2026?',
        answer:
          'For July 2026 to June 2027, the maximum is $8,157 per year ($679.75/month) for each child under 6 and $6,883 per year ($573.58/month) for each child aged 6 to 17 — a 2% increase over last year.',
      },
      {
        question: 'When do the higher CCB payments start?',
        answer:
          'With the July 20, 2026 payment — the first deposit of the new 2026–27 benefit year. Payments then continue monthly around the 20th.',
      },
      {
        question: 'What income do I need to get the full CCB?',
        answer:
          'If your adjusted family net income (AFNI) on your 2025 tax return is under $38,237, you receive the maximum for each child. Above that, the benefit is gradually reduced as income rises.',
      },
      {
        question: 'Is the Canada Child Benefit taxable?',
        answer:
          'No. The CCB is completely tax-free — it does not appear as income on your tax return and does not affect your tax refund.',
      },
      {
        question: 'Do I need to apply for the increase?',
        answer:
          'No. If you already receive the CCB and filed your 2025 tax return, the new amounts are calculated automatically. Both spouses must file a return every year, even with zero income.',
      },
      {
        question: 'How much more money is the 2026 CCB increase worth?',
        answer:
          'About $160 more per year for each child under 6 and about $135 more per year for each child aged 6 to 17, compared with the 2025–26 benefit year.',
      },
    ],
    content: `
## The new CCB benefit year starts this month

Every July, the **Canada Child Benefit (CCB)** resets for a new benefit year, indexed to inflation. For **July 2026 to June 2027** the indexation is **2%**, and the first payment at the new rates arrives on **July 20, 2026**.

## The new maximum amounts

| Child | 2025–26 max | 2026–27 max | Increase |
| --- | --- | --- | --- |
| Under 6 | $7,997/yr | **$8,157/yr ($679.75/mo)** | +$160/yr |
| Aged 6–17 | $6,748/yr | **$6,883/yr ($573.58/mo)** | +$135/yr |

For a family with **two children under 6**, the maximum is now about **$16,314 a year, tax-free** — roughly $1,360 a month.

## Who gets the full amount?

Your CCB is based on your **adjusted family net income (AFNI)** from your **2025 tax return**:

- **AFNI under $38,237** → you get the **maximum** for each child.
- Above that, the benefit **phases down gradually** as income rises — many middle-income families still receive a substantial monthly amount.

Because the CCB is income-tested, your **net family income** is the number that matters. If you are negotiating a raise or comparing job offers, it helps to know both your [take-home pay](/) and how a higher gross income interacts with income-tested benefits like the CCB.

## Key facts

- **Tax-free:** the CCB never appears as taxable income.
- **Automatic:** no application needed for the increase — but **both spouses must file a tax return every year**, even with zero income, or payments stop.
- **Monthly:** paid around the 20th of each month; the July 20, 2026 deposit is the first at the new rates.

## What it means for your family budget

The CCB is paid **on top of** your employment income — it does not change your paycheque. To plan your monthly budget, start with your real after-tax pay from the [free take-home pay calculator](/), then add your CCB. Families juggling work schedules can also estimate hourly pay with the [hourly wage calculator](/hourly-wage-calculator).

## Sources & disclaimer

Based on CRA indexation figures for the 2026–27 benefit year as reported in July 2026. Your exact amount depends on your family income, number and ages of children, and custody arrangements. This is general information, not tax or financial advice — confirm your amounts in CRA My Account or with the [CRA](https://www.canada.ca/en/revenue-agency.html).
`,
  },
  {
    id: 'study-8',
    slug: 'canada-workers-benefit-payments-2026',
    title: 'Canada Workers Benefit 2026: New Amounts and the July 10 Advance Payment',
    subtitle: 'Low- and modest-income workers get up to $272 (single) or $469 (family) per advance instalment — and the 2026 maximums are going up.',
    excerpt:
      'The Advanced Canada Workers Benefit paid its first 2026-27 instalment on July 10, 2026. Who qualifies, how much the advances are, the new 2026 maximums, and the October and January payment dates.',
    metaTitle: 'Canada Workers Benefit 2026: ACWB Payment Dates & New Amounts',
    metaDescription:
      'ACWB advance payments for 2026-27: up to ~$272 single / ~$469 family per instalment (July 10, October, January), with 2026 tax-year maximums rising to $1,665 single and $2,869 family.',
    keywords: [
      'canada workers benefit 2026',
      'ACWB payment dates 2026',
      'advanced canada workers benefit july 2026',
      'CWB amount 2026',
      'who qualifies for canada workers benefit',
      'CWB disability supplement 2026',
    ],
    category: 'news',
    tags: ['CRA', 'benefits', 'CWB', 'workers', '2026'],
    publishedAt: '2026-07-15',
    readTime: 5,
    imageUrl: '/blog/canada-workers-benefit-2026.svg',
    directAnswer:
      'The Canada Workers Benefit (CWB) is a refundable tax credit for low- and modest-income workers. Advance payments (ACWB) for the 2026–27 cycle are paid in three instalments — July 10, 2026, October 2026, and January 2027 — worth up to about $272 per instalment for a single worker and about $469 for a family, based on your 2025 tax return. For the 2026 tax year itself, the maximum basic CWB rises to $1,665 for singles and $2,869 for families, plus a disability supplement of up to $843. It is automatic: if you qualified on your 2025 return, the CRA pays you without any application.',
    faq: [
      {
        question: 'What is the Canada Workers Benefit?',
        answer:
          'A refundable federal tax credit that tops up the income of low- and modest-income workers. You must have working income (a job or self-employment) and be 19 or older (or live with a spouse or child). It is refundable, so you can receive it even if you owe no tax.',
      },
      {
        question: 'When are the ACWB payment dates in 2026?',
        answer:
          'Advance instalments for the 2026–27 cycle are paid July 10, 2026, in October 2026, and in January 2027. The remainder is settled when you file your 2026 tax return in spring 2027.',
      },
      {
        question: 'How much is the ACWB advance payment?',
        answer:
          'Each instalment is up to about $272 for a single worker and about $469 for a family — advances total 50% of your CWB entitlement from your 2025 return, split into three payments.',
      },
      {
        question: 'How much is the CWB for 2026?',
        answer:
          'For the 2026 tax year, the maximum basic amount rises to $1,665 for single workers and $2,869 for families, plus a disability supplement of up to $843. Amounts phase down as income rises past your province&apos;s threshold.',
      },
      {
        question: 'Do I need to apply for the Canada Workers Benefit?',
        answer:
          'No. The CRA calculates it automatically from your tax return (line 45300). If you qualified on your 2025 return, advance payments arrive automatically — the only requirement is filing your taxes.',
      },
      {
        question: 'Does working more hours reduce my CWB?',
        answer:
          'The CWB grows with working income at first, then phases out as net income rises past your province&apos;s threshold. A raise can reduce the credit but almost always leaves you ahead overall — use a take-home pay calculator to see your net gain.',
      },
    ],
    content: `
## What happened on July 10

The CRA paid the **first Advanced Canada Workers Benefit (ACWB) instalment** of the 2026–27 cycle on **July 10, 2026** — up to about **$272 for a single worker** and **$469 for a family**. If you qualified for the CWB on your 2025 tax return (line 45300), the money arrived automatically.

## What is the Canada Workers Benefit?

The **CWB** is a **refundable tax credit** for people who **work** but earn a low or modest income. Refundable means you get the money even if you owe no tax. There are two parts:

- a **basic amount**, and
- a **disability supplement** (up to **$843**) if you qualify for the disability tax credit.

## The numbers for 2026

| | Single worker | Family |
| --- | --- | --- |
| Max basic CWB, 2026 tax year | **$1,665** | **$2,869** |
| Advance instalment (Jul/Oct/Jan) | up to ~$272 | up to ~$469 |

Advance payments equal **50% of your entitlement** from your **2025 return**, split into three instalments — **July 10, 2026**, **October 2026**, and **January 2027**. The rest arrives after you file your 2026 return next spring.

## Who qualifies?

- You have **working income** (employment or self-employment) and your net income is below your **province&apos;s threshold** (the cut-offs differ by province and family type);
- You are **19 or older** on December 31, or live with a spouse/common-law partner or your child;
- Full-time students (13+ weeks) without dependants generally do **not** qualify.

## Will earning more cost me my CWB?

The CWB **grows** with your working income at first, then **phases out** as net income rises. A raise can shrink the credit, but you almost always come out ahead in total. To see the real effect of more hours or a higher wage on your pocket, run your numbers in the [hourly wage calculator](/hourly-wage-calculator) or the [take-home pay calculator](/) — and if you earn minimum wage, see the province-by-province [minimum-wage take-home study](/blog/minimum-wage-take-home-pay-canada-2026).

## Key dates

| Date | What |
| --- | --- |
| July 10, 2026 | First 2026–27 ACWB instalment (paid) |
| October 2026 | Second instalment |
| January 2027 | Third instalment |
| Spring 2027 | Balance settled when you file your 2026 return |

## Sources & disclaimer

Based on CRA figures for the 2026–27 ACWB cycle and 2026 tax-year indexation as reported in July 2026. Exact amounts depend on your income, province, and family situation. This is general information, not tax or financial advice — confirm your amounts in CRA My Account or with the [CRA](https://www.canada.ca/en/revenue-agency.html).
`,
  },
  {
    id: 'study-9',
    slug: 'minimum-wage-increases-october-2026',
    title: 'Minimum Wage Rises in 4 Provinces on October 1, 2026: What It Means for Your Paycheque',
    subtitle:
      'Ontario, Nova Scotia, Prince Edward Island, and Manitoba all raise their minimum wage on October 1, 2026 — we ran the new rates through the CanPay Insights tax engine to see what full-time workers actually gain.',
    excerpt:
      'Four provinces raise minimum wage on October 1, 2026: Ontario to $17.95, Nova Scotia to $17.00, PEI to $17.30, and Manitoba to $16.40. A full-time Ontario worker gains about $545 a year after tax; a Manitoba worker gains about $578.',
    metaTitle: 'Minimum Wage Rises in 4 Provinces Oct 1, 2026',
    metaDescription:
      'Ontario, Nova Scotia, PEI & Manitoba raise minimum wage Oct 1, 2026. See the new hourly rates and exactly how much extra take-home pay each province gains.',
    keywords: [
      'minimum wage increase october 2026',
      'ontario minimum wage october 2026',
      'nova scotia minimum wage october 2026',
      'pei minimum wage october 2026',
      'manitoba minimum wage october 2026',
      'minimum wage october 1 2026',
    ],
    category: 'news',
    tags: ['Minimum Wage', 'Ontario', 'Nova Scotia', 'PEI', 'Manitoba', '2026'],
    publishedAt: '2026-08-10',
    readTime: 6,
    imageUrl: '/blog/minimum-wage-increases-october-2026.svg',
    directAnswer:
      'On October 1, 2026, four provinces raise their general minimum wage: Ontario from $17.60 to $17.95, Nova Scotia from $16.75 to $17.00, Prince Edward Island from $17.00 to $17.30, and Manitoba from $16.00 to $16.40. Running the new rates through the CanPay Insights tax engine, a full-time (2,080 hours/year) minimum wage worker gains about $545 more take-home pay a year in Ontario, $339 in Nova Scotia, $416 in PEI, and $578 in Manitoba, after federal tax, provincial tax, CPP, and EI.',
    faq: [
      {
        question: 'Which provinces are raising minimum wage on October 1, 2026?',
        answer:
          'Ontario, Nova Scotia, Prince Edward Island, and Manitoba. All four increases take effect October 1, 2026, and all four are tied to provincial inflation-indexing formulas (CPI, or CPI plus 1%, depending on the province) rather than one-off political decisions.',
      },
      {
        question: 'What is Ontario’s new minimum wage?',
        answer:
          'Ontario’s general minimum wage rises from $17.60 to $17.95 per hour on October 1, 2026, a 35-cent increase tied to Ontario’s 1.9% Consumer Price Index change, as required under the Employment Standards Act, 2000. The province says the increase affects more than 700,000 workers. The student minimum wage rises to $16.90 and the homeworker rate to $19.70.',
      },
      {
        question: 'How much extra will a full-time minimum wage worker take home?',
        answer:
          'For 2,080 hours a year (40 hours/week), the after-tax gain is about $545/year (~$45/month) in Ontario, $339/year (~$28/month) in Nova Scotia, $416/year (~$35/month) in PEI, and $578/year (~$48/month) in Manitoba. Manitoba and Ontario see the largest dollar gains because CPP and EI take a smaller bite out of the raise at their income levels.',
      },
      {
        question: 'Why is Nova Scotia raising its minimum wage twice in one year?',
        answer:
          'Nova Scotia raised its minimum wage on April 1, 2026 (to $16.75) and raises it again on October 1, 2026 (to $17.00), as recommended by its Minimum Wage Review Committee under a CPI-plus-1% formula. Prince Edward Island is on a similar path, aiming for $17.60 by April 2027.',
      },
      {
        question: 'What is the minimum wage in the rest of Canada after October 1, 2026?',
        answer:
          'The other nine provinces and territories are not changing their minimum wage on October 1 — most adjust on a different date (commonly April 1 or annually in the fall). See our full province-by-province minimum wage take-home pay study for every current rate.',
      },
      {
        question: 'Does a higher minimum wage change CPP and EI deductions?',
        answer:
          'Yes, proportionally — CPP (5.95%) and EI (1.63%) apply to the extra gross pay just like income tax does, which is why the after-tax raise is smaller than the pre-tax raise. On Ontario’s 35-cent increase, for example, the extra $728 in gross annual pay becomes about $545 in extra take-home pay.',
      },
    ],
    content: `
## Four provinces, one date: October 1, 2026

Minimum wage rarely moves on a single national date, but this fall four provinces line up: **Ontario, Nova Scotia, Prince Edward Island, and Manitoba** all raise their general minimum wage on **October 1, 2026**. Each increase comes from a provincial inflation-indexing formula, not a one-off announcement, so the raises are modest — but they still change what full-time workers take home.

We ran the new rates through the CanPay Insights tax engine (2026 federal and provincial brackets, CPP/CPP2, and EI) to see exactly how much of each raise survives payroll deductions.

### What's changing

| Province | Old rate | New rate (Oct 1) | Increase | Reason |
| --- | --- | --- | --- | --- |
| Ontario | $17.60 | **$17.95** | +$0.35 | CPI (1.9%), per the Employment Standards Act |
| Manitoba | $16.00 | **$16.40** | +$0.40 | 2025 inflation rate, rounded to nearest 5¢ |
| Prince Edward Island | $17.00 | **$17.30** | +$0.30 | CPI + 1% formula |
| Nova Scotia | $16.75 | **$17.00** | +$0.25 | CPI + 1% formula (second increase of 2026) |

Ontario's increase is the largest in absolute cents and affects the most workers — the province says **more than 700,000 workers** will see a bigger paycheque. Nova Scotia's move is its second of 2026: the province already raised its minimum wage from $16.50 to $16.75 on April 1.

### What it's actually worth after tax

Full-time hours (40/week, 2,080/year), 2026 federal and provincial tax rates, basic personal amounts only:

| Province | New gross (full-time) | New take-home / year | New take-home / month | Extra vs. today | Extra / month |
| --- | --- | --- | --- | --- | --- |
| Manitoba | $34,112 | **$27,872** | $2,323 | +$578/yr | +$48 |
| Ontario | $37,336 | **$31,060** | $2,588 | +$545/yr | +$45 |
| Prince Edward Island | $35,984 | **$29,247** | $2,437 | +$416/yr | +$35 |
| Nova Scotia | $35,360 | **$28,476** | $2,373 | +$339/yr | +$28 |

*Extra take-home = new annual take-home minus current annual take-home for the same worker in the same province, after federal tax, provincial tax, CPP/CPP2, and EI.*

### Why the gain is smaller than the raise looks

A 35-cent Ontario raise sounds like $728 more a year (35¢ × 2,080 hours) — but only about **$545** of that survives payroll deductions, because the extra income is taxed and subject to CPP and EI exactly like the rest of the paycheque. Ontario keeps the largest share of its raise (about 75 cents of every extra dollar); Nova Scotia keeps the smallest share (about 65 cents), since it already has the highest deduction rate on minimum-wage income in the country.

### How these rates compare nationally

Even after October 1, Ontario's $17.95 and PEI's $17.30 remain below British Columbia ($18.25) and well below Nunavut ($19.75), the two highest rates in the country. Manitoba's $16.40 and Nova Scotia's $17.00 stay in the middle of the pack. None of the other nine provinces and territories change their minimum wage on October 1 — for the full current picture across all 13 jurisdictions, see our [minimum wage take-home pay study](/blog/minimum-wage-take-home-pay-canada-2026).

### See your own numbers

These figures assume a single worker with no other income or credits. To check your own paycheque under the new rate, use the [free take-home pay calculator](/), or go straight to your province: [Ontario paycheck calculator](/ontario-paycheck-calculator), the [Ontario take-home pay guide](/blog/ontario-take-home-pay-guide-2026), the [Manitoba take-home pay guide](/blog/manitoba-take-home-pay-guide-2026), the [Nova Scotia take-home pay guide](/blog/nova-scotia-take-home-pay-guide-2026), or the [PEI take-home pay guide](/blog/pei-take-home-pay-guide-2026).

## Sources & disclaimer

Rate and effective-date figures are based on official government announcements: the Government of Ontario (Employment Standards Act minimum wage indexing, April 2026), the Government of Nova Scotia (news release, December 2025 and April 2026), the Government of Manitoba (news release, April 2026), and Prince Edward Island's published minimum wage schedule, cross-checked against contemporaneous reporting. Take-home figures are calculated with the CanPay Insights tax engine using 2026 federal and provincial rates, full-time hours (2,080/year), a single worker, and basic personal amounts only — real paycheques vary with credits, benefits, and actual hours worked. This is general information, not tax advice.
`,
  },
  {
    id: 'study-10',
    slug: 'cpp-contribution-rate-cut-2027',
    title: 'CPP Contribution Rate Cut 2027: What It Actually Saves You',
    subtitle:
      'Ottawa is cutting the base CPP rate from 9.9% to 9.5% on January 1, 2027 — we ran the new employee rate through the CanPay Insights tax engine to see exactly how much extra you keep.',
    excerpt:
      'Bill C-30 cuts the base CPP contribution rate from 4.95% to 4.75% for employees starting January 1, 2027 — worth up to $142.20 more take-home pay a year for anyone earning $74,600 or more, and about $133 for a worker on $70,000. Self-employed Canadians save roughly double.',
    metaTitle: 'CPP Rate Cut 2027: Up to $142 More Take-Home Pay',
    metaDescription:
      'CPP’s base rate falls from 9.9% to 9.5% on Jan 1, 2027 — up to $142.20 more take-home pay a year for employees. See exact savings by salary.',
    keywords: [
      'cpp rate cut 2027',
      'cpp contribution rate 2027',
      'cpp 9.9 to 9.5',
      'base cpp rate cut',
      'how much will i save cpp 2027',
      'bill c-30 cpp',
    ],
    category: 'news',
    tags: ['CRA', 'CPP', 'Payroll Deductions', 'Federal Budget', '2027'],
    publishedAt: '2026-08-13',
    readTime: 6,
    imageUrl: '/blog/cpp-contribution-rate-cut-2027.svg',
    directAnswer:
      'Starting January 1, 2027, the base CPP contribution rate falls from 9.9% to 9.5% combined, with the employee share dropping from 4.95% to 4.75% and employers matching. The cut was legislated by Bill C-30, which received Royal Assent in June 2026. For an employee earning $70,000, the 2027 rate cut is worth about $133 more take-home pay a year, and anyone earning $74,600 or more saves the 2027 maximum of about $142.20. Self-employed workers, who pay both the employee and employer share, save roughly double. The CPP2 rate of 4% on income above the first ceiling is unchanged.',
    faq: [
      {
        question: 'What is the CPP contribution rate cut in 2027?',
        answer:
          'The base CPP contribution rate — the original, pre-2019-enhancement part of CPP — falls from 9.9% combined (employer + employee) to 9.5%, a 0.40 percentage point cut. For an individual employee, that means the rate drops from 4.95% to 4.75%; employers see the same cut. It takes effect January 1, 2027.',
      },
      {
        question: 'How much will I save from the CPP rate cut?',
        answer:
          'It depends on your income. Applying the 2027 rate cut of 0.20 percentage points to the current CPP earnings band ($3,500 to $74,600) works out to about $73 a year at a $40,000 salary, $113 at $60,000, $133 at $70,000 in 2027 (the government’s own example), and a maximum of about $142.20 in 2027 for anyone earning $74,600 or more. Self-employed workers, who pay both halves, save roughly double these amounts in 2027.',
      },
      {
        question: 'When does the CPP rate cut take effect?',
        answer:
          'January 1, 2027. It was announced in the federal government’s Spring Economic Update on April 28, 2026, and became law when Bill C-30 (the Spring Economic Update 2026 Implementation Act) received Royal Assent on June 18, 2026. It does not change anything on your 2026 paycheque.',
      },
      {
        question: 'Does the CPP rate cut affect CPP2?',
        answer:
          'No. The cut applies only to the base CPP rate on earnings up to the first ceiling (the YMPE, $74,600 in 2026). CPP2 — the extra 4% contribution on earnings between the first and second ceilings — is unchanged, so higher earners still pay CPP2 in full on top of the reduced base rate.',
      },
      {
        question: 'Will the CPP rate cut reduce my CPP pension?',
        answer:
          'No, according to the government and an independent actuarial review. Canada’s Chief Actuary submitted a report on May 28, 2026 confirming the reduced 9.5% base rate still clears the minimum contribution rate needed to sustain the base CPP plan long-term, so the cut does not reduce the benefits the base plan is designed to pay.',
      },
      {
        question: 'Is the CPP rate cut definitely happening?',
        answer:
          'Yes — it is now law. Bill C-30 passed and received Royal Assent on June 18, 2026, and all provincial finance ministers agreed to the change (CPP rate changes require provincial sign-off). The only remaining unknown is the exact 2027 CPP earnings ceiling (YMPE), which the CRA typically announces each November; this article uses the 2026 ceiling to estimate 2027 savings.',
      },
    ],
    content: `
## Your CPP deduction is about to get smaller

For the first time since the CPP enhancement began phasing in back in 2019, a piece of your CPP contribution is coming back **off** your paycheque instead of going up. Starting **January 1, 2027**, the **base CPP contribution rate** falls from **9.9% to 9.5%** combined (employer + employee) — a 0.40 percentage point cut. For an individual employee, that is a drop from **4.95% to 4.75%**.

It is now law: the change was announced in Ottawa's **Spring Economic Update** on April 28, 2026, and became law when **Bill C-30** (the *Spring Economic Update 2026 Implementation Act*) received **Royal Assent on June 18, 2026**. All provincial finance ministers signed off, which CPP rate changes require.

We ran the new rate through the CanPay Insights tax engine to see exactly what it is worth, salary by salary.

### What's changing

| | 2026 (current) | 2027 (after the cut) | Change |
| --- | --- | --- | --- |
| Base CPP rate, employee | 4.95% | **4.75%** | −0.20 pp |
| Enhanced ("first additional") CPP, employee | 1.00% | 1.00% (unchanged) | — |
| **Total CPP rate, employee** | **5.95%** | **5.75%** | −0.20 pp |
| CPP2 rate (income $74,600–$85,000) | 4.00% | 4.00% (unchanged) | — |
| Combined rate (employer + employee) | 9.90% | **9.50%** | −0.40 pp |

Only the base rate moves. The "first additional" enhancement (the part phased in 2019–2023) and CPP2 (the second additional contribution above the first ceiling) are untouched — so higher earners still pay CPP2 in full on top of the lower base rate.

### What it's worth on your paycheque

The 2027 CPP earnings ceiling (YMPE) has not been announced yet — the CRA typically confirms it each November. Using the 2026 ceiling ($74,600) as an estimate, here is what the rate cut is worth at different salaries:

| Annual salary | 2026 CPP (current) | 2027 CPP (after cut) | Annual savings |
| --- | --- | --- | --- |
| $40,000 | $2,172 | $2,099 | **+$73** |
| $50,000 | $2,767 | $2,674 | **+$93** |
| $60,000 | $3,362 | $3,249 | **+$113** |
| $70,000 | $3,957 | $3,824 | **+$133** |
| $74,600+ (max) | $4,230.45 | $4,088.25 | **+$142.20** |

*Figures are the employee share only, using 2026 CPP figures with the new 2027 base rate applied; CPP2 (for income above $74,600) is unaffected and not included. The $133 figure at $70,000 matches the federal government's own published example.*

Every dollar saved comes from the base rate alone, so the gain is capped once you reach the first ceiling — earning more above $74,600 does not save you anything extra on the base rate, though you still pay CPP2 on that portion exactly as before.

### Self-employed workers save about double

Self-employed Canadians pay both the employee and employer share of CPP, so the rate cut is worth roughly **twice** as much to them: about **$266 a year** at $70,000 of net self-employment income, and up to about **$284.40** at the maximum. Ottawa says the combined cut will reduce total CPP contributions across the country by more than **$3 billion a year**, spread across roughly **16 million contributors**.

### Why the government is doing this

The stated reason is affordability: "many hard-working Canadians continue to face affordability pressures as the cost of essential goods, housing, and everyday expenses remains high," the government said in announcing the measure. Because the CPP is self-financed through its own investment fund and contributions — not general tax revenue — the cut does not affect the federal budget's bottom line the way a tax cut would.

The bigger question was whether cutting the rate would leave the CPP short of money to pay future pensions. **Canada's Chief Actuary** reviewed the change and submitted a report on **May 28, 2026** confirming the reduced 9.5% base rate still clears the **minimum contribution rate** needed to sustain the base plan over the long term — so the cut is not expected to reduce the CPP retirement benefits the base plan pays out.

### How this fits with CPP2

If you already know about **CPP2**, the extra 4% contribution on income between the first and second CPP ceilings, this cut does not touch it. In 2027, a worker earning $90,000 will pay the new 4.75% base rate up to $74,600, the unchanged 1.00% enhancement on the same band, and the unchanged 4% CPP2 rate on the portion between $74,600 and $85,000. See [CPP2 explained](/blog/cpp2-second-additional-cpp-2026) and [how much CPP you pay by salary](/blog/how-much-cpp-will-i-pay-2026) for the full current-year picture.

### See your own number

These figures use the 2026 CPP earnings ceiling as an estimate for 2027; CanPay Insights will update this article with the exact 2027 ceiling once the CRA announces it this fall. For your current, exact take-home pay for 2026, use the [free payroll calculator](/) or the [CPP & EI calculator](/cpp-ei-calculator).

## Sources & disclaimer

Based on the Government of Canada's Spring Economic Update 2026 and the Department of Finance Canada announcement that Bill C-30 (the Spring Economic Update 2026 Implementation Act) received Royal Assent on June 18, 2026, cross-checked against contemporaneous news reporting on the rate cut and the Chief Actuary's May 28, 2026 report. Savings figures are calculated with the CanPay Insights tax engine, applying the new 2027 base rate to the current 2026 CPP earnings ceiling and exemption, since the official 2027 ceiling has not yet been published. This is general information, not tax or financial advice — confirm current CPP figures with the [Canada Revenue Agency](https://www.canada.ca/en/revenue-agency.html) or [Department of Finance Canada](https://www.canada.ca/en/department-finance.html).
`,
  },
  {
    id: 'study-11',
    slug: 'bc-tax-rate-increase-2026',
    title: 'BC Tax Rate Jumps to 5.60%: Why Your Paycheque Shrank in July 2026',
    subtitle:
      "British Columbia's lowest income tax rate rose from 5.06% to 5.60% for 2026 — but the change wasn't finalized until payroll systems had already run six months at the old rate, so the CRA is now withholding at a prorated 6.14% through December to catch up.",
    excerpt:
      "BC's February 2026 budget raised the province's lowest tax rate from 5.06% to 5.60%. Because payroll tables didn't catch up until July, the CRA is withholding BC tax at a prorated 6.14% rate from July through December 2026 — which is why BC paycheques got smaller starting with the first July payday.",
    metaTitle: 'BC Tax Rate Jumps to 5.60% in 2026: Paycheque Impact',
    metaDescription:
      "BC's lowest tax rate rose from 5.06% to 5.60% for 2026. Since payroll caught up late, the CRA is withholding at 6.14% through December. What it costs you.",
    keywords: [
      'bc tax rate increase 2026',
      'why is my bc paycheque smaller',
      'bc tax rate 5.60',
      'bc payroll deductions july 2026',
      'bc income tax change 2026',
      'cra prorated tax rate bc',
    ],
    category: 'news',
    tags: ['BC', 'Provincial Budget', 'CRA', 'Payroll Deductions', '2026'],
    publishedAt: '2026-08-17',
    readTime: 6,
    imageUrl: '/blog/bc-tax-rate-increase-2026.svg',
    directAnswer:
      "British Columbia's lowest personal income tax rate rose from 5.06% to 5.60% for all of 2026, under a budget tabled February 17, 2026. Because payroll software had already withheld six months of pay at the old 5.06% rate before the change was finalized, the CRA's July 2026 payroll tables apply a prorated rate of 6.14% to BC's first tax bracket from July through December 2026, so the full year averages out to 5.60%. In practice, this made BC paycheques noticeably smaller starting with the first July payday, on top of the roughly $130–$165 a year the rate increase itself adds for anyone earning $40,000 or more.",
    faq: [
      {
        question: 'Why did my BC paycheque get smaller in July 2026?',
        answer:
          "Because BC's 2026 budget (tabled February 17, 2026) raised the province's lowest income tax rate from 5.06% to 5.60%, but the change wasn't reflected in payroll software until the CRA's mid-year T4127 update took effect on July 1, 2026. Since employers had already withheld six months of pay at the old, lower rate, the CRA is now withholding BC tax at a prorated 6.14% rate from July through December to make up the shortfall so the full-year total comes out to the correct 5.60% average.",
      },
      {
        question: "What is BC's new lowest tax rate for 2026?",
        answer:
          "5.60%, up from 5.06% in 2025 — a 0.54 percentage point increase. It applies to the first $50,363 of taxable income, BC's lowest tax bracket. The change is permanent, effective for the 2026 taxation year and beyond, not a one-time adjustment.",
      },
      {
        question: 'What is the 6.14% rate I keep seeing mentioned?',
        answer:
          "6.14% is not BC's real tax rate — it's a temporary payroll-withholding correction. Because employers withheld at the old 5.06% rate for January through June 2026, the CRA's July payroll formulas apply 6.14% to BC's first tax bracket for July through December 2026 only, so total withholding for the year matches the true 5.60% annual rate. It reverts to a level rate once a full year has passed under the new law.",
      },
      {
        question: 'How much more BC tax will I actually pay in 2026?',
        answer:
          "It depends on income. Comparing BC's 2025 and 2026 brackets and basic personal amounts directly: about $130 more for the year at a $40,000 salary, $165 more at $50,000 (the increase is largest right around this point, in the gap between the two years' bracket thresholds), and a stable roughly $157 more a year for salaries between about $60,000 and $95,000. These are CanPay Insights calculations from the official 2025 and 2026 BC brackets, using basic personal amounts only.",
      },
      {
        question: 'Will my BC paycheque go back to normal in 2027?',
        answer:
          "The size of the mid-year catch-up (the extra bite from the 6.14% prorated rate) is specific to the second half of 2026 — it exists only because employers under-withheld in the first half. Assuming no further provincial rate changes, 2027 payroll tables should apply BC's 5.60% rate evenly across the whole year, so paycheques should be more stable, though the total annual BC tax will still be higher than it was in 2025.",
      },
      {
        question: 'Does this rate change affect CPP or EI too?',
        answer:
          "No. This is a BC provincial income tax change only. CPP and EI rates and maximums were set at the start of 2026 and were not affected by BC's mid-year payroll update — see [how much CPP you pay in 2026](/blog/how-much-cpp-will-i-pay-2026) and [how much EI you pay in 2026](/blog/how-much-ei-will-i-pay-2026) for those figures.",
      },
    ],
    content: `
## Why BC take-home pay dropped starting in July

If you work in British Columbia and noticed your paycheque was a little smaller starting with your first July 2026 payday — and nothing else about your job changed — this is almost certainly why: the province's lowest income tax rate went up, and payroll withholding only caught up to it halfway through the year.

British Columbia's budget, tabled **February 17, 2026**, raised the **lowest personal income tax rate from 5.06% to 5.60%** for the 2026 taxation year and beyond — a 0.54 percentage point increase on the first **$50,363** of taxable income. The government also raised the **BC tax reduction credit**, which softens the impact for lower earners, from **$575 to $690** for 2026.

The trouble is timing. The Canada Revenue Agency finalizes its annual **T4127 Payroll Deductions Formulas** guide before most provincial budgets are even tabled, so employers spent January through June 2026 withholding BC tax at the *old* 5.06% rate. Once BC's budget became law, the CRA had to correct course. Its July 2026 payroll update (the guide effective July 1, 2026) applies BC's lowest bracket at a **prorated 6.14% rate for July through December 2026** — higher than even the real 5.60% annual rate — so that six months of catch-up withholding brings the full year back in line with what BC residents actually owe.

### The rate, in one table

| Period | BC lowest-bracket rate | Why |
| --- | --- | --- |
| 2025 (all year) | 5.06% | Pre-budget rate |
| Jan – Jun 2026 | 5.06% | Payroll hadn't updated for the new budget yet |
| Jul – Dec 2026 | **6.14%** (prorated) | Catches up the shortfall from Jan–Jun |
| 2026, full-year average | **5.60%** | The real, legislated 2026 rate |
| 2027 onward (expected) | 5.60% | Applied evenly all year, assuming no further change |

### What it costs you for the pay period

The 6.14% figure only applies to income taxed in BC's first bracket, and only for July through December 2026 — it is a temporary correction, not BC's permanent rate. For someone earning $50,000 a year (fully inside the first bracket) paid biweekly, that works out to roughly **$21 more withheld per paycheque** from July through December compared with what a level 5.60% rate would have taken all year — because the second half of the year is carrying the whole correction on its own.

### What it costs you for the full year

Ignoring the mid-year withholding mechanics and just comparing BC's 2025 tax brackets and basic personal amounts against 2026's, here's what the rate increase is actually worth annually, using basic personal amounts only:

| Annual salary | 2025 BC tax (5.06% bracket) | 2026 BC tax (5.60% bracket) | Extra BC tax |
| --- | --- | --- | --- |
| $40,000 | $1,370 | $1,500 | **+$130** |
| $50,000 | $1,895 | $2,060 | **+$165** |
| $60,000 | $2,665 | $2,822 | **+$157** |
| $75,000 | $3,820 | $3,977 | **+$157** |
| $90,000 | $5,410 | $5,567 | **+$157** |

*Calculated by CanPay Insights from BC's published 2025 and 2026 tax brackets and basic personal amounts. The basic personal amount was $12,932 in 2025. It rose to $13,216 for 2026. The increase peaks around $50,000, in the narrow gap between the two years' bracket-one thresholds ($49,279 in 2025 vs. $50,363 in 2026), then settles to a flat roughly $157 a year for salaries between about $60,000 and $95,000. Figures exclude BC's income-tested tax reduction credit, which further lowers tax for net incomes under about $25,570.*

### The bottom line

BC's 2026 tax increase itself is modest — well under $200 a year for most workers. What actually surprised people was the *timing*: a mid-year jump in withholding that, on paper, looks bigger than the real annual change because it's cramming a full year's worth of extra tax into just six months of paycheques. By the time 2026 wraps up, total BC tax withheld should land close to the true 5.60%-rate amount; it's the last six months of the year carrying more than their fair share to get there.

For your own exact 2026 take-home pay by paycheque, use the free [BC paycheck calculator](/bc-paycheck-calculator) or see how BC compares to other provinces with [compare provinces](/compare-provinces). For the fuller picture on BC take-home pay this year, see the [BC take-home pay guide 2026](/blog/bc-take-home-pay-guide-2026).

## Sources & disclaimer

Based on the Province of British Columbia's official [personal income tax rates page](https://www2.gov.bc.ca/gov/content/taxes/income-taxes/personal/tax-rates) and the Canada Revenue Agency's **T4127 Payroll Deductions Formulas — 123rd Edition, effective July 1, 2026**, cross-checked against professional tax-alert summaries of BC's February 17, 2026 budget from PwC Canada and Doane Grant Thornton. Annual comparison figures are calculated by CanPay Insights from the published 2025 and 2026 BC tax brackets and basic personal amounts; they are not themselves quoted from a government source and exclude the BC tax reduction credit. This is general information, not tax or financial advice — confirm your own payroll deductions with your employer or the [Canada Revenue Agency](https://www.canada.ca/en/revenue-agency.html).
`,
  },
  {
    id: 'study-12',
    slug: 'federal-tax-cut-2026',
    title: 'The 14% Federal Tax Cut: 2026 Is the First Full Year — Up to $420 Back',
    subtitle:
      "Ottawa cut the lowest federal income tax rate from 15% to 14%, effective July 1, 2025. Because 2025 only got half a year at the new rate (a blended 14.5%), 2026 is the first full year at 14% — worth up to $420 per person, or $840 for a two-income couple.",
    excerpt:
      "The lowest federal tax rate dropped from 15% to 14%. 2025 was a blended 14.5% because the cut landed mid-year; 2026 is the first full year at 14%, so it delivers the full benefit — up to $420 per person. Here's what it adds to your take-home pay by salary.",
    metaTitle: 'Federal Tax Cut 2026: 14% Rate Worth Up to $420',
    metaDescription:
      "Canada's lowest federal tax rate was cut from 15% to 14%. 2026 is the first full year, worth up to $420 per person. See the savings by salary and paycheque.",
    keywords: [
      'federal tax cut 2026',
      '14 percent federal tax rate canada',
      'middle class tax cut 2026',
      'why is my paycheque bigger 2026',
      'federal income tax rate 2026',
      'how much is the federal tax cut worth',
    ],
    category: 'news',
    tags: ['Federal Tax', 'CRA', '2026', 'Take-Home Pay', 'Tax Cut'],
    publishedAt: '2026-08-20',
    readTime: 6,
    imageUrl: '/blog/federal-tax-cut-2026.svg',
    directAnswer:
      "The federal government reduced Canada's lowest personal income tax rate from 15% to 14%, effective July 1, 2025. Because the cut landed mid-year, the 2025 full-year rate was a blended 14.5%; 2026 is the first full calendar year at 14%, so it delivers the complete benefit. The maximum saving is $420 per person in 2026 (up to $840 for a two-income couple), reached once your taxable income passes the top of the first bracket ($58,523). Roughly 22 million Canadians benefit, which is why many workers' 2026 paycheques are slightly larger than their 2025 ones even with no raise.",
    faq: [
      {
        question: 'What is the new federal tax rate for 2026?',
        answer:
          "Canada's lowest federal personal income tax rate is 14% for 2026, down from 15%. It applies to the first $58,523 of taxable income — the first federal bracket. The higher brackets (20.5%, 26%, 29% and 33%) are unchanged. The rate cut took effect July 1, 2025, so 2025's full-year rate was a blended 14.5%; 2026 is the first full year at the flat 14%.",
      },
      {
        question: 'How much is the federal tax cut worth in 2026?',
        answer:
          "Up to $420 per person, and up to $840 for a two-income couple. The saving is the 1% rate cut applied to the income you have taxed in the first bracket above the basic personal amount — so it grows with income until you reach the top of that bracket, then flattens out. At a $30,000 salary it is about $135; at $50,000, about $335; and it maxes out at roughly $420 once taxable income passes $58,523.",
      },
      {
        question: 'Why is my paycheque bigger in 2026 than in 2025?',
        answer:
          "Because 2026 is the first full year at the lower 14% rate. The cut only started July 1, 2025, so CRA blended the 2025 rate to 14.5% — you got the lower rate for just half of 2025. In 2026 the full 14% applies to every pay period from January onward, so slightly less federal tax is withheld each cheque even if your pay is unchanged. Use the free [Ontario paycheck calculator](/ontario-paycheck-calculator) or [salary after tax tool](/salary-after-tax-canada) to see your own figure.",
      },
      {
        question: 'Does everyone get the full $420?',
        answer:
          "No. You only reach the maximum $420 if your taxable income is above the top of the first bracket ($58,523). Below that, the saving is smaller because the 1% rate cut only reduces tax on the first-bracket income you actually have above the basic personal amount ($16,452 federally in 2026). Someone earning $40,000 saves about $235; someone at or above roughly $59,000 saves the full ~$420. Higher earners get the same flat $420 — the cut only touches the first bracket.",
      },
      {
        question: 'Is the middle-class tax cut permanent?',
        answer:
          "Yes. The rate reduction was made law by Bill C-4, the Making Life More Affordable for Canadians Act, which received Royal Assent on March 12, 2026. The 14% rate applies to the 2026 tax year and future years, not just as a one-time measure. The government estimates it delivers over $27 billion in tax relief over five years, starting in 2025-26.",
      },
      {
        question: 'Does the rate cut change CPP, EI or provincial tax?',
        answer:
          "No. This is a federal income tax change only. Your CPP (5.95%), CPP2 (4%) and EI (1.63%) deductions are set separately and are unaffected — see [how much CPP you pay in 2026](/blog/how-much-cpp-will-i-pay-2026) and [how much EI you pay in 2026](/blog/how-much-ei-will-i-pay-2026). Provincial income tax is also separate; some provinces moved their own rates for 2026, such as [BC's rise to 5.60%](/blog/bc-tax-rate-increase-2026).",
      },
    ],
    content: `
## The federal rate is 14% now — and 2026 is the first full year of it

If your 2026 paycheque looks slightly bigger than your 2025 one and you haven't had a raise, this is a big part of why. The federal government cut Canada's **lowest personal income tax rate from 15% to 14%**, and 2026 is the first full calendar year the lower rate applies from the very first pay period.

The cut took effect **July 1, 2025**. Because it landed halfway through that year, the Canada Revenue Agency set the **2025 full-year rate at a blended 14.5%** — you got 15% for the first half and 14% for the second. In **2026 the flat 14% applies all year**, so the full benefit finally shows up. The change was made permanent by **Bill C-4, the Making Life More Affordable for Canadians Act, which received Royal Assent on March 12, 2026**.

The 14% rate applies to the **first $58,523 of taxable income** — the first federal bracket. Everything above that is taxed at the unchanged higher rates (20.5%, 26%, 29% and 33%). Because the first bracket is the one every taxpayer passes through, **roughly 22 million Canadians** benefit, regardless of income.

### The rate, in one table

| Tax year | Lowest federal rate | Why |
| --- | --- | --- |
| 2024 and earlier | 15% | Pre-cut rate |
| 2025 (full year) | **14.5%** (blended) | Cut took effect July 1, 2025 — only half a year at 14% |
| 2026 (full year) | **14%** | First full year at the reduced rate |
| 2027 onward | 14% | Permanent under Bill C-4 |

## What the cut is worth to you

The maximum saving is **$420 per person in 2026**, and **up to $840 for a two-income couple**. But not everyone reaches the maximum. The saving is essentially the **1% rate cut applied to the income you have taxed in the first bracket** above the basic personal amount ($16,452 federally in 2026) — so it climbs with income until you hit the top of the first bracket ($58,523), then flattens.

| Annual salary | Approx. federal tax cut saving (2026) |
| --- | --- |
| $30,000 | ~$135 |
| $40,000 | ~$235 |
| $50,000 | ~$335 |
| $60,000 | ~$420 (maximum) |
| $75,000 | ~$420 (maximum) |
| $90,000 | ~$420 (maximum) |
| $120,000 | ~$420 (maximum) |

*Calculated by CanPay Insights using the 2026 federal bracket ($58,523 at 14%) and basic personal amount ($16,452). The saving is the difference between federal tax at 15% and at 14% on first-bracket income, net of the small offset from valuing credits at 14% instead of 15%. This matches the government's stated maximum of $420 per person. Figures use basic personal amounts only and exclude provincial tax and other credits.*

The maximum lands at about $420 once taxable income passes $58,523 — and it stays flat above that, because the cut only touches the first bracket. A worker earning $250,000 gets the same $420 from this measure as a worker earning $60,000.

### On your actual paycheque

Spread across the year, $420 is roughly **$16 more per biweekly cheque** (26 pay periods) for someone above the first-bracket threshold, or about **$35 a month**. Someone at $50,000 keeps about **$335 more for the year**, roughly **$13 a paycheque**. It is not dramatic on any single payday — but it is real money that shows up automatically, without filing anything, because employers' 2026 payroll tables already build in the 14% rate.

## How it stacks with everything else in 2026

The federal cut is one of several 2026 changes moving take-home pay in different directions. On its own it is a modest raise; some provincial moves partly offset it. For example, [British Columbia raised its lowest rate to 5.60%](/blog/bc-tax-rate-increase-2026) for 2026, and CPP/EI figures were reset at the start of the year. To see the combined, province-specific result on your own pay, use the free [salary after tax calculator](/salary-after-tax-canada), the [Ontario paycheck calculator](/ontario-paycheck-calculator), or [compare provinces](/compare-provinces) side by side.

### The bottom line

Canada's lowest federal income tax rate is **14% for 2026**, down from 15%, and 2026 is the **first full year** of it. It is automatic, permanent, and worth **up to $420 per person** ($840 per couple) — the reason many paycheques quietly grew in January 2026 with no raise attached. Check exactly what it means for your take-home with the [free take-home pay calculator](/).

## Sources & disclaimer

Based on the Government of Canada's announcement [Delivering a middle-class tax cut](https://www.canada.ca/en/department-finance/news/2025/05/delivering-a-middle-class-tax-cut.html) and the Prime Minister's office release [Canada's new government delivers middle-class tax cut](https://www.pm.gc.ca/en/news/news-releases/2025/06/30/canadas-new-government-delivers-middle-class-tax), cross-checked against professional summaries from Invesco Canada and BDO Canada and reporting by CBC News. The $420 maximum and the 15%-to-14% rate, July 1, 2025 effective date, 14.5% blended 2025 rate and 14% full-year 2026 rate are drawn from those government sources. Savings by salary are calculated by CanPay Insights from the published 2026 federal bracket and basic personal amount and are not themselves quoted from a government source. This is general information, not tax or financial advice — confirm current figures with the [Canada Revenue Agency](https://www.canada.ca/en/revenue-agency.html) or [Department of Finance Canada](https://www.canada.ca/en/department-finance.html).
`,
  },
  {
    id: 'study-13',
    slug: 'saskatchewan-minimum-wage-october-2026',
    title: "Saskatchewan's Minimum Wage Rises to $15.70 on October 1, 2026",
    subtitle:
      "Saskatchewan raises its minimum wage from $15.35 to $15.70 an hour on October 1, 2026 — the province's indexation formula catching up while it remains Canada's second-lowest, ahead only of Alberta.",
    excerpt:
      "Saskatchewan's minimum wage rises from $15.35 to $15.70 on October 1, 2026, a 35-cent increase under the province's CPI-and-wages formula. A full-time worker gains about $508 more take-home pay a year — and Saskatchewan stays Canada's second-lowest minimum wage, just above Alberta's frozen $15.00.",
    metaTitle: 'Saskatchewan Minimum Wage Rises to $15.70 in 2026',
    metaDescription:
      "Saskatchewan's minimum wage rises from $15.35 to $15.70 on Oct 1, 2026. See the after-tax gain, calculated with the CanPay tax engine.",
    keywords: [
      'saskatchewan minimum wage 2026',
      'saskatchewan minimum wage october 2026',
      'saskatchewan minimum wage increase',
      'sk minimum wage $15.70',
      'saskatchewan take-home pay 2026',
      'lowest minimum wage canada 2026',
    ],
    category: 'news',
    tags: ['Saskatchewan', 'Minimum Wage', '2026'],
    publishedAt: '2026-08-24',
    readTime: 5,
    imageUrl: '/blog/saskatchewan-minimum-wage-october-2026.svg',
    directAnswer:
      "Saskatchewan's general minimum wage rises from $15.35 to $15.70 an hour on October 1, 2026, a 35-cent increase set under the province's indexation formula, which gives equal weight to changes in the Consumer Price Index and the average hourly wage in Saskatchewan. Running the new rate through the CanPay Insights tax engine, a full-time (2,080 hours/year) minimum wage worker in Saskatchewan gains about $508 more take-home pay a year — roughly $20 more per biweekly paycheque. Even after the increase, Saskatchewan keeps Canada's second-lowest minimum wage, ahead only of Alberta's $15.00, which has been frozen since 2018.",
    faq: [
      {
        question: "What is Saskatchewan's new minimum wage for October 2026?",
        answer:
          "$15.70 an hour, up from $15.35, effective October 1, 2026. It's a 35-cent increase set under Saskatchewan's indexation formula, which averages the change in the Consumer Price Index and the change in the average hourly wage for the province over the previous year — not a one-off political decision.",
      },
      {
        question: "Why wasn't Saskatchewan included when Ontario, Nova Scotia, PEI and Manitoba raised minimum wage on the same date?",
        answer:
          "Those four provinces confirmed their October 1, 2026 increases earlier in the year; Saskatchewan's own October 1 increase, confirmed by the provincial government on June 29, 2026, also lands on the same date. Five provinces — Ontario, Nova Scotia, Prince Edward Island, Manitoba, and Saskatchewan — all raise minimum wage on October 1, 2026, though each sets its rate independently.",
      },
      {
        question: 'How much extra will a full-time Saskatchewan minimum wage worker take home?',
        answer:
          "For 2,080 hours a year (40 hours/week), the raise adds $728 in gross pay before deductions, but only about $508 survives federal tax, Saskatchewan provincial tax, CPP, and EI — roughly $20 more per biweekly paycheque, or about $42 a month. That's a CanPay Insights calculation using the 2026 tax engine, comparing $15.35/hour and $15.70/hour full-time pay in Saskatchewan.",
      },
      {
        question: "Is Saskatchewan still the lowest minimum wage in Canada?",
        answer:
          "No — Alberta is lowest, at $15.00 an hour, unchanged since October 2018. After the October 1, 2026 increase, Saskatchewan's $15.70 remains Canada's second-lowest, below every other province and territory, including New Brunswick at $15.90 (as of April 2026).",
      },
      {
        question: 'Does Saskatchewan review its minimum wage every year?',
        answer:
          "Yes. Saskatchewan has used the same CPI-plus-average-hourly-wage indexation formula since 2018, with increases typically taking effect each October 1. The formula is meant to keep pace with both inflation and overall wage growth in the province, rather than requiring a new law or budget announcement each time.",
      },
      {
        question: 'Does the minimum wage increase affect CPP and EI deductions?',
        answer:
          "Yes, proportionally — CPP (5.95%) and EI (1.63%) apply to the extra gross pay just like income tax does, which is why the after-tax raise ($508) is smaller than the pre-tax raise ($728). See [how much CPP you pay in 2026](/blog/how-much-cpp-will-i-pay-2026) and [how much EI you pay in 2026](/blog/how-much-ei-will-i-pay-2026) for the full rates.",
      },
    ],
    content: `
## Saskatchewan's rate catches up on October 1

Saskatchewan's general minimum wage rises from **$15.35 to $15.70 an hour on October 1, 2026** — a 35-cent increase set under the province's indexation formula, which gives equal weight to the change in the Consumer Price Index and the change in Saskatchewan's average hourly wage over the previous year. The province confirmed the new rate on **June 29, 2026**.

That puts Saskatchewan on the same effective date as four other provinces already raising their minimum wage on October 1, 2026: [Ontario, Nova Scotia, Prince Edward Island, and Manitoba](/blog/minimum-wage-increases-october-2026). Five provinces move on the same day this fall, but each sets its own rate independently through its own formula or legislation.

We ran Saskatchewan's new rate through the CanPay Insights tax engine (2026 federal and provincial brackets, CPP, and EI) to see exactly how much of the raise survives payroll deductions.

### The rate, in one table

| | Rate | Change | Effective |
| --- | --- | --- | --- |
| Old rate | $15.35/hr | — | Since October 2025 |
| New rate | **$15.70/hr** | +$0.35 | October 1, 2026 |
| Formula | CPI + average hourly wage, averaged | — | Annual review |

### What it's actually worth after tax

Full-time hours (40/week, 2,080/year), 2026 federal and Saskatchewan tax rates, CPP, EI, and basic personal amounts only:

| Rate | Gross pay/year | Take-home pay/year | Take-home/biweekly | Extra vs. old rate | Extra/cheque |
| --- | --- | --- | --- | --- | --- |
| $15.35/hr (current) | $31,928 | $26,879 | $1,034 | — | — |
| $15.70/hr (Oct 1) | **$32,656** | **$27,387** | **$1,053** | **+$508/yr** | **+$20** |

*Calculated by CanPay Insights using the 2026 tax engine for a single Saskatchewan worker with no other income or credits, paid biweekly (26 pay periods).*

### Why the after-tax gain is smaller than the raise looks

A 35-cent raise sounds like $728 more a year (35 cents × 2,080 hours) — but only about **$508** of that survives payroll deductions, because the extra income is taxed and subject to CPP and EI exactly like the rest of the paycheque. In practice, a Saskatchewan minimum wage worker keeps roughly **70 cents of every extra dollar** from this raise; the rest goes to federal tax, Saskatchewan provincial tax, CPP, and EI.

### Still Canada's second-lowest minimum wage

Even at $15.70, Saskatchewan stays near the bottom of the national ranking. Alberta remains the only province paying less, at a flat **$15.00 an hour** — frozen since October 2018, with no increase announced for 2026. New Brunswick, which raised its own rate to $15.90 in April 2026, now pays 20 cents more per hour than Saskatchewan's new rate. For the full national picture across all 13 provinces and territories, see our [minimum wage take-home pay study](/blog/minimum-wage-take-home-pay-canada-2026).

### See your own numbers

These figures assume a single worker with no other income or credits. To check your own paycheque under the new rate, use the free [Saskatchewan paycheck calculator](/saskatchewan-paycheck-calculator), see the [Saskatchewan take-home pay guide](/blog/saskatchewan-take-home-pay-guide-2026), or compare it against every other province with [compare provinces](/compare-provinces).

## Sources & disclaimer

Rate and effective-date figures are based on the Government of Saskatchewan's June 29, 2026 announcement of its minimum wage increase and the province's published indexation formula, cross-checked against contemporaneous reporting by the Prince Albert Daily Herald and MBC Radio. Take-home figures are calculated with the CanPay Insights tax engine using 2026 federal and Saskatchewan provincial rates, full-time hours (2,080/year), a single worker, and basic personal amounts only — real paycheques vary with credits, benefits, and actual hours worked. This is general information, not tax advice.
`,
  },
];
