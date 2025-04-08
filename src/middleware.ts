import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // /admin으로 시작하는 모든 경로에 대해
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Basic 인증 헤더 확인
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      // 쿠키에서 인증 정보 확인
      const adminAuth = request.cookies.get('adminAuth')?.value;
      if (adminAuth) {
        const [email, password] = Buffer.from(adminAuth, 'base64').toString('ascii').split(':');
        if (
          email === process.env.ADMIN_EMAIL &&
          password === process.env.ADMIN_PASSWORD
        ) {
          return NextResponse.next();
        }
      }

      // 인증 정보가 없으면 Basic Auth 요청
      return new NextResponse(
        JSON.stringify({ error: '인증에 실패했습니다.' }),
        {
          status: 401,
          headers: {
            'WWW-Authenticate': 'Basic realm="Admin Area"',
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Basic 인증 정보 디코딩
    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [email, password] = credentials.split(':');

    // 관리자 인증 확인
    if (
      email !== process.env.ADMIN_EMAIL ||
      password !== process.env.ADMIN_PASSWORD
    ) {
      return new NextResponse(
        JSON.stringify({ error: '인증에 실패했습니다.' }),
        {
          status: 401,
          headers: {
            'WWW-Authenticate': 'Basic realm="Admin Area"',
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // 인증 성공
    const response = NextResponse.next();
    response.cookies.set('adminAuth', base64Credentials, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/admin',
      maxAge: 7200 // 2시간
    });

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*'
} 