import { NextResponse } from 'next/server';
import { db } from '../../../lib/d1/db';
import { currentUser, sessionCookie } from '../../../lib/auth/core';

export const dynamic = 'force-dynamic';
const noStore = { 'cache-control': 'private, no-store' };

/** The signed-in user, for a client that wants to show who it is signed in as. */
export async function GET(request: Request) {
  const u = await currentUser(request);
  if (!u) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  return NextResponse.json(u, { headers: noStore });
}

/**
 * Delete the account and everything attached to it.
 *
 * App Store guideline 5.1.1(v): an app that lets people create an account has
 * to let them delete it, in the app, without emailing anyone. This is that.
 *
 * What goes, and what does not:
 *
 *  - Saved calculations, timesheets, settings, the exclusion flag and any
 *    unused magic-link tokens are DELETED. They exist only to serve this user.
 *
 *  - Purchases are kept but UNLINKED (user_id and email nulled). The row is a
 *    financial record — Stripe holds the authoritative copy and CRA expects
 *    the seller to keep one too — but once it carries no identifier it is no
 *    longer personal data. Deleting the money and keeping the person would be
 *    the wrong way round.
 *
 *  - Telemetry in `events` is untouched, and that is not an omission: it has
 *    no user id, no IP and no precise location by design, so there is no row
 *    here that could be found and removed even if we wanted to. Nothing in it
 *    points back at this person.
 *
 * The user row goes last, so a failure part-way through leaves an account that
 * can sign in and try again rather than an orphaned session pointing at
 * nothing.
 */
export async function DELETE(request: Request) {
  const u = await currentUser(request);
  if (!u) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const d = await db();

  await d.batch([
    d.prepare('delete from calculation_history where user_id = ?').bind(u.id),
    d.prepare('delete from timesheet_entries where user_id = ?').bind(u.id),
    d.prepare('delete from user_settings where user_id = ?').bind(u.id),
    d.prepare('delete from excluded_users where user_id = ?').bind(u.id),
    d.prepare('delete from auth_tokens where email = ?').bind(u.email),
    d.prepare('update purchases set user_id = null, email = null where user_id = ? or email = ?').bind(u.id, u.email),
    d.prepare('delete from users where id = ?').bind(u.id),
  ]);

  // Clearing the cookie signs the web out. The app drops its bearer token on
  // its own; either way the token is already dead, because verification reads
  // session_version from a users row that no longer exists.
  return NextResponse.json({ ok: true }, { headers: { ...noStore, 'Set-Cookie': sessionCookie(null) } });
}
