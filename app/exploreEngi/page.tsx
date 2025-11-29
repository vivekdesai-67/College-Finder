'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ExploreEngiPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Explore Engineering Colleges</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            This page is under construction. Please use the Explore page to view all colleges.
          </p>
          <Button onClick={() => router.push('/explore')}>
            Go to Explore Page
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
