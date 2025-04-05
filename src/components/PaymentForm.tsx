import { useState } from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';

interface PaymentFormProps {
  amount: number;
  userId: number;
}

export default function PaymentForm({ amount, userId }: PaymentFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  const createOrder = async () => {
    try {
      const response = await fetch('/api/payment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, amount }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create order');
      }

      setOrderId(data.orderId);
      return data.orderId;
    } catch (err) {
      setError('Failed to create order. Please try again.');
      throw err;
    }
  };

  const onApprove = async (data: any) => {
    try {
      const response = await fetch('/api/payment/capture', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId: data.orderID }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to capture payment');
      }

      // 결제 성공 후 처리 (예: 리다이렉트 또는 상태 업데이트)
      window.location.href = '/payment/success';
    } catch (err) {
      setError('Failed to process payment. Please try again.');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <PayPalScriptProvider
        options={{
          'client-id': process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
          currency: 'USD',
        }}
      >
        <div className="mb-4">
          <p className="text-lg font-semibold">
            Amount: ${(amount / 1300).toFixed(2)} USD
          </p>
          <p className="text-sm text-gray-500">
            (Approximately {amount.toLocaleString()} KRW)
          </p>
        </div>

        <PayPalButtons
          createOrder={createOrder}
          onApprove={onApprove}
          onError={(err) => {
            setError('An error occurred during payment. Please try again.');
          }}
          style={{
            layout: 'vertical',
            color: 'blue',
            shape: 'rect',
            label: 'pay',
          }}
        />

        {error && (
          <div className="mt-4 text-red-500 text-sm">{error}</div>
        )}
      </PayPalScriptProvider>
    </div>
  );
} 