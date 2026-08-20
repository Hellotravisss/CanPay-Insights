'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import Globe from './Globe';
import Donut from './Donut';
import { countryName } from './countries';
import TrendChart from './TrendChart';
import Candles, { type CandleData } from './Candles';
import CrossTab, { type CrossTabData } from './CrossTab';
import Provenance, { type ProvenanceData } from './Provenance';
import HourChart from './HourChart';
import SearchPanel from './SearchPanel';
import ContentPanel from './ContentPanel';

// Private data room. Deliberately styled the way a published data story would
// look — this doubles as the visual rehearsal for the eventual public /data
// report and the year-end Awards.
//
// The zh toggle translates THIS page's own prose. Child panels (trend, cross
// tab, provenance, search) keep their English labels — they are shared with
// other surfaces and their text is mostly proper nouns and numbers anyway.

type Row = { k: string | number; n: number };
type Stats = {
  total: number;
  sessions: number;
  first_event: string | null;
  last_event: string | null;
  last_7d: number;
  geo_known: number;
  excluded_rows: number;
  by_province: Row[];
  by_bracket: Row[];
  by_lang: Row[];
  by_country: Row[];
  by_city: Row[];
  cities_geo: { city: string; lat: number; lon: number; n: number }[];
  by_device: Row[];
  by_mode: Row[];
  by_source: Row[];
  by_industry: Row[];
  by_hour: Row[];
  by_dow: Row[];
  by_daily: Row[];
  work: {
    n: number;
    unpaid_break_share: number | null;
    median_break: number | null;
    weekend_share: number | null;
    median_daily_hours: number | null;
    median_days_week: number | null;
  } | null;
  comparison_sessions: number;
  rrsp: { n: number; has_rrsp_share: number | null; employer_match_share: number | null } | null;
  by_rrsp_pct: Row[];
  by_ot: Row[];
  premium: { n: number; share: number | null } | null;
  by_premium_rate: Row[];
  by_tips: Row[];
  by_pay_freq: Row[];
  engagement: { report_share: number | null; median_calcs_per_session: number | null } | null;
};

// The dimensions that were being collected all along but never displayed —
// median comparison, employment shape, expectation, raise detection, intent,
// shift start hour, entry page, sign-in share.
type Journeys = {
  sessions: number;
  multi: number;
  depth: { one: number; two_four: number; five_plus: number; max: number };
  varied: { income: number; overtime: number; rrsp: number; province: number; nothing: number };
  income_moves: { up: number; down: number; same: number };
};

type Extra = {
  by_median: Row[];
  by_shape: Row[];
  by_expectation: Row[];
  by_paychange: Row[];
  by_intent: Row[];
  by_shift_start: Row[];
  by_entry: Row[];
  registered: { n: number; share: number | null } | null;
};

const RRSP_LABEL: Record<string, string> = {
  '0': 'None', '1-5': '1–5% of pay', '5-10': '5–10%', '10-15': '10–15%', '15-plus': '15%+',
};
const RRSP_LABEL_ZH: Record<string, string> = {
  '0': '不供', '1-5': '工资的 1–5%', '5-10': '5–10%', '10-15': '10–15%', '15-plus': '15% 以上',
};
const OT_LABEL: Record<string, string> = {
  '0': 'No overtime', 'under-5': 'Under 5 h', '5-10': '5–10 h', '10-plus': '10 h+',
};
const OT_LABEL_ZH: Record<string, string> = {
  '0': '不加班', 'under-5': '5 小时以内', '5-10': '5–10 小时', '10-plus': '10 小时以上',
};
const TIPS_LABEL: Record<string, string> = {
  '0': 'No tips', '1-10': '1–10% of pay', '10-20': '10–20%', '20-30': '20–30%', '30-plus': '30%+',
};
const TIPS_LABEL_ZH: Record<string, string> = {
  '0': '没有小费', '1-10': '工资的 1–10%', '10-20': '10–20%', '20-30': '20–30%', '30-plus': '30% 以上',
};
const PREMIUM_LABEL: Record<string, string> = {
  'under-2': 'Under $2/h', '2-4': '$2–4/h', '4-6': '$4–6/h', '6-plus': '$6+/h',
};
const MEDIAN_LABEL: Record<string, string> = {
  'under-0.5': 'Under half the median', '0.5-0.75': '50–75% of median', '0.75-1': '75–100%',
  '1-1.25': '100–125%', '1.25-1.5': '125–150%', '1.5-2': '1.5–2× median',
  '2-3': '2–3× median', '3-plus': '3×+',
};
const MEDIAN_LABEL_ZH: Record<string, string> = {
  'under-0.5': '不到中位一半', '0.5-0.75': '中位的 50–75%', '0.75-1': '75–100%',
  '1-1.25': '100–125%', '1.25-1.5': '125–150%', '1.5-2': '中位的 1.5–2 倍',
  '2-3': '2–3 倍', '3-plus': '3 倍以上',
};
const SHAPE_LABEL: Record<string, string> = {
  'salaried': 'Salaried', 'full-time-hourly': 'Full-time hourly', 'part-time-hourly': 'Part-time hourly',
  'shift-worker': 'Shift worker', 'tipped-service': 'Tipped service',
};
const SHAPE_LABEL_ZH: Record<string, string> = {
  'salaried': '年薪受薪', 'full-time-hourly': '全职时薪', 'part-time-hourly': '兼职时薪',
  'shift-worker': '轮班', 'tipped-service': '小费服务业',
};
const EXPECT_LABEL: Record<string, string> = {
  'lower': 'Less than expected', 'as-expected': 'About what I expected', 'higher': 'More than expected',
};
const EXPECT_LABEL_ZH: Record<string, string> = {
  'lower': '比想象的少', 'as-expected': '和想的差不多', 'higher': '比想象的多',
};
const INTENT_LABEL: Record<string, string> = {
  'job-offer': 'Weighing a job offer', 'raise': 'After a raise', 'moving': 'Considering a move',
  'budgeting': 'Budgeting', 'curious': 'Just curious',
};
const INTENT_LABEL_ZH: Record<string, string> = {
  'job-offer': '在权衡 offer', 'raise': '刚涨了薪', 'moving': '考虑搬家',
  'budgeting': '做预算', 'curious': '只是好奇',
};
const PAYCHANGE_LABEL: Record<string, string> = { up: 'Raise', down: 'Pay cut', same: 'No change' };
const PAYCHANGE_LABEL_ZH: Record<string, string> = { up: '涨薪', down: '降薪', same: '没变' };

const LANG_NAMES: Record<string, string> = {
  en: 'English', fr: 'Français', zh: '中文', pa: 'ਪੰਜਾਬੀ', hi: 'हिन्दी',
  tl: 'Tagalog', es: 'Español', uk: 'Українська', ko: '한국어', vi: 'Tiếng Việt',
};
const DOW = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DOW_ZH = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
const BRACKET_LABEL: Record<string, string> = {
  'under-30k': 'Under $30k', '30-50k': '$30–50k', '50-70k': '$50–70k',
  '70-90k': '$70–90k', '90-120k': '$90–120k', '120-160k': '$120–160k',
  '160k-plus': '$160k+',
};

function Bars({ rows, label, total, empty }: { rows: Row[]; label?: (k: string | number) => string; total: number; empty?: string }) {
  if (!rows?.length) return <p className="text-sm text-slate-400">{empty ?? 'No data yet.'}</p>;
  const max = Math.max(...rows.map((r) => r.n));
  return (
    <div className="space-y-2">
      {rows.map((r) => (
        <div key={String(r.k)} className="grid grid-cols-[9rem_1fr_4.5rem] items-center gap-3">
          <span className="truncate text-sm text-slate-600">{label ? label(r.k) : String(r.k)}</span>
          <div className="h-2.5 rounded-full bg-slate-100">
            <div className="h-2.5 rounded-full bg-red-600" style={{ width: `${(r.n / max) * 100}%` }} />
          </div>
          <span className="text-right text-xs tabular-nums text-slate-500">
            {r.n} · {total ? Math.round((r.n / total) * 100) : 0}%
          </span>
        </div>
      ))}
    </div>
  );
}

function Card({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-base font-bold text-slate-800">{title}</h2>
      {hint && <p className="mb-4 mt-0.5 text-xs leading-5 text-slate-400">{hint}</p>}
      <div className={hint ? '' : 'mt-4'}>{children}</div>
    </section>
  );
}

export default function StatsDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [extra, setExtra] = useState<Extra | null>(null);
  const [journeys, setJourneys] = useState<Journeys | null>(null);
  const [series, setSeries] = useState<any | null>(null);
  const [candles, setCandles] = useState<CandleData | null>(null);
  const [cross, setCross] = useState<CrossTabData | null>(null);
  const [prov, setProv] = useState<ProvenanceData | null>(null);
  const [geo, setGeo] = useState<{ city: string; lat: number; lon: number; n: number }[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [zh, setZh] = useState(false);
  // Bilingual helper — every visible string on this page goes through it.
  const T = (en: string, z: string) => (zh ? z : en);

  useEffect(() => {
    try { if (localStorage.getItem('dataroom_lang') === 'zh') setZh(true); } catch {}
    supabase.rpc('calc_series').then(({ data }) => {
      if (data) setSeries(data);
    });
    supabase.rpc('calc_candles').then(({ data }) => {
      if (data) setCandles(data as CandleData);
    });
    supabase.rpc('calc_crosstab').then(({ data }) => {
      if (data) setCross(data as CrossTabData);
    });
    supabase.rpc('calc_provenance').then(({ data }) => {
      if (data) setProv(data as ProvenanceData);
    });
    // Separate call: calc_stats drops any point whose city name the edge could
    // not resolve, which hid Hong Kong and China from the globe entirely.
    supabase.rpc('calc_cities_geo').then(({ data }) => {
      if (data) setGeo(data as { city: string; lat: number; lon: number; n: number }[]);
    });
    supabase.rpc('calc_stats_extra').then(({ data }) => {
      if (data) setExtra(data as Extra);
    });
    supabase.rpc('calc_journeys').then(({ data }) => {
      if (data) setJourneys(data as Journeys);
    });
    supabase.rpc('calc_stats').then(({ data, error }) => {
      if (error) setError(error.message);
      else setStats(data as Stats);
    });
  }, []);

  const switchLang = (v: boolean) => {
    setZh(v);
    try { localStorage.setItem('dataroom_lang', v ? 'zh' : 'en'); } catch {}
  };

  if (error) return <div className="p-10 text-sm text-red-600">Could not load stats: {error}</div>;
  if (!stats) return <div className="p-10 text-sm text-slate-400">Loading…</div>;

  const t = stats.total;
  const days =
    stats.first_event && stats.last_event
      ? Math.max(1, Math.round((+new Date(stats.last_event) - +new Date(stats.first_event)) / 86400000))
      : 1;
  const hourRows = Array.from({ length: 24 }, (_, h) => ({
    k: h,
    n: stats.by_hour.find((r) => Number(r.k) === h)?.n ?? 0,
  }));
  const maxHour = Math.max(1, ...hourRows.map((r) => r.n));
  // Same 24-slot treatment for shift start hours, so the two clocks read alike.
  const shiftRows = Array.from({ length: 24 }, (_, h) => ({
    k: h,
    n: extra?.by_shift_start?.find((r) => Number(r.k) === h)?.n ?? 0,
  }));
  const maxShift = Math.max(1, ...shiftRows.map((r) => r.n));
  const shiftTotal = shiftRows.reduce((a, r) => a + r.n, 0);
  const belowMedian = extra?.by_median
    ? extra.by_median.filter((r) => ['under-0.5', '0.5-0.75', '0.75-1'].includes(String(r.k))).reduce((a, r) => a + r.n, 0)
    : 0;
  const medianTotal = extra?.by_median ? extra.by_median.reduce((a, r) => a + r.n, 0) : 0;
  const noData = T('No data yet.', '还没有数据。');

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <header className="mb-10 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-600">
              {T('Private data room', '私密数据室')}
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              {T('What Canadians are calculating', '加拿大人都在算什么工资')}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              {T(
                'Anonymous aggregate statistics from the CanPay Insights calculator. Income is recorded as a bracket, never an exact amount; no IP addresses, accounts, or device fingerprints are stored. This page is unlisted and not indexed. Owner and testing traffic is excluded from every number here — add ',
                '来自 CanPay Insights 计算器的匿名汇总统计。收入只记档位,从不记具体数字;不存 IP 地址、不存账号、不存设备指纹。本页不公开、不被搜索引擎收录。站主和测试流量已从所有数字中剔除 —— 在任意页面网址后加 ',
              )}
              <code className="rounded bg-slate-100 px-1">?notelemetry=1</code>
              {T(
                ' to any page URL to permanently silence a browser you test from.',
                ' 可让测试用的浏览器永久静音。',
              )}
            </p>
          </div>
          {/* Language toggle — persisted so it survives reloads */}
          <div className="flex shrink-0 overflow-hidden rounded-full border border-slate-200 bg-white text-xs font-semibold shadow-sm">
            <button
              onClick={() => switchLang(false)}
              className={`px-3 py-1.5 ${!zh ? 'bg-red-600 text-white' : 'text-slate-500 hover:text-slate-700'}`}
            >
              EN
            </button>
            <button
              onClick={() => switchLang(true)}
              className={`px-3 py-1.5 ${zh ? 'bg-red-600 text-white' : 'text-slate-500 hover:text-slate-700'}`}
            >
              中文
            </button>
          </div>
        </header>

        {/* Headline numbers */}
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { n: t.toLocaleString(), l: T('Calculations recorded', '记录的计算次数') },
            { n: stats.sessions.toLocaleString(), l: T('Visits (with a visit id)', '访问数(有访问 id 的)') },
            { n: stats.last_7d.toLocaleString(), l: T('Last 7 days', '最近 7 天') },
            { n: `${days}d`, l: T('Collecting since', '已采集天数') },
          ].map((s) => (
            <div key={s.l} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="text-3xl font-bold tabular-nums text-slate-900">{s.n}</div>
              <div className="mt-1 text-xs font-medium text-slate-500">{s.l}</div>
            </div>
          ))}
        </div>

        <p className="mb-8 -mt-4 text-xs leading-5 text-slate-400">
          {T(
            'A visit id is minted per page load and discarded when the visitor leaves, so a returning person counts as a new visit, and the earliest events predate visit ids entirely. Treat the visit count as a floor, not a headcount — calculations recorded is the reliable number.',
            '访问 id 每次加载页面生成、离开即丢弃,回头客会被算成新访问,而且最早的一批事件在访问 id 上线之前。所以访问数只是下限,不是人数 —— 可靠的数字是计算次数。',
          )}
        </p>

        {/* Deliberately near the top. Anyone who also has page analytics open —
            Travis, a journalist, a buyer — will compare the two and read the
            gap as an error unless the difference is named first. */}
        <div className="mb-8 rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {T('This is not page analytics', '这不是网页流量统计')}
          </p>
          <p className="mt-1.5 text-xs leading-5 text-slate-500">
            {T(
              'Every number here counts a calculation — someone entering a wage and getting an answer. Page analytics counts everyone who loads a page, most of whom never calculate anything, so the two will never agree and are not meant to. The gap is itself a finding: visitors from outside Canada land often and calculate almost never, which is why this page skews more Canadian and more mobile than raw traffic does.',
              '这里每个数字数的都是一次计算 —— 有人输入了工资并拿到了答案。网页流量统计数的是打开页面的所有人,其中大多数根本没算过,所以两边永远对不上,也不该对上。这个差距本身就是发现:加拿大以外的访客常来但几乎不算,所以本页比原始流量更「加拿大」、更「手机」。',
            )}
          </p>
        </div>

        {/* Media-readiness gauge: how close the dataset is to being pitchable */}
        <div className="mb-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-2 flex items-baseline justify-between">
            <h2 className="text-base font-bold text-slate-800">{T('Media-readiness', '媒体可用度')}</h2>
            <span className="text-xs text-slate-400">
              {T('target: 5,000 events for a citable data story', '目标:5,000 条事件,够写一篇可引用的数据报道')}
            </span>
          </div>
          <div className="h-3 w-full rounded-full bg-slate-100">
            <div
              className="h-3 rounded-full bg-gradient-to-r from-red-400 to-red-600"
              style={{ width: `${Math.min(100, (t / 5000) * 100)}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-slate-500">
            {t.toLocaleString()} / 5,000 ({Math.min(100, Math.round((t / 5000) * 100))}%)
            {/* Rate over the whole collection window, not last_7d/7 — with only
                a few days of history the 7-day divisor understates badly. */}
            {t < 5000 &&
              (zh
                ? ` —— 目前约 ${(t / days).toFixed(1)} 条/天,离目标还要约 ${Math.ceil((5000 - t) / Math.max(0.5, t / days))} 天。`
                : ` — ~${(t / days).toFixed(1)}/day so far, about ${Math.ceil((5000 - t) / Math.max(0.5, t / days))} days to target.`)}
          </p>
        </div>

        {/* Globe — where in the world people are calculating Canadian pay */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-800">{T('Live map', '实时地图')}</h2>
          <p className="mb-4 mt-0.5 text-xs leading-5 text-slate-400">
            {zh
              ? `只用城市中心点 —— 访问来自哪个城市就标那个城市的中心,从不定位到人,也从不存 IP。点越大量越大;悬停可看城市名。基于 ${stats.geo_known}/${t} 条事件,其余不是丢了而是本来就无法定位:iOS App 的计算不经过解析位置的网页边缘节点,最早的事件则在位置采集上线之前。`
              : `City centroids only — the centre point of the city a visit came from, never a precise location and never an IP address. Dot size is volume; hover a dot to name it. Based on ${stats.geo_known} of ${t} events. The rest cannot be placed rather than failed to be: calculations from the iOS app never pass through the web edge that resolves location, and the earliest events predate location collection entirely.`}
          </p>
          <Globe cities={geo ?? stats.cities_geo ?? []} countries={stats.by_country} lang={zh ? 'zh' : 'en'} />
        </div>

        {/* ── The headline distribution: wage vs provincial median ────────── */}
        <div className="mb-6 rounded-2xl border-2 border-red-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-800">
            {T('Where users sit against their provincial median wage', '用户工资 vs 本省中位工资')}
          </h2>
          <p className="mb-4 mt-0.5 text-xs leading-5 text-slate-400">
            {T(
              'Each calculation compared, at calculation time, against the Statistics Canada median wage for the selected province. This is also an honest self-selection disclosure: people who check a pay calculator skew lower-income than the country, and this chart says so out loud.',
              '每次计算都在当下和加拿大统计局公布的该省中位工资比了一次。这同时是对自选择偏差的坦白:会来查工资计算器的人,收入结构比全国偏低 —— 这张图把这件事直接说了出来。',
            )}
          </p>
          {medianTotal > 0 && (
            <div className="mb-4 rounded-xl bg-red-50 p-4">
              <span className="text-3xl font-bold tabular-nums text-red-700">
                {Math.round((belowMedian / medianTotal) * 100)}%
              </span>
              <span className="ml-2 text-sm text-slate-600">
                {T('of measured calculations were below the provincial median', '的计算低于所在省的中位工资')}
              </span>
            </div>
          )}
          <Bars
            rows={extra?.by_median ?? []}
            total={medianTotal}
            label={(k) => (zh ? MEDIAN_LABEL_ZH : MEDIAN_LABEL)[String(k)] ?? String(k)}
            empty={noData}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card
            title={T('Province calculated', '计算的省份')}
            hint={T('The province the user selected — the core, untamperable signal.', '用户自己选的省份 —— 最核心、无法作假的信号。')}
          >
            <Bars rows={stats.by_province} total={t} empty={noData} />
          </Card>

          <Card
            title={T('Income bracket', '收入档位')}
            hint={T('Exact salaries are never stored — only these seven ranges.', '从不存具体工资 —— 只有这七个区间。')}
          >
            <Bars rows={stats.by_bracket} total={t} label={(k) => BRACKET_LABEL[String(k)] ?? String(k)} empty={noData} />
          </Card>

          <Card
            title={T('Interface language', '界面语言')}
            hint={T('Ten languages live. Language × country is the newcomer-intent signal.', '十种语言在线。语言 × 国家就是新移民意向信号。')}
          >
            <Bars rows={stats.by_lang} total={t} label={(k) => LANG_NAMES[String(k)] ?? String(k)} empty={noData} />
          </Card>

          <Card title={T('Calculator used', '用的哪个计算器')}>
            <Donut rows={stats.by_mode} />
          </Card>

          {/* Derived employment shape — no question was ever asked */}
          <Card
            title={T('Employment shape', '就业形态')}
            hint={T(
              'Derived from which calculator was used, weekly hours, tips, and shift premiums — never asked as a question. Salaried vs hourly vs part-time vs shift vs tipped.',
              '从用了哪个计算器、周工时、小费、班次津贴推导出来 —— 一个问题都没问过。受薪 / 时薪 / 兼职 / 轮班 / 小费业。',
            )}
          >
            <Bars
              rows={extra?.by_shape ?? []}
              total={extra?.by_shape?.reduce((a, r) => a + r.n, 0) ?? 0}
              label={(k) => (zh ? SHAPE_LABEL_ZH : SHAPE_LABEL)[String(k)] ?? String(k)}
              empty={noData}
            />
          </Card>

          <Card title={T('Device', '设备')}>
            <Donut rows={stats.by_device} label={(k) => (k === '?' ? T('Unknown', '未知') : String(k))} />
          </Card>

          <Card
            title={T('Declared industry', '申报的行业')}
            hint={T('Voluntary — users pick it to see where their pay stands.', '自愿填写 —— 用户选行业是为了看自己的工资在行业里的位置。')}
          >
            <Bars rows={stats.by_industry} total={t} empty={noData} />
          </Card>

          <Card
            title={T('Day of week', '星期分布')}
            hint={T('Payday-cycle signal: most Canadian employers pay biweekly on Fridays.', '发薪周期信号:加拿大多数雇主双周五发薪。')}
          >
            <Bars rows={stats.by_dow} total={t} label={(k) => (zh ? DOW_ZH : DOW)[Number(k)] ?? String(k)} empty={noData} />
          </Card>

          <Card
            title={T('Where it was calculated', '在哪算的')}
            hint={T('Website, iPhone app, or a widget embedded on another site.', '网站、iPhone App,或嵌在别人网站里的小组件。')}
          >
            <Donut
              rows={stats.by_source}
              label={(k) =>
                (zh
                  ? ({ web: '网站', app: 'iPhone App', widget: '嵌入组件' } as Record<string, string>)
                  : ({ web: 'Website', app: 'iPhone app', widget: 'Embedded widget' } as Record<string, string>))[
                  String(k)
                ] ?? String(k)
              }
            />
          </Card>

          {/* Entry page — which page does the convincing */}
          <Card
            title={T('Entry page', '入口页面')}
            hint={T(
              'The first page of the visit that led to a calculation — which pages actually convert readers into users.',
              '产生计算的那次访问落地的第一个页面 —— 哪些页面真的把读者变成了用户。',
            )}
          >
            <Bars
              rows={extra?.by_entry ?? []}
              total={extra?.by_entry?.reduce((a, r) => a + r.n, 0) ?? 0}
              empty={noData}
            />
          </Card>
        </div>

        {/* Hour of day + shift start — two 24h clocks side by side */}
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card
            title={T("Hour of day (user's local time)", '一天中的时刻(用户当地时间)')}
            hint={T('When Canadians check their pay.', '加拿大人什么时候查工资。')}
          >
            <HourChart
              rows={hourRows}
              peakLabel={(h, n) =>
                zh ? `高峰在 ${h}:00 —— ${n} 次计算` : `Peak at ${h}:00 — ${n} calculations`
              }
            />
          </Card>

          <Card
            title={T('When shifts start', '几点上班')}
            hint={
              zh
                ? `来自 ${shiftTotal} 次班次计算的开班时刻。9 点以外的每一根柱都是官方统计里看不见的人 —— 夜班加拿大没有公开数据。`
                : `Shift start hours from ${shiftTotal} shift calculations. Every bar away from 9am is someone official statistics cannot see — night-shift Canada has no public dataset.`
            }
          >
            <HourChart
              rows={shiftRows}
              color="bg-slate-700"
              peakLabel={(h, n) =>
                zh
                  ? `最常见的开班时刻是 ${h}:00(${n} 次);其余 ${shiftTotal - n} 次班次不在这个时刻开始`
                  : `Most shifts start at ${h}:00 (${n}); the other ${shiftTotal - n} start somewhere else`
              }
            />
          </Card>
        </div>

        {/* Work patterns — the story nobody else has */}
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card
            title={T('Work patterns', '工作形态')}
            hint={
              zh
                ? `来自 ${stats.work?.n ?? 0} 次排班/时薪表计算。只记班表形状 —— 从不记具体日期。`
                : `From ${stats.work?.n ?? 0} shift/timesheet calculations. Schedule shape only — never specific dates.`
            }
          >
            <dl className="space-y-3 text-sm">
              {[
                [T('Have an unpaid break', '有无薪休息'), stats.work?.unpaid_break_share != null ? `${stats.work.unpaid_break_share}%` : '—'],
                [T('Median unpaid break', '无薪休息中位时长'), stats.work?.median_break != null ? `${stats.work.median_break} min` : '—'],
                [T('Work weekends', '周末要上班'), stats.work?.weekend_share != null ? `${stats.work.weekend_share}%` : '—'],
                [T('Median shift length', '班次中位时长'), stats.work?.median_daily_hours != null ? `${stats.work.median_daily_hours} h` : '—'],
                [T('Median days per week', '每周中位工作天数'), stats.work?.median_days_week != null ? `${stats.work.median_days_week}` : '—'],
              ].map(([k, v]) => (
                <div key={k} className="flex items-baseline justify-between border-b border-slate-100 pb-2">
                  <dt className="text-slate-600">{k}</dt>
                  <dd className="text-lg font-bold tabular-nums text-slate-900">{v}</dd>
                </div>
              ))}
            </dl>
          </Card>

          <Card
            title={T('Relocation intent', '搬家意向')}
            hint={T(
              'Visits where one person compared two or more provinces in a single session.',
              '同一次访问里,一个人对比了两个或以上省份。',
            )}
          >
            <div className="text-5xl font-bold tabular-nums text-red-600">{stats.comparison_sessions}</div>
            <p className="mt-2 text-sm text-slate-500">
              {stats.sessions
                ? zh
                  ? `占所有访问的 ${Math.round((stats.comparison_sessions / stats.sessions) * 100)}%`
                  : `${Math.round((stats.comparison_sessions / stats.sessions) * 100)}% of all visits`
                : ''}
            </p>
            <p className="mt-4 text-xs leading-5 text-slate-400">
              {T(
                'This is the dataset nobody else has: someone weighing a move sees two provinces side by side in one sitting. At scale it becomes the interprovincial-migration story.',
                '这是别人都没有的数据:考虑搬家的人会在一次访问里把两个省摆在一起看。规模起来之后,这就是省际迁移的报道素材。',
              )}
            </p>
          </Card>

          {/* Expectation — one-tap "lower / as expected / higher" */}
          <Card
            title={T('Take-home vs expectation', '到手工资 vs 预期')}
            hint={T(
              'One tap after seeing the result: was your take-home lower, about right, or higher than you thought? No agency records what people thought they would earn — this is the field that headlines are made of.',
              '看到结果后一键作答:到手的钱比你想的少、差不多、还是多?没有任何机构记录人们「以为自己能拿多少」—— 这是最出标题的字段。',
            )}
          >
            <Bars
              rows={extra?.by_expectation ?? []}
              total={extra?.by_expectation?.reduce((a, r) => a + r.n, 0) ?? 0}
              label={(k) => (zh ? EXPECT_LABEL_ZH : EXPECT_LABEL)[String(k)] ?? String(k)}
              empty={T('Port is live — collecting now.', '端口已上线 —— 正在采集。')}
            />
          </Card>

          {/* Raise detection — the Ookla-style moat, port open, waiting for data */}
          <Card
            title={T('Raise detection', '涨薪检测')}
            hint={T(
              'Registered users re-opening a saved calculation with a new wage = a raise or pay-cut signal over time. The only longitudinal repeat measurement in the dataset — the Speedtest-style moat. Needs months of registered use to fill.',
              '注册用户重开保存过的计算并改了工资 = 一条随时间的涨薪/降薪信号。这是数据集中唯一的纵向重复测量 —— Speedtest 式的护城河,需要几个月的注册使用才会有数据。',
            )}
          >
            <Bars
              rows={extra?.by_paychange ?? []}
              total={extra?.by_paychange?.reduce((a, r) => a + r.n, 0) ?? 0}
              label={(k) => (zh ? PAYCHANGE_LABEL_ZH : PAYCHANGE_LABEL)[String(k)] ?? String(k)}
              empty={T('Port is live — no repeat measurements yet.', '端口已上线 —— 还没有重复测量。')}
            />
            {extra?.registered && (
              <p className="mt-3 border-t border-slate-100 pt-3 text-xs text-slate-400">
                {zh
                  ? `前置条件:目前 ${extra.registered.share ?? 0}% 的计算来自登录用户。`
                  : `Prerequisite: ${extra.registered.share ?? 0}% of calculations currently come from signed-in users.`}
              </p>
            )}
          </Card>

          {/* Why people checked */}
          <Card
            title={T('Why people checked', '为什么来算')}
            hint={T(
              'One-tap intent after the result: job offer, raise, moving, budgeting, curiosity.',
              '出结果后一键作答的来意:权衡 offer、涨薪、搬家、做预算、纯好奇。',
            )}
          >
            <Bars
              rows={extra?.by_intent ?? []}
              total={extra?.by_intent?.reduce((a, r) => a + r.n, 0) ?? 0}
              label={(k) => (zh ? INTENT_LABEL_ZH : INTENT_LABEL)[String(k)] ?? String(k)}
              empty={noData}
            />
          </Card>
        </div>

        {/* What one visit looks like inside — scenario modelling, derived
            entirely from events that already exist. 3.3 calcs/visit is not
            loyalty; it is people test-driving a different income. */}
        {journeys && journeys.multi > 0 && (
          <div className="mt-6 rounded-2xl border-2 border-red-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-800">
              {T('What one visit looks like inside', '一次访问的内部')}
            </h2>
            <p className="mb-4 mt-0.5 text-xs leading-5 text-slate-400">
              {T(
                'People do not check their pay once — they re-run the calculator with a different income, more overtime, or a bigger RRSP contribution. The wage they try out but do not yet earn is a measurement of aspiration, and no statistics agency collects it.',
                '人们不是查一次就走 —— 他们会换一个收入、加几小时加班、调大 RRSP 供款再算一遍。那个「试算过但还没拿到」的工资是对愿望的测量,没有任何统计机构在采集它。',
              )}
            </p>
            <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
              {[
                {
                  n: `${Math.round((journeys.multi / Math.max(1, journeys.sessions)) * 100)}%`,
                  l: T('of visits calculate more than once', '的访问算了不止一次'),
                },
                {
                  n: `${Math.round((journeys.varied.income / Math.max(1, journeys.multi)) * 100)}%`,
                  l: T('of those try a different income', '其中换收入试算'),
                },
                {
                  n: `${Math.round((journeys.varied.overtime / Math.max(1, journeys.multi)) * 100)}%`,
                  l: T('try a different overtime load', '换加班时长试算'),
                },
                {
                  n: `${Math.round((journeys.varied.rrsp / Math.max(1, journeys.multi)) * 100)}%`,
                  l: T('tune their RRSP contribution', '在调 RRSP 供款'),
                },
              ].map((x) => (
                <div key={x.l} className="rounded-xl bg-slate-50 p-3">
                  <div className="text-2xl font-bold tabular-nums text-slate-900">{x.n}</div>
                  <div className="mt-0.5 text-xs text-slate-500">{x.l}</div>
                </div>
              ))}
            </div>
            {(() => {
              const m = journeys.income_moves;
              const moves = m.up + m.down;
              if (!moves) return null;
              return (
                <div className="rounded-xl bg-red-50 p-4">
                  <span className="text-3xl font-bold tabular-nums text-red-700">
                    {Math.round((m.up / moves) * 100)}%
                  </span>
                  <span className="ml-2 text-sm text-slate-600">
                    {T(
                      'of within-visit income changes go UP — people are pricing the raise or the offer they hope for, not a pay cut they fear.',
                      '的访问内收入改动是往上调 —— 人们在给期望中的涨薪或 offer 定价,而不是在预演降薪。',
                    )}
                  </span>
                  <p className="mt-2 text-xs text-slate-400">
                    {zh
                      ? `连续两次计算之间收入档位的变化:上调 ${m.up} 次 · 下调 ${m.down} 次 · 未变 ${m.same} 次。访问深度:1 次 ${journeys.depth.one} · 2–4 次 ${journeys.depth.two_four} · 5 次以上 ${journeys.depth.five_plus},单次访问最多 ${journeys.depth.max} 次。`
                      : `Income-bracket changes between consecutive calculations: up ${m.up} · down ${m.down} · unchanged ${m.same}. Visit depth: single ${journeys.depth.one} · 2–4 ${journeys.depth.two_four} · 5+ ${journeys.depth.five_plus}, deepest visit ${journeys.depth.max}.`}
                  </p>
                </div>
              );
            })()}
          </div>
        )}

        {/* Savings, premium pay, tips — signals nobody else collects */}
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card
            title={T('RRSP behaviour', 'RRSP 储蓄行为')}
            hint={
              zh
                ? `来自 ${stats.rrsp?.n ?? 0} 次计算。供款按占工资比例分档存储。`
                : `From ${stats.rrsp?.n ?? 0} calculations. Contribution stored as a share of pay, bucketed.`
            }
          >
            <div className="mb-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-slate-50 p-3">
                <div className="text-2xl font-bold tabular-nums text-slate-900">
                  {stats.rrsp?.has_rrsp_share != null ? `${stats.rrsp.has_rrsp_share}%` : '—'}
                </div>
                <div className="text-xs text-slate-500">{T('contribute to an RRSP', '在供 RRSP')}</div>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <div className="text-2xl font-bold tabular-nums text-slate-900">
                  {stats.rrsp?.employer_match_share != null ? `${stats.rrsp.employer_match_share}%` : '—'}
                </div>
                <div className="text-xs text-slate-500">{T('get an employer match', '雇主有配比')}</div>
              </div>
            </div>
            <Bars rows={stats.by_rrsp_pct} total={t} label={(k) => (zh ? RRSP_LABEL_ZH : RRSP_LABEL)[String(k)] ?? String(k)} empty={noData} />
          </Card>

          <Card
            title={T('Overtime & shift premium', '加班与班次津贴')}
            hint={T(
              'Canada has no systematic public data on night-shift premiums.',
              '加拿大没有任何系统性的夜班津贴公开数据。',
            )}
          >
            <div className="mb-4 rounded-xl bg-slate-50 p-3">
              <div className="text-2xl font-bold tabular-nums text-slate-900">
                {stats.premium?.share != null ? `${stats.premium.share}%` : '—'}
              </div>
              <div className="text-xs text-slate-500">{T('receive a shift premium', '拿班次津贴')}</div>
            </div>
            <Bars rows={stats.by_ot} total={t} label={(k) => (zh ? OT_LABEL_ZH : OT_LABEL)[String(k)] ?? String(k)} empty={noData} />
            {stats.by_premium_rate?.length > 0 && (
              <div className="mt-4 border-t border-slate-100 pt-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {T('Premium rate', '津贴金额')}
                </p>
                <Bars rows={stats.by_premium_rate} total={t} label={(k) => PREMIUM_LABEL[String(k)] ?? String(k)} empty={noData} />
              </div>
            )}
          </Card>

          <Card
            title={T('Tips', '小费')}
            hint={T(
              'Declared tips as a share of pay, derived from the tips column of the timesheet calculator — never asked separately. Official tip data barely exists. Thin so far because few timesheet users have tipped work.',
              '小费占工资的比例,从时薪表计算器里用户本来就要填的小费栏派生 —— 没有额外提问。官方几乎没有小费数据。目前数据很薄:用时薪表的人少,且来的多不是小费行业。',
            )}
          >
            <Bars rows={stats.by_tips} total={t} label={(k) => (zh ? TIPS_LABEL_ZH : TIPS_LABEL)[String(k)] ?? String(k)} empty={noData} />
          </Card>

          <Card title={T('Pay frequency', '发薪频率')}>
            <Donut rows={stats.by_pay_freq} />
          </Card>

          <Card title={T('Engagement', '使用深度')} hint={T('Product diagnostics — not for publication.', '产品诊断用 —— 不对外发表。')}>
            <dl className="space-y-3 text-sm">
              <div className="flex items-baseline justify-between border-b border-slate-100 pb-2">
                <dt className="text-slate-600">{T('Open the deep tax report', '打开完整税务报告')}</dt>
                <dd className="text-lg font-bold tabular-nums text-slate-900">
                  {stats.engagement?.report_share != null ? `${stats.engagement.report_share}%` : '—'}
                </dd>
              </div>
              <div className="flex items-baseline justify-between border-b border-slate-100 pb-2">
                <dt className="text-slate-600">{T('Median calculations per visit', '每次访问计算次数中位')}</dt>
                <dd className="text-lg font-bold tabular-nums text-slate-900">
                  {stats.engagement?.median_calcs_per_session ?? '—'}
                </dd>
              </div>
            </dl>
          </Card>
        </div>

        {/* Activity over time */}
        {series && (
          <div className="mt-6">
            <TrendChart series={series} />
          </div>
        )}

        {/* The crossing — and how far this sample sits from the national median */}
        {cross && (
          <div className="mt-6">
            <Card
              title={T('Income bracket by province and industry', '收入档位 × 省份 × 行业')}
              hint={T(
                'The crossing single charts cannot show, measured against the Statistics Canada median.',
                '单张图表画不出来的交叉,基准是加拿大统计局的中位数。',
              )}
            >
              <CrossTab data={cross} />
            </Card>
          </div>
        )}

        {/* Who turned up, by income bracket, day by day */}
        {candles && candles.candles.length > 0 && (
          <div className="mt-6">
            <Card
              title={T('Income mix by day', '每日收入构成')}
              hint={T(
                'Who turned up to check their pay — never what anyone actually earns.',
                '每天来查工资的都是什么收入的人 —— 从不涉及任何人的具体收入。',
              )}
            >
              <Candles data={candles} />
            </Card>
          </div>
        )}

        {/* Why any of the above can be believed. Last, because it answers a
            question the reader only has after seeing the numbers. */}
        {prov && (
          <div className="mt-6">
            <Card
              title={T('Provenance', '数据溯源')}
              hint={T(
                'Where these numbers come from, and how they are kept honest.',
                '这些数字从哪来,以及如何保证没被改过。',
              )}
            >
              <Provenance data={prov} />
            </Card>
          </div>
        )}

        {/* What people searched to get here */}
        <SearchPanel />
        <ContentPanel />

        <p className="mt-10 text-center text-xs text-slate-400">
          {zh
            ? `实时读取匿名事件表 · 已剔除 ${stats.excluded_rows} 条站主/测试事件 · 最后一条事件 ${
                stats.last_event ? new Date(stats.last_event).toLocaleString('zh-CA') : '—'
              }`
            : `Live from the anonymous events table · ${stats.excluded_rows} owner/test event${
                stats.excluded_rows === 1 ? '' : 's'
              } excluded · last event ${stats.last_event ? new Date(stats.last_event).toLocaleString('en-CA') : '—'}`}
        </p>
      </div>
    </div>
  );
}
