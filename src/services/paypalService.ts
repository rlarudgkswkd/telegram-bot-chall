import { PrismaClient } from '@prisma/client';
import { TelegramBotService } from './telegramBot';
import { EmailService } from './emailService';
import { DatabaseService } from './databaseService';

export class PayPalService {
  private static instance: PayPalService;
  private prisma: PrismaClient;
  private telegramBot!: TelegramBotService;
  private emailService: EmailService;
  private databaseService: DatabaseService;
  private baseUrl: string;
  private clientId: string;
  private clientSecret: string;
  private isTestMode: boolean = false;
  private accessToken: string | null = null;
  private accessTokenExpiresAt: number = 0;

  private constructor() {
    this.prisma = new PrismaClient();
    this.emailService = EmailService.getInstance();
    this.databaseService = DatabaseService.getInstance();
    
    // PayPal 설정
    this.baseUrl = process.env.PAYPAL_BASE_URL || 'https://api-m.sandbox.paypal.com';
    this.clientId = process.env.PAYPAL_CLIENT_ID || '';
    this.clientSecret = process.env.PAYPAL_CLIENT_SECRET || '';

    if (!this.clientId || !this.clientSecret) {
      console.error('PayPal credentials are not properly configured');
    }
  }
  

  private async initialize() {
    try {
      this.telegramBot = await TelegramBotService.getInstance();
      // 시스템 설정에서 테스트 모드 상태 로드
      const testModeSetting = await this.prisma.systemSettings.findUnique({
        where: { key: 'paypal_test_mode' }
      });
      this.isTestMode = testModeSetting?.value === 'true';
      
      // PayPal API URL 설정
      this.updatePayPalConfig();
    } catch (error) {
      console.error('Failed to initialize PayPalService:', error);
    }
  }

  private updatePayPalConfig() {
    // 테스트 모드에 따라 PayPal API URL 설정
    this.baseUrl = this.isTestMode
      ? process.env.PAYPAL_SANDBOX_BASE_API_URL || 'https://api-m.sandbox.paypal.com'
      : process.env.PAYPAL_LIVE_BASE_API_URL || 'https://api-m.paypal.com';
    
    // 테스트 모드에 따라 클라이언트 ID와 시크릿 설정
    if (this.isTestMode) {
      this.clientId = process.env.PAYPAL_SANDBOX_CLIENT_ID || '';
      this.clientSecret = process.env.PAYPAL_SANDBOX_CLIENT_SECRET || '';
    } else {
      this.clientId = process.env.PAYPAL_LIVE_CLIENT_ID || '';
      this.clientSecret = process.env.PAYPAL_LIVE_CLIENT_SECRET || '';
    }
  }

  public async setTestMode(enabled: boolean): Promise<void> {
    try {
      // 시스템 설정 업데이트
      await this.prisma.systemSettings.upsert({
        where: { key: 'paypal_test_mode' },
        update: { value: enabled.toString() },
        create: {
          key: 'paypal_test_mode',
          value: enabled.toString()
        }
      });

      this.isTestMode = enabled;
      this.updatePayPalConfig();
      
      console.log(`PayPal test mode ${enabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Error updating PayPal test mode:', error);
      throw error;
    }
  }

  public getTestMode(): boolean {
    return this.isTestMode;
  }

  public async getAccessToken(): Promise<string> {
    console.log('Requesting PayPal access token...');
    try {
      const response = await fetch(`${this.baseUrl}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Accept-Language': 'en_US',
          'Authorization': `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('PayPal access token error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        throw new Error(`Failed to get PayPal access token: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Successfully obtained PayPal access token');
      return data.access_token;
    } catch (error) {
      console.error('Error getting PayPal access token:', error);
      throw error;
    }
  }

  /**
   * PayPal 주문을 생성합니다.
   */
  public async createOrder(userId: string, amount: number): Promise<string> {
    console.log(`Creating PayPal order for user ${userId} with amount ${amount}`);
    try {
      const accessToken = await this.getAccessToken();
      
      const orderData = {
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: 'USD',
            value: amount.toString()
          }
        }],
        application_context: {
          return_url: `${process.env.WEBHOOK_DOMAIN}/api/payments/approve`,
          cancel_url: `${process.env.WEBHOOK_DOMAIN}/subscribe/cancel`
        }
      };

      console.log('Sending order creation request to PayPal:', orderData);
      
      const response = await fetch(`${this.baseUrl}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('PayPal order creation error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        throw new Error(`Failed to create PayPal order: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Successfully created PayPal order:', data.id);

      // 결제 요청 생성
      await this.databaseService.createPaymentRequest(userId, data.id, amount);
      
      return data.id;
    } catch (error) {
      console.error('Error creating PayPal order:', error);
      throw error;
    }
  }

  /**
   * PayPal 결제를 캡처합니다.
   */
  public async capturePayment(orderId: string): Promise<void> {
    console.log(`Capturing payment for order ${orderId}`);
    try {
      const accessToken = await this.getAccessToken();
      
      console.log('Sending capture request to PayPal');
      const response = await fetch(`${this.baseUrl}/v2/checkout/orders/${orderId}/capture`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('PayPal payment capture error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        throw new Error(`Failed to capture PayPal payment: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Successfully captured PayPal payment:', {
        orderId,
        captureId: data.purchase_units[0].payments.captures[0].id,
        status: data.status
      });

      // 결제 요청 상태 업데이트
      const paymentRequest = await this.databaseService.getPaymentRequestByOrderId(orderId);
      if (!paymentRequest) {
        throw new Error(`Payment request not found for order ${orderId}`);
      }

      await this.databaseService.updatePaymentRequestStatus(orderId, 'completed');
      
      // 사용자 구독 상태 업데이트
      await this.databaseService.updateUserSubscription(
        paymentRequest.id,
        paymentRequest.userId,
        'active',
        new Date(),
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30일 후
      );

      // 텔레그램 메시지 전송
      if (this.telegramBot) {
        const user = await this.databaseService.getUserById(paymentRequest.userId);
        if (user && user.telegramId) {
          await this.telegramBot.sendMessage(
            user.telegramId,
            '🎉 결제가 성공적으로 완료되었습니다! 프리미엄 기능을 이용하실 수 있습니다.'
          );
        }
      }

      // 이메일 전송
      const user = await this.databaseService.getUserById(paymentRequest.userId);
      if (user) {
        const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
        await this.emailService.sendPaymentConfirmation(
          user.email,
          paymentRequest.amount,
          endDate
        );
      }
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
        user.name ?? ''
      );

      // 텔레그램 봇으로 환영 메시지 전송
      if (user.telegramId) {
        await this.telegramBot.sendMessage(
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
        user.name ?? ''
      );

      // 텔레그램 봇으로 구독 확인 메시지 전송
      if (user.telegramId) {
        await this.telegramBot.sendMessage(
          user.telegramId,
          `구독이 성공적으로 시작되었습니다. ${plan === 'monthly' ? '월간' : '연간'} 플랜으로 이용하실 수 있습니다.`
        );
      }
    } catch (error) {
      console.error('구독 생성 중 오류:', error);
      throw error;
    }
  }

  public static async getInstance(): Promise<PayPalService> {
    if (!PayPalService.instance) {
      PayPalService.instance = new PayPalService();
      await PayPalService.instance.initialize();
    }
    return PayPalService.instance;
  }
}

export default PayPalService; 