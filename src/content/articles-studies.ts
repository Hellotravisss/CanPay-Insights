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
];
