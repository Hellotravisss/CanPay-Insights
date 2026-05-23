type ShareLinksProps = {
  url?: string;
  title?: string;
  description?: string;
  compact?: boolean;
};

const DEFAULT_URL = 'https://canpayinsights.ca/';
const DEFAULT_TITLE = 'Free Canadian Payroll Calculator 2025/2026';
const DEFAULT_DESCRIPTION =
  'Estimate Canadian take-home pay by province with CPP, EI, income tax, hourly wage, salary, and timesheet tools.';

export default function ShareLinks({
  url = DEFAULT_URL,
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  compact = false,
}: ShareLinksProps) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);
  const emailBody = encodeURIComponent(`${description}\n\n${url}`);

  const links = [
    {
      label: 'LinkedIn',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
    {
      label: 'X',
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    },
    {
      label: 'Reddit',
      href: `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
    },
    {
      label: 'Email',
      href: `mailto:?subject=${encodedTitle}&body=${emailBody}`,
    },
  ];

  return (
    <section
      className={`bg-white border border-slate-200 rounded-xl shadow-sm ${
        compact ? 'p-4' : 'p-6'
      }`}
      aria-labelledby="share-canpay"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 id="share-canpay" className={`${compact ? 'text-lg' : 'text-xl'} font-bold text-slate-900`}>
            Share this free calculator
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Help another Canadian compare take-home pay before accepting a job offer or planning a move.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target={link.href.startsWith('mailto:') ? undefined : '_blank'}
              rel={link.href.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
              className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700 no-underline transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
