import { jobSearchLinks } from '../lib/partners';

/**
 * "Who actually pays this?" — job searches pinned to the salary and province of
 * the page the reader is already on.
 *
 * This earns nothing until a publisher id is configured, and says so. It is
 * here first because it is useful: the most common reason to look up the
 * take-home pay on a specific salary is that someone is weighing an offer.
 */
export default function JobsAtThisSalary({
  amount,
  provinceName,
}: {
  amount: number;
  provinceName: string;
}) {
  const links = jobSearchLinks(amount, provinceName);
  const anyPaid = links.some((l) => l.paid);
  const salary = `$${amount.toLocaleString('en-CA')}`;

  return (
    <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="text-xl font-bold text-slate-900">
        Jobs paying around {salary} in {provinceName}
      </h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Most people checking the take-home pay on a specific salary are weighing an offer or
        job-hunting. These searches are pre-filled for {salary} in {provinceName}.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        {links.map((l) => (
          <a
            key={l.id}
            href={l.url}
            target="_blank"
            rel={l.paid ? 'sponsored noopener noreferrer' : 'noopener noreferrer'}
            className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-800 no-underline hover:bg-slate-50"
          >
            Search on {l.label} →
          </a>
        ))}
      </div>
      <p className="mt-3 text-[11px] text-slate-400">
        {anyPaid
          ? 'Some job links are paid placements. They never affect our tax figures or rankings.'
          : 'Plain links to third-party job sites. We earn nothing from them and have no relationship with either site.'}
      </p>
    </section>
  );
}
