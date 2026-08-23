import { getCloudflareContext } from '@opennextjs/cloudflare';

/**
 * D1 access for route handlers. Everything the site knows now lives in the
 * `canpay` database bound as DB (wrangler.jsonc). There is no client-side
 * database access any more: the browser only ever talks to our own routes.
 */
export type D1 = {
  prepare(sql: string): {
    bind(...values: unknown[]): { all<T = Record<string, unknown>>(): Promise<{ results: T[] }>; run(): Promise<unknown>; first<T = Record<string, unknown>>(): Promise<T | null> };
    all<T = Record<string, unknown>>(): Promise<{ results: T[] }>;
    run(): Promise<unknown>;
    first<T = Record<string, unknown>>(): Promise<T | null>;
  };
  batch(stmts: unknown[]): Promise<unknown>;
};

export async function db(): Promise<D1> {
  const { env } = await getCloudflareContext({ async: true });
  const d = (env as unknown as { DB?: D1 }).DB;
  if (!d) throw new Error('D1 binding DB missing');
  return d;
}

export async function secret(name: string): Promise<string | undefined> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    return (env as unknown as Record<string, string | undefined>)[name];
  } catch {
    return process.env[name];
  }
}

/** Constant-time-ish token comparison for ingest/export endpoints. */
export function tokenOk(given: string | null | undefined, expected: string | undefined): boolean {
  if (!given || !expected || given.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < given.length; i++) diff |= given.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}
