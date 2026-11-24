'use client';
import { useState } from 'react';

export default function CopyEmbedCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable — user can still select the text */
    }
  };

  return (
    <div className="relative">
      <pre tabIndex={0} aria-label="Embed code" className="overflow-x-auto rounded-xl bg-[#15171C] p-4 pt-12 text-xs leading-6 text-pearl focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2">
        <code>{code}</code>
      </pre>
      <button
        onClick={copy}
        type="button"
        className={`absolute right-3 top-3 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
          copied ? 'bg-pearl-shade text-ink' : 'bg-white text-ink hover:bg-pearl'
        }`}
      >
        {copied ? 'Copied!' : 'Copy'}
      </button>
    </div>
  );
}
