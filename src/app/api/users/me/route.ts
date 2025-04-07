import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { DatabaseService } from '@/services/databaseService';

async function getToken() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token');

    if (!token) {
      console.log('No auth token found in cookies');
      return null;
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not defined in environment variables');
      return null;
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    console.log('Attempting to verify token...');
    const { payload } = await jwtVerify(token.value, secret);
    console.log('Token verified successfully');

    console.log('Payload:', payload);
    return payload;
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
}

export async function GET() {
  try {
    const token = await getToken();
    if (!token || !token.userId) {
      return NextResponse.json({ error: '인증되지 않은 사용자입니다.' }, { status: 401 });
    }

    const user = await DatabaseService.getInstance().getUserById(token.userId as string);
    if (!user) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    }
    
    return NextResponse.json({
      name: user.name,
      email: user.email,
      userStatus: user.userStatus
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: '사용자 정보를 가져오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 