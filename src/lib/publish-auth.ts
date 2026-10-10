// src/lib/publish-auth.ts
// Bearer-token guard for the publish API that Mana's Publisher calls.
import { timingSafeEqual } from 'crypto';
import { NextResponse } from 'next/server';

export function isAuthorizedPublisher(request: Request): boolean {
  const expected = process.env.MANA_PUBLISH_TOKEN;
  if (!expected) return false; // unset token = endpoint closed, never open

  const header = request.headers.get('authorization') || '';
  const match = /^Bearer\s+(.+)$/i.exec(header.trim());
  if (!match) return false;

  const given = Buffer.from(match[1]);
  const want = Buffer.from(expected);
  return given.length === want.length && timingSafeEqual(given, want);
}

export function unauthorized() {
  const configured = Boolean(process.env.MANA_PUBLISH_TOKEN);
  return NextResponse.json(
    { error: configured ? 'Unauthorized' : 'MANA_PUBLISH_TOKEN is not set on the server' },
    { status: 401 }
  );
}
