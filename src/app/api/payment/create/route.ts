import { NextResponse } from 'next/server';
import PayPalService from '@/services/paypalService';

export async function POST(request: Request) {
  try {
    const { userId, amount } = await request.json();
    
    if (!userId || !amount) {
      return NextResponse.json(
        { error: 'User ID and amount are required' },
        { status: 400 }
      );
    }

    const paypalService = PayPalService.getInstance();
    const { orderId, paymentRequest } = await paypalService.createOrder(userId, amount);
    
    return NextResponse.json({ orderId, paymentRequest });
  } catch (error) {
    console.error('Error in payment creation route:', error);
    return NextResponse.json(
      { error: 'Payment creation failed' },
      { status: 500 }
    );
  }
} 