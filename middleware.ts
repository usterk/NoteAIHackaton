import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
  runtime: 'nodejs',
  matcher: ['/dashboard/:path*', '/login'],
};

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const isLoginPage = request.nextUrl.pathname === '/login';
  const isDashboard = request.nextUrl.pathname.startsWith('/dashboard');

  // Jeśli użytkownik jest zalogowany i próbuje wejść na stronę logowania
  if (token && isLoginPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Jeśli użytkownik nie jest zalogowany i próbuje wejść na dashboard
  if (!token && isDashboard) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}
