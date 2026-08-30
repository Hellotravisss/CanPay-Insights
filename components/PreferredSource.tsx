'use client';
import { useT } from '../lib/i18n';

/**
 * "Add this to your preferred sources" — the official Google deep link, drawn
 * as our own button.
 *
 * NOT the embed. Google publishes a drop-in widget
 * (news.google.com/swg/js/v1/publisher.js + a marked div) that does the same
 * job, and it costs a render-blocking third-party script on every page that
 * carries it, a tracking surface charged to the reader, and Google's brand
 * colours inside our design system. The deep link below is the same feature
 * with none of that.
 *
 * The honesty paragraph is not filler. Preferred sources is PERSONALISATION:
 * it changes what the person who opted in sees, and nothing about our position
 * in anybody else's results. A widely-shared reading of the phrase "a global
 * SEO signal" took "global" to mean ranking weight when it meant
 * geographically available. Saying so plainly is the point of the block.
 *
 * Placed under the article list, where the recurring content is — a reader who
 * has scrolled a list of articles is the only one for whom "show me more of
 * this source" means anything.
 */
export default function PreferredSource() {
  const { t } = useT();
  return (
    <section className="mx-auto max-w-3xl px-4 pb-14">
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-bold text-slate-900">{t('ps.title')}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">{t('ps.body')}</p>
        <p className="mt-2 text-xs leading-5 text-slate-500">{t('ps.honest')}</p>
        <a
          href="https://www.google.com/preferences/source?q=canpayinsights.ca"
          target="_blank"
          rel="noopener"
          className="mt-4 inline-flex items-center gap-2 rounded-xl border-2 border-slate-900 px-5 py-2.5 text-sm font-bold text-slate-900 no-underline transition-colors hover:bg-slate-900 hover:text-white"
        >
          {t('ps.cta')}
          <span aria-hidden="true">→</span>
        </a>
      </div>
    </section>
  );
}
