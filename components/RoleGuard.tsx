'use client';

import { useRoleAuth, UserRole } from '@/hooks/useRoleAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, ShieldX, UserX } from 'lucide-react';

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRole: UserRole;
  fallback?: React.ReactNode;
  showLoading?: boolean;
}

/**
 * Component that protects content based on user role
 * Uses privateMetadata for secure role checking
 */
export default function RoleGuard({ 
  children, 
  requiredRole,
  fallback,
  showLoading = true 
}: RoleGuardProps) {
  const { userRole, isLoaded, canAccess } = useRoleAuth(requiredRole);

  // Show loading state while Clerk is loading
  if (!isLoaded && showLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
            <p className="text-gray-600">Verifying access permissions...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show fallback or access denied if wrong role
  if (!canAccess(requiredRole)) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-red-50 px-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <div className="mb-4 p-3 bg-red-100 rounded-full">
              {!userRole ? (
                <UserX className="h-8 w-8 text-red-600" />
              ) : (
                <ShieldX className="h-8 w-8 text-red-600" />
              )}
            </div>
            <h2 className="text-2xl font-bold text-red-600 mb-2">
              {!userRole ? 'Account Setup Required' : 'Access Denied'}
            </h2>
            <p className="text-gray-600 text-center">
              {!userRole 
                ? 'Please complete your profile setup to access this content.'
                : `This content requires ${requiredRole} privileges.`
              }
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // User has correct role, render children
  return <>{children}</>;
}

/**
 * Admin-only guard component
 */
export function AdminGuard({ children, fallback, showLoading = true }: Omit<RoleGuardProps, 'requiredRole'>) {
  return (
    <RoleGuard requiredRole="admin" fallback={fallback} showLoading={showLoading}>
      {children}
    </RoleGuard>
  );
}

/**
 * Student-only guard component
 */
export function StudentGuard({ children, fallback, showLoading = true }: Omit<RoleGuardProps, 'requiredRole'>) {
  return (
    <RoleGuard requiredRole="student" fallback={fallback} showLoading={showLoading}>
      {children}
    </RoleGuard>
  );
}

/**
 * Higher-order component for protecting pages with roles
 */
export function withRoleGuard<P extends object>(
  Component: React.ComponentType<P>,
  requiredRole: UserRole
) {
  return function RoleProtectedComponent(props: P) {
    return (
      <RoleGuard requiredRole={requiredRole}>
        <Component {...props} />
      </RoleGuard>
    );
  };
}