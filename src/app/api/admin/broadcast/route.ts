import { NextResponse } from 'next/server';
import { adminAuth } from '@/middleware/adminAuth';
import { TelegramBotService } from '@/services/telegramBot';
import { DatabaseService } from '@/services/databaseService';

/**
 * MarkdownV2 형식의 메시지를 검증하고 이스케이프 처리합니다.
 */
function validateAndEscapeMessage(message: string): { isValid: boolean; message: string; error?: string } {
  try {
    // MarkdownV2에서 이스케이프가 필요한 특수문자들 (우선순위 순)
    const specialChars = [
      '\\', // 백슬래시는 가장 먼저 이스케이프
      '_', '*', '[', ']', '(', ')', '~', '`', '>', '#', '+', 
      '=', '|', '{', '}', '.', '!', '-'
    ];

    let escapedMessage = message;
    
    // 백슬래시를 먼저 이스케이프
    escapedMessage = escapedMessage.replace(/\\/g, '\\\\');

    // 나머지 특수문자 이스케이프
    specialChars.slice(1).forEach(char => {
      escapedMessage = escapedMessage.replace(new RegExp('\\' + char, 'g'), '\\' + char);
    });

    // 지원하지 않는 HTML 태그 검사
    const invalidHtml = /<[^>]+>/g.test(message);
    if (invalidHtml) {
      return {
        isValid: false,
        message: message,
        error: 'HTML 태그는 지원되지 않습니다. MarkdownV2 형식을 사용해주세요.'
      };
    }

    // 잘못된 마크다운 문법 검사 (짝이 맞지 않는 경우)
    const pairs = {
      '*': /(?<!\\)\*[^*]*(?<!\\)\*/g,  // 볼드체
      '_': /(?<!\\)_[^_]*(?<!\\)_/g,    // 이탤릭체
      '`': /(?<!\\)`[^`]*(?<!\\)`/g,    // 코드
      '[': /(?<!\\)\[([^\]]*)\]\(([^)]*)\)/g  // 링크
    };

    // 각 마크다운 문법의 짝이 맞는지 검사
    for (const [char, regex] of Object.entries(pairs)) {
      const matches = escapedMessage.match(regex) || [];
      const count = (escapedMessage.match(new RegExp('(?<!\\\\)\\' + char, 'g')) || []).length;
      
      if (count % 2 !== 0) {
        return {
          isValid: false,
          message: message,
          error: `마크다운 문법이 올바르지 않습니다. '${char}' 문자의 짝이 맞지 않습니다.`
        };
      }
    }

    return { 
      isValid: true, 
      message: escapedMessage 
    };
  } catch (error) {
    console.error('Message validation error:', error);
    return {
      isValid: false,
      message: message,
      error: '메시지 형식 검증 중 오류가 발생했습니다.'
    };
  }
}

export const POST = adminAuth(async (request: Request) => {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: '메시지가 필요합니다.' },
        { status: 400 }
      );
    }

    // 메시지 형식 검증 및 이스케이프 처리
    const validation = validateAndEscapeMessage(message);
    if (!validation.isValid) {
      return NextResponse.json({
        error: validation.error,
        success: false
      }, { status: 400 });
    }

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

    const telegramBot = await TelegramBotService.getInstance();

    let successCount = 0;
    let failedCount = 0;
    let errors: string[] = [];

    for (const chat of activeChats) {
      try {
        console.log(`Sending message to chat ${chat.telegramId}...`);
        await telegramBot.sendMessage(chat.telegramId, validation.message);
        console.log(`Successfully sent message to chat ${chat.telegramId}`);
        successCount++;
      } catch (error) {
        console.error(`Failed to send message to chat ${chat.telegramId}:`, error);
        failedCount++;
        if (error instanceof Error) {
          errors.push(`텔레그램 ID ${chat.telegramId}: ${error.message}`);
        }
      }
    }

    console.log(`Broadcast completed. Success: ${successCount}, Failed: ${failedCount}`);

    return NextResponse.json({
      success: true,
      message: '브로드캐스트가 완료되었습니다.',
      total: activeChats.length,
      successCount,
      failedCount,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('Broadcast error:', error);
    return NextResponse.json(
      { 
        error: '브로드캐스트 처리 중 오류가 발생했습니다.',
        success: false,
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    );
  }
});