'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, ArrowLeft, Home } from 'lucide-react';
import { useUser } from '@clerk/nextjs';

export default function UnauthorizedPage() {
  const { user, isLoaded } = useUser();

  useEffect(() => {
    // Log the unauthorized access attempt for debugging
    console.log('Unauthorized access attempt:', {
      userId: user?.id,
      role: user?.publicMetadata?.role,
      timestamp: new Date().toISOString()
    });
  }, [user]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 p-3 bg-red-100 rounded-full w-fit">
            <Shield className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Access Denied
          </CardTitle>
        </CardHeader>
        
        <CardContent className="text-center space-y-6">
          <div className="space-y-2">
            <p className="text-gray-600">
              You don't have permission to access this page.
            </p>
            {user ? (
              <p className="text-sm text-gray-500">
                Current role: {user.publicMetadata?.role || 'No role assigned'}
              </p>
            ) : (
              <p className="text-sm text-gray-500">
                Please sign in to continue.
              </p>
            )}
          </div>

          <div className="space-y-3">
            {user ? (
              <>
                {user.publicMetadata?.role === 'student' && (
                  <Link href="/dashboard">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      <Home className="h-4 w-4 mr-2" />
                      Go to Student Dashboard
                    </Button>
                  </Link>
                )}
                
                {user.publicMetadata?.role === 'admin' && (
                  <Link href="/admin-dashboard">
                    <Button className="w-full bg-green-600 hover:bg-green-700">
                      <Home className="h-4 w-4 mr-2" />
                      Go to Admin Dashboard
                    </Button>
                  </Link>
                )}

                {!user.publicMetadata?.role && (
                  <Link href="/dashboard">
                    <Button className="w-full bg-purple-600 hover:bg-purple-700">
                      <Home className="h-4 w-4 mr-2" />
                      Go to Dashboard
                    </Button>
                  </Link>
                )}
              </>
            ) : (
              <Link href="/sign-in">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Sign In
                </Button>
              </Link>
            )}

            <Link href="/">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              If you believe this is an error, please contact support.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}