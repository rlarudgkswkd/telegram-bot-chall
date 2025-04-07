import { NextResponse, NextRequest } from 'next/server';
import { DatabaseService } from '@/services/databaseService';
import { AuthService } from '@/services/authService';

export async function GET(request: NextRequest) {
  try {
    // 토큰에서 사용자 ID 추출
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: '인증되지 않은 요청입니다.' },
        { status: 401 }
      );
    }

    const authService = AuthService.getInstance();
    const decoded = await authService.verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: '유효하지 않은 토큰입니다.' },
        { status: 401 }
      );
    }

    const db = DatabaseService.getInstance();

    // 사용자의 구독 정보 조회
    const subscription = await db.getUserSubscription(decoded.userId);
    if (!subscription) {
      return NextResponse.json(
        { error: '구독 정보가 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      subscription: {
        plan: subscription.plan,
        isTrial: subscription.isTrial,
        endDate: subscription.endDate,
      },
    });
  } catch (error: any) {
    console.error('구독 정보 조회 오류:', error);
    return NextResponse.json(
      { error: error.message || '구독 정보 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 