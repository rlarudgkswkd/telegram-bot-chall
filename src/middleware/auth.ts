import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AuthService } from '@/services/authService';

export async function auth(request: NextRequest) {
  // JWT 토큰 확인
  const token = request.cookies.get('auth_token')?.value;
  
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 토큰 검증
  const authService = AuthService.getInstance();
  const user = await authService.getUserFromToken(token);
  
  if (!user) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('auth_token');
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/subscribe/:path*'
  ]
} 