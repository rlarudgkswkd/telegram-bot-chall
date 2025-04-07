import { NextResponse } from 'next/server';
import { adminAuth } from '@/middleware/adminAuth';
import { TelegramBotService } from '@/services/telegramBot';
import { DatabaseService } from '@/services/databaseService';

async function handler(request: Request) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: '메시지가 필요합니다.' },
        { status: 400 }
      );
    }

    console.log('Starting broadcast with message:', message);

    // 활성 채팅방 가져오기
    const db = DatabaseService.getInstance();
    const activeChats = await db.getActiveChats();
    
    console.log(`Found ${activeChats.length} active chats for broadcast`);
    
    if (activeChats.length === 0) {
      return NextResponse.json({
        message: '브로드캐스트가 완료되었습니다. (활성 채팅방이 없습니다)',
        total: 0,
        success: 0,
        failed: 0
      });
    }
    
    // 텔레그램 봇 서비스 가져오기
    const telegramBot = await TelegramBotService.getInstance();
    
    // 결과 추적
    let successCount = 0;
    let failedCount = 0;
    
    // 각 채팅방에 메시지 전송
    for (const chat of activeChats) {
      try {
        console.log(`Sending message to chat ${chat.telegramId}...`);
        await telegramBot.sendMessage(chat.telegramId, message);
        console.log(`Successfully sent message to chat ${chat.telegramId}`);
        successCount++;
      } catch (error) {
        console.error(`Failed to send message to chat ${chat.telegramId}:`, error);
        failedCount++;
      }
    }
    
    console.log(`Broadcast completed. Success: ${successCount}, Failed: ${failedCount}`);
    
    // 결과 반환
    return NextResponse.json({
      message: '브로드캐스트가 완료되었습니다.',
      total: activeChats.length,
      success: successCount,
      failed: failedCount
    });
  } catch (error) {
    console.error('Broadcast error:', error);
    return NextResponse.json(
      { error: '브로드캐스트 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export const POST = adminAuth(handler); 