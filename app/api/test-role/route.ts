import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';

export async function GET() {
  try {
    const { userId, sessionClaims } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get current user to see all metadata
    const user = await currentUser();

    // Try multiple ways to get the role
    const privateRole = (sessionClaims?.privateMetadata as any)?.role as string;
    const publicRole = (sessionClaims?.publicMetadata as any)?.role as string;
    const userPrivateRole = (user?.privateMetadata as any)?.role as string;
    const userPublicRole = (user?.publicMetadata as any)?.role as string;
    
    // Use the most reliable source
    const userRole = privateRole || publicRole || userPrivateRole || userPublicRole;

    return NextResponse.json({
      userId: userId.substring(0, 8) + '...',
      privateRole,
      publicRole,
      userPrivateRole,
      userPublicRole,
      userRole,
      hasSessionClaims: !!sessionClaims,
      sessionClaims: sessionClaims ? {
        privateMetadata: sessionClaims.privateMetadata,
        publicMetadata: sessionClaims.publicMetadata
      } : null,
      currentUser: user ? {
        id: user.id.substring(0, 8) + '...',
        publicMetadata: user.publicMetadata,
        privateMetadata: user.privateMetadata,
        unsafeMetadata: user.unsafeMetadata
      } : null
    });
  } catch (error) {
    console.error('Test role error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}