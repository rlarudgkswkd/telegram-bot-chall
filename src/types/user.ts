export interface User {
  id: string;
  name: string | null;
  email: string;
  telegramId: string | null;
  isActive: boolean;
  userStatus: 'active' | 'inactive' | 'suspended';
  createdAt: Date;
  updatedAt: Date;
  subscriptions?: Subscription[];
  chats?: Chat[];
  paymentRequests?: PaymentRequest[];
}

export interface Chat {
  id: string;
  telegramId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
}

export interface Subscription {
  id: string;
  userId: string;
  plan: 'trial' | 'basic' | 'premium';
  status: 'active' | 'expired' | 'cancelled';
  startDate: Date;
  endDate: Date;
  isTrial: boolean;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
}

export interface PaymentRequest {
  id: string;
  userId: string;
  paypalOrderId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
  user?: User;
} 