import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (
      email !== process.env.ADMIN_EMAIL ||
      password !== process.env.ADMIN_PASSWORD
    ) {
      return new NextResponse(
        JSON.stringify({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' }),
        { status: 401 }
      );
    }

    const token = jwt.sign(
      { email, role: 'ADMIN' },
      process.env.JWT_SECRET!,
      { expiresIn: '2h' }
    );

    const response = NextResponse.json({ success: true });

    response.cookies.set('adminToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 2 * 60 * 60, // 2시간
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return new NextResponse(
      JSON.stringify({ error: '로그인 처리 중 오류가 발생했습니다.' }),
      { status: 500 }
    );
  }
}