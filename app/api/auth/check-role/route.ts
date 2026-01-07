import { NextResponse } from 'next/server';
import { currentUser, auth } from '@clerk/nextjs/server';

export async function GET() {
  try {
    // Always use currentUser() to get the most up-to-date metadata
    const user = await currentUser();
    const { sessionClaims } = await auth();
    
    if (!user) {
      return NextResponse.json({ 
        isAdmin: false, 
        isStudent: false, 
        error: 'Not authenticated' 
      }, { status: 401 });
    }

    // Get roles from both metadata sources for debugging
    const userPrivateRole = (user.privateMetadata as any)?.role;
    const userPublicRole = (user.publicMetadata as any)?.role;
    const sessionPrivateRole = (sessionClaims?.privateMetadata as any)?.role;
    const sessionPublicRole = (sessionClaims?.publicMetadata as any)?.role;

    // Use the most reliable source (currentUser metadata)
    const isAdmin = userPrivateRole === 'admin' || userPublicRole === 'admin';
    const isStudent = userPrivateRole === 'student' || userPublicRole === 'student';
    const userRole = userPrivateRole || userPublicRole;

    const role = isAdmin ? 'admin' : isStudent ? 'student' : 'none';

    return NextResponse.json({ 
      isAdmin,
      isStudent,
      role,
      userId: user.id.substring(0, 8) + '...',
      // Debug info
      userPrivateRole,
      userPublicRole,
      userRole,
      hasSessionClaims: !!sessionClaims,
      sessionClaims: {
        privateRole: sessionPrivateRole,
        publicRole: sessionPublicRole
      },
      currentUser: {
        id: user.id.substring(0, 8) + '...',
        publicMetadata: user.publicMetadata,
        privateMetadata: user.privateMetadata,
        unsafeMetadata: user.unsafeMetadata
      }
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