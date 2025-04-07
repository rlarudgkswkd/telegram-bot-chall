import { PrismaClient } from '@prisma/client';
import { User, Chat, Subscription, PaymentRequest } from '@/types/user';

export class DatabaseService {
  private prisma: PrismaClient;
  private static instance: DatabaseService | null = null;

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
   * 새로운 사용자를 생성합니다.
   */
  public async createUser(email: string, name: string): Promise<{ id: string }> {
    try {
      const user = await this.prisma.user.create({
        data: {
          email,
          name,
          paymentRequests: {
            create: {
              paypalOrderId: `initial_${Date.now()}`,
              amount: 0,
              status: 'pending'
            }
          }
        },
      });
      return { id: user.id };
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
        where: { email },
      });
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    }
  }

  /**
   * 텔레그램 ID로 사용자를 찾습니다.
   */
  public async getUserByTelegramId(telegramId: string) {
    try {
      return await this.prisma.user.findUnique({
        where: { telegramId },
      });
    } catch (error) {
      console.error('Error finding user by telegram ID:', error);
      throw error;
    }
  }

  /**
   * 사용자 ID로 사용자를 찾습니다.
   */
  public async getUserById(id: string) {
    try {
      return await this.prisma.user.findUnique({
        where: { id },
      });
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw error;
    }
  }

  /**
   * 사용자의 텔레그램 ID를 업데이트합니다.
   */
  public async updateUserTelegramId(userId: string, telegramId: string) {
    try {
      return await this.prisma.user.update({
        where: { id: userId },
        data: { telegramId },
      });
    } catch (error) {
      console.error('Error updating user telegram ID:', error);
      throw error;
    }
  }

  /**
   * 새로운 채팅을 생성합니다.
   */
  public async createChat(telegramId: string) {
    try {
      // 먼저 사용자를 찾습니다
      let user = await this.getUserByTelegramId(telegramId);
      
      // 사용자가 없으면 임시 사용자를 생성합니다
      if (!user) {
        const tempUser = await this.createUser(
          `temp_${telegramId}@telegram.user`,
          `Telegram User ${telegramId}`
        );
        await this.updateUserTelegramId(tempUser.id, telegramId);
        user = await this.getUserById(tempUser.id);
      }
      
      if (!user) {
        throw new Error('Failed to create or find user');
      }
      
      // 채팅을 생성합니다
      return await this.prisma.chat.create({
        data: {
          telegramId,
          userId: user.id,
        },
      });
    } catch (error) {
      console.error('Error creating chat:', error);
      throw error;
    }
  }

  /**
   * 새로운 구독을 생성합니다.
   */
  public async createSubscription(
    userId: string,
    plan: string,
    isTrial: boolean = false,
    endDate: Date
  ) {
    try {
      return await this.prisma.subscription.create({
        data: {
          userId,
          plan,
          status: 'active',
          endDate,
          isTrial,
        },
      });
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  }

  /**
   * 사용자의 활성 구독을 가져옵니다.
   */
  public async getUserSubscription(userId: string) {
    try {
      return await this.prisma.subscription.findFirst({
        where: {
          userId,
          status: 'active',
          endDate: {
            gt: new Date(),
          },
        },
      });
    } catch (error) {
      console.error('Error getting user subscription:', error);
      throw error;
    }
  }

  /**
   * 새로운 결제 요청을 생성합니다.
   */
  public async createPaymentRequest(
    userId: string,
    paypalOrderId: string,
    amount: number,
    currency: string = 'USD'
  ) {
    try {
      return await this.prisma.paymentRequest.create({
        data: {
          userId,
          paypalOrderId,
          amount,
          currency,
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
  public async updatePaymentStatus(paypalOrderId: string, status: string) {
    try {
      return await this.prisma.paymentRequest.update({
        where: { paypalOrderId },
        data: { status },
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
        where: { status: 'pending' },
      });
    } catch (error) {
      console.error('Error getting pending payment requests:', error);
      throw error;
    }
  }

  /**
   * 활성 채팅방 목록을 가져옵니다.
   */
  public async getActiveChats(): Promise<{ id: string; telegramId: string }[]> {
    try {
      // 활성 사용자 찾기
      const activeUsers = await this.prisma.user.findMany({
        where: {
          userStatus: 'active',
          telegramId: { not: null },
          subscriptions: {
            some: {
              status: 'active',
              endDate: { gt: new Date() }
            }
          }
        },
        select: {
          id: true,
          telegramId: true,
          chats: {
            select: {
              id: true,
              telegramId: true
            }
          }
        }
      });

      console.log(`Found ${activeUsers.length} active users`);

      // 각 사용자의 채팅방 수집
      let chats: { id: string; telegramId: string }[] = [];
      
      // 기존 채팅방 수집
      activeUsers.forEach((user: any) => {
        if (user.chats && user.chats.length > 0) {
          chats.push(...user.chats);
        }
      });

      // 채팅방이 없는 경우, 텔레그램 ID를 사용하여 채팅방을 생성합니다
      if (chats.length === 0) {
        console.log('No chats found for active users, creating chats...');
        
        for (const user of activeUsers) {
          if (user.telegramId) {
            try {
              // 텔레그램 ID를 채팅방 ID로 사용하여 채팅방을 생성합니다
              const chat = await this.createChat(user.telegramId);
              console.log(`Created chat for user ${user.id} with telegram ID ${user.telegramId}`);
              chats.push({
                id: chat.id,
                telegramId: chat.telegramId
              });
            } catch (error) {
              console.error(`Error creating chat for user ${user.id}:`, error);
            }
          }
        }
      }

      return chats;
    } catch (error) {
      console.error('Error getting active chats:', error);
      throw error;
    }
  }

  /**
   * 사용자 정보를 업데이트합니다.
   */
  public async updateUser(userId: string, data: { 
    telegramId?: string;
    name?: string;
    email?: string;
    userStatus?: string;
  }): Promise<void> {
    try {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          telegramId: data.telegramId,
          name: data.name,
          email: data.email,
          userStatus: data.userStatus
        }
      });
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  /**
   * 모든 사용자를 가져옵니다.
   */
  public async getAllUsers() {
    try {
      return await this.prisma.user.findMany({
        include: {
          subscriptions: {
            where: {
              status: 'active',
              endDate: {
                gt: new Date()
              }
            }
          },
          paymentRequests: {
            orderBy: {
              createdAt: 'desc'
            },
            take: 1
          }
        }
      });
    } catch (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
  }

  /**
   * 사용자를 삭제합니다.
   */
  public async deleteUser(userId: string): Promise<void> {
    try {
      // 연결된 모든 데이터를 삭제합니다
      await this.prisma.$transaction([
        // 채팅 삭제
        this.prisma.chat.deleteMany({
          where: { userId }
        }),
        // 구독 삭제
        this.prisma.subscription.deleteMany({
          where: { userId }
        }),
        // 결제 요청 삭제
        this.prisma.paymentRequest.deleteMany({
          where: { userId }
        }),
        // 사용자 삭제
        this.prisma.user.delete({
          where: { id: userId }
        })
      ]);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
} 