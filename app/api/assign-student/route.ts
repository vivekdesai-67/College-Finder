import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';

export async function POST() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Assign student role to current user in BOTH metadata types
    const client = await clerkClient();
    await client.users.updateUser(userId, {
      publicMetadata: {
        role: 'student'
      },
      privateMetadata: {
        role: 'student'
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Student role assigned to both public and private metadata',
      userId: userId.substring(0, 8) + '...'
    });
  } catch (error) {
    console.error('Student assignment error:', error);
    return NextResponse.json({ error: 'Failed to assign student role' }, { status: 500 });
  }
}