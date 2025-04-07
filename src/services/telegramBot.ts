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
  private userStates: { [key: string]: string } = {};

  private constructor() {
    if (!process.env.TELEGRAM_BOT_TOKEN) {
      throw new Error('TELEGRAM_BOT_TOKEN is not defined');
    }

    this.bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
    this.db = DatabaseService.getInstance();
    //this.emailService = EmailService.getInstance();
    this.prisma = new PrismaClient();
  }

  public static getInstance(): TelegramBotService {
    if (!TelegramBotService.instance) {
      TelegramBotService.instance = new TelegramBotService();
    }
    return TelegramBotService.instance;
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('TelegramBotService is already initialized');
      return;
    }

    try {
      // 명령어 핸들러 등록
      this.bot.command('start', this.handleStart.bind(this));
      this.bot.command('help', this.handleHelp.bind(this));
      this.bot.command('status', this.handleStatus.bind(this));
      this.bot.command('challenge', this.handleChallenge.bind(this));
      this.bot.command('subscribe', this.handleSubscribe.bind(this));
      this.bot.command('unsubscribe', this.handleUnsubscribe.bind(this));
      this.bot.command('broadcast', this.handleBroadcast.bind(this));

      // 텍스트 메시지 핸들러 등록
      this.bot.on('text', this.handleText.bind(this));

      // 봇 시작
      if (process.env.WEBHOOK_DOMAIN) {
        await this.bot.launch({
          webhook: {
            domain: process.env.WEBHOOK_DOMAIN,
            port: Number(process.env.WEBHOOK_PORT) || 8443,
          },
        });
      } else {
        await this.bot.launch();
      }

      console.log('Telegram bot started successfully');
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize Telegram bot:', error);
      throw error;
    }
  }

  private async handleStart(ctx: Context): Promise<void> {
    if (!ctx.from) {
      await ctx.reply('사용자 정보를 가져올 수 없습니다.');
      return;
    }
    
    const telegramId = BigInt(ctx.from.id);
    this.userStates[telegramId.toString()] = 'waiting_for_email';
    await ctx.reply('이메일을 입력해주세요.');
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

    const telegramId = ctx.from?.id ? BigInt(ctx.from.id) : undefined;
    if (!telegramId) return;

    const telegramIdStr = telegramId.toString();
    if (this.userStates[telegramIdStr] === 'waiting_for_email') {
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
      } else {
        await ctx.reply('해당 이메일로 등록된 사용자를 찾을 수 없습니다.');
      }
      
      delete this.userStates[telegramIdStr];
    } else {
      // 에코 메시지로 응답 (테스트용)
      await ctx.reply(`Echo: ${messageText}`);
      console.log(`Sent echo message to ${chatId}`);
    }
  }

  /**
   * 특정 채팅방에 메시지를 전송합니다.
   */
  public async sendMessage(chatId: string | bigint, message: string): Promise<void> {
    try {
      await this.bot.telegram.sendMessage(chatId.toString(), message);
    } catch (error) {
      console.error(`Error sending message to chat ${chatId}:`, error);
      throw error;
    }
  }

  /**
   * 봇을 중지합니다.
   */
  public async stop(): Promise<void> {
    if (this.isInitialized) {
      await this.bot.stop();
      this.isInitialized = false;
      console.log('Telegram bot stopped');
    }
  }
} 