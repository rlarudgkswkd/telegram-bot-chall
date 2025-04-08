'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function SubscribePage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      // 사용자 등록 API 호출
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, name, startTrial: false }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to register');
      }

      const data = await response.json();

      // PayPal 결제 시작
      const paymentResponse = await fetch('/api/payments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: data.userId }),
      });

      console.log("paymentResponse: ", paymentResponse);

      if (!paymentResponse.ok) {
        const paymentData = await paymentResponse.json();
        throw new Error(paymentData.error || 'Failed to create payment');
      }

      const paymentData = await paymentResponse.json();
      console.log("paymentData", paymentData);
      
      // PayPal 결제 페이지로 리다이렉트
      window.location.href = paymentData.approvalUrl;
    } catch (err: any) {
      setError(err.message || '오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-blue-900 mb-4">
              한국어 학습 챌린지 구독
            </h1>
            <p className="text-xl text-gray-700">
              월간 구독으로 한국어 학습 챌린지를 시작하세요.
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-blue-800 mb-4">구독 신청</h2>
            <p className="text-gray-600 mb-6">
              아래 양식을 작성하여 구독을 신청하세요. PayPal을 통해 결제가 진행됩니다.
            </p>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  이름
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  이메일
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {isSubmitting ? '처리 중...' : '구독 시작하기'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                이미 계정이 있으신가요?{' '}
                <Link href="/login" className="text-blue-600 hover:text-blue-800">
                  로그인하기
                </Link>
              </p>
            </div>
          </div>

          <div className="mt-8 bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold text-blue-800 mb-4">구독 혜택</h2>
            <ul className="space-y-3">
              <li className="flex items-start">
                <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-900">무제한 한국어 학습 챌린지 이용</span>
              </li>
              <li className="flex items-start">
                <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-900">Telegram 봇을 통한 1:1 한국어 학습</span>
              </li>
              <li className="flex items-start">
                <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-900">월간 자동 갱신, 언제든지 취소 가능</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
} 