import { NextResponse } from 'next/server';
import { DatabaseService } from '@/services/databaseService';
import PayPalService from '@/services/paypalService';
import { AuthService } from '@/services/authService';

export async function POST(request: Request) {
  try {
    const { email, name, startTrial } = await request.json();

    if (!email || !name) {
      return NextResponse.json(
        { error: '이메일과 이름은 필수 입력 항목입니다.' },
        { status: 400 }
      );
    }

    const db = DatabaseService.getInstance();

    // 이메일로 기존 사용자 확인
    const existingUser = await db.getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: '이미 등록된 이메일입니다.' },
        { status: 400 }
      );
    }

    // 새 사용자 생성
    const user = await db.createUser(email, name);

    // 무료 체험 시작
    if (startTrial) {
      const paypalService = await PayPalService.getInstance();
      await paypalService.startTrial(user.id);
    }

    // 자동 로그인을 위한 토큰 생성
    const authService = AuthService.getInstance();
    const token = await authService.generateToken(user.id);

    const response = NextResponse.json({
      message: '사용자 등록이 완료되었습니다.',
      userId: user.id,
    });

    // Set auth token cookie
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 // 24 hours
    });

    return response;
  } catch (error: any) {
    console.error('사용자 등록 오류:', error);
    return NextResponse.json(
      { error: error.message || '사용자 등록 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 