import { PrismaClient } from '@prisma/client';
import { TelegramBotService } from './telegramBot';
import { EmailService } from './emailService';
import { DatabaseService } from './databaseService';

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
      const user = await DatabaseService.getInstance().getUserById(userId);
      if (!user) {
        throw new Error('사용자를 찾을 수 없습니다.');
      }

      // 7일 무료 체험 구독 생성
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 7);
      
      // 무료 체험 구독 생성
      const db = DatabaseService.getInstance();
      await db.createSubscription(userId, 'trial', true, endDate);

      // 환영 이메일 발송
      await EmailService.getInstance().sendTelegramBotLink(
        user.email,
        user.name
      );

      // 텔레그램 봇으로 환영 메시지 전송
      if (user.telegramId) {
        await TelegramBotService.getInstance().sendMessage(
          user.telegramId,
          `안녕하세요 ${user.name}님! 7일 무료 체험이 시작되었습니다.`
        );
      }
    } catch (error) {
      console.error('무료 체험 시작 중 오류:', error);
      throw error;
    }
  }

  public async createSubscription(userId: string, plan: 'monthly' | 'yearly'): Promise<void> {
    try {
      const user = await DatabaseService.getInstance().getUserById(userId);
      if (!user) {
        throw new Error('사용자를 찾을 수 없습니다.');
      }

      // 구독 기간 설정
      const endDate = new Date();
      if (plan === 'monthly') {
        endDate.setMonth(endDate.getMonth() + 1);
      } else {
        endDate.setFullYear(endDate.getFullYear() + 1);
      }

      // 구독 생성
      const db = DatabaseService.getInstance();
      await db.createSubscription(userId, plan, false, endDate);

      // 구독 확인 이메일 발송
      await EmailService.getInstance().sendTelegramBotLink(
        user.email,
        user.name
      );

      // 텔레그램 봇으로 구독 확인 메시지 전송
      if (user.telegramId) {
        await TelegramBotService.getInstance().sendMessage(
          user.telegramId,
          `구독이 성공적으로 시작되었습니다. ${plan === 'monthly' ? '월간' : '연간'} 플랜으로 이용하실 수 있습니다.`
        );
      }
    } catch (error) {
      console.error('구독 생성 중 오류:', error);
      throw error;
    }
  }
}

export default PayPalService; 