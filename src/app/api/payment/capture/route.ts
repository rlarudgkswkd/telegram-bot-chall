import { NextResponse } from 'next/server';
import PayPalService from '@/services/paypalService';

export async function POST(request: Request) {
  try {
    const { orderId } = await request.json();
    
    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    const paypalService = PayPalService.getInstance();
    const chatId = await paypalService.capturePayment(orderId);
    
    return NextResponse.json({ success: true, chatId });
  } catch (error) {
    console.error('Error in payment capture route:', error);
    return NextResponse.json(
      { error: 'Payment capture failed' },
      { status: 500 }
    );
  }
} 