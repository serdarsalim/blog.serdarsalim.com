import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Bot probes for CMSs this site never ran. Answer 404 before they hit a route.
const BLOCKED_PATTERNS = [
  '/wp-',
  '.php',
  'xmlrpc',
  'wordpress',
  'administrator',
  'phpmyadmin',
  'setup-config',
  'myadmin',
  'webconfig',
];

// Public, read-only endpoints that other sites (serdarsalim.com) call from the browser.
const PUBLIC_API = ['/api/latest-posts'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (BLOCKED_PATTERNS.some((pattern) => pathname.includes(pattern))) {
    return new NextResponse(null, { status: 404 });
  }

  if (PUBLIC_API.some((p) => pathname.startsWith(p)) && request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/|static/|favicon.ico).*)'],
};
