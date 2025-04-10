import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

type HandlerParams = {
  params?: { [key: string]: string };
};

export function adminAuth(handler: Function) {
  return async (request: NextRequest, context?: HandlerParams) => {
    try {
      const token = request.cookies.get('adminToken')?.value;

      if (!token) {
        return NextResponse.json(
          { error: '인증 토큰이 없습니다.' },
          { status: 401 }
        );
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!);

      // 인증된 관리자 확인
      if (
        typeof decoded === 'object' &&
        decoded.email === process.env.ADMIN_EMAIL &&
        decoded.role === 'ADMIN'
      ) {
        return await handler(request, context);
      } else {
        return NextResponse.json(
          { error: '권한이 없습니다.' },
          { status: 403 }
        );
      }
    } catch (error) {
      console.error('adminAuth error:', error);
      return NextResponse.json(
        { error: '인증 오류가 발생했습니다.' },
        { status: 401 }
      );
    }
  };
}