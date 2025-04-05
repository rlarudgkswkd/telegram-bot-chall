import { PrismaClient } from '@prisma/client';

class DatabaseService {
  private prisma: PrismaClient;
  private static instance: DatabaseService;

  private constructor() {
    this.prisma = new PrismaClient();
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  /**
   * 이메일과 이름으로 사용자를 생성합니다.
   */
  public async createUser(email: string, name: string) {
    try {
      return await this.prisma.user.create({
        data: {
          email,
          name,
        },
      });
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * 이메일로 사용자를 찾습니다.
   */
  public async getUserByEmail(email: string) {
    try {
      return await this.prisma.user.findUnique({
        where: {
          email,
        },
      });
    } catch (error) {
      console.error('Error getting user by email:', error);
      throw error;
    }
  }

  /**
   * Telegram ID로 사용자를 찾습니다.
   */
  public async getUserByTelegramId(telegramId: string) {
    try {
      return await this.prisma.user.findUnique({
        where: {
          telegramId,
        },
      });
    } catch (error) {
      console.error('Error getting user by telegram ID:', error);
      throw error;
    }
  }

  /**
   * 사용자 ID로 사용자를 찾습니다.
   */
  public async getUserById(id: string) {
    try {
      return await this.prisma.user.findUnique({
        where: {
          id,
        },
      });
    } catch (error) {
      console.error('Error getting user by ID:', error);
      throw error;
    }
  }

  /**
   * 사용자의 Telegram ID를 업데이트합니다.
   */
  public async updateUserTelegramId(userId: string, telegramId: string) {
    try {
      return await this.prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          telegramId,
        },
      });
    } catch (error) {
      console.error('Error updating user telegram ID:', error);
      throw error;
    }
  }

  /**
   * 채팅 정보를 생성합니다.
   */
  public async createChat(telegramId: string, telegramChatId: string) {
    try {
      // 먼저 사용자를 찾거나 생성합니다
      let user = await this.getUserByTelegramId(telegramId);
      if (!user) {
        // 사용자가 없는 경우 임시 사용자를 생성합니다
        user = await this.createUser(`temp_${telegramId}@example.com`, `User ${telegramId}`);
        await this.updateUserTelegramId(user.id, telegramId);
      }

      // 채팅 정보를 저장합니다
      return await this.prisma.chat.create({
        data: {
          userId: user.id,
          telegramChatId,
        },
      });
    } catch (error) {
      console.error('Error creating chat:', error);
      throw error;
    }
  }

  /**
   * 활성 채팅 목록을 가져옵니다.
   */
  public async getActiveChats(): Promise<string[]> {
    try {
      const chats = await this.prisma.chat.findMany({
        select: {
          telegramChatId: true,
        },
      });
      return chats.map((chat: { telegramChatId: string }) => chat.telegramChatId);
    } catch (error) {
      console.error('Error getting active chats:', error);
      throw error;
    }
  }

  /**
   * 구독 정보를 생성합니다.
   */
  public async createSubscription(
    userId: string,
    plan: string,
    isTrial: boolean = false,
    endDate?: Date
  ) {
    try {
      return await this.prisma.subscription.create({
        data: {
          userId,
          plan,
          isTrial,
          endDate,
          status: 'active',
        },
      });
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  }

  /**
   * 사용자의 구독 정보를 가져옵니다.
   */
  public async getUserSubscription(userId: string) {
    try {
      return await this.prisma.subscription.findFirst({
        where: {
          userId,
          status: 'active',
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (error) {
      console.error('Error getting user subscription:', error);
      throw error;
    }
  }

  /**
   * 결제 요청을 생성합니다.
   */
  public async createPaymentRequest(userId: string, paypalOrderId: string, amount: number) {
    try {
      return await this.prisma.paymentRequest.create({
        data: {
          userId,
          paypalOrderId,
          amount,
          status: 'pending',
        },
      });
    } catch (error) {
      console.error('Error creating payment request:', error);
      throw error;
    }
  }

  /**
   * 결제 상태를 업데이트합니다.
   */
  public async updatePaymentStatus(paymentId: string, status: string) {
    try {
      return await this.prisma.paymentRequest.update({
        where: {
          id: paymentId,
        },
        data: {
          status,
        },
      });
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw error;
    }
  }

  /**
   * 대기 중인 결제 요청을 가져옵니다.
   */
  public async getPendingPaymentRequests() {
    try {
      return await this.prisma.paymentRequest.findMany({
        where: {
          status: 'pending',
        },
        include: {
          user: true,
        },
      });
    } catch (error) {
      console.error('Error getting pending payment requests:', error);
      throw error;
    }
  }
}

export default DatabaseService; 