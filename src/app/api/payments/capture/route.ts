import { NextResponse } from 'next/server';
import PayPalService from '@/services/paypalService';

export async function POST(request: Request) {
  try {
    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { error: '주문 ID는 필수 입력 항목입니다.' },
        { status: 400 }
      );
    }

    const paypalService = PayPalService.getInstance();
    await (await paypalService).capturePayment(orderId);

    return NextResponse.json({
      message: '결제가 완료되었습니다.',
    });
  } catch (error: any) {
    console.error('PayPal 결제 캡처 오류:', error);
    return NextResponse.json(
      { error: error.message || 'PayPal 결제 캡처 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 