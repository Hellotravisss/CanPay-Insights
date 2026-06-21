import { buildSalaryBreakdown, getSalaryFigures, type SalaryBreakdown } from '../lib/salaryFigures';

export type LandingPage = {
  slug: string;
  title: string;
  description: string;
  h1: string;
  kicker: string;
  intro: string;
  primaryKeyword: string;
  examples: string[];
  sections: Array<{
    heading: string;
    body: string;
  }>;
  faq: Array<{
    question: string;
    answer: string;
  }>;
  relatedSalaryLinks?: Array<{
    href: string;
    label: string;
  }>;
  highlights?: Array<{
    label: string;
    value: string;
    detail: string;
  }>;
  nextSteps?: Array<{
    title: string;
    body: string;
    href: string;
    label: string;
  }>;
  alternateLanguages?: Array<{
    href: string;
    hrefLang: string;
    label: string;
  }>;
  salaryBreakdown?: SalaryBreakdown;
};

const coreLandingPages: LandingPage[] = [
  {
    slug: 'salary-after-tax-canada',
    title: 'Salary After Tax Canada 2025/2026 - Take-Home Pay Calculator',
    description:
      'Estimate salary after tax in Canada for 2025/2026. Calculate federal tax, provincial tax, CPP, EI, net pay, and paycheque amounts by province.',
    h1: 'Salary After Tax Canada Calculator 2025/2026',
    kicker: 'Annual salary to net pay',
    primaryKeyword: 'salary after tax Canada',
    intro:
      'Use CanPay Insights to estimate what your annual salary becomes after Canadian income tax, CPP, EI, and provincial deductions. Choose your province, enter your gross salary, and compare annual, monthly, and bi-weekly take-home pay.',
    examples: ['$50,000 salary after tax in Canada', '$65,000 after tax in Ontario', '$85,000 take-home pay Canada'],
    sections: [
      {
        heading: 'What gets deducted from a Canadian salary?',
        body:
          'Canadian payroll deductions usually include federal income tax, provincial or territorial income tax, Canada Pension Plan contributions, and Employment Insurance premiums. Depending on your employer, your paycheque may also include RRSP contributions, union dues, long-term disability premiums, benefits, or other deductions.',
      },
      {
        heading: 'Why province matters',
        body:
          'A $75,000 salary does not produce the same net pay in every province. Ontario, British Columbia, Alberta, Quebec, and the Atlantic provinces all use different tax brackets and credits. CanPay Insights lets you switch provinces quickly so you can compare job offers or relocation decisions.',
      },
      {
        heading: 'Best way to use this calculator',
        body:
          'Start with your gross annual salary, select your province, then review your estimated annual net pay and paycheque amount. If you are paid hourly or have changing shifts, use the hourly wage or timesheet mode for a more practical estimate.',
      },
    ],
    faq: [
      {
        question: 'How do I calculate salary after tax in Canada?',
        answer:
          'Start with gross salary, subtract federal income tax, provincial income tax, CPP contributions, EI premiums, and any workplace deductions. CanPay Insights estimates these deductions by province for 2025/2026.',
      },
      {
        question: 'Is take-home pay the same in every province?',
        answer:
          'No. Federal tax is the same across Canada, but provincial tax brackets and credits differ, so the same salary can produce different net pay in Ontario, BC, Alberta, Quebec, and other provinces.',
      },
    ],
    alternateLanguages: [
      {
        href: '/fr/calculateur-salaire-net-quebec',
        hrefLang: 'fr-CA',
        label: 'Français - calculateur Québec',
      },
    ],
    relatedSalaryLinks: [
      { href: '/65000-after-tax-ontario', label: '$65,000 after tax Ontario' },
      { href: '/70000-after-tax-bc', label: '$70,000 after tax BC' },
      { href: '/80000-after-tax-alberta', label: '$80,000 after tax Alberta' },
      { href: '/60000-after-tax-manitoba', label: '$60,000 after tax Manitoba' },
      { href: '/70000-after-tax-saskatchewan', label: '$70,000 after tax Saskatchewan' },
      { href: '/80000-after-tax-nova-scotia', label: '$80,000 after tax Nova Scotia' },
      { href: '/65000-after-tax-new-brunswick', label: '$65,000 after tax New Brunswick' },
      { href: '/100000-after-tax-quebec', label: '$100,000 after tax Quebec' },
    ],
    highlights: [
      {
        label: 'Best for',
        value: 'Job offers',
        detail: 'Compare the number on an offer letter with the estimated pay that actually reaches your bank account.',
      },
      {
        label: 'Includes',
        value: 'Tax, CPP, EI',
        detail: 'Use province-specific deductions instead of relying on a generic Canada-wide estimate.',
      },
      {
        label: 'Next check',
        value: 'Province gap',
        detail: 'A similar salary can feel different in Ontario, BC, Alberta, Quebec, and Atlantic Canada.',
      },
    ],
    nextSteps: [
      {
        title: 'Compare provinces before moving',
        body: 'Use the same gross salary across provinces to see how provincial tax changes take-home pay.',
        href: '/compare-provinces',
        label: 'Compare provinces',
      },
      {
        title: 'Read the newcomer tax guide',
        body: 'Useful if you are new to Canada and trying to understand tax residency, credits, and first-year filing.',
        href: '/blog/newcomer-tax-guide-canada-2025',
        label: 'Newcomer guide',
      },
    ],
  },
  {
    slug: 'hourly-wage-calculator',
    title: 'Hourly Wage Calculator Canada 2025/2026 - Net Pay by Province',
    description:
      'Calculate Canadian hourly wage take-home pay with shift hours, unpaid breaks, overtime, CPP, EI, taxes, and province-specific deductions.',
    h1: 'Hourly Wage Calculator Canada',
    kicker: 'Hourly pay to take-home pay',
    primaryKeyword: 'hourly wage calculator Canada',
    intro:
      'Estimate take-home pay from your hourly wage, weekly schedule, unpaid breaks, overtime, and province. This is useful for part-time workers, hourly employees, students, restaurant staff, retail workers, and anyone whose pay changes by shift.',
    examples: ['$20 per hour after tax in Ontario', '$25/hour take-home pay Canada', 'Bi-weekly hourly wage calculator'],
    sections: [
      {
        heading: 'Hourly workers need more than a salary calculator',
        body:
          'Hourly pay depends on scheduled days, shift length, unpaid breaks, overtime rules, tips, premiums, and pay frequency. A simple annual salary estimate can miss the reality of changing hours, especially for service and shift-based workers.',
      },
      {
        heading: 'Overtime and province rules',
        body:
          'Canadian employment standards vary by province. Some provinces use daily overtime thresholds while others focus more on weekly hours. CanPay Insights is built to make those province-specific payroll rules easier to estimate.',
      },
      {
        heading: 'When to use timesheet mode',
        body:
          'If your schedule changes every week, switch to the timesheet tracker. It lets you enter individual shifts, breaks, and tips so your net pay estimate better matches your actual pay period.',
      },
    ],
    faq: [
      {
        question: 'Can I calculate hourly wage after tax in Canada?',
        answer:
          'Yes. Enter your hourly rate, province, shift schedule, breaks, and pay frequency to estimate gross pay, taxes, CPP, EI, and take-home pay.',
      },
      {
        question: 'Does overtime affect take-home pay?',
        answer:
          'Yes. Overtime increases gross pay and can also increase income tax withholding. The final net amount depends on your province, hours, and pay period.',
      },
    ],
  },
  {
    slug: 'salary-calculator',
    title: 'Canadian Salary Calculator 2025/2026 - Annual Salary to Paycheque',
    description:
      'Convert annual salary into Canadian take-home pay by province. Estimate income tax, CPP, EI, monthly pay, and bi-weekly pay for 2025/2026.',
    h1: 'Canadian Salary Calculator 2025/2026',
    kicker: 'Annual salary calculator',
    primaryKeyword: 'Canadian salary calculator',
    intro:
      'Compare gross salary and take-home pay across Canada. CanPay Insights helps salaried employees estimate deductions by province and understand what lands in each paycheque.',
    examples: ['$70,000 salary calculator Canada', 'Bi-weekly salary after tax', 'Monthly net pay calculator Canada'],
    sections: [
      {
        heading: 'From annual salary to paycheque',
        body:
          'Employers often quote annual salary, but your budget depends on monthly or bi-weekly net pay. The calculator breaks salary down into payroll periods after estimated taxes, CPP, EI, and optional deductions.',
      },
      {
        heading: 'Useful for job offers',
        body:
          'A higher salary in another province may not mean the same after-tax income. Use the calculator with the province comparison page before accepting an offer or planning a move.',
      },
      {
        heading: 'Add real-world deductions',
        body:
          'If your employer deducts RRSP contributions, union dues, insurance, benefits, or other amounts, add them to make your estimate closer to your actual pay stub.',
      },
    ],
    faq: [
      {
        question: 'What is the difference between gross salary and net salary?',
        answer:
          'Gross salary is your pay before deductions. Net salary is what remains after federal tax, provincial tax, CPP, EI, and other payroll deductions.',
      },
      {
        question: 'Should I use annual or hourly mode?',
        answer:
          'Use annual salary mode if your pay is fixed. Use hourly wage or timesheet mode if your hours, overtime, or tips change from one pay period to another.',
      },
    ],
  },
  {
    slug: 'timesheet-tracker',
    title: 'Timesheet Tracker Canada - Estimate Net Pay from Shifts',
    description:
      'Track shifts, unpaid breaks, tips, overtime, and deductions to estimate Canadian take-home pay by pay period.',
    h1: 'Timesheet Tracker for Canadian Workers',
    kicker: 'Shift-by-shift pay estimates',
    primaryKeyword: 'timesheet tracker Canada',
    intro:
      'Use the timesheet tracker when a fixed salary or simple hourly estimate is not enough. Enter shifts, breaks, and tips to estimate gross pay and take-home pay for your actual pay period.',
    examples: ['Weekly timesheet calculator', 'Shift pay calculator Canada', 'Tips and overtime pay estimate'],
    sections: [
      {
        heading: 'Built for changing schedules',
        body:
          'Retail, hospitality, healthcare, warehouse, and gig schedules can change every week. A shift-based tracker gives you a better view of expected pay before the paycheque arrives.',
      },
      {
        heading: 'Include tips and deductions',
        body:
          'Declared tips, premiums, unpaid breaks, and recurring deductions can all change net pay. Tracking them in one place helps you compare your estimate against your actual pay stub.',
      },
      {
        heading: 'Plan around pay periods',
        body:
          'Choose weekly, bi-weekly, semi-monthly, or monthly pay frequency to match how your employer pays you and estimate cash flow more realistically.',
      },
    ],
    faq: [
      {
        question: 'Who should use a timesheet tracker?',
        answer:
          'Use it if your shifts, hours, tips, or overtime change from week to week. It is especially useful for hourly and part-time workers.',
      },
      {
        question: 'Can this replace my official pay stub?',
        answer:
          'No. It is an estimate for planning. Your employer payroll system and final pay stub are the official records.',
      },
    ],
  },
  {
    slug: 'cpp-ei-calculator',
    title: 'CPP and EI Calculator Canada 2025/2026 - Payroll Deductions',
    description:
      'Estimate CPP contributions and EI premiums in Canada for 2025/2026. Learn how CPP, CPP2, and EI affect take-home pay.',
    h1: 'CPP and EI Calculator Canada',
    kicker: 'Payroll deductions explained',
    primaryKeyword: 'CPP EI calculator',
    intro:
      'CPP and EI are two of the most common deductions on Canadian paycheques. CanPay Insights estimates how these payroll deductions affect your take-home pay alongside income tax.',
    examples: ['CPP deduction calculator 2025', 'EI premium calculator Canada', 'CPP and EI on bi-weekly pay'],
    sections: [
      {
        heading: 'What CPP pays for',
        body:
          'Canada Pension Plan contributions help fund retirement, disability, survivor, and related benefits. Employees and employers both contribute, and self-employed workers generally pay both portions.',
      },
      {
        heading: 'What EI pays for',
        body:
          'Employment Insurance premiums support eligible workers during job loss, sickness, parental leave, compassionate care, and other qualifying situations.',
      },
      {
        heading: 'Why CPP and EI change through the year',
        body:
          'CPP and EI each have annual maximums. Once your earnings reach those limits, deductions can stop or change for the rest of the year, which may make later paycheques slightly larger.',
      },
    ],
    faq: [
      {
        question: 'Are CPP and EI the same as income tax?',
        answer:
          'No. CPP and EI are payroll contributions, while income tax is paid to federal and provincial governments. All three reduce take-home pay.',
      },
      {
        question: 'Do all employees pay CPP and EI?',
        answer:
          'Most employees pay CPP and EI, but there are exceptions depending on age, employment type, earnings, and province-specific rules.',
      },
    ],
  },
  {
    slug: 'ontario-paycheck-calculator',
    title: 'Ontario Paycheck Calculator 2025/2026 - Take-Home Pay',
    description:
      'Calculate Ontario take-home pay with federal tax, Ontario tax, CPP, EI, hourly wage, salary, and bi-weekly pay estimates.',
    h1: 'Ontario Paycheck Calculator',
    kicker: 'Ontario take-home pay',
    primaryKeyword: 'Ontario paycheck calculator',
    intro:
      'Estimate your Ontario paycheque after federal tax, Ontario provincial tax, CPP, EI, and workplace deductions. Useful for Toronto, Ottawa, Mississauga, Brampton, Hamilton, London, and workers across Ontario.',
    examples: ['$65,000 after tax Ontario', '$25/hour after tax Ontario', 'Toronto take-home pay calculator'],
    sections: [
      {
        heading: 'Ontario tax and payroll deductions',
        body:
          'Ontario workers pay federal income tax, Ontario provincial income tax, CPP contributions, and EI premiums. Your final net pay depends on salary, pay frequency, credits, deductions, and whether you have overtime or variable income.',
      },
      {
        heading: 'For salary and hourly workers',
        body:
          'Use annual salary mode for a fixed salary or hourly mode for shift-based work. If your hours change weekly, timesheet mode gives a more realistic estimate.',
      },
      {
        heading: 'Compare Ontario with other provinces',
        body:
          'If you are considering a move from Ontario to Alberta, BC, Quebec, or another province, use the province comparison page to see how take-home pay changes.',
      },
    ],
    faq: [
      {
        question: 'How much tax is deducted from an Ontario paycheque?',
        answer:
          'It depends on your income, pay period, credits, and deductions. Ontario paycheques usually include federal tax, Ontario tax, CPP, and EI deductions.',
      },
      {
        question: 'Is Ontario take-home pay lower than Alberta?',
        answer:
          'Often, yes for many incomes, but the exact difference depends on salary and deductions. Use the province comparison tool for your own income.',
      },
    ],
  },
  {
    slug: 'bc-paycheck-calculator',
    title: 'BC Paycheck Calculator 2025/2026 - British Columbia Take-Home Pay',
    description:
      'Estimate British Columbia take-home pay with federal tax, BC tax, CPP, EI, salary, hourly wage, and pay period deductions.',
    h1: 'BC Paycheck Calculator',
    kicker: 'British Columbia take-home pay',
    primaryKeyword: 'BC paycheck calculator',
    intro:
      'Estimate take-home pay in British Columbia after income tax, CPP, EI, and payroll deductions. Useful for Vancouver, Victoria, Surrey, Burnaby, Kelowna, and workers across BC.',
    examples: ['$70,000 after tax BC', '$30/hour after tax Vancouver', 'British Columbia salary calculator'],
    sections: [
      {
        heading: 'BC payroll deductions',
        body:
          'BC employees typically see federal income tax, BC provincial income tax, CPP, and EI deductions on each paycheque. Benefit premiums, RRSP contributions, and union dues may also apply.',
      },
      {
        heading: 'Plan around high living costs',
        body:
          'Take-home pay matters in BC because housing and daily costs can vary widely. Use net pay estimates to compare job offers, rent budgets, and relocation choices.',
      },
      {
        heading: 'Compare BC with Ontario and Alberta',
        body:
          'The same gross salary can lead to different net pay in BC, Ontario, Alberta, and Quebec. Province comparison helps you see the difference quickly.',
      },
    ],
    faq: [
      {
        question: 'Does BC have provincial income tax?',
        answer:
          'Yes. BC has its own provincial tax brackets in addition to federal income tax, CPP, and EI deductions.',
      },
      {
        question: 'Can I calculate Vancouver take-home pay?',
        answer:
          'Yes. Vancouver workers can use the BC calculator because provincial payroll deductions are based on British Columbia rules.',
      },
    ],
  },
  {
    slug: 'alberta-paycheck-calculator',
    title: 'Alberta Paycheck Calculator 2025/2026 - Take-Home Pay',
    description:
      'Calculate Alberta take-home pay with federal tax, Alberta tax, CPP, EI, salary, hourly wage, and bi-weekly pay estimates.',
    h1: 'Alberta Paycheck Calculator',
    kicker: 'Alberta take-home pay',
    primaryKeyword: 'Alberta paycheck calculator',
    intro:
      'Estimate your Alberta paycheque after federal tax, Alberta provincial tax, CPP, EI, and workplace deductions. Useful for Calgary, Edmonton, Red Deer, Lethbridge, Fort McMurray, and workers across Alberta.',
    examples: ['$80,000 after tax Alberta', '$35/hour after tax Calgary', 'Alberta salary calculator'],
    sections: [
      {
        heading: 'Alberta payroll deductions',
        body:
          'Alberta workers still pay federal tax, provincial tax, CPP, and EI. While Alberta is often seen as tax-friendly, your actual take-home pay depends on income level and deductions.',
      },
      {
        heading: 'Compare job offers',
        body:
          'Alberta salaries can look different after tax compared with Ontario, BC, and Quebec. Use the calculator and province comparison page before making a relocation decision.',
      },
      {
        heading: 'Hourly and shift work',
        body:
          'If your pay includes overtime, shift premiums, tips, or variable hours, use hourly wage or timesheet mode instead of a simple annual salary estimate.',
      },
    ],
    faq: [
      {
        question: 'Is Alberta take-home pay higher than Ontario?',
        answer:
          'It can be higher for many salaries, but the exact difference depends on income, pay frequency, and deductions.',
      },
      {
        question: 'Does Alberta have no income tax?',
        answer:
          'Alberta has no provincial sales tax, but it does have provincial income tax. Employees also pay federal tax, CPP, and EI.',
      },
    ],
  },
  {
    slug: 'quebec-paycheck-calculator',
    title: 'Quebec Paycheck Calculator 2025/2026 - Take-Home Pay',
    description:
      'Estimate Quebec take-home pay with federal tax, Quebec tax, payroll deductions, salary, hourly wage, and pay period estimates.',
    h1: 'Quebec Paycheck Calculator',
    kicker: 'Quebec take-home pay',
    primaryKeyword: 'Quebec paycheck calculator',
    intro:
      'Estimate take-home pay in Quebec after income tax and payroll deductions. Quebec payroll can differ from other provinces, so province-specific estimates are especially important.',
    examples: ['$100,000 after tax Quebec', '$65,000 after tax Quebec', 'Montreal take-home pay calculator', 'Quebec salary calculator'],
    sections: [
      {
        heading: 'Quebec has distinct payroll rules',
        body:
          'Quebec uses its own provincial tax system and payroll deductions. Workers in Montreal, Quebec City, Laval, Gatineau, and other cities should use province-specific estimates rather than a generic Canada-wide average.',
      },
      {
        heading: 'Compare Quebec with other provinces',
        body:
          'Quebec take-home pay can differ meaningfully from Ontario, Alberta, and BC. Use the province comparison tool to understand the tradeoff between taxes, salary, and benefits.',
      },
      {
        heading: 'Use estimates for planning',
        body:
          'Payroll rules can change and individual tax situations vary. Treat calculator output as a planning estimate and compare it with your official pay stub.',
      },
    ],
    faq: [
      {
        question: 'Is Quebec payroll different from other provinces?',
        answer:
          'Yes. Quebec has distinct provincial tax and payroll rules, so a Quebec-specific estimate is better than a generic Canadian salary calculator.',
      },
      {
        question: 'Can I compare Quebec and Ontario take-home pay?',
        answer:
          'Yes. Use the province comparison page to compare the same salary across Quebec, Ontario, Alberta, BC, and other provinces.',
      },
    ],
    relatedSalaryLinks: [
      { href: '/50000-after-tax-quebec', label: '$50,000 after tax Quebec' },
      { href: '/60000-after-tax-quebec', label: '$60,000 after tax Quebec' },
      { href: '/70000-after-tax-quebec', label: '$70,000 after tax Quebec' },
      { href: '/80000-after-tax-quebec', label: '$80,000 after tax Quebec' },
      { href: '/90000-after-tax-quebec', label: '$90,000 after tax Quebec' },
      { href: '/100000-after-tax-quebec', label: '$100,000 after tax Quebec' },
      { href: '/120000-after-tax-quebec', label: '$120,000 after tax Quebec' },
    ],
  },
];

const salaryAmounts = [
  35000, 40000, 45000, 48000, 50000, 52000, 55000, 58000, 60000, 62000, 65000,
  68000, 70000, 72000, 75000, 78000, 80000, 85000, 90000, 95000, 100000,
  110000, 120000, 130000, 150000, 175000, 200000,
];

const provinceSalaryConfigs = [
  {
    slug: 'ontario',
    name: 'Ontario',
    shortName: 'Ontario',
    cities: 'Toronto, Ottawa, Mississauga, Brampton, Hamilton, London, and workers across Ontario',
    taxNote:
      'Ontario workers usually see federal income tax, Ontario income tax, CPP, and EI deductions on every paycheque.',
    comparison: 'Alberta, British Columbia, Quebec, or another province',
    localNote:
      'This is especially useful when comparing Toronto-area rent, Ottawa public sector offers, or hybrid roles based in Ontario.',
  },
  {
    slug: 'bc',
    name: 'British Columbia',
    shortName: 'BC',
    cities: 'Vancouver, Victoria, Surrey, Burnaby, Kelowna, and workers across British Columbia',
    taxNote:
      'BC workers usually see federal income tax, British Columbia income tax, CPP, and EI deductions on every paycheque.',
    comparison: 'Ontario, Alberta, Quebec, or another province',
    localNote:
      'This is especially useful for Vancouver, Victoria, and Lower Mainland budgets where gross salary can feel very different from net pay.',
  },
  {
    slug: 'alberta',
    name: 'Alberta',
    shortName: 'Alberta',
    cities: 'Calgary, Edmonton, Red Deer, Lethbridge, Fort McMurray, and workers across Alberta',
    taxNote:
      'Alberta workers still pay federal income tax, Alberta income tax, CPP, and EI, even though Alberta has no provincial sales tax.',
    comparison: 'Ontario, British Columbia, Quebec, or another province',
    localNote:
      'This is especially useful for Calgary and Edmonton offers where Alberta income tax and no provincial sales tax are often part of the decision.',
  },
  {
    slug: 'quebec',
    name: 'Quebec',
    shortName: 'Quebec',
    cities: 'Montreal, Quebec City, Laval, Gatineau, Sherbrooke, and workers across Quebec',
    taxNote:
      'Quebec payroll is distinct from other provinces, with its own provincial tax and payroll deduction rules.',
    comparison: 'Ontario, Alberta, British Columbia, or another province',
    localNote:
      'This is especially useful for Montreal and Quebec City offers because Quebec payroll is different enough that generic Canada estimates can be misleading.',
  },
  {
    slug: 'manitoba',
    name: 'Manitoba',
    shortName: 'Manitoba',
    cities: 'Winnipeg, Brandon, Steinbach, Thompson, Portage la Prairie, and workers across Manitoba',
    taxNote:
      'Manitoba workers usually see federal income tax, Manitoba income tax, CPP, and EI deductions on every paycheque.',
    comparison: 'Ontario, Saskatchewan, Alberta, British Columbia, or another province',
    localNote:
      'This is especially useful for Winnipeg budgets where rent, transportation, and winter costs can make net pay feel different from gross salary.',
  },
  {
    slug: 'saskatchewan',
    name: 'Saskatchewan',
    shortName: 'Saskatchewan',
    cities: 'Saskatoon, Regina, Prince Albert, Moose Jaw, Yorkton, and workers across Saskatchewan',
    taxNote:
      'Saskatchewan workers usually see federal income tax, Saskatchewan income tax, CPP, and EI deductions on every paycheque.',
    comparison: 'Manitoba, Alberta, Ontario, British Columbia, or another province',
    localNote:
      'This is especially useful for Saskatoon and Regina offers where resource, agriculture, healthcare, and public sector salaries can vary by region.',
  },
  {
    slug: 'nova-scotia',
    name: 'Nova Scotia',
    shortName: 'Nova Scotia',
    cities: 'Halifax, Dartmouth, Sydney, Truro, New Glasgow, and workers across Nova Scotia',
    taxNote:
      'Nova Scotia workers usually see federal income tax, Nova Scotia income tax, CPP, and EI deductions on every paycheque.',
    comparison: 'New Brunswick, Prince Edward Island, Newfoundland and Labrador, Ontario, or another province',
    localNote:
      'This is especially useful for Halifax-area job offers where housing costs and provincial taxes can change how far a salary goes.',
  },
  {
    slug: 'new-brunswick',
    name: 'New Brunswick',
    shortName: 'New Brunswick',
    cities: 'Moncton, Saint John, Fredericton, Dieppe, Miramichi, and workers across New Brunswick',
    taxNote:
      'New Brunswick workers usually see federal income tax, New Brunswick income tax, CPP, and EI deductions on every paycheque.',
    comparison: 'Nova Scotia, Prince Edward Island, Quebec, Ontario, or another province',
    localNote:
      'This is especially useful for Moncton, Saint John, and Fredericton budgets where lower housing costs can still depend heavily on take-home pay.',
  },
  {
    slug: 'newfoundland',
    name: 'Newfoundland and Labrador',
    shortName: 'Newfoundland',
    cities: "St. John's, Mount Pearl, Corner Brook, Grand Falls-Windsor, Labrador City, and workers across Newfoundland and Labrador",
    taxNote:
      'Newfoundland and Labrador workers usually see federal income tax, provincial income tax, CPP, and EI deductions on every paycheque.',
    comparison: 'Nova Scotia, New Brunswick, Prince Edward Island, Alberta, or another province',
    localNote:
      "This is especially useful for St. John's and Labrador job offers where commuting, housing, and remote-work costs can change the real value of a salary.",
  },
  {
    slug: 'pei',
    name: 'Prince Edward Island',
    shortName: 'PEI',
    cities: 'Charlottetown, Summerside, Stratford, Cornwall, Montague, and workers across Prince Edward Island',
    taxNote:
      'PEI workers usually see federal income tax, Prince Edward Island income tax, CPP, and EI deductions on every paycheque.',
    comparison: 'Nova Scotia, New Brunswick, Newfoundland and Labrador, Ontario, or another province',
    localNote:
      'This is especially useful for Charlottetown and Summerside budgets where smaller-city costs and seasonal work can make net pay planning important.',
  },
  {
    slug: 'yukon',
    name: 'Yukon',
    shortName: 'Yukon',
    cities: 'Whitehorse, Dawson City, Watson Lake, Haines Junction, and workers across Yukon',
    taxNote:
      'Yukon workers usually see federal income tax, Yukon territorial tax, CPP, and EI deductions on every paycheque.',
    comparison: 'British Columbia, Alberta, Northwest Territories, Nunavut, or another province or territory',
    localNote:
      'This is especially useful for Whitehorse offers where northern living costs can make take-home pay more important than gross salary alone.',
  },
  {
    slug: 'northwest-territories',
    name: 'Northwest Territories',
    shortName: 'Northwest Territories',
    cities: 'Yellowknife, Hay River, Inuvik, Fort Smith, and workers across the Northwest Territories',
    taxNote:
      'Northwest Territories workers usually see federal income tax, territorial tax, CPP, and EI deductions on every paycheque.',
    comparison: 'Yukon, Nunavut, Alberta, British Columbia, or another province or territory',
    localNote:
      'This is especially useful for Yellowknife and northern job offers where housing, travel, and grocery costs make net pay planning essential.',
  },
  {
    slug: 'nunavut',
    name: 'Nunavut',
    shortName: 'Nunavut',
    cities: 'Iqaluit, Rankin Inlet, Cambridge Bay, Arviat, and workers across Nunavut',
    taxNote:
      'Nunavut workers usually see federal income tax, Nunavut territorial tax, CPP, and EI deductions on every paycheque.',
    comparison: 'Northwest Territories, Yukon, Alberta, Ontario, or another province or territory',
    localNote:
      'This is especially useful for Iqaluit and northern job offers where high living costs make after-tax income more practical than gross salary alone.',
  },
];

const formatSalary = (amount: number) => `$${amount.toLocaleString('en-CA')}`;
const formatFrenchSalary = (amount: number) => `${amount.toLocaleString('fr-CA')} $`;
const formatMoney = (amount: number) =>
  `$${Math.round(amount).toLocaleString('en-CA')}`;
const formatFrenchMoney = (amount: number) =>
  `${Math.round(amount).toLocaleString('fr-CA')} $`;

const provinceGuideLinks: Record<string, { href: string; label: string }> = {
  ontario: { href: '/blog/ontario-tax-guide-2025', label: 'Ontario tax guide' },
  bc: { href: '/blog/bc-tax-guide-2025', label: 'BC tax guide' },
  alberta: { href: '/blog/alberta-vs-ontario-taxes-2025', label: 'Alberta vs Ontario taxes' },
  quebec: { href: '/blog/minimum-wage-take-home-pay-canada-2026', label: 'Take-home pay by province' },
  'nova-scotia': { href: '/blog/minimum-wage-take-home-pay-canada-2026', label: 'Take-home pay by province' },
  'new-brunswick': { href: '/blog/minimum-wage-take-home-pay-canada-2026', label: 'Take-home pay by province' },
  newfoundland: { href: '/blog/minimum-wage-take-home-pay-canada-2026', label: 'Take-home pay by province' },
  pei: { href: '/blog/minimum-wage-take-home-pay-canada-2026', label: 'Take-home pay by province' },
};

const getSalaryBand = (amount: number) => {
  if (amount < 65000) {
    return {
      value: 'Entry to mid-level',
      detail:
        'Good for checking rent, transit, groceries, student debt, and emergency savings before committing to an offer.',
    };
  }

  if (amount < 100000) {
    return {
      value: 'Mid-career',
      detail:
        'Useful for comparing job offers where benefits, RRSP matching, bonus structure, and province choice can change the real value.',
    };
  }

  return {
    value: 'Senior income',
    detail:
      'At this level, marginal tax rate, bonus timing, RRSP room, and province choice become more important to after-tax planning.',
  };
};

const getFrenchSalaryBand = (amount: number) => {
  if (amount < 65000) {
    return {
      value: 'Début à mi-carrière',
      detail:
        "Utile pour vérifier le loyer, le transport, les dettes, l'épicerie et l'épargne d'urgence avant d'accepter une offre.",
    };
  }

  if (amount < 100000) {
    return {
      value: 'Mi-carrière',
      detail:
        "Utile pour comparer les avantages, le REER collectif, les primes, la fréquence de paie et le vrai montant disponible.",
    };
  }

  return {
    value: 'Revenu senior',
    detail:
      "À ce niveau, le taux marginal, les primes, les cotisations REER et le choix de province peuvent changer la planification après impôt.",
  };
};

const getRelatedSalaryLinks = (provinceSlug: string, provinceShortName: string, currentAmount: number) =>
  salaryAmounts
    .filter((amount) => amount !== currentAmount)
    .sort((a, b) => Math.abs(a - currentAmount) - Math.abs(b - currentAmount))
    .slice(0, 7)
    .sort((a, b) => a - b)
    .map((amount) => ({
      href: `/${amount}-after-tax-${provinceSlug}`,
      label: `${formatSalary(amount)} after tax ${provinceShortName}`,
    }));

const salaryProvinceLandingPages: LandingPage[] = provinceSalaryConfigs.flatMap((province) =>
  salaryAmounts.map((amount) => {
    const salary = formatSalary(amount);
    const slugSalary = String(amount);
    const keyword = `${salary} after tax ${province.shortName}`;
    const monthlyKeyword = `${salary} monthly take-home pay ${province.shortName}`;
    const biWeeklyKeyword = `${salary} bi-weekly pay ${province.shortName}`;
    const salaryBand = getSalaryBand(amount);
    const guideLink = provinceGuideLinks[province.slug] ?? {
      href: '/blog',
      label: 'Canadian payroll guides',
    };

    const breakdown = buildSalaryBreakdown(amount, province.slug, salaryAmounts);
    const { figures } = breakdown;
    const netAnnual = formatMoney(figures.netAnnual);
    const netMonthly = formatMoney(figures.netMonthly);
    const netBiWeekly = formatMoney(figures.netBiWeekly);
    const totalTax = formatMoney(figures.federalTax + figures.provincialTax);
    const averageRate = `${(figures.averageTaxRate * 100).toFixed(1)}%`;
    const deductionRate = `${(figures.totalDeductionRate * 100).toFixed(1)}%`;
    const topProvince = breakdown.provinceComparison[0];
    const bottomProvince = breakdown.provinceComparison[breakdown.provinceComparison.length - 1];
    const provinceSpread = formatMoney(topProvince.netAnnual - bottomProvince.netAnnual);

    const page: LandingPage = {
      slug: `${slugSalary}-after-tax-${province.slug}`,
      title: `${salary} After Tax in ${province.shortName}: ${netAnnual} Take-Home (2025/26)`,
      description: `A ${salary} salary in ${province.name} leaves about ${netAnnual} after tax in 2025/2026 — roughly ${netMonthly}/month or ${netBiWeekly} bi-weekly. See the full federal tax, ${province.shortName} tax, CPP, and EI breakdown.`,
      h1: `${salary} After Tax in ${province.shortName}`,
      kicker: 'Salary after tax breakdown',
      primaryKeyword: keyword,
      intro: `If you earn ${salary} per year in ${province.name}, your estimated take-home pay is about ${netAnnual} — ${netMonthly} per month or ${netBiWeekly} every two weeks. This page breaks down exactly where the other ${formatMoney(figures.totalDeductions)} goes, for workers in ${province.cities}.`,
      examples: [
        `${salary} salary after tax ${province.shortName}`,
        `${salary} take-home pay ${province.shortName}`,
        biWeeklyKeyword,
        monthlyKeyword,
      ],
      sections: [
        {
          heading: `What affects ${salary} take-home pay in ${province.shortName}?`,
          body: `${province.taxNote} The estimate on this page assumes the basic personal amount only. Your actual net pay also depends on pay frequency, credits, RRSP contributions, workplace benefits, union dues, insurance premiums, and any other deductions on your pay stub.`,
        },
        {
          heading: 'Use this before accepting a job offer',
          body: `A ${salary} offer is easier to judge in net terms: about ${netMonthly} per month to cover rent, transportation, debt payments, and savings. If the employer offers RRSP matching or health benefits, the real value is higher than the cash paycheque alone. Run your exact situation through the free calculator before you negotiate.`,
        },
        {
          heading: `${salary} monthly and bi-weekly pay in ${province.shortName}`,
          body: `Budgeting usually happens monthly or per paycheque, not annually. On ${salary} in ${province.name}, expect roughly ${netMonthly} per month, ${netBiWeekly} bi-weekly, or ${formatMoney(figures.netWeekly)} per week after deductions. ${province.localNote}`,
        },
        {
          heading: `Compare ${province.shortName} with other provinces`,
          body: `The same ${salary} salary keeps the most in ${topProvince.shortName} (about ${formatMoney(topProvince.netAnnual)}) and the least in ${bottomProvince.shortName} (about ${formatMoney(bottomProvince.netAnnual)}) — a gap of ${provinceSpread} per year. If you are weighing offers in ${province.comparison}, compare after-tax pay in the table above before assuming a higher gross salary means more spending money.`,
        },
      ],
      faq: [
        {
          question: `How much is ${salary} after tax in ${province.shortName}?`,
          answer: `A ${salary} annual salary in ${province.name} leaves approximately ${netAnnual} after tax in 2025/2026 — about ${netMonthly} per month or ${netBiWeekly} bi-weekly. This assumes federal tax, ${province.shortName} tax, CPP, and EI with the basic personal amount only.`,
        },
        {
          question: `What is ${salary} bi-weekly after tax in ${province.shortName}?`,
          answer: `On a ${salary} salary in ${province.name}, each bi-weekly paycheque is approximately ${netBiWeekly} after deductions (26 paycheques per year). Semi-monthly pay would be about ${formatMoney(figures.netSemiMonthly)} per cheque (24 per year).`,
        },
        {
          question: `How much tax do I pay on ${salary} in ${province.shortName}?`,
          answer: `On ${salary} in ${province.name}, you pay roughly ${formatMoney(figures.federalTax)} federal tax and ${formatMoney(figures.provincialTax)} provincial tax — ${totalTax} in income tax total, an average tax rate of ${averageRate}. Adding ${formatMoney(figures.pensionContribution)} CPP and ${formatMoney(figures.eiPremium)} EI brings total deductions to ${formatMoney(figures.totalDeductions)} (${deductionRate} of gross).`,
        },
        {
          question: `Is ${salary} a good salary in ${province.shortName}?`,
          answer: `${salary} in ${province.name} works out to about ${netMonthly} per month after tax. Whether that is comfortable depends on your city, rent, household size, debt, and savings goals — net pay is the better starting point for that judgment than gross salary.`,
        },
      ],
      relatedSalaryLinks: getRelatedSalaryLinks(province.slug, province.shortName, amount),
      highlights: [
        {
          label: 'Net per year',
          value: netAnnual,
          detail: `Estimated take-home pay on ${salary} gross, after federal tax, ${province.shortName} tax, CPP, and EI.`,
        },
        {
          label: 'Net per month',
          value: netMonthly,
          detail: `What lands in your account monthly. Bi-weekly paycheques are about ${netBiWeekly}.`,
        },
        {
          label: 'Salary context',
          value: salaryBand.value,
          detail: salaryBand.detail,
        },
      ],
      nextSteps: [
        {
          title: `Run your exact ${province.shortName} numbers`,
          body: `Add RRSP contributions, benefits, and your real pay frequency to refine this ${salary} estimate.`,
          href: '/',
          label: 'Open calculator',
        },
        {
          title: `Compare ${province.shortName} with another province`,
          body: `Use the same ${salary} salary across provinces before assuming a higher gross offer means more spending money.`,
          href: '/compare-provinces',
          label: 'Compare provinces',
        },
        {
          title: `Read the ${province.shortName} context`,
          body: 'Pair the calculator with a guide on local salary, tax, and cost-of-living tradeoffs.',
          href: guideLink.href,
          label: guideLink.label,
        },
      ],
      salaryBreakdown: breakdown,
    };

    if (province.slug === 'quebec') {
      page.alternateLanguages = [
        {
          href: `/fr/${slugSalary}-apres-impot-quebec`,
          hrefLang: 'fr-CA',
          label: `Français - ${formatFrenchSalary(amount)} après impôt Québec`,
        },
      ];
    }

    return page;
  })
);

// Keep French Quebec pages in lockstep with the English Quebec set so every
// hreflang alternate link resolves to a real page.
const frenchQuebecAmounts = salaryAmounts;

const getRelatedFrenchQuebecLinks = (currentSlug: string, currentAmount?: number) =>
  frenchQuebecAmounts
    .filter((amount) => amount !== currentAmount)
    .sort((a, b) => Math.abs(a - (currentAmount ?? 70000)) - Math.abs(b - (currentAmount ?? 70000)))
    .slice(0, 7)
    .sort((a, b) => a - b)
    .map((amount) => ({
      href: `/fr/${amount}-apres-impot-quebec`,
      label: `${formatFrenchSalary(amount)} après impôt Québec`,
    }))
    .filter((link) => link.href !== `/fr/${currentSlug}`);

const frenchCoreLandingPages: LandingPage[] = [
  {
    slug: 'calculateur-salaire-net-quebec',
    title: 'Calculateur de salaire net Québec 2025/2026 - Paie après impôt',
    description:
      'Calculez votre salaire net au Québec en 2025/2026 avec impôt fédéral, impôt du Québec, RRQ, assurance emploi, RQAP et paie nette.',
    h1: 'Calculateur de salaire net au Québec',
    kicker: 'Salaire brut en paie nette',
    primaryKeyword: 'calculateur salaire net Québec',
    intro:
      "Estimez ce qu'un salaire brut devient en paie nette au Québec. CanPay Insights aide les travailleurs de Montréal, Québec, Laval, Gatineau et Sherbrooke à comparer le salaire annuel, les retenues, la RRQ, l'assurance emploi, le RQAP et le montant qui arrive dans le compte bancaire.",
    examples: [
      'calcul salaire net Québec',
      'salaire après impôt Québec',
      'paie nette Montréal',
      'calculateur retenues Québec',
    ],
    sections: [
      {
        heading: 'Pourquoi utiliser un calculateur pour le Québec?',
        body:
          "Le Québec a ses propres règles de paie, incluant l'impôt provincial, la RRQ et le RQAP. Une estimation canadienne générale peut être utile, mais une page spécifique au Québec aide mieux à comprendre la paie nette.",
      },
      {
        heading: 'Ce qui réduit votre paie',
        body:
          "Les retenues habituelles comprennent l'impôt fédéral, l'impôt du Québec, la RRQ, l'assurance emploi, le RQAP et parfois des avantages sociaux, cotisations REER, assurances, frais syndicaux ou autres déductions.",
      },
      {
        heading: "Utile avant une offre d'emploi",
        body:
          "Avant d'accepter une offre à Montréal ou ailleurs au Québec, comparez le salaire brut avec la paie mensuelle, bimensuelle ou aux deux semaines. Le montant net est plus utile pour planifier le loyer, le transport, les dettes et l'épargne.",
      },
    ],
    faq: [
      {
        question: 'Comment calculer le salaire net au Québec?',
        answer:
          "Commencez avec le salaire brut, puis soustrayez l'impôt fédéral, l'impôt du Québec, la RRQ, l'assurance emploi, le RQAP et les déductions de l'employeur. CanPay Insights donne une estimation rapide pour 2025/2026.",
      },
      {
        question: 'Le Québec est-il différent des autres provinces?',
        answer:
          "Oui. Le Québec utilise son propre système d'impôt provincial et des retenues comme la RRQ et le RQAP, donc la paie nette peut différer d'une estimation faite pour l'Ontario, l'Alberta ou la Colombie-Britannique.",
      },
    ],
    relatedSalaryLinks: getRelatedFrenchQuebecLinks('calculateur-salaire-net-quebec'),
    highlights: [
      {
        label: 'Idéal pour',
        value: 'Offres au Québec',
        detail:
          "Comparez le salaire brut d'une offre avec une estimation du montant qui arrive vraiment dans votre compte.",
      },
      {
        label: 'Retenues',
        value: 'Impôt, RRQ, RQAP',
        detail:
          "Le Québec a des retenues distinctes, donc une estimation canadienne générale peut être trop vague.",
      },
      {
        label: 'À vérifier',
        value: 'Paie nette',
        detail:
          "Passez du salaire annuel à la paie mensuelle, semi-mensuelle, aux deux semaines ou hebdomadaire.",
      },
    ],
    nextSteps: [
      {
        title: 'Calculer votre paie nette',
        body: 'Ouvrez le calculateur, choisissez Québec et comparez le salaire annuel avec chaque fréquence de paie.',
        href: '/',
        label: 'Ouvrir le calculateur',
      },
      {
        title: 'Comparer Québec et Ontario',
        body: "Utilisez le même salaire brut pour voir l'écart de paie nette entre provinces.",
        href: '/compare-provinces',
        label: 'Comparer les provinces',
      },
      {
        title: 'Lire le guide Québec',
        body: 'Ajoutez le contexte sur les salaires, Montréal, la RRQ, le RQAP et le coût de la vie.',
        href: '/blog/guide-paie-quebec-2026',
        label: 'Guide Québec',
      },
    ],
    alternateLanguages: [
      {
        href: '/quebec-paycheck-calculator',
        hrefLang: 'en-CA',
        label: 'English - Quebec Paycheck Calculator',
      },
    ],
  },
];

const frenchQuebecSalaryPages: LandingPage[] = frenchQuebecAmounts.map((amount) => {
  const salary = formatFrenchSalary(amount);
  const slug = `${amount}-apres-impot-quebec`;
  const englishSlug = `${amount}-after-tax-quebec`;
  const salaryBand = getFrenchSalaryBand(amount);

  const breakdown = buildSalaryBreakdown(amount, 'quebec', salaryAmounts);
  // Point in-province salary links at the French pages instead of the English ones.
  const frenchBreakdown: SalaryBreakdown = {
    ...breakdown,
    nearbySalaries: breakdown.nearbySalaries.map((entry) => ({
      ...entry,
      href: `/fr/${entry.amount}-apres-impot-quebec`,
    })),
  };
  const { figures } = breakdown;
  const netAnnual = formatFrenchMoney(figures.netAnnual);
  const netMonthly = formatFrenchMoney(figures.netMonthly);
  const netBiWeekly = formatFrenchMoney(figures.netBiWeekly);
  const totalTax = formatFrenchMoney(figures.federalTax + figures.provincialTax);
  const averageRate = `${(figures.averageTaxRate * 100).toFixed(1).replace('.', ',')} %`;

  return {
    slug,
    title: `${salary} après impôt au Québec : ${netAnnual} net (2025/2026)`,
    description: `Un salaire de ${salary} au Québec laisse environ ${netAnnual} après impôt en 2025/2026 — soit ${netMonthly} par mois. Voyez le détail : impôt fédéral, impôt du Québec, RRQ, RQAP et assurance emploi.`,
    h1: `${salary} après impôt au Québec`,
    kicker: 'Salaire net détaillé',
    primaryKeyword: `${salary} après impôt Québec`,
    intro: `Avec un salaire annuel de ${salary} au Québec, votre paie nette estimée est d'environ ${netAnnual} — soit ${netMonthly} par mois ou ${netBiWeekly} aux deux semaines. Cette page détaille où vont les ${formatFrenchMoney(figures.totalDeductions)} de retenues pour les travailleurs de Montréal, Québec, Laval, Gatineau et Sherbrooke.`,
    examples: [
      `${salary} salaire net Québec`,
      `${salary} après impôt Québec`,
      `${salary} paie nette Montréal`,
      `${salary} aux deux semaines Québec`,
    ],
    sections: [
      {
        heading: `Ce qui affecte ${salary} net au Québec`,
        body:
          "L'estimation de cette page suppose le montant personnel de base seulement. Votre paie réelle dépend aussi de la fréquence de paie, des crédits personnels, des cotisations REER, des avantages sociaux et des déductions de l'employeur.",
      },
      {
        heading: 'Salaire mensuel et paie aux deux semaines',
        body: `Le budget se planifie par mois ou par paie, pas par année. Sur ${salary} au Québec, comptez environ ${netMonthly} par mois, ${netBiWeekly} aux deux semaines ou ${formatFrenchMoney(figures.netWeekly)} par semaine après retenues.`,
      },
      {
        heading: 'Avant de signer une offre',
        body: `Un salaire brut de ${salary} peut sembler clair, mais le budget dépend du montant qui arrive vraiment dans votre compte : environ ${netMonthly} par mois. Vérifiez la paie nette avant de comparer un poste au Québec avec une offre en Ontario, en Alberta ou en Colombie-Britannique.`,
      },
    ],
    faq: [
      {
        question: `Combien donne ${salary} après impôt au Québec?`,
        answer: `Un salaire annuel de ${salary} au Québec laisse environ ${netAnnual} après impôt en 2025/2026 — soit ${netMonthly} par mois ou ${netBiWeekly} aux deux semaines, avec le montant personnel de base seulement.`,
      },
      {
        question: `Quelle est la paie aux deux semaines pour ${salary} au Québec?`,
        answer: `Sur un salaire de ${salary} au Québec, chaque paie aux deux semaines est d'environ ${netBiWeekly} après retenues (26 paies par année). En paie semi-mensuelle, comptez environ ${formatFrenchMoney(figures.netSemiMonthly)} par chèque.`,
      },
      {
        question: `Combien d'impôt sur ${salary} au Québec?`,
        answer: `Sur ${salary} au Québec, comptez environ ${formatFrenchMoney(figures.federalTax)} d'impôt fédéral et ${formatFrenchMoney(figures.provincialTax)} d'impôt du Québec — ${totalTax} au total, un taux moyen de ${averageRate}. S'ajoutent ${formatFrenchMoney(figures.pensionContribution)} de RRQ et RQAP et ${formatFrenchMoney(figures.eiPremium)} d'assurance emploi.`,
      },
      {
        question: `${salary} est-il un bon salaire au Québec?`,
        answer: `${salary} au Québec donne environ ${netMonthly} par mois après impôt. Le confort dépend de la ville, du loyer, du transport, des dettes et de vos objectifs d'épargne — la paie nette est un meilleur point de départ que le brut.`,
      },
    ],
    relatedSalaryLinks: getRelatedFrenchQuebecLinks(slug, amount),
    highlights: [
      {
        label: 'Net par année',
        value: netAnnual,
        detail: `Paie nette estimée sur ${salary} brut, après impôt fédéral, impôt du Québec, RRQ, RQAP et assurance emploi.`,
      },
      {
        label: 'Net par mois',
        value: netMonthly,
        detail: `Ce qui arrive dans votre compte chaque mois. Aux deux semaines : environ ${netBiWeekly}.`,
      },
      {
        label: 'Contexte salaire',
        value: salaryBand.value,
        detail: salaryBand.detail,
      },
    ],
    salaryBreakdown: frenchBreakdown,
    nextSteps: [
      {
        title: 'Calculer le net au Québec',
        body: `Entrez ${salary}, choisissez Québec et comparez le net annuel, mensuel et aux deux semaines.`,
        href: '/',
        label: 'Ouvrir le calculateur',
      },
      {
        title: 'Comparer avec une autre province',
        body: `Le même salaire brut de ${salary} peut donner une paie nette différente ailleurs au Canada.`,
        href: '/compare-provinces',
        label: 'Comparer les provinces',
      },
      {
        title: 'Lire le guide salaire Québec',
        body: 'Ajoutez le contexte sur Montréal, Québec, les retenues provinciales et le coût de la vie.',
        href: '/blog/guide-paie-quebec-2026',
        label: 'Guide Québec',
      },
    ],
    alternateLanguages: [
      {
        href: `/${englishSlug}`,
        hrefLang: 'en-CA',
        label: `English - ${formatSalary(amount)} after tax Quebec`,
      },
    ],
  };
});

export const frenchLandingPages: LandingPage[] = [
  ...frenchCoreLandingPages,
  ...frenchQuebecSalaryPages,
];

export const landingPages: LandingPage[] = [
  ...coreLandingPages,
  ...salaryProvinceLandingPages,
];

export function getLandingPage(slug: string) {
  return landingPages.find((page) => page.slug === slug);
}

export function getFrenchLandingPage(slug: string) {
  return frenchLandingPages.find((page) => page.slug === slug);
}
