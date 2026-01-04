import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';

export async function GET() {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ 
        isAdmin: false, 
        isStudent: false, 
        error: 'Not authenticated' 
      }, { status: 401 });
    }

    // Check if user has admin role in either metadata
    const isAdmin = (user.publicMetadata as any)?.role === 'admin' || 
                   (user.privateMetadata as any)?.role === 'admin';
    
    // Check if user has student role in either metadata
    const isStudent = (user.publicMetadata as any)?.role === 'student' || 
                     (user.privateMetadata as any)?.role === 'student';

    const role = isAdmin ? 'admin' : isStudent ? 'student' : 'none';

    return NextResponse.json({ 
      isAdmin,
      isStudent,
      role,
      userId: user.id.substring(0, 8) + '...'
    });
  } catch (error) {
    console.error('Role check error:', error);
    return NextResponse.json({ 
      isAdmin: false, 
      isStudent: false, 
      error: 'Server error' 
    }, { status: 500 });
  }
}