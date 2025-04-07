import { NextResponse } from 'next/server';
import { AuthService } from '@/services/authService';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: '이메일은 필수 입력 항목입니다.' },
        { status: 400 }
      );
    }

    const authService = AuthService.getInstance();
    const token = await authService.loginWithEmail(email);

    if (!token) {
      return NextResponse.json(
        { error: '등록되지 않은 이메일입니다.' },
        { status: 401 }
      );
    }

    const response = NextResponse.json({ success: true });
    
    // Set auth token cookie
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 // 24 hours
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: '로그인 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 