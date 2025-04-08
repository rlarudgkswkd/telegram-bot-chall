import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/services/databaseService';
import { PayPalService } from '@/services/paypalService';

export const GET = async (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url);
      const orderId = searchParams.get('token');
  
      if (!orderId) {
        return NextResponse.json({ error: 'Missing order ID' }, { status: 400 });
      }
  
      const accessToken = await (await PayPalService.getInstance()).getAccessToken();
  
      const captureRes = await fetch(
        `https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderId}/capture`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );
  
      const data = await captureRes.json();
  
      if (!captureRes.ok) {
        console.error('Capture error:', data);
        return NextResponse.json({ error: 'Failed to capture order' }, { status: 500 });
      }
  
      console.log('결제 승인 성공:', data);
  
      // TODO: 결제 성공 처리 로직 구현
      // await DatabaseService.getInstance().markPaymentCompleted(orderId);
  
      const redirectUrl = `${process.env.WEBHOOK_DOMAIN}/subscribe/success`;
      console.log('Redirecting to:', redirectUrl);

      return NextResponse.redirect(redirectUrl);
    } catch (error) {
      console.error('Error capturing PayPal order:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  };