/**
 * Data-room reads go through our own routes on D1 (see app/api/insights).
 * Returns the same { data, error } shape the old supabase.rpc() calls
 * resolved to, so the panels did not have to change.
 */
export function insights<T = unknown>(name: string): Promise<{ data: T | null; error: { message: string } | null }> {
  return fetch(`/api/insights/${name}`, { headers: { 'x-room-key': 'Mi9kcqgRDRCM' }, cache: 'no-store' })
    .then(async (r) => (r.ok ? { data: (await r.json()) as T, error: null } : { data: null, error: { message: `${r.status} ${await r.text()}` } }))
    .catch((e) => ({ data: null, error: { message: (e as Error).message } }));
}
