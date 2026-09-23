'use client';
import { useEffect, useState } from 'react';
import { roomKey } from './api';

/**
 * Shows the room only in a browser that holds the key. Without it the page is
 * an empty shell — the data itself is refused by the API either way, so this
 * is courtesy, not security.
 */
export default function KeyGate({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<'checking' | 'ok' | 'none'>('checking');
  const [draft, setDraft] = useState('');
  useEffect(() => { setState(roomKey() ? 'ok' : 'none'); }, []);

  if (state === 'checking') return null;
  if (state === 'ok') return <>{children}</>;
  return (
    <main className="mx-auto max-w-md px-4 py-24">
      <h1 className="text-lg font-bold text-slate-900">Data room</h1>
      <p className="mt-2 text-sm text-slate-600">This browser has no room key.</p>
      <form
        className="mt-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          const k = draft.trim();
          if (!/^[0-9a-f]{16,}$/i.test(k)) return;
          window.location.hash = `key=${k}`;
          window.location.reload();
        }}
      >
        <input
          type="password"
          autoComplete="off"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
          placeholder="Room key"
        />
        <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-white">Open</button>
      </form>
    </main>
  );
}
