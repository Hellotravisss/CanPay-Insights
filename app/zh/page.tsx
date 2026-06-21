import type { Metadata } from 'next';
import SalaryBreakdownPanel from '../../components/SalaryBreakdownPanel';
import { buildSalaryBreakdown } from '../../lib/salaryFigures';

const BASE_URL = 'https://canpayinsights.ca';
const PAGE_URL = `${BASE_URL}/zh`;

export const metadata: Metadata = {
  title: '加拿大工资税后计算器 2026 | 税后工资怎么算 - CanPay Insights',
  description:
    '免费加拿大工资税后计算器：按省计算联邦税、省税、CPP/CPP2、EI（魁省 QPP/QPIP）后的到手工资，数据基于 2026 年 CRA 与各省税率。支持中文、英文、法语，无需注册。',
  keywords: [
    '加拿大工资税后怎么算',
    '加拿大税后工资计算器',
    '加拿大工资计算器',
    '安省税后工资',
    '加拿大net pay计算',
    'CPP EI 计算',
  ],
  alternates: {
    canonical: PAGE_URL,
    languages: {
      'zh-Hans': PAGE_URL,
      'en-CA': `${BASE_URL}/salary-after-tax-canada`,
      'fr-CA': `${BASE_URL}/fr/calculateur-salaire-net-quebec`,
      'x-default': `${BASE_URL}/salary-after-tax-canada`,
    },
  },
  openGraph: {
    title: '加拿大工资税后计算器 2026 | 税后工资怎么算',
    description:
      '免费按省计算加拿大税后到手工资（联邦税、省税、CPP、EI）。2026 年最新税率，支持中英法三语。',
    url: PAGE_URL,
    type: 'website',
    locale: 'zh_CN',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
};

const money = (n: number) => `$${Math.round(n).toLocaleString('en-CA')}`;

export default function ChineseHubPage() {
  // Live 2026 sample: $60,000 in Ontario (the most common Chinese-Canadian query).
  const breakdown = buildSalaryBreakdown(60000, 'ontario', [40000, 50000, 60000, 70000, 80000, 100000, 120000]);
  const f = breakdown.figures;
  const netA = money(f.netAnnual);
  const netM = money(f.netMonthly);

  const faq = [
    {
      q: '加拿大工资税后怎么算？',
      a: `加拿大工资税后 = 税前工资 − 联邦所得税 − 省/地区税 − CPP（养老金供款）− EI（失业保险）。其中联邦税 2026 年从最低档 14% 起、最高 33%；CPP 为 5.95%（年收入 $3,500 至 $74,600 之间），EI 为 1.63%（上限 $1,123）。魁省居民改交 QPP、QPIP，并适用魁省省税。用本页计算器输入薪水和省份即可得到精确结果。`,
    },
    {
      q: '6 万年薪在安大略省 2026 年税后多少？',
      a: `年薪 $60,000 在安大略省，2026 年到手约 ${netA}，即每月约 ${netM}。这已扣除联邦税、安省省税、CPP 和 EI（仅计基本个人免税额）。RRSP 供款、福利、工会会费等会改变你的实际数字。`,
    },
    {
      q: '哪个加拿大工资税后计算器好用？',
      a: 'CanPay Insights 的特点：① 透明的规则引擎，逐项列出联邦税、省税、CPP/CPP2、EI；② 覆盖全部 13 个省与地区，可一键对比；③ 中文、英文、法语三语；④ 完全免费、无需注册、无广告墙；⑤ 数据按 CRA 与各省 2026 年最新税率更新。',
    },
    {
      q: '魁北克省的算法和其他省一样吗？',
      a: '不一样。魁省居民缴的是 QPP（魁省养老金，2026 年第一档 6.3%）而非 CPP，另缴 QPIP（魁省育儿保险，2026 年 0.43%），EI 费率也更低（魁省 1.30%），并适用魁省自己的省税阶梯和 16.5% 的联邦税减免。计算器选择 Québec 会自动套用这些规则。',
    },
  ];

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: '加拿大工资税后计算器 2026',
      description: metadata.description,
      url: PAGE_URL,
      inLanguage: 'zh-Hans',
      isPartOf: { '@type': 'WebSite', name: 'CanPay Insights', url: BASE_URL },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: '加拿大工资税后计算器 (CanPay Insights)',
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Web Browser',
      url: PAGE_URL,
      inLanguage: 'zh-Hans',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'CAD' },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      inLanguage: 'zh-Hans',
      mainEntity: faq.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a },
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: '首页', item: BASE_URL },
        { '@type': 'ListItem', position: 2, name: '加拿大工资税后计算器', item: PAGE_URL },
      ],
    },
  ];

  const highlights = [
    { label: '2026 新变化', value: '联邦最低档 14%', detail: '最低联邦税率由 15% 降至 14%，几乎人人到手都略增。' },
    { label: 'CPP / CPP2', value: '$74,600 / $85,000', detail: '5.95% 至第一上限 $74,600；高收入再交 4% 的 CPP2 至 $85,000。' },
    { label: '覆盖范围', value: '13 省与地区', detail: '安省、BC、阿省、魁省……全部可算、可一键对比。' },
  ];

  const sections = [
    {
      h: '加拿大工资税后怎么算？',
      b: `公式很简单：税后到手 = 税前工资 − 联邦税 − 省/地区税 − CPP − EI。联邦税按阶梯计算（2026：$58,523 以内 14%、之后 20.5% / 26% / 29% / 33%），各省再叠加自己的省税阶梯；CPP 按 5.95% 计（$3,500 至 $74,600 之间），EI 按 1.63% 计（上限 $1,123）。基本个人免税额会以最低税率抵免一部分税。以年薪 $60,000、安大略省为例，2026 年到手约 ${netA}，每月约 ${netM}。`,
    },
    {
      h: '2026 年有哪些变化？',
      b: '三点最关键：① 联邦最低档税率由 15% 降到 14%，所有纳税人到手都略有增加；② CPP 第一上限（YMPE）升到 $74,600、CPP2 上限（YAMPE）升到 $85,000，EI 最高可保收入升到 $68,900、费率降到 1.63%；③ 各省税阶与基本免税额按通胀微调。本计算器已全部更新到 2026 数值。',
    },
    {
      h: '哪个加拿大税后计算器好用？',
      b: 'CanPay Insights 用一个透明的规则引擎，把联邦税、省税、CPP/CPP2、EI 逐项算给你看，而不是只给一个总数。它覆盖全部 13 个省与地区、支持中英法三语、完全免费且无需注册——很适合在比较 offer、规划搬去哪个省、或核对工资单时使用。',
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 py-12 md:py-16">
          <a href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-red-600 no-underline mb-8">
            <img src="/logo.png" alt="" className="w-8 h-8 rounded-lg" />
            CanPay Insights
          </a>
          <p className="text-sm font-bold uppercase tracking-wide text-red-600 mb-3">加拿大工资税后计算器</p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-950 mb-5">
            加拿大工资税后怎么算？2026 免费税后工资计算器
          </h1>
          <p className="text-lg leading-8 text-slate-600 max-w-3xl">
            CanPay Insights 是一个<strong>免费的加拿大工资税后计算器</strong>，按省计算联邦税、省税、CPP/CPP2、EI
            （魁省为 QPP/QPP2/QPIP）后的到手工资，数据基于 2026 年 CRA 与各省最新税率。支持中文、英文、法语，无需注册、无广告墙。
          </p>
          <p className="text-lg leading-8 text-slate-700 max-w-3xl mt-4">
            简单说：<strong>税后到手 = 税前工资 − 联邦税 − 省税 − CPP − EI</strong>。以安大略省年薪 $60,000 为例，
            2026 年到手约 <strong>{netA}</strong>（每月约 {netM}）。
          </p>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3 mt-8">
            {highlights.map((item) => (
              <div key={item.label} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{item.label}</p>
                <p className="mt-2 text-2xl font-bold text-slate-950">{item.value}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.detail}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-3 mt-8">
            <a href="/" className="inline-flex items-center justify-center rounded-lg bg-red-600 px-5 py-3 font-bold text-white hover:bg-red-700 no-underline">
              打开计算器
            </a>
            <a href="/compare-provinces" className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-3 font-bold text-slate-700 hover:border-red-200 hover:text-red-600 no-underline">
              比较各省
            </a>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          <article className="space-y-6">
            <SalaryBreakdownPanel breakdown={breakdown} locale="zh" />

            {sections.map((s) => (
              <section key={s.h} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <h2 className="text-2xl font-bold text-slate-900 mb-3">{s.h}</h2>
                <p className="leading-8 text-slate-600">{s.b}</p>
              </section>
            ))}

            <nav className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm" aria-label="其他语言">
              <h2 className="text-lg font-bold text-slate-900 mb-3">其他语言版本</h2>
              <div className="flex flex-wrap gap-2">
                <a href="/salary-after-tax-canada" hrefLang="en-CA" className="rounded-md border border-red-100 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 no-underline hover:border-red-200 hover:bg-red-100">
                  English — Salary After Tax Canada
                </a>
                <a href="/fr/calculateur-salaire-net-quebec" hrefLang="fr-CA" className="rounded-md border border-red-100 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 no-underline hover:border-red-200 hover:bg-red-100">
                  Français — Calculateur salaire net Québec
                </a>
              </div>
            </nav>

            <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900 mb-5">常见问题</h2>
              <div className="space-y-4">
                {faq.map((item) => (
                  <details key={item.q} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <summary className="cursor-pointer font-bold text-slate-800">{item.q}</summary>
                    <p className="mt-3 leading-7 text-slate-600">{item.a}</p>
                  </details>
                ))}
              </div>
            </section>
          </article>

          <aside className="space-y-4">
            <div className="bg-slate-900 text-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-2">算你的工资</h2>
              <p className="text-sm leading-6 text-slate-300 mb-5">输入薪水和省份，立即估算税后到手、联邦税、省税、CPP 和 EI。</p>
              <a href="/" className="block rounded-lg bg-red-600 px-4 py-3 text-center font-bold text-white hover:bg-red-700 no-underline">
                打开计算器
              </a>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-bold mb-4">相关页面</h2>
              <div className="space-y-2">
                <a href="/compare-provinces" className="block rounded-lg px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100 no-underline">各省税后对比</a>
                <a href="/salary-after-tax-canada" className="block rounded-lg px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100 no-underline">Salary After Tax Canada (EN)</a>
                <a href="/cpp-ei-calculator" className="block rounded-lg px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100 no-underline">CPP &amp; EI Calculator</a>
                <a href="/blog" className="block rounded-lg px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100 no-underline">报税与工资指南</a>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
