import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getSalaryFigures, PROVINCE_SEO_CONFIGS } from '../../../lib/salaryFigures';
import { provinceLabel } from '../../../lib/provinceNames';

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
  return null;
}

const SLUGS = ['100k-after-tax', 'bc-payroll-tax', 'newcomer-tax'];

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
          <a href="/zh/100k-after-tax" className="mr-4">年薪十万到手多少</a>
          <a href="/zh/bc-payroll-tax" className="mr-4">BC 省工资扣税</a>
          <a href="/zh/newcomer-tax" className="mr-4">新移民工资扣税</a>
          <a href="/zh">返回中文首页</a>
        </nav>
      </section>
    </main>
  );
}
