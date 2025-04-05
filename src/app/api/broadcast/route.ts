import { NextResponse } from 'next/server';
import TelegramBotService from '@/services/telegramBot';

export async function POST(request: Request) {
  try {
    const { message } = await request.json();
    
    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const telegramBot = TelegramBotService.getInstance();
    await telegramBot.sendMessageToAllChats(message);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in broadcast route:', error);
    return NextResponse.json(
      { error: 'Broadcast failed' },
      { status: 500 }
    );
  }
} 