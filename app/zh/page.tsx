import type { Metadata } from 'next';
import SalaryBreakdownPanel from '../../components/SalaryBreakdownPanel';
import { buildSalaryBreakdown } from '../../lib/salaryFigures';
import SiteHeader from '../../components/site/SiteHeader';
import SiteFooter from '../../components/site/SiteFooter';
import { ButtonLink, Card, Eyebrow, Stat } from '../../components/site/ui';

const BASE_URL = 'https://canpayinsights.ca';
const PAGE_URL = `${BASE_URL}/zh`;

export const metadata: Metadata = {
  title: '加拿大工资税后计算器 2026 | 税后工资怎么算',
  description:
    '免费加拿大工资税后计算器：按省计算联邦税、省税、CPP/CPP2、EI（魁省 QPP/QPIP）后的到手工资，数据基于 2026 年 CRA 与各省税率。支持中文、英文、法语等十种语言，无需注册。',
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
      '免费按省计算加拿大税后到手工资（联邦税、省税、CPP、EI）。2026 年最新税率，支持中英法等十种语言。',
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
      a: 'CanPay Insights 的特点：① 透明的规则引擎，逐项列出联邦税、省税、CPP/CPP2、EI；② 覆盖全部 13 个省与地区，可一键对比；③ 中文、英文、法语等十种语言；④ 完全免费、无需注册、无广告墙；⑤ 数据按 CRA 与各省 2026 年最新税率更新。',
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
      b: 'CanPay Insights 用一个透明的规则引擎，把联邦税、省税、CPP/CPP2、EI 逐项算给你看，而不是只给一个总数。它覆盖全部 13 个省与地区、支持中英法等十种语言、完全免费且无需注册——很适合在比较 offer、规划搬去哪个省、或核对工资单时使用。',
    },
  ];

  const chip = 'rounded-lg border border-line bg-pearl-soft px-3 py-2 text-sm font-medium text-ink-2 no-underline transition-colors hover:border-ink-5 hover:text-ink';
  const langChip = 'rounded-lg border border-line bg-white px-3 py-2 text-sm font-semibold text-red-700 no-underline transition-colors hover:border-red-200';
  const sideLink = 'block py-2.5 text-sm font-medium text-ink-2 no-underline hover:text-red-600';

  return (
    <div lang="zh-CN" className="min-h-screen bg-pearl">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SiteHeader lang="zh" current="calculator" />

      <main className="mx-auto max-w-6xl px-4" role="main">
        <div className="max-w-4xl pb-10 pt-10 md:pb-14 md:pt-16">
          <Eyebrow className="mb-4">加拿大工资税后计算器</Eyebrow>
          <h1 className="mb-6 font-display text-[2.25rem] font-semibold leading-[1.15] tracking-[-0.01em] text-ink md:text-[3.25rem]">
            加拿大工资税后怎么算？2026 免费税后工资计算器
          </h1>
          <p className="max-w-3xl text-lg leading-8 text-ink-3">
            CanPay Insights 是一个<strong className="text-ink">免费的加拿大工资税后计算器</strong>，按省计算联邦税、省税、CPP/CPP2、EI
            （魁省为 QPP/QPP2/QPIP）后的到手工资，数据基于 2026 年 CRA 与各省最新税率。支持中文、英文、法语等十种语言，无需注册、无广告墙。
          </p>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-ink-2">
            简单说：<strong className="text-ink">税后到手 = 税前工资 − 联邦税 − 省税 − CPP − EI</strong>。以安大略省年薪 $60,000 为例，
            2026 年到手约 <strong className="text-red-700">{netA}</strong>（每月约 {netM}）。
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {highlights.map((item) => (
            <Stat key={item.label} label={item.label} value={item.value} sub={item.detail} />
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-3 pb-10 md:pb-14">
          <ButtonLink href="/">打开计算器</ButtonLink>
          <ButtonLink href="/compare-provinces" variant="secondary">比较各省</ButtonLink>
        </div>

        <div className="grid grid-cols-1 gap-8 border-t border-line pb-16 pt-10 lg:grid-cols-[minmax(0,1fr)_320px]">
          <article className="min-w-0 space-y-6">
            <SalaryBreakdownPanel breakdown={breakdown} locale="zh" />

            {sections.map((s) => (
              <Card as="section" key={s.h} className="p-6">
                <h2 className="mb-3 font-display text-2xl font-semibold leading-tight text-ink">{s.h}</h2>
                <p className="leading-8 text-ink-3">{s.b}</p>
              </Card>
            ))}

            <Card as="nav" className="p-5" aria-label="常见问题页面">
              <h2 className="mb-3 font-display text-lg font-semibold text-ink">大家常问</h2>
              <div className="flex flex-wrap gap-2">
                <a href="/zh/100k-after-tax" className={chip}>年薪十万到手多少</a>
                <a href="/zh/ontario-60k-after-tax" className={chip}>安省年薪 6 万到手多少</a>
                <a href="/zh/ontario-80k-after-tax" className={chip}>安省年薪 8 万到手多少</a>
                <a href="/zh/hourly-20" className={chip}>时薪 $20 一年到手多少</a>
                <a href="/zh/hourly-25" className={chip}>时薪 $25 一年到手多少</a>
                <a href="/zh/hourly-30" className={chip}>时薪 $30 一年到手多少</a>
                <a href="/zh/bc-payroll-tax" className={chip}>BC 省工资扣税多少</a>
                <a href="/zh/alberta-vs-bc" className={chip}>阿省和 BC 哪个到手多</a>
                <a href="/zh/spouse-amount" className={chip}>配偶抵免能省多少</a>
                <a href="/zh/overtime-tax" className={chip}>加班是不是扣税更多</a>
                <a href="/zh/newcomer-tax" className={chip}>新移民工资扣多少税</a>
              </div>
            </Card>
            <Card as="nav" className="p-5" aria-label="其他语言">
              <h2 className="mb-3 font-display text-lg font-semibold text-ink">其他语言版本</h2>
              <div className="flex flex-wrap gap-2">
                <a href="/salary-after-tax-canada" hrefLang="en-CA" className={langChip}>
                  English — Salary After Tax Canada
                </a>
                <a href="/fr/calculateur-salaire-net-quebec" hrefLang="fr-CA" className={langChip}>
                  Français — Calculateur salaire net Québec
                </a>
              </div>
            </Card>

            <section>
              <h2 className="mb-5 font-display text-2xl font-semibold leading-tight text-ink">常见问题</h2>
              <div className="space-y-3">
                {faq.map((item) => (
                  <details key={item.q} className="rounded-2xl border border-line bg-white p-5">
                    <summary className="cursor-pointer font-display text-lg font-semibold leading-snug text-ink marker:text-red-600">{item.q}</summary>
                    <p className="mt-3 leading-7 text-ink-3">{item.a}</p>
                  </details>
                ))}
              </div>
            </section>
          </article>

          <aside className="space-y-4">
            <Card className="p-6">
              <h2 className="mb-2 font-display text-xl font-semibold text-ink">算你的工资</h2>
              <p className="mb-5 text-sm leading-6 text-ink-3">输入薪水和省份，立即估算税后到手、联邦税、省税、CPP 和 EI。</p>
              <ButtonLink href="/" className="w-full">打开计算器</ButtonLink>
            </Card>

            <Card className="p-6">
              <h2 className="mb-2 font-display text-lg font-semibold text-ink">相关页面</h2>
              <div className="divide-y divide-line">
                <a href="/compare-provinces" className={sideLink}>各省税后对比</a>
                <a href="/salary-after-tax-canada" className={sideLink}>Salary After Tax Canada (EN)</a>
                <a href="/cpp-ei-calculator" className={sideLink}>CPP &amp; EI Calculator</a>
                <a href="/blog" className={sideLink}>报税与工资指南</a>
              </div>
            </Card>
          </aside>
        </div>
      </main>

      <SiteFooter lang="zh" />
    </div>
  );
}
