/**
 * Data-room reads go through our own routes on D1 (see app/api/insights).
 * Returns the same { data, error } shape the old supabase.rpc() calls
 * resolved to, so the panels did not have to change.
 *
 * The key is NOT in this file. It used to be a string literal here, which put
 * it in every visitor's JavaScript and in a public repository (found
 * 2026-09-22). It now lives in this browser's storage only: open the room once
 * with the key in the address's #fragment (a fragment is never sent to any
 * server or written to any log), and it is kept and wiped from the address bar.
 */
const STORE = 'canpay_room_key';

export function roomKey(): string | null {
  try {
    const m = window.location.hash.match(/key=([0-9a-f]{16,})/i);
    if (m) {
      localStorage.setItem(STORE, m[1]);
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    return localStorage.getItem(STORE);
  } catch {
    return null;
  }
}

export function forgetRoomKey(): void {
  try { localStorage.removeItem(STORE); } catch { /* nothing to forget */ }
}

export function insights<T = unknown>(name: string): Promise<{ data: T | null; error: { message: string } | null }> {
  const key = roomKey();
  if (!key) return Promise.resolve({ data: null, error: { message: '403 no room key in this browser' } });
  return fetch(`/api/insights/${name}`, { headers: { 'x-room-key': key }, cache: 'no-store' })
    .then(async (r) => (r.ok ? { data: (await r.json()) as T, error: null } : { data: null, error: { message: `${r.status} ${await r.text()}` } }))
    .catch((e) => ({ data: null, error: { message: (e as Error).message } }));
}
