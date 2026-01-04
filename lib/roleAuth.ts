import { auth, clerkClient, currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export type UserRole = 'admin' | 'student';

/**
 * Server-side role authorization check using privateMetadata
 * Use this in API routes to verify user roles securely
 */
export async function requireRole(requiredRole: UserRole) {
  const { userId, sessionClaims } = await auth();
  
  if (!userId) {
    throw new Error('Unauthorized: No user session');
  }

  // Check both privateMetadata and publicMetadata for compatibility
  let privateRole = (sessionClaims?.privateMetadata as any)?.role as UserRole;
  let publicRole = (sessionClaims?.publicMetadata as any)?.role as UserRole;
  
  // If session claims are empty, fallback to currentUser()
  if (!privateRole && !publicRole) {
    const user = await currentUser();
    if (user) {
      privateRole = (user.privateMetadata as any)?.role as UserRole;
      publicRole = (user.publicMetadata as any)?.role as UserRole;
    }
  }
  
  const userRole = privateRole || publicRole;
  
  if (userRole !== requiredRole) {
    throw new Error(`Forbidden: ${requiredRole} access required`);
  }

  return { userId, userRole };
}

/**
 * Admin-only authorization check
 */
export async function requireAdmin() {
  return requireRole('admin');
}

/**
 * Student-only authorization check
 */
export async function requireStudent() {
  return requireRole('student');
}

/**
 * Middleware helper for role-based route protection
 * Returns appropriate error responses
 */
export async function checkRoleAccess(requiredRole: UserRole) {
  try {
    const roleData = await requireRole(requiredRole);
    return { success: true, data: roleData };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Access denied';
    
    if (message.includes('Unauthorized')) {
      return { 
        success: false, 
        response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      };
    }
    
    return { 
      success: false, 
      response: NextResponse.json({ 
        error: `Forbidden: ${requiredRole} access required` 
      }, { status: 403 })
    };
  }
}

/**
 * Assign role to a user (admin use only)
 * Updates privateMetadata for secure role storage
 */
export async function assignUserRole(targetUserId: string, role: UserRole) {
  try {
    // Verify current user is admin
    await requireAdmin();
    
    // Update target user's privateMetadata
    const client = await clerkClient();
    await client.users.updateUser(targetUserId, {
      publicMetadata: { 
        role: role 
      },
      privateMetadata: { 
        role: role 
      }
    });

    return { success: true, message: `Role "${role}" assigned to user ${targetUserId}` };
  } catch (error) {
    console.error('Role assignment error:', error);
    throw new Error('Failed to assign role');
  }
}

/**
 * Get user role information from session
 */
export async function getUserRole() {
  const { userId, sessionClaims } = await auth();
  
  if (!userId) {
    return { role: null, isAuthenticated: false };
  }

  // Check both privateMetadata and publicMetadata for compatibility
  let privateRole = (sessionClaims?.privateMetadata as any)?.role as UserRole | undefined;
  let publicRole = (sessionClaims?.publicMetadata as any)?.role as UserRole | undefined;
  
  // If session claims are empty, fallback to currentUser()
  if (!privateRole && !publicRole) {
    const user = await currentUser();
    if (user) {
      privateRole = (user.privateMetadata as any)?.role as UserRole | undefined;
      publicRole = (user.publicMetadata as any)?.role as UserRole | undefined;
    }
  }
  
  const userRole = privateRole || publicRole;
  
  return {
    userId,
    role: userRole || null,
    isAuthenticated: true,
    isAdmin: userRole === 'admin',
    isStudent: userRole === 'student'
  };
}

/**
 * Check if user has specific role without throwing errors
 */
export async function hasRole(requiredRole: UserRole): Promise<boolean> {
  try {
    await requireRole(requiredRole);
    return true;
  } catch {
    return false;
  }
}