import { NextResponse } from 'next/server';
import PayPalService from '@/services/paypalService';
import { adminAuth } from '@/middleware/adminAuth';

export const GET = adminAuth(async () => {
  try {
    const paypalService = await PayPalService.getInstance();
    const isTestMode = paypalService.getTestMode();

    return NextResponse.json({ enabled: isTestMode });
  } catch (error) {
    console.error('Error getting PayPal test mode status:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});

export const POST = adminAuth(async (request: Request) => {
  try {
    const { enabled } = await request.json();

    const paypalService = await PayPalService.getInstance();
    await paypalService.setTestMode(enabled);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating PayPal test mode:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});