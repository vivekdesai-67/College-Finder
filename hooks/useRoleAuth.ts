'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export type UserRole = 'admin' | 'student' | null;

/**
 * Custom hook for role-based authentication using Clerk privateMetadata
 * Provides secure role checking and automatic redirects
 */
export function useRoleAuth(requiredRole?: UserRole, redirectOnUnauthorized = true) {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  // Get user role from publicMetadata (client-accessible)
  // Note: We'll use publicMetadata for client-side checks, but server-side will use privateMetadata
  const userRole = user?.publicMetadata?.role as UserRole;
  const isAuthenticated = !!user;

  useEffect(() => {
    // Add a small delay to ensure Clerk session is fully loaded
    const checkAuth = () => {
      if (isLoaded && redirectOnUnauthorized) {
        if (!isAuthenticated) {
          // Not signed in, redirect to sign-in
          router.push('/sign-in');
          return;
        }

        // Only redirect if we have a required role and the user role is loaded and doesn't match
        if (requiredRole && isLoaded && userRole && userRole !== requiredRole) {
          // Wrong role, redirect to unauthorized
          console.log('Role mismatch:', { userRole, requiredRole });
          router.push('/unauthorized');
          return;
        }

        // Auto-redirect based on role if no specific role required
        if (!requiredRole && userRole) {
          const currentPath = window.location.pathname;
          
          // Don't redirect if already on correct dashboard
          if (userRole === 'admin' && !currentPath.startsWith('/admin')) {
            router.push('/admin-dashboard');
          } else if (userRole === 'student' && currentPath === '/') {
            router.push('/dashboard');
          }
        }
      }
    };

    // Add a small delay to ensure session is fully synced
    const timer = setTimeout(checkAuth, 100);
    return () => clearTimeout(timer);
  }, [isLoaded, isAuthenticated, userRole, requiredRole, redirectOnUnauthorized, router]);

  return {
    user,
    userRole,
    isAuthenticated,
    isLoaded,
    isAdmin: userRole === 'admin',
    isStudent: userRole === 'student',
    hasRole: !!userRole,
    canAccess: (role: UserRole) => userRole === role,
  };
}

/**
 * Hook for admin-only access
 */
export function useAdminAuth(redirectOnUnauthorized = false) {
  return useRoleAuth('admin', redirectOnUnauthorized);
}

/**
 * Hook for student-only access
 */
export function useStudentAuth(redirectOnUnauthorized = true) {
  return useRoleAuth('student', redirectOnUnauthorized);
}

/**
 * Hook for checking roles without redirects (for conditional rendering)
 */
export function useRoleCheck() {
  return useRoleAuth(undefined, false);
}