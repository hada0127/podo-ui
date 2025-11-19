import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export function middleware(request: NextRequest) {
  // Allow all requests to pass through
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|logo.svg).*)'],
};
