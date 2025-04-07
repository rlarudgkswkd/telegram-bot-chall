import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // /admin 경로에 대해서만 처리
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // 쿠키에서 인증 정보 확인
    const adminAuth = request.cookies.get('adminAuth')?.value;
    if (!adminAuth) {
      // 인증 정보가 없으면 401 응답
      return new NextResponse(
        JSON.stringify({ error: '인증이 필요합니다.' }),
        {
          status: 401,
          headers: {
            'WWW-Authenticate': 'Basic realm="Admin Area"',
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // 인증 정보 확인
    const [email, password] = Buffer.from(adminAuth, 'base64').toString('ascii').split(':');
    if (
      email !== process.env.ADMIN_EMAIL ||
      password !== process.env.ADMIN_PASSWORD
    ) {
      // 인증 실패
      return new NextResponse(
        JSON.stringify({ error: '인증에 실패했습니다.' }),
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
} 