import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getSalaryFigures, PROVINCE_SEO_CONFIGS } from '../../../lib/salaryFigures';
import { provinceLabel } from '../../../lib/provinceNames';
import { calculateFromAnnualSalary } from '../../../utils/taxEngine';
import { PayFrequency } from '../../../types';

/**
 * Chinese answer pages for the questions Chinese-speaking users actually type
 * (GEO audit 2026-09-30: /zh ranked #1 for two Chinese prompts and was absent
 * from three, because one page could not answer them all).
 *
 * Every figure is computed by the engine at render time, the same way /zh does,
 * so a rate change can never leave a Chinese page quoting an old number.
 * Facts that are not engine output (newcomer rules) were checked on canada.ca
 * on 2026-10-01 and cite it.
 */
const BASE_URL = 'https://canpayinsights.ca';
const money = (n: number) => `$${Math.round(n).toLocaleString('en-CA')}`;
const pct = (r: number) => `${(r * 100).toFixed(1)}%`;
const zhName = (slug: string, en: string) => provinceLabel(slug, 'zh', en);

type Row = { label: string; cells: string[] };
type Page = {
  title: string;
  description: string;
  h1: string;
  answer: string;
  table: { caption: string; head: string[]; rows: Row[] };
  sections: { h: string; b: string }[];
  faq: { q: string; a: string }[];
};


const MAIN4 = ['ontario', 'bc', 'alberta', 'quebec'];
const nameOf = (slug: string) => {
  const c = PROVINCE_SEO_CONFIGS.find((x) => x.slug === slug)!;
  return zhName(c.slug, c.name);
};
/** Extra take-home from claiming the TD1 spouse amount (spouse with no income). */
const spouseGain = (slug: string, salary: number) => {
  const prov = PROVINCE_SEO_CONFIGS.find((x) => x.slug === slug)!.name;
  const base = { province: prov, annualSalary: salary, payFrequency: PayFrequency.BI_WEEKLY };
  return calculateFromAnnualSalary({ ...base, spouseNetIncome: 0 }).netPayAnnual - calculateFromAnnualSalary(base).netPayAnnual;
};

function hourlyPage(rate: number): Page {
  const annual = rate * 2080;
  const rows = MAIN4.map((sl) => ({ sl, f: getSalaryFigures(annual, sl) }));
  const on = rows[0].f;
  return {
    title: `加拿大时薪 $${rate} 一年到手多少？2026 各省对比`,
    description: `时薪 $${rate}、全职一年约 ${money(annual)} 税前。2026 年在安大略省到手约 ${money(on.netAnnual)}，每月约 ${money(on.netMonthly)}。安省、BC、阿省、魁省对比。`,
    h1: `时薪 $${rate} 一年到手多少？`,
    answer: `时薪 $${rate}，每周 40 小时、全年 52 周，税前约 ${money(annual)}。2026 年在安大略省到手约 ${money(on.netAnnual)}（每月约 ${money(on.netMonthly)}，每两周约 ${money(on.netBiWeekly)}），相当于每小时到手约 $${on.netHourly.toFixed(2)}。`,
    table: {
      caption: `时薪 $${rate}、全职（2,080 小时）的 2026 年税后（单身、只用基本免税额）`,
      head: ['省', '年到手', '每月', '每小时到手'],
      rows: rows.map(({ sl, f }) => ({ label: nameOf(sl), cells: [money(f.netAnnual), money(f.netMonthly), `$${f.netHourly.toFixed(2)}`] })),
    },
    sections: [
      { h: '怎么算的', b: `税前年收入 = 时薪 × 2,080 小时（每周 40 小时 × 52 周）。再扣联邦税、省税、CPP 和 EI（魁省为 QPP、QPIP）。兼职或有加班的，用首页计算器按实际小时算。` },
      { h: '实际可能更少的原因', b: '公司福利保费、工会会费、退休金计划会从工资单里再扣；没带薪的假期和病假也会让全年小时数少于 2,080。' },
    ],
    faq: [
      { q: `时薪 $${rate} 在安省每月到手多少？`, a: `全职的话，2026 年每月约 ${money(on.netMonthly)}。` },
      { q: '时薪工和年薪工扣税一样吗？', a: '一样。扣税只看收入多少，和按时薪还是年薪发无关。' },
    ],
  };
}

function salaryPage(salary: number, slug: string): Page {
  const f = getSalaryFigures(salary, slug);
  const name = nameOf(slug);
  const k = salary / 10000;
  const ladder = [salary - 10000, salary, salary + 10000];
  return {
    title: `${name}年薪 ${k} 万到手多少？2026 税后计算`,
    description: `${name}年薪 ${money(salary)}，2026 年到手约 ${money(f.netAnnual)}，每月约 ${money(f.netMonthly)}。已扣联邦税、省税、CPP、EI。`,
    h1: `${name}年薪 ${k} 万到手多少？`,
    answer: `年薪 ${money(salary)} 在${name}，2026 年到手约 ${money(f.netAnnual)}，每月约 ${money(f.netMonthly)}，每两周约 ${money(f.netBiWeekly)}。一共扣约 ${money(f.totalDeductions)}：联邦税 ${money(f.federalTax)}、省税 ${money(f.provincialTax)}${slug === 'ontario' ? '（含安省健康保费）' : ''}、CPP ${money(f.pensionContribution)}、EI ${money(f.eiPremium)}。`,
    table: {
      caption: `${name}附近收入的 2026 年税后（单身、只用基本免税额）`,
      head: ['年薪', '年到手', '每月', '总扣除比例'],
      rows: ladder.map((g) => { const x = getSalaryFigures(g, slug); return { label: money(g), cells: [money(x.netAnnual), money(x.netMonthly), pct(x.totalDeductionRate)] }; }),
    },
    sections: [
      { h: '加薪 1 万能多拿多少？', b: `从 ${money(salary)} 加到 ${money(salary + 10000)}，到手多约 ${money(getSalaryFigures(salary + 10000, slug).netAnnual - f.netAnnual)}。加薪永远不会让到手变少，只是多出来的部分扣得更多。` },
      { h: '实际可能更少的原因', b: '公司福利保费、退休金计划、工会会费、团体 RRSP 都会从工资单里再扣。本页只算法定扣除。' },
    ],
    faq: [
      { q: `${name}年薪 ${k} 万每月到手多少？`, a: `2026 年约 ${money(f.netMonthly)}。` },
      { q: '有配偶要养能少扣税吗？', a: `能。在 TD1 表上申报配偶抵免，雇主就会少扣税。配偶没有收入时，${name}这个收入一年约多到手 ${money(spouseGain(slug, salary))}。` },
    ],
  };
}

function build(slug: string): Page | null {
  if (slug === '100k-after-tax') {
    const rows = PROVINCE_SEO_CONFIGS.map((c) => ({ c, f: getSalaryFigures(100000, c.slug) })).sort(
      (a, b) => b.f.netAnnual - a.f.netAnnual,
    );
    const on = getSalaryFigures(100000, 'ontario');
    const bc = getSalaryFigures(100000, 'bc');
    const top = rows[0];
    const bottom = rows[rows.length - 1];
    return {
      title: '加拿大年薪十万到手多少？2026 各省税后对比',
      description: `年薪 $100,000 在加拿大 2026 年到手多少：安大略省约 ${money(on.netAnnual)}，BC 省约 ${money(bc.netAnnual)}。13 个省与地区逐一对比，已扣联邦税、省税、CPP、EI。`,
      h1: '加拿大年薪十万到手多少？',
      answer: `年薪 $100,000，2026 年在安大略省到手约 ${money(on.netAnnual)}（每月约 ${money(on.netMonthly)}），在 BC 省约 ${money(bc.netAnnual)}（每月约 ${money(bc.netMonthly)}）。13 个省与地区里，${zhName(top.c.slug, top.c.name)}到手最多（约 ${money(top.f.netAnnual)}），${zhName(bottom.c.slug, bottom.c.name)}最少（约 ${money(bottom.f.netAnnual)}）。`,
      table: {
        caption: '年薪 $100,000 的 2026 年税后到手（单身、只用基本免税额）',
        head: ['省 / 地区', '年到手', '每月', '总扣除比例'],
        rows: rows.map(({ c, f }) => ({
          label: zhName(c.slug, c.name),
          cells: [money(f.netAnnual), money(f.netMonthly), pct(f.totalDeductionRate)],
        })),
      },
      sections: [
        {
          h: '扣掉的是哪几项？',
          b: `以安大略省为例：联邦税约 ${money(on.federalTax)}，省税约 ${money(on.provincialTax)}（含安省健康保费），CPP/CPP2 约 ${money(on.pensionContribution)}，EI 约 ${money(on.eiPremium)}。除魁北克外，联邦税、CPP、EI 各省一样，差别主要在省税；魁北克交 QPP 和 QPIP，联邦税另有减免，算法不同。`,
        },
        {
          h: '为什么实际到手可能更少？',
          b: '公司福利保费、退休金计划、工会会费、团体 RRSP 都会从工资单里再扣。本页只算法定扣除。',
        },
      ],
      faq: [
        {
          q: '年薪十万在安大略省税后多少？',
          a: `2026 年约 ${money(on.netAnnual)}，每月约 ${money(on.netMonthly)}，每两周约 ${money(on.netBiWeekly)}。`,
        },
        {
          q: '年薪十万在 BC 省税后多少？',
          a: `2026 年约 ${money(bc.netAnnual)}，每月约 ${money(bc.netMonthly)}。温哥华没有市级所得税，全 BC 省算法相同。`,
        },
      ],
    };
  }

  if (slug === 'bc-payroll-tax') {
    const salaries = [40000, 50000, 60000, 80000, 100000, 120000];
    const f60 = getSalaryFigures(60000, 'bc');
    return {
      title: 'BC 省工资扣税多少？2026 年 BC 税后工资对照表',
      description: `2026 年 BC 省工资扣税：年薪 $60,000 扣联邦税 ${money(f60.federalTax)}、BC 省税 ${money(f60.provincialTax)}、CPP ${money(f60.pensionContribution)}、EI ${money(f60.eiPremium)}，到手约 ${money(f60.netAnnual)}。`,
      h1: 'BC 省工资扣税多少？',
      answer: `在 BC 省，年薪 $60,000 在 2026 年一共扣约 ${money(f60.totalDeductions)}：联邦税 ${money(f60.federalTax)}、BC 省税 ${money(f60.provincialTax)}、CPP ${money(f60.pensionContribution)}、EI ${money(f60.eiPremium)}，到手约 ${money(f60.netAnnual)}（每月约 ${money(f60.netMonthly)}）。BC 省税最低一档 2026 年是 5.60%。`,
      table: {
        caption: 'BC 省 2026 年各收入的扣除与到手（单身、只用基本免税额）',
        head: ['年薪', '联邦税', 'BC 省税', 'CPP + EI', '年到手'],
        rows: salaries.map((s) => {
          const f = getSalaryFigures(s, 'bc');
          return {
            label: money(s),
            cells: [money(f.federalTax), money(f.provincialTax), money(f.pensionContribution + f.eiPremium), money(f.netAnnual)],
          };
        }),
      },
      sections: [
        {
          h: '2026 年 BC 省有什么变化？',
          b: 'BC 省最低一档税率从 5.06% 提高到 5.60%，所以同样的工资，2026 年下半年的工资单可能比上半年少一点。',
        },
        {
          h: '时薪工也一样算吗？',
          b: '一样。把时薪乘以一年的工作小时数（全职约 2,080 小时）就是年收入，扣除规则相同。用首页计算器可以直接按时薪算。',
        },
      ],
      faq: [
        {
          q: 'BC 省年薪 $80,000 到手多少？',
          a: `2026 年约 ${money(getSalaryFigures(80000, 'bc').netAnnual)}，每月约 ${money(getSalaryFigures(80000, 'bc').netMonthly)}。`,
        },
        {
          q: '温哥华和 BC 其他城市扣税一样吗？',
          a: '一样。加拿大没有市级所得税，扣多少只看省份。',
        },
      ],
    };
  }

  if (slug === 'newcomer-tax') {
    const on = getSalaryFigures(50000, 'ontario');
    const bc = getSalaryFigures(50000, 'bc');
    return {
      title: '新移民加拿大工资要扣多少税？2026 年说明',
      description: `新移民的工资和本地人按同样的规则扣税：联邦税、省税、CPP、EI。年薪 $50,000 在安大略省 2026 年到手约 ${money(on.netAnnual)}。`,
      h1: '新移民加拿大工资要扣多少税？',
      answer: `成为加拿大税务居民后，新移民的工资和其他人按同一套规则扣：联邦税、省税、CPP、EI。年薪 $50,000，2026 年在安大略省到手约 ${money(on.netAnnual)}，在 BC 省约 ${money(bc.netAnnual)}。区别在第一年报税：部分个人免税额要按你在加拿大居住的天数折算。`,
      table: {
        caption: '年薪 $50,000 的 2026 年扣除（单身、只用基本免税额）',
        head: ['', '安大略省', 'BC 省'],
        rows: [
          { label: '联邦税', cells: [money(on.federalTax), money(bc.federalTax)] },
          { label: '省税', cells: [money(on.provincialTax), money(bc.provincialTax)] },
          { label: 'CPP', cells: [money(on.pensionContribution), money(bc.pensionContribution)] },
          { label: 'EI', cells: [money(on.eiPremium), money(bc.eiPremium)] },
          { label: '年到手', cells: [money(on.netAnnual), money(bc.netAnnual)] },
        ],
      },
      sections: [
        {
          h: '第一年报税要注意什么？',
          b: '入境那一年，基本个人免税额等部分免税额要按你成为居民的天数折算。雇主扣税时通常按全年额度算，所以第一年报税可能要补一点税，也可能退税。',
        },
        {
          h: '别忘了申请补助',
          b: '新移民可以用 RC151 表申请 Canada Groceries and Essentials Benefit（原来的 GST/HST 退税），有孩子的还可以申请牛奶金（CCB）。这些都要先报税或提交表格才能拿到。',
        },
      ],
      faq: [
        {
          q: '新移民第一年要交 CPP 和 EI 吗？',
          a: '要。只要在加拿大有工作，从第一份工资起就扣 CPP 和 EI，和身份无关。',
        },
        {
          q: '新移民需要报税吗？',
          a: '应该报。即使收入不高，也要报税才能拿到 Canada Groceries and Essentials Benefit、牛奶金等补助，退回多扣的税。',
        },
      ],
    };
  }
  const hourly = slug.match(/^hourly-(\d+)$/);
  if (hourly && ['20', '25', '30'].includes(hourly[1])) return hourlyPage(Number(hourly[1]));
  if (slug === 'ontario-60k-after-tax') return salaryPage(60000, 'ontario');
  if (slug === 'ontario-80k-after-tax') return salaryPage(80000, 'ontario');

  if (slug === 'alberta-vs-bc') {
    const sal = [50000, 80000, 100000, 150000];
    const r80a = getSalaryFigures(80000, 'alberta'), r80b = getSalaryFigures(80000, 'bc');
    const r150a = getSalaryFigures(150000, 'alberta'), r150b = getSalaryFigures(150000, 'bc');
    const more = (a: number, b: number) => (a > b ? `阿省多约 ${money(a - b)}` : `BC 多约 ${money(b - a)}`);
    return {
      title: '阿省和 BC 哪个到手多？2026 各收入对比',
      description: `同样的工资，阿尔伯塔省和 BC 省哪个到手多？年薪 $80,000：${more(r80a.netAnnual, r80b.netAnnual)}；$150,000：${more(r150a.netAnnual, r150b.netAnnual)}。`,
      h1: '阿省和 BC 哪个到手多？',
      answer: `看收入。年薪 $80,000，2026 年阿省到手约 ${money(r80a.netAnnual)}，BC 约 ${money(r80b.netAnnual)}，${more(r80a.netAnnual, r80b.netAnnual)}；年薪 $150,000，阿省约 ${money(r150a.netAnnual)}，BC 约 ${money(r150b.netAnnual)}，${more(r150a.netAnnual, r150b.netAnnual)}。只比所得税，没算房价、油价和销售税。`,
      table: {
        caption: '阿省与 BC 省 2026 年税后对比（单身、只用基本免税额）',
        head: ['年薪', '阿省到手', 'BC 到手', '差额'],
        rows: sal.map((g) => { const a = getSalaryFigures(g, 'alberta'), b = getSalaryFigures(g, 'bc'); return { label: money(g), cells: [money(a.netAnnual), money(b.netAnnual), more(a.netAnnual, b.netAnnual)] }; }),
      },
      sections: [
        { h: '为什么会反过来', b: 'BC 的省税起点税率低，中等收入扣得少；阿省的基本免税额更高，高收入段的省税税率也比 BC 低。所以收入越高，阿省越占优，到 $150,000 左右两边基本持平。' },
        { h: '搬家前还要算什么', b: '阿省没有省销售税（只有 5% GST），BC 有 7% PST；房价和房租两地差距更大。所得税只是其中一项。' },
      ],
      faq: [
        { q: '年薪 10 万在阿省和 BC 哪个到手多？', a: (() => { const a = getSalaryFigures(100000, 'alberta'), b = getSalaryFigures(100000, 'bc'); return `2026 年阿省约 ${money(a.netAnnual)}，BC 约 ${money(b.netAnnual)}，${more(a.netAnnual, b.netAnnual)}。`; })() },
        { q: '年中搬省，税按哪个省算？', a: '按 12 月 31 日你住在哪个省，那一整年的省税都按那个省算。' },
      ],
    };
  }

  if (slug === 'spouse-amount') {
    const rows = ['ontario', 'bc', 'alberta', 'manitoba', 'saskatchewan'].map((sl) => ({ sl, g: spouseGain(sl, 80000) }));
    const on = spouseGain('ontario', 80000);
    return {
      title: '加拿大配偶抵免能省多少税？2026 一人工作养家',
      description: `夫妻只有一人工作，在 TD1 表上申报配偶抵免能少扣税。年薪 $80,000、配偶没有收入，2026 年在安大略省一年约多到手 ${money(on)}。`,
      h1: '一人工作养家，配偶抵免能省多少？',
      answer: `如果配偶没有收入或收入很低，工作的一方可以在 TD1 表上申报配偶抵免（spouse or common-law partner amount），雇主就会少扣税。年薪 $80,000、配偶没有收入，2026 年在安大略省一年约多到手 ${money(on)}，阿省约 ${money(spouseGain('alberta', 80000))}。`,
      table: {
        caption: '年薪 $80,000、配偶无收入时，申报配偶抵免一年多到手（2026）',
        head: ['省', '一年多到手'],
        rows: rows.map(({ sl, g }) => ({ label: nameOf(sl), cells: [money(g)] })),
      },
      sections: [
        { h: '怎么申报', b: '在联邦和省的 TD1 表上填配偶抵免，交给雇主。不交 TD1，雇主就按单身扣税，多扣的钱要等报税时才退回。配偶收入越高，抵免越少，超过一定收入就没有了。' },
        { h: '注意', b: '夫妻两人只能有一人申报。阿省的配偶抵免和基本个人免税额一样高，所以阿省省得最多。魁省的规则不同，本页不含魁省。' },
      ],
      faq: [
        { q: '配偶有一点收入还能申报吗？', a: '能，但抵免会按配偶收入减少。用首页计算器勾选「我在供养配偶」并填配偶收入，就能看到你的情况。' },
        { q: '同居伴侣算配偶吗？', a: '算。同居满 12 个月、或有共同子女的 common-law partner，和已婚配偶同样对待。' },
      ],
    };
  }

  if (slug === 'overtime-tax') {
    const f = getSalaryFigures(30 * 2080, 'ontario');
    return {
      title: '加拿大加班是不是扣税更多？2026 说明',
      description: '加班费和普通工资按同样的税率扣税。加班多的那张工资单扣得多，是因为扣税按「每期都这样挣」估算，报税时多扣的会退回。',
      h1: '加班是不是扣税更多？',
      answer: `不是。加班费是普通工资收入，税率和其他工资一样。加班多的那一期工资单扣得多，是因为雇主按「每一期都挣这么多」来估算扣税，这一期可能被算进更高的税档。报税时按全年实际收入重新算，多扣的会退回。`,
      table: {
        caption: '各省什么时候开始算加班（时薪 1.5 倍）',
        head: ['省', '加班起点'],
        rows: [
          { label: '安大略省', cells: ['每周超过 44 小时'] },
          { label: '不列颠哥伦比亚省（BC 省）', cells: ['每天超过 8 小时，或每周超过 40 小时'] },
          { label: '阿尔伯塔省', cells: ['每天超过 8 小时，或每周超过 44 小时'] },
        ],
      },
      sections: [
        { h: '举个例子', b: `时薪 $30、每周 40 小时，在安大略省一年税前 ${money(30 * 2080)}，2026 年到手约 ${money(f.netAnnual)}。某一期多了 20 小时加班，这一期就按「全年都这么挣」来扣税，所以显得扣得特别多。` },
        { h: 'CPP 和 EI 也扣吗', b: '扣。加班费和普通工资一样要交 CPP 和 EI，直到当年交满上限为止。' },
      ],
      faq: [
        { q: '加班多扣的税能退回吗？', a: '能。报税时按全年实际收入算税，扣多了退，扣少了补。' },
        { q: '联邦管辖的工作也一样吗？', a: '银行、航空、电信等联邦管辖的工作，按加拿大劳动法（Canada Labour Code）：每天超过 8 小时或每周超过 40 小时算加班。' },
      ],
    };
  }

  return null;
}

const SLUGS = ['100k-after-tax', 'bc-payroll-tax', 'newcomer-tax', 'hourly-20', 'hourly-25', 'hourly-30', 'ontario-60k-after-tax', 'ontario-80k-after-tax', 'alberta-vs-bc', 'spouse-amount', 'overtime-tax'];

export function generateStaticParams() {
  return SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = build(slug);
  if (!p) return { title: 'Page Not Found' };
  const url = `${BASE_URL}/zh/${slug}`;
  return {
    title: p.title,
    description: p.description,
    alternates: { canonical: url, languages: { 'zh-Hans': url } },
    openGraph: { title: p.title, description: p.description, url, type: 'article', locale: 'zh_CN', images: [{ url: '/og-image.png', width: 1200, height: 630 }] },
  };
}

export default async function ZhAnswerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = build(slug);
  if (!p) notFound();
  const url = `${BASE_URL}/zh/${slug}`;
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      inLanguage: 'zh-Hans',
      mainEntity: p.faq.map((x) => ({ '@type': 'Question', name: x.q, acceptedAnswer: { '@type': 'Answer', text: x.a } })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: '首页', item: BASE_URL },
        { '@type': 'ListItem', position: 2, name: '加拿大工资税后计算器', item: `${BASE_URL}/zh` },
        { '@type': 'ListItem', position: 3, name: p.h1, item: url },
      ],
    },
  ];
  return (
    <main lang="zh-CN" className="min-h-screen bg-slate-50 text-slate-900">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 py-10">
          <a href="/zh" className="inline-flex items-center gap-2 text-sm font-semibold text-red-700 no-underline mb-6">
            <img src="/logo.png" alt="" className="w-8 h-8 rounded-lg" />
            加拿大工资税后计算器
          </a>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-950 mb-4">{p.h1}</h1>
          <p className="text-lg leading-8 text-slate-700">{p.answer}</p>
          <a href="/" className="mt-6 inline-flex items-center justify-center rounded-lg bg-red-700 px-5 py-3 font-bold text-white no-underline hover:bg-red-800">
            用计算器算我的工资
          </a>
        </div>
      </section>
      <section className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div className="bg-white border border-slate-200 rounded-xl p-5 overflow-x-auto">
          <table className="w-full text-sm">
            <caption className="text-left font-bold text-slate-800 mb-3">{p.table.caption}</caption>
            <thead>
              <tr>{p.table.head.map((h) => <th key={h} scope="col" className="text-left py-2 pr-3 text-slate-600">{h}</th>)}</tr>
            </thead>
            <tbody>
              {p.table.rows.map((r) => (
                <tr key={r.label} className="border-t border-slate-100">
                  <th scope="row" className="text-left py-2 pr-3 font-semibold text-slate-800">{r.label}</th>
                  {r.cells.map((c, i) => <td key={i} className="py-2 pr-3 text-slate-700">{c}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {p.sections.map((s) => (
          <section key={s.h} className="bg-white border border-slate-200 rounded-xl p-5">
            <h2 className="text-xl font-bold text-slate-900 mb-2">{s.h}</h2>
            <p className="leading-8 text-slate-700">{s.b}</p>
          </section>
        ))}
        <section className="bg-white border border-slate-200 rounded-xl p-5">
          <h2 className="text-xl font-bold text-slate-900 mb-3">常见问题</h2>
          {p.faq.map((x) => (
            <div key={x.q} className="mb-4">
              <h3 className="font-bold text-slate-800">{x.q}</h3>
              <p className="leading-7 text-slate-700">{x.a}</p>
            </div>
          ))}
        </section>
        <p className="text-sm leading-6 text-slate-600">
          数字由 CanPay Insights 的计算引擎按 2026 年联邦和各省税率实时算出，引擎每次发布前都与 CRA 官方扣税表逐行核对。
          {slug === 'newcomer-tax' && (
            <>
              {' '}新移民规定来源：
              <a href="https://www.canada.ca/en/revenue-agency/services/tax/international-non-residents/individuals-leaving-entering-canada-non-residents/newcomers-canada-immigrants.html">CRA 新移民页面</a>、
              <a href="https://www.canada.ca/en/revenue-agency/services/forms-publications/forms/rc151.html">RC151 表</a>。
            </>
          )}
          {' '}仅供参考，不构成税务建议。
        </p>
        <nav className="text-sm" aria-label="相关页面">
          <a href="/zh" className="mr-4">返回中文首页（全部问题）</a>
          <a href="/zh/100k-after-tax" className="mr-4">年薪十万到手多少</a>
          <a href="/zh/hourly-25" className="mr-4">时薪 $25 一年到手多少</a></nav>
      </section>
    </main>
  );
}
