import { NextResponse } from 'next/server';
import PayPalService from '@/services/paypalService';

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: '사용자 ID는 필수 입력 항목입니다.' },
        { status: 400 }
      );
    }

    const paypalService = PayPalService.getInstance();
    const orderId = await paypalService.createOrder(userId, 29.99); // 월간 구독 가격

    // PayPal 결제 페이지 URL 생성
    // 실제 구현에서는 PayPal API를 사용하여 결제 페이지 URL을 생성합니다.
    const approvalUrl = `${process.env.PAYPAL_BASE_URL}/checkoutnow?token=${orderId}`;

    return NextResponse.json({
      orderId,
      approvalUrl,
    });
  } catch (error: any) {
    console.error('PayPal 결제 생성 오류:', error);
    return NextResponse.json(
      { error: error.message || 'PayPal 결제 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 