import { NextResponse } from 'next/server';
import { getUserRole } from '@/lib/roleAuth';

export async function GET() {
  try {
    const roleInfo = await getUserRole();
    
    if (!roleInfo.isAuthenticated) {
      return NextResponse.json({ isAdmin: false }, { status: 401 });
    }

    return NextResponse.json({ 
      isAdmin: roleInfo.isAdmin,
      role: roleInfo.role,
      userId: roleInfo.userId
    });
  } catch (error) {
    console.error('Admin verification error:', error);
    return NextResponse.json({ isAdmin: false }, { status: 500 });
  }
}
