import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';

export async function POST() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Assign admin role to current user in BOTH metadata types
    const client = await clerkClient();
    await client.users.updateUser(userId, {
      publicMetadata: {
        role: 'admin'
      },
      privateMetadata: {
        role: 'admin'
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Admin role assigned to both public and private metadata',
      userId: userId.substring(0, 8) + '...'
    });
  } catch (error) {
    console.error('Admin assignment error:', error);
    return NextResponse.json({ error: 'Failed to assign admin role' }, { status: 500 });
  }
}