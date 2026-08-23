import { NextResponse } from 'next/server';
import { currentUser } from '../../../../lib/auth/core';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const user = await currentUser(request);
  return NextResponse.json({ user }, { headers: { 'cache-control': 'private, no-store' } });
}
