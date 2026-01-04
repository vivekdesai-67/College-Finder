'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SetupAdminPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const createAdmin = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/setup-admin', {
        method: 'POST'
      });
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: 'Failed to create admin user' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Setup Admin User</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded p-4">
            <h3 className="font-semibold text-blue-800 mb-2">Admin User Details:</h3>
            <p><strong>Email:</strong> vivekdesai3369@gmail.com</p>
            <p><strong>Password:</strong> VivekAdmin@2024!</p>
            <p><strong>Role:</strong> admin</p>
            <p className="text-sm text-blue-600 mt-2">
              Note: Using a secure password that meets Clerk's security requirements
            </p>
          </div>
          
          <Button 
            onClick={createAdmin} 
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Creating Admin User...' : 'Create Admin User'}
          </Button>
          
          {result && (
            <div className={`border rounded p-4 ${
              result.success 
                ? 'bg-green-50 border-green-200 text-green-800' 
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              <pre className="whitespace-pre-wrap">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
          
          {result?.success && (
            <div className="bg-green-50 border border-green-200 rounded p-4">
              <p className="text-green-800 font-semibold">✅ Admin user created successfully!</p>
              <p className="text-green-700 mt-2">
                You can now sign in with:
                <br />
                <strong>Email:</strong> {result.email}
                <br />
                <strong>Password:</strong> {result.password}
              </p>
              <p className="text-sm text-green-600 mt-2">
                {result.note}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}