import { NextResponse } from 'next/server';

import { adminAuth } from '@/middleware/adminAuth';
import { DatabaseService } from '@/services/databaseService';

export const GET = adminAuth(async () => {
  try {
    const db = DatabaseService.getInstance();
    const users = await db.getAllUsers();
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}); 