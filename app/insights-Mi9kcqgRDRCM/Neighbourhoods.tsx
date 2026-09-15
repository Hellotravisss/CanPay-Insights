'use client';

/**
 * Calculations by postal-code prefix (FSA) — the first panel on this page
 * built from something a visitor GAVE rather than something the edge
 * inferred. Also the panel a real-estate buyer would ask to see first, so the
 * suppression rule is printed on it: a bracket mix needs twenty people, a bare
 * count needs five, and everything smaller is one withheld total.
 */
export type NeighbourhoodData = {
  min_cell: number;
  min_count: number;
  events_with_fsa: number;
  typed: number;
  device: number;
  remembered: number;
  positioned: number;
  fsas: number;
  shown: number;
  withheld_fsas: number;
  withheld_events: number;
  rows: { fsa: string; n: number; device: number; province: string | null; brackets: { k: string; n: number }[] | null; high_share: number | null }[];
  tz: { k: string | number; n: number }[];
  returning: { returning: number; first_time: number; unknown: number };
  bracket_order: string[];
  bracket_labels: string[];
};

const n = (v: number) => v.toLocaleString('en-CA');

export default function Neighbourhoods({ data, zh }: { data: NeighbourhoodData | null; zh: boolean }) {
  if (!data) return null;
  const T = (en: string, cn: string) => (zh ? cn : en);

  if (data.events_with_fsa === 0) {
    return (
      <p className="text-sm leading-6 text-slate-500">
        {T(
          'No neighbourhood answers yet. The prompt asks for the first three characters of a postal code, or a location rounded on the device, after every calculation — this panel fills in as people answer.',
          '还没有社区级回答。每次计算后会请访客输入邮编前三位,或在设备上就近取整的位置 —— 随着回答增加,这个面板会逐步填满。',
        )}
      </p>
    );
  }

  const stat = (label: string, value: string) => (
    <div key={label}>
      <dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</dt>
      <dd className="mt-0.5 text-xl font-bold tabular-nums text-slate-900">{value}</dd>
    </div>
  );

  return (
    <div>
      <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-4">
        {stat(T('Calculations with an FSA', '带 FSA 的计算'), n(data.events_with_fsa))}
        {stat(T('Distinct FSAs', '不同 FSA 数'), n(data.fsas))}
        {stat(T('Typed · device · remembered', '手输 · 定位 · 记住的'), `${n(data.typed)} · ${n(data.device)} · ${n(data.remembered)}`)}
        {stat(T('Returning devices', '回访设备'), data.returning.returning + data.returning.first_time > 0 ? `${Math.round((100 * data.returning.returning) / (data.returning.returning + data.returning.first_time))}%` : '—')}
      </dl>

      {data.rows.length > 0 && (
        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-400">
                <th className="py-1.5 pr-3 font-semibold">FSA</th>
                <th className="py-1.5 pr-3 font-semibold">{T('Province', '省')}</th>
                <th className="py-1.5 pr-3 text-right font-semibold">{T('Calcs', '次数')}</th>
                <th className="py-1.5 pr-3 text-right font-semibold">{T('From device', '来自定位')}</th>
                <th className="py-1.5 pr-3 text-right font-semibold">{T('$90k+ share', '$90k+ 占比')}</th>
                <th className="py-1.5 font-semibold">{T('Bracket mix', '收入档分布')}</th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((r) => (
                <tr key={r.fsa} className="border-t border-slate-100">
                  <td className="py-1.5 pr-3 font-mono font-semibold text-slate-800">{r.fsa}</td>
                  <td className="py-1.5 pr-3 text-slate-500">{r.province ?? '—'}</td>
                  <td className="py-1.5 pr-3 text-right tabular-nums text-slate-800">{n(r.n)}</td>
                  <td className="py-1.5 pr-3 text-right tabular-nums text-slate-500">{r.device}</td>
                  <td className="py-1.5 pr-3 text-right tabular-nums text-slate-800">{r.high_share === null ? T('withheld', '不显示') : `${r.high_share}%`}</td>
                  <td className="py-1.5">
                    {r.brackets ? (
                      <div className="flex h-3 w-40 overflow-hidden rounded-sm bg-slate-100" title={r.brackets.map((b, i) => `${data.bracket_labels[i]}: ${b.n}`).join(' · ')}>
                        {r.brackets.map((b, i) => (
                          <div key={b.k} style={{ width: `${(100 * b.n) / r.n}%`, backgroundColor: `hsl(0 70% ${88 - i * 9}%)` }} />
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-400">{T(`under ${data.min_cell}`, `不足 ${data.min_cell} 人`)}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-3 text-xs leading-5 text-slate-400">
        {T(
          `Suppression: a bracket mix needs ${data.min_cell} calculations, a bare count needs ${data.min_count}. ${n(data.withheld_fsas)} FSAs with ${n(data.withheld_events)} calculations between them are below that and appear nowhere on this page — the same rule any licensed extract follows. Device positions are stored at two decimals (~1 km) in urban FSAs and one decimal (~11 km) in rural ones, rounded on the visitor's device before sending.`,
          `抑制规则:收入档分布需要 ${data.min_cell} 次计算,只显示次数需要 ${data.min_count} 次。共 ${n(data.withheld_fsas)} 个 FSA、${n(data.withheld_events)} 次计算低于门槛,不出现在本页任何地方 —— 任何对外授权的数据切片都遵循同一规则。设备定位在城市 FSA 存两位小数(约 1 公里),乡村 FSA 存一位(约 11 公里),都在访客设备上取整后才发送。`,
        )}
      </p>

      {data.tz.length > 0 && (
        <div className="mt-4 rounded-xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{T('Browser time zones', '浏览器时区')}</p>
          <p className="mt-1 text-xs leading-5 text-slate-400">
            {T(
              'The zone the browser reports, as a cross-check on the connection geography: a Toronto zone on a Vancouver connection is a VPN or a corporate egress, not a Vancouverite.',
              '浏览器上报的时区,用来交叉验证连接地理:温哥华 IP 配多伦多时区,多半是 VPN 或公司出口,不是温哥华人。',
            )}
          </p>
          <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
            {data.tz.map((z) => (
              <li key={String(z.k)} className="tabular-nums"><span className="font-mono">{String(z.k)}</span> · {n(z.n)}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
