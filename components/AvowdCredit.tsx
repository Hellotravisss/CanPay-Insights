/**
 * Avowd credit — one per page, and only one.
 *
 * CanPay Insights is an Avowd project, not a client engagement, so the wording
 * is "An Avowd project". Writing "Site & GEO by Avowd" here would dress an
 * own-brand property up as a case study, and anyone who looks at the registrar,
 * the Cloudflare account or the analytics tag can see it is the same person.
 * Marking it honestly as an own project is the version an engine can verify.
 *
 * The half that matters more is machine-readable and lives in app/layout.tsx:
 * WebSite.creator -> https://avowd.ai/#org. This line is the human-visible
 * counterpart, deliberately small but not hidden — an opacity-0.3 credit is a
 * credit nobody reads, which defeats the point of having one.
 */
export default function AvowdCredit({ lang = 'en' }: { lang?: 'en' | 'zh' | 'fr' }) {
  return (
    <a
      href="https://avowd.ai/?utm_source=canpayinsights.ca&utm_medium=credit"
      rel="noopener"
      className="text-slate-400 underline decoration-slate-300 underline-offset-4 transition-colors hover:text-red-600"
    >
      {lang === 'zh' ? 'Avowd 青眼出品' : lang === 'fr' ? 'Un projet Avowd' : 'An Avowd project'}
    </a>
  );
}
