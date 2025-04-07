import { NextResponse } from 'next/server';
import { TelegramBotService } from '@/services/telegramBot';

export async function POST(request: Request) {
  try {
    const update = await request.json();
    console.log('📨 Received Telegram update:', JSON.stringify(update, null, 2));
    
    const bot = await TelegramBotService.getInstance();
    await bot.handleUpdate(update);
    
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error handling webhook:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}

// Telegram webhook verification
export async function GET() {
  return NextResponse.json({ ok: true });
} 