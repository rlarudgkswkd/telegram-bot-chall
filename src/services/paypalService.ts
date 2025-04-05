import { PrismaClient } from '@prisma/client';
import TelegramBotService from './telegramBot';
import EmailService from './emailService';
import DatabaseService from './databaseService';

class PayPalService {
  private static instance: PayPalService;
  private prisma: PrismaClient;
  private telegramBot: TelegramBotService;
  private emailService: EmailService;
  private databaseService: DatabaseService;

  private constructor() {
    this.prisma = new PrismaClient();
    this.telegramBot = TelegramBotService.getInstance();
    this.emailService = EmailService.getInstance();
    this.databaseService = DatabaseService.getInstance();
  }

  public static getInstance(): PayPalService {
    if (!PayPalService.instance) {
      PayPalService.instance = new PayPalService();
    }
    return PayPalService.instance;
  }

  /**
   * PayPal 주문을 생성합니다.
   */
  public async createOrder(userId: string, amount: number): Promise<string> {
    try {
      // PayPal API를 사용하여 주문 생성
      // 실제 구현에서는 PayPal API를 호출하여 주문을 생성합니다.
      // 여기서는 예시로 주문 ID를 생성합니다.
      const orderId = `ORDER-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
      
      // 결제 요청 생성
      await this.databaseService.createPaymentRequest(userId, orderId, amount);
      
      return orderId;
    } catch (error) {
      console.error('Error creating PayPal order:', error);
      throw error;
    }
  }

  /**
   * PayPal 결제를 캡처합니다.
   */
  public async capturePayment(orderId: string): Promise<void> {
    try {
      // PayPal 결제 캡처 로직
      const paymentRequest = await this.prisma.paymentRequest.findUnique({
        where: { paypalOrderId: orderId },
        include: { user: true },
      });

      if (!paymentRequest) {
        throw new Error('Payment request not found');
      }

      // 결제 상태 업데이트
      await this.databaseService.updatePaymentStatus(paymentRequest.id, 'completed');
      
      // 구독 생성
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1); // 1개월 구독
      
      await this.databaseService.createSubscription(
        paymentRequest.userId,
        'monthly',
        false,
        endDate
      );
      
      // 이메일로 Telegram 봇 링크 전송
      await this.emailService.sendTelegramBotLink(
        paymentRequest.user.email,
        paymentRequest.user.name
      );
      
      console.log(`Payment captured for order ${orderId}`);
    } catch (error) {
      console.error('Error capturing PayPal payment:', error);
      throw error;
    }
  }

  /**
   * 무료 체험을 시작합니다.
   */
  public async startTrial(userId: string): Promise<void> {
    try {
      // 사용자 정보 가져오기
      const user = await this.databaseService.getUserById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      // 무료 체험 종료일 설정 (3일 후)
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 3);
      
      // 무료 체험 구독 생성
      await this.databaseService.createSubscription(
        userId,
        'trial',
        true,
        endDate
      );
      
      // 이메일로 Telegram 봇 링크 전송
      await this.emailService.sendTelegramBotLink(
        user.email,
        user.name,
        true,
        endDate
      );
      
      console.log(`Trial started for user ${userId}`);
    } catch (error) {
      console.error('Error starting trial:', error);
      throw error;
    }
  }
}

export default PayPalService; 