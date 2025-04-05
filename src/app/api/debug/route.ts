import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    telegramToken: process.env.TELEGRAM_BOT_TOKEN ? '설정됨' : '설정되지 않음',
    paypalClientId: process.env.PAYPAL_CLIENT_ID ? '설정됨' : '설정되지 않음',
    databaseUrl: process.env.DATABASE_URL ? '설정됨' : '설정되지 않음',
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
  });
} 