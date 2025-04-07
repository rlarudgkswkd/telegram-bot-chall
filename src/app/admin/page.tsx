'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';

interface PaymentRequest {
  id: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
}

interface Subscription {
  id: string;
  plan: string;
  status: string;
  startDate: string;
  endDate: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  telegramId: string | null;
  userStatus: string;
  subscriptions: Subscription[];
  paymentRequests: PaymentRequest[];
}

export default function AdminPage() {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleBroadcast = async () => {
    if (!message.trim()) {
      toast.error('메시지를 입력해주세요.');
      return;
    }

    setIsSending(true);
    try {
      const response = await fetch('/api/broadcast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error('Failed to send broadcast');
      }

      const result = await response.json();
      toast.success(`메시지가 성공적으로 전송되었습니다. (성공: ${result.successCount}, 실패: ${result.failureCount})`);
      setMessage('');
    } catch (error) {
      console.error('Error sending broadcast:', error);
      toast.error('메시지 전송에 실패했습니다.');
    } finally {
      setIsSending(false);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser({ ...user });
  };

  const handleSave = async () => {
    if (!editingUser) return;

    try {
      const response = await fetch(`/api/users/${editingUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userStatus: editingUser.userStatus,
          subscription: editingUser.subscriptions[0] ? {
            id: editingUser.subscriptions[0].id,
            plan: editingUser.subscriptions[0].plan,
            status: editingUser.subscriptions[0].status,
            endDate: editingUser.subscriptions[0].endDate
          } : null
        })
      });

      if (!response.ok) throw new Error('Failed to update user');
      
      toast.success('사용자 정보가 수정되었습니다.');
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('사용자 정보 수정에 실패했습니다.');
    }
  };

  const handleCancel = () => {
    setEditingUser(null);
  };

  const handleSubscriptionChange = (field: keyof Subscription, value: string) => {
    if (!editingUser || !editingUser.subscriptions[0]) return;
    
    setEditingUser({
      ...editingUser,
      subscriptions: [{
        ...editingUser.subscriptions[0],
        [field]: value
      }]
    });
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('정말로 이 사용자를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return;
    }

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      toast.success('사용자가 성공적으로 삭제되었습니다.');
      fetchUsers(); // 사용자 목록 새로고침
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('사용자 삭제에 실패했습니다.');
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold mb-6 text-black">관리자 대시보드</h1>

        <Card className="bg-white shadow-sm mb-8">
          <CardContent className="p-6">
            <h2 className="text-lg font-medium text-black mb-4">브로드캐스트 메시지</h2>
            <div className="space-y-6">
              <Textarea
                placeholder="전송할 메시지를 입력하세요..."
                value={message}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)}
                className="w-full min-h-[120px] p-3 border border-gray-300 rounded-md shadow-sm text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="text-sm text-gray-500 mb-4">
                * 메시지는 사용자 상태가 'active'이고 구독 상태가 'active'인 사용자에게만 전송됩니다.
              </div>
              <Button
                onClick={handleBroadcast}
                disabled={isSending}
                className="w-full bg-[#4F46E5] hover:bg-[#4338CA] text-white py-3 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {isSending ? '메시지 전송 중...' : '메시지 전송'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold mb-4 text-black">사용자 관리</h2>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-black">이름</TableHead>
                    <TableHead className="text-black">이메일</TableHead>
                    <TableHead className="text-black">Telegram ID</TableHead>
                    <TableHead className="text-black">사용자 상태</TableHead>
                    <TableHead className="text-black">구독 정보</TableHead>
                    <TableHead className="text-black">결제 정보</TableHead>
                    <TableHead className="text-black">작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="text-black">{user.name}</TableCell>
                      <TableCell className="text-black">{user.email}</TableCell>
                      <TableCell className="text-black">{user.telegramId || 'Not connected'}</TableCell>
                      <TableCell className="text-black">
                        {editingUser?.id === user.id ? (
                          <select
                            value={editingUser.userStatus}
                            onChange={(e) => setEditingUser({ ...editingUser, userStatus: e.target.value })}
                            className="border rounded p-1"
                          >
                            <option value="active">활성화</option>
                            <option value="inactive">비활성화</option>
                            <option value="suspended">정지</option>
                          </select>
                        ) : (
                          {
                            'active': '활성화',
                            'inactive': '비활성화',
                            'suspended': '정지'
                          }[user.userStatus] || user.userStatus
                        )}
                      </TableCell>
                      <TableCell className="text-black">
                        {editingUser?.id === user.id ? (
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <span>구독:</span>
                              <select
                                value={editingUser.subscriptions[0]?.plan || 'trial'}
                                onChange={(e) => handleSubscriptionChange('plan', e.target.value)}
                                className="border rounded p-1"
                              >
                                <option value="trial">체험판</option>
                                <option value="basic">기본</option>
                                <option value="premium">프리미엄</option>
                              </select>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span>상태:</span>
                              <select
                                value={editingUser.subscriptions[0]?.status || 'active'}
                                onChange={(e) => handleSubscriptionChange('status', e.target.value)}
                                className="border rounded p-1"
                              >
                                <option value="active">활성화</option>
                                <option value="expired">만료</option>
                                <option value="cancelled">취소</option>
                              </select>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span>만료일:</span>
                              <input
                                type="date"
                                value={editingUser.subscriptions[0]?.endDate.split('T')[0] || ''}
                                onChange={(e) => handleSubscriptionChange('endDate', e.target.value)}
                                className="border rounded p-1"
                              />
                            </div>
                          </div>
                        ) : (
                          user.subscriptions.length > 0 ? (
                            <div>
                              <div>구독: {
                                {
                                  'trial': '체험판',
                                  'basic': '기본',
                                  'premium': '프리미엄'
                                }[user.subscriptions[0].plan] || user.subscriptions[0].plan
                              }</div>
                              <div>상태: {
                                {
                                  'active': '활성화',
                                  'expired': '만료',
                                  'cancelled': '취소'
                                }[user.subscriptions[0].status] || user.subscriptions[0].status
                              }</div>
                              <div>만료일: {new Date(user.subscriptions[0].endDate).toLocaleDateString()}</div>
                            </div>
                          ) : (
                            '구독 정보 없음'
                          )
                        )}
                      </TableCell>
                      <TableCell className="text-black">
                        {user.paymentRequests.length > 0 ? (
                          <div>
                            <div>금액: {user.paymentRequests[0].amount} {user.paymentRequests[0].currency}</div>
                            <div>상태: {
                              {
                                'pending': '대기중',
                                'completed': '완료',
                                'failed': '실패'
                              }[user.paymentRequests[0].status] || user.paymentRequests[0].status
                            }</div>
                            <div>날짜: {new Date(user.paymentRequests[0].createdAt).toLocaleDateString()}</div>
                          </div>
                        ) : (
                          '결제 정보 없음'
                        )}
                      </TableCell>
                      <TableCell>
                        {editingUser?.id === user.id ? (
                          <div className="space-x-2">
                            <Button onClick={handleSave} variant="default" size="sm">
                              저장
                            </Button>
                            <Button onClick={handleCancel} variant="outline" size="sm">
                              취소
                            </Button>
                          </div>
                        ) : (
                          <div className="space-x-2">
                            <Button onClick={() => handleEdit(user)} variant="outline" size="sm">
                              수정
                            </Button>
                            <Button 
                              onClick={() => handleDelete(user.id)} 
                              variant="destructive" 
                              size="sm"
                            >
                              삭제
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 