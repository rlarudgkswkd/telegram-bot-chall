import { Telegraf, Context } from 'telegraf';
import { DatabaseService } from './databaseService';
import { EmailService } from './emailService';
import { PrismaClient } from '@prisma/client';

export class TelegramBotService {
  private bot: Telegraf;
  private db: DatabaseService;
  //private emailService: EmailService;
  private prisma: PrismaClient;
  private static instance: TelegramBotService | null = null;
  private isInitialized: boolean = false;
  private userStates: { [key: string]: { state: string; retryCount?: number } } = {};

  private constructor() {
    if (!process.env.TELEGRAM_BOT_TOKEN) {
      throw new Error('TELEGRAM_BOT_TOKEN is not defined');
    }

    this.bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
    this.db = DatabaseService.getInstance();
    //this.emailService = EmailService.getInstance();
    this.prisma = new PrismaClient();

    // Webhook 설정에 필요한 환경변수 검증
    if (!process.env.WEBHOOK_DOMAIN) {
      throw new Error('WEBHOOK_DOMAIN is not defined');
    }
    if (!process.env.WEBHOOK_PATH) {
      throw new Error('WEBHOOK_PATH is not defined');
    }
  }

  public static async getInstance(): Promise<TelegramBotService> {
    if (!TelegramBotService.instance) {
      TelegramBotService.instance = new TelegramBotService();
      await TelegramBotService.instance.initialize();
    }
    return TelegramBotService.instance;
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('TelegramBotService is already initialized');
      return;
    }

    console.log('Initializing TelegramBotService...');

    try {
      const webhookDomain = process.env.WEBHOOK_DOMAIN;
      const webhookPath = process.env.WEBHOOK_PATH || '/api/telegram/webhook';
      const webhookUrl = `${webhookDomain}${webhookPath}`;

      if (!webhookDomain) {
        throw new Error('WEBHOOK_DOMAIN environment variable is not set');
      }

      // 기존 webhook 삭제
      await this.bot.telegram.deleteWebhook();
      
      // 커맨드 핸들러 등록
      this.bot.command('start', (ctx) => this.handleStart(ctx));
      this.bot.command('help', (ctx) => this.handleHelp(ctx));
      this.bot.command('status', (ctx) => this.handleStatus(ctx));
      this.bot.command('challenge', (ctx) => this.handleChallenge(ctx));
      this.bot.command('subscribe', (ctx) => this.handleSubscribe(ctx));
      this.bot.command('unsubscribe', (ctx) => this.handleUnsubscribe(ctx));
      this.bot.command('broadcast', (ctx) => this.handleBroadcast(ctx));
      
      // 텍스트 메시지 핸들러 등록
      this.bot.on('text', (ctx) => this.handleText(ctx));
      
      // 새로운 webhook 설정
      await this.bot.telegram.setWebhook(webhookUrl);
      
      console.log(`Telegram bot webhook set up successfully at ${webhookUrl}`);

      // Graceful shutdown 설정
      process.once('SIGINT', () => this.stop());
      process.once('SIGTERM', () => this.stop());

      this.isInitialized = true;
      console.log('TelegramBotService initialized with all command handlers');
    } catch (error) {
      console.error('Failed to initialize Telegram bot:', error);
      throw error;
    }
  }

  private async handleStart(ctx: Context): Promise<void> {
    console.log('🤖 /start command received');
    
    if (!ctx.from) {
      console.log('❌ User information not available');
      await ctx.reply('사용자 정보를 가져올 수 없습니다.');
      return;
    }
    
    const telegramId = ctx.from.id.toString();
    const username = ctx.from.username || 'unknown';
    console.log(`✨ New user starting bot - Telegram ID: ${telegramId}, Username: @${username}`);
    
    this.userStates[telegramId] = { state: 'waiting_for_email' };
    await ctx.reply('이메일을 입력해주세요.');
    console.log(`📧 Waiting for email from user ${telegramId}`);
  }

  private async handleHelp(ctx: Context): Promise<void> {
    const chatId = ctx.chat?.id.toString();
    if (!chatId) return;

    try {
      const helpText = `
사용 가능한 명령어:
/start - 봇 시작
/help - 도움말 표시
/status - 현재 상태 확인
/challenge - 오늘의 챌린지 시작
/subscribe - 구독 시작
/unsubscribe - 구독 취소
/broadcast - 관리자용 브로드캐스트 메시지 전송
      `;
      await ctx.reply(helpText);
    } catch (error) {
      console.error(`Error in handleHelp for chat ${chatId}:`, error);
    }
  }

  private async handleStatus(ctx: Context): Promise<void> {
    const chatId = ctx.chat?.id.toString();
    if (!chatId) return;

    try {
      await ctx.reply('현재 상태: 정상 작동 중');
    } catch (error) {
      console.error(`Error in handleStatus for chat ${chatId}:`, error);
    }
  }

  private async handleChallenge(ctx: Context): Promise<void> {
    const chatId = ctx.chat?.id.toString();
    if (!chatId) return;

    try {
      await ctx.reply('오늘의 한국어 챌린지: "안녕하세요"를 한국어로 말해보세요!');
    } catch (error) {
      console.error(`Error in handleChallenge for chat ${chatId}:`, error);
    }
  }

  private async handleSubscribe(ctx: Context): Promise<void> {
    const chatId = ctx.chat?.id.toString();
    if (!chatId) return;

    try {
      await ctx.reply('구독이 완료되었습니다. 매일 새로운 한국어 챌린지를 받아보세요!');
    } catch (error) {
      console.error(`Error in handleSubscribe for chat ${chatId}:`, error);
    }
  }

  private async handleUnsubscribe(ctx: Context): Promise<void> {
    const chatId = ctx.chat?.id.toString();
    if (!chatId) return;

    try {
      await ctx.reply('구독이 취소되었습니다. 다시 구독하시려면 /subscribe 명령어를 사용하세요.');
    } catch (error) {
      console.error(`Error in handleUnsubscribe for chat ${chatId}:`, error);
    }
  }

  private async handleBroadcast(ctx: Context): Promise<void> {
    const chatId = ctx.chat?.id.toString();
    if (!chatId) return;

    try {
      // 관리자 권한 확인 로직 추가 필요
      await ctx.reply('브로드캐스트 메시지를 입력하세요:');
    } catch (error) {
      console.error(`Error in handleBroadcast for chat ${chatId}:`, error);
    }
  }

  private async handleText(ctx: Context): Promise<void> {
    const chatId = ctx.chat?.id.toString();
    const messageText = ctx.message && 'text' in ctx.message ? ctx.message.text : undefined;
    
    if (!chatId || !messageText) return;

    const telegramId = ctx.from?.id ? ctx.from.id.toString() : undefined;
    if (!telegramId) return;

    const userState = this.userStates[telegramId];
    if (userState?.state === 'waiting_for_email') {
      const email = messageText;
      
      // 이메일 형식 검증
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        await ctx.reply('잘못된 이메일 형식입니다. 다시 입력해주세요.');
        return;
      }
      
      const user = await DatabaseService.getInstance().getUserByEmail(email);
      
      if (user) {
        // 사용자의 텔레그램 ID를 업데이트합니다
        await DatabaseService.getInstance().updateUser(user.id, { telegramId });
        await ctx.reply('텔레그램 ID가 성공적으로 등록되었습니다.');
        delete this.userStates[telegramId];
      } else {
        // 재시도 횟수 증가
        userState.retryCount = (userState.retryCount || 0) + 1;
        
        if (userState.retryCount >= 3) {
          const adminContactMessage = `
해당 이메일로 등록된 사용자를 찾을 수 없습니다.
최대 시도 횟수를 초과했습니다.

관리자에게 문의해 주세요:
- 이메일: vietolleckhkim@gmail.com
- 텔레그램: @goregoreda`;
          
          await ctx.reply(adminContactMessage);
          delete this.userStates[telegramId];
        } else {
          const remainingAttempts = 3 - userState.retryCount;
          await ctx.reply(`해당 이메일로 등록된 사용자를 찾을 수 없습니다.\n남은 시도 횟수: ${remainingAttempts}회\n\n다시 이메일을 입력해주세요.`);
        }
      }
    } else {
      // 에코 메시지로 응답 (테스트용)
      await ctx.reply(`Echo: ${messageText}`);
      console.log(`Sent echo message to ${chatId}`);
    }
  }

  /**
   * Webhook 핸들러 - Next.js API 라우트에서 사용
   */
  public async handleUpdate(update: any): Promise<void> {
    try {
      await this.bot.handleUpdate(update);
    } catch (error) {
      console.error('Error handling webhook update:', error);
      throw error;
    }
  }

  /**
   * 특정 채팅방에 메시지를 전송합니다.
   */
  public async sendMessage(chatId: string, message: string): Promise<void> {
    try {
      await this.bot.telegram.sendMessage(chatId, message, {
        parse_mode: 'HTML', // 또는 'MarkdownV2'
        // disable_web_page_preview: false, // 미리보기 활성화
      });
    } catch (error) {
      console.error(`Error sending message to chat ${chatId}:`, error);
      throw error;
    }
  }

  /**
   * 봇을 안전하게 중지합니다.
   */
  public async stop(): Promise<void> {
    if (this.isInitialized) {
      // Webhook 제거
      await this.bot.telegram.deleteWebhook();
      await this.bot.stop('SIGINT');
      this.isInitialized = false;
      console.log('Telegram bot stopped gracefully');
    }
  }
} 