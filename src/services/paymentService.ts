import DatabaseService from './databaseService';
import TelegramBotService from './telegramBot';

class PaymentService {
  private static instance: PaymentService;
  private databaseService: DatabaseService;
  private telegramBot: TelegramBotService;

  private constructor() {
    this.databaseService = DatabaseService.getInstance();
    this.telegramBot = TelegramBotService.getInstance();
  }

  public static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }

  public async createPaymentLink(amount: number, userId: string): Promise<string> {
    try {
      // 실제 구현에서는 토스/카카오 송금 링크 생성 API를 호출
      // 여기서는 예시 링크를 반환
      const paymentLink = `https://toss.me/yourusername/${amount}`;
      
      // 결제 정보를 데이터베이스에 저장
      await this.databaseService.createPaymentRequest(userId, amount, paymentLink);
      
      return paymentLink;
    } catch (error) {
      console.error('Error creating payment link:', error);
      throw error;
    }
  }

  public async confirmPayment(userId: string, paymentId: string): Promise<string> {
    try {
      // 결제 확인 처리
      await this.databaseService.updatePaymentStatus(paymentId, 'confirmed');
      
      // 사용자 정보 가져오기
      const user = await this.databaseService.getUserById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      // Telegram 채팅방 생성
      const chatId = await this.telegramBot.createPrivateChat(user.telegramId);
      
      return chatId;
    } catch (error) {
      console.error('Error confirming payment:', error);
      throw error;
    }
  }
}

export default PaymentService; 