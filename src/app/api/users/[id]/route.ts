import { NextResponse, NextRequest } from 'next/server';
import { adminAuth } from '@/middleware/adminAuth';
import { DatabaseService } from '@/services/databaseService';

export const PATCH = adminAuth(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const { id } = params;
    console.log('PATCH params:', params);

    const body = await request.json();
    const { name, email, userStatus } = body;

    // 사용자 정보 업데이트
    await DatabaseService.getInstance().updateUser(id, {
      name,
      email,
      userStatus
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: '사용자 정보를 수정하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
});

export const DELETE = adminAuth(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const { id } = params;
    console.log('DELETE params:', params);

    // 사용자 삭제
    await DatabaseService.getInstance().deleteUser(id);

    return NextResponse.json({ 
      success: true,
      message: '사용자가 성공적으로 삭제되었습니다.'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: '사용자를 삭제하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}); 