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
      <pre className="overflow-x-auto rounded-xl border border-slate-200 bg-slate-900 p-4 text-xs leading-6 text-slate-100">
        <code>{code}</code>
      </pre>
      <button
        onClick={copy}
        className={`absolute right-3 top-3 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
          copied ? 'bg-green-600 text-white' : 'bg-red-600 text-white hover:bg-red-700'
        }`}
      >
        {copied ? 'Copied!' : 'Copy'}
      </button>
    </div>
  );
}
