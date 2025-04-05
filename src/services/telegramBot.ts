import TelegramBot from 'node-telegram-bot-api';
import DatabaseService from './databaseService';

class TelegramBotService {
  private bot: TelegramBot;
  private static instance: TelegramBotService;
  private databaseService: DatabaseService;

  private constructor() {
    // 봇 토큰 확인
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
      throw new Error('TELEGRAM_BOT_TOKEN is not set in environment variables');
    }
    console.log('Initializing Telegram bot with token:', token.substring(0, 10) + '...');
    
    // 봇 초기화
    this.bot = new TelegramBot(token, { polling: true });
    this.databaseService = DatabaseService.getInstance();
    this.initializeBot();
  }

  public static getInstance(): TelegramBotService {
    if (!TelegramBotService.instance) {
      TelegramBotService.instance = new TelegramBotService();
    }
    return TelegramBotService.instance;
  }

  private initializeBot() {
    // 봇 정보 가져오기
    this.bot.getMe().then((botInfo) => {
      console.log('Bot initialized successfully:', botInfo.username);
    }).catch((error) => {
      console.error('Error getting bot info:', error);
    });

    // 메시지 수신 이벤트 처리
    this.bot.on('message', async (msg) => {
      const chatId = msg.chat.id;
      console.log(`Received message from ${chatId}: ${msg.text}`);
      
      // 에코 메시지로 응답 (테스트용)
      try {
        await this.bot.sendMessage(chatId, `Echo: ${msg.text}`);
        console.log(`Sent echo message to ${chatId}`);
      } catch (error) {
        console.error(`Error sending echo message to ${chatId}:`, error);
      }
    });
  }

  public async createPrivateChat(telegramId: string): Promise<string> {
    try {
      console.log(`Creating private chat for user ${telegramId}`);
      
      // 먼저 사용자와의 대화를 시작합니다
      await this.bot.sendMessage(telegramId, "안녕하세요! 한국어 학습 챌린지에 오신 것을 환영합니다.");
      console.log(`Sent welcome message to ${telegramId}`);
      
      // 채팅방 ID는 사용자의 Telegram ID와 동일합니다 (1:1 채팅의 경우)
      const telegramChatId = telegramId;
      
      // 채팅방 권한 설정 (1:1 채팅에서는 필요 없음)
      // 대신 봇이 관리자인 그룹 채팅방을 생성하는 로직이 필요합니다
      
      // 데이터베이스에 채팅 정보 저장
      await this.databaseService.createChat(telegramId, telegramChatId);
      console.log(`Chat created and saved for user ${telegramId}`);

      return telegramChatId;
    } catch (error) {
      console.error('Error creating private chat:', error);
      throw error;
    }
  }

  public async sendMessageToAllChats(message: string) {
    try {
      console.log('Sending message to all chats:', message);
      
      // Get all active chats from the database
      const activeChats = await this.databaseService.getActiveChats();
      console.log(`Found ${activeChats.length} active chats`);
      
      // Send message to all active chats
      for (const chatId of activeChats) {
        try {
          await this.bot.sendMessage(chatId, message);
          console.log(`Sent message to chat ${chatId}`);
        } catch (error) {
          console.error(`Error sending message to chat ${chatId}:`, error);
        }
      }
    } catch (error) {
      console.error('Error sending message to all chats:', error);
      throw error;
    }
  }
}

export default TelegramBotService; 