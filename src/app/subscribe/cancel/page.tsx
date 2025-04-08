// app/subscribe/cancel.tsx
export default function SubscribeCancel() {
    return (
      <main className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-red-700">결제가 취소되었습니다.</h1>
          <p className="mt-4 text-gray-700">언제든지 다시 시도하실 수 있어요.</p>
        </div>
      </main>
    );
  }