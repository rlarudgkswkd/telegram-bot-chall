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

    const paypalService = await PayPalService.getInstance();
    const orderId = await paypalService.createOrder(userId, 10.99); // 월간 구독 가격
    console.log("orderId: ", orderId);

     // testMode에 따라 approval URL 동적으로 생성
     const isTestMode = paypalService.getTestMode();
     console.log("isTestMode: ", isTestMode);
     const approvalBaseUrl = isTestMode
       ? process.env.PAYPAL_SANDBOX_BASE_URL || 'https://www.sandbox.paypal.com'
       : process.env.PAYPAL_LIVE_BASE_URL || 'https://www.paypal.com';
 
     const approvalUrl = `${approvalBaseUrl}/checkoutnow?token=${orderId}`;

     console.log("approvalUrl: ", approvalUrl);

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