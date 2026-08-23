/**
 * Browser → our own routes, with the session cookie. Resolves to the same
 * { data, error } pair the old Supabase calls returned, so hooks kept their
 * shape when the database and auth moved to Cloudflare.
 */
export async function api<T = unknown>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  path: string,
  body?: unknown,
): Promise<{ data: T | null; error: { message: string } | null }> {
  try {
    const r = await fetch(path, {
      method,
      credentials: 'same-origin',
      cache: 'no-store',
      headers: body !== undefined ? { 'content-type': 'application/json' } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    if (!r.ok) return { data: null, error: { message: `${r.status} ${(await r.text()).slice(0, 200)}` } };
    const text = await r.text();
    return { data: (text ? JSON.parse(text) : null) as T, error: null };
  } catch (e) {
    return { data: null, error: { message: (e as Error).message } };
  }
}
