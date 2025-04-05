import { NextResponse } from 'next/server';
import DatabaseService from '@/services/databaseService';

export async function GET(request: Request) {
  try {
    // TODO: 실제 구현에서는 세션이나 토큰에서 사용자 ID를 가져와야 합니다.
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json(
        { error: '인증되지 않은 요청입니다.' },
        { status: 401 }
      );
    }

    const db = DatabaseService.getInstance();

    // 사용자의 구독 정보 조회
    const subscription = await db.getUserSubscription(userId);
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