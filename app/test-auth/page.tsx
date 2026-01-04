'use client';

import { useUser } from '@clerk/nextjs';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestAuthPage() {
  const { user, isLoaded } = useUser();
  const [roleData, setRoleData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const checkRole = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/check-role');
      const data = await response.json();
      setRoleData(data);
    } catch (error) {
      console.error('Role check failed:', error);
      setRoleData({ error: 'Failed to check role' });
    } finally {
      setLoading(false);
    }
  };

  const assignStudentRole = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/assign-student', { method: 'POST' });
      const data = await response.json();
      console.log('Student role assignment result:', data);
      // Refresh role data
      await checkRole();
    } catch (error) {
      console.error('Student role assignment failed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Authentication Test Page</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Client-side User Data (useUser hook)</h3>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify({
                id: user?.id,
                username: user?.username,
                firstName: user?.firstName,
                lastName: user?.lastName,
                email: user?.primaryEmailAddress?.emailAddress,
                publicMetadata: user?.publicMetadata
              }, null, 2)}
            </pre>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Server-side Role Data (API endpoint)</h3>
            <Button onClick={checkRole} disabled={loading} className="mb-2">
              {loading ? 'Checking...' : 'Refresh'}
            </Button>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {roleData ? JSON.stringify(roleData, null, 2) : 'Click refresh to check role'}
            </pre>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Role Assignment Test</h3>
            <p className="text-sm text-gray-600 mb-2">
              Current role from client: {user?.publicMetadata?.role || 'No role'}
            </p>
            <p className="text-sm text-gray-600 mb-2">
              Current role from server: {roleData?.role || 'No role'}
            </p>
            
            {!roleData?.isStudent && (
              <div className="space-y-2">
                <p className="text-orange-600">
                  No role detected. You should be redirected to profile setup to get a student role assigned.
                </p>
                <Button onClick={assignStudentRole} disabled={loading} variant="outline">
                  Assign Student Role (Testing Only)
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}