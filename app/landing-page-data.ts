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
    relatedSalaryLinks: [
      { href: '/65000-after-tax-ontario', label: '$65,000 after tax Ontario' },
      { href: '/70000-after-tax-bc', label: '$70,000 after tax BC' },
      { href: '/80000-after-tax-alberta', label: '$80,000 after tax Alberta' },
      { href: '/100000-after-tax-quebec', label: '$100,000 after tax Quebec' },
      { href: '/90000-after-tax-quebec', label: '$90,000 after tax Quebec' },
      { href: '/120000-after-tax-quebec', label: '$120,000 after tax Quebec' },
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

const defaultSalaryAmounts = [50000, 60000, 65000, 70000, 80000, 90000, 100000, 120000];

const salaryAmountsByProvince: Record<string, number[]> = {
  quebec: [45000, 50000, 55000, 60000, 65000, 70000, 75000, 80000, 90000, 100000, 120000, 150000],
};

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
];

const formatSalary = (amount: number) => `$${amount.toLocaleString('en-CA')}`;

const getSalaryAmountsForProvince = (provinceSlug: string) =>
  salaryAmountsByProvince[provinceSlug] ?? defaultSalaryAmounts;

const getRelatedSalaryLinks = (provinceSlug: string, provinceShortName: string, currentAmount: number) =>
  getSalaryAmountsForProvince(provinceSlug)
    .filter((amount) => amount !== currentAmount)
    .slice(0, 7)
    .map((amount) => ({
      href: `/${amount}-after-tax-${provinceSlug}`,
      label: `${formatSalary(amount)} after tax ${provinceShortName}`,
    }));

const salaryProvinceLandingPages: LandingPage[] = provinceSalaryConfigs.flatMap((province) =>
  getSalaryAmountsForProvince(province.slug).map((amount) => {
    const salary = formatSalary(amount);
    const slugSalary = String(amount);
    const keyword = `${salary} after tax ${province.shortName}`;
    const monthlyKeyword = `${salary} monthly take-home pay ${province.shortName}`;
    const biWeeklyKeyword = `${salary} bi-weekly pay ${province.shortName}`;

    return {
      slug: `${slugSalary}-after-tax-${province.slug}`,
      title: `${salary} After Tax in ${province.shortName} 2025/2026 - Take-Home Pay`,
      description: `Estimate ${salary} after tax in ${province.name} for 2025/2026. Calculate take-home pay with federal tax, ${province.shortName} tax, CPP, EI, and paycheque estimates.`,
      h1: `${salary} After Tax in ${province.shortName}`,
      kicker: 'Salary after tax estimate',
      primaryKeyword: keyword,
      intro: `Estimate what a ${salary} annual salary becomes after tax in ${province.name}. CanPay Insights helps workers in ${province.cities} compare gross salary, net pay, CPP, EI, and paycheque amounts.`,
      examples: [
        `${salary} salary after tax ${province.shortName}`,
        `${salary} take-home pay ${province.shortName}`,
        biWeeklyKeyword,
        monthlyKeyword,
      ],
      sections: [
        {
          heading: `What affects ${salary} take-home pay in ${province.shortName}?`,
          body: `${province.taxNote} Your actual net pay also depends on pay frequency, credits, RRSP contributions, workplace benefits, union dues, insurance premiums, and any other deductions on your pay stub.`,
        },
        {
          heading: 'Use this before accepting a job offer',
          body: `A ${salary} offer is easier to understand when you compare annual gross pay with monthly, semi-monthly, or bi-weekly net pay. Use the calculator to estimate what may actually land in your bank account before budgeting rent, transportation, debt payments, or savings.`,
        },
        {
          heading: `${salary} monthly and bi-weekly pay in ${province.shortName}`,
          body: `Many workers search for ${salary} after tax because rent, debt payments, groceries, transit, and savings goals are monthly or bi-weekly. Use CanPay Insights to switch pay frequency and compare estimated annual net pay, monthly take-home pay, semi-monthly pay, bi-weekly pay, and weekly pay in ${province.name}. ${province.localNote}`,
        },
        {
          heading: `Compare ${province.shortName} with other provinces`,
          body: `The same ${salary} salary can produce different take-home pay in ${province.comparison}. If you are planning a move, compare provinces before assuming a higher gross salary means a higher after-tax income.`,
        },
      ],
      faq: [
        {
          question: `How much is ${salary} after tax in ${province.shortName}?`,
          answer: `It depends on your pay frequency, deductions, credits, and tax situation. Use CanPay Insights to estimate ${salary} after federal tax, ${province.shortName} tax, CPP, EI, and workplace deductions.`,
        },
        {
          question: `What is ${salary} bi-weekly after tax in ${province.shortName}?`,
          answer: `Bi-weekly take-home pay depends on payroll deductions and your exact tax situation. Enter ${salary} as annual salary, choose ${province.name}, and switch the pay frequency to estimate each paycheque.`,
        },
        {
          question: `Is ${salary} a good salary in ${province.shortName}?`,
          answer: `It depends on your city, rent, household size, debt, transportation costs, and savings goals. Take-home pay is the better starting point for budgeting than gross salary alone.`,
        },
      ],
      relatedSalaryLinks: getRelatedSalaryLinks(province.slug, province.shortName, amount),
    };
  })
);

export const landingPages: LandingPage[] = [
  ...coreLandingPages,
  ...salaryProvinceLandingPages,
];

export function getLandingPage(slug: string) {
  return landingPages.find((page) => page.slug === slug);
}
