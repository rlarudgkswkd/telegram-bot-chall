'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Subscription {
  plan: string;
  isTrial: boolean;
  endDate: string;
}

export default function DashboardPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const response = await fetch('/api/subscription');
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to fetch subscription');
        }

        const data = await response.json();
        setSubscription(data.subscription);
      } catch (err: any) {
        setError(err.message || '오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscription();
  }, []);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-gray-600">로딩 중...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
            <div className="text-center">
              <Link
                href="/"
                className="text-blue-600 hover:text-blue-800"
              >
                홈으로 돌아가기
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-blue-900 mb-4">
              대시보드
            </h1>
            <p className="text-gray-600">
              한국어 학습 챌린지 대시보드에 오신 것을 환영합니다.
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-lg mb-8">
            <h2 className="text-2xl font-bold text-blue-800 mb-4">구독 정보</h2>
            {subscription && (
              <div className="space-y-4">
                <div>
                  <p className="text-gray-600">구독 플랜</p>
                  <p className="font-medium">
                    {subscription.plan === 'trial' ? '무료 체험' : '월간 구독'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">만료일</p>
                  <p className="font-medium">{formatDate(subscription.endDate)}</p>
                </div>
                {subscription.isTrial && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                    <p className="text-yellow-800">
                      무료 체험 기간이 곧 종료됩니다. 계속 이용하시려면 구독을 시작해주세요.
                    </p>
                    <Link
                      href="/subscribe"
                      className="mt-2 inline-block bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      구독 시작하기
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-blue-800 mb-4">Telegram 봇</h2>
            <p className="text-gray-600 mb-4">
              한국어 학습 챌린지 Telegram 봇을 통해 1:1 한국어 학습을 시작하세요.
            </p>
            <a
              href="https://t.me/KOR_Chall_bot"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-blue-600 text-white text-center py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Telegram 봇 시작하기
            </a>
          </div>
        </div>
      </div>
    </main>
  );
} 