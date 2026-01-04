'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Settings } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfileSetupPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn, user } = useUser();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [profileForm, setProfileForm] = useState({
    rank: '',
    category: '',
    preferredBranch: [] as string[],
  });

  const branches = [
    "Computer Science & Engineering",
    "Information Science & Engineering",
    "Electronics & Communication Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
    "Artificial Intelligence & Machine Learning",
    "Electrical & Electronics Engineering",
  ];

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
      return;
    }

    // Load existing profile data if available
    const loadExistingProfile = async () => {
      if (!isSignedIn) return;
      
      try {
        const response = await fetch('/api/student/profile');
        if (response.ok) {
          const profileData = await response.json();
          console.log('Loaded existing profile:', profileData);
          
          // Pre-populate form with existing data
          setProfileForm({
            rank: profileData.rank?.toString() || '',
            category: profileData.category || '',
            preferredBranch: profileData.preferredBranch || [],
          });
        }
      } catch (error) {
        console.log('No existing profile found or error loading:', error);
      } finally {
        setInitialLoading(false);
      }
    };

    if (isLoaded && isSignedIn) {
      loadExistingProfile();
    }
  }, [isLoaded, isSignedIn, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    console.log('Form submitted with data:', profileForm);

    try {
      // Create student profile and assign role via API
      const response = await fetch('/api/student/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...profileForm,
          clerkId: user?.id,
          username: user?.username || user?.firstName || `user_${user?.id?.slice(-8)}`,
          email: user?.primaryEmailAddress?.emailAddress,
          assignRole: true, // Flag to assign student role
        }),
      });

      console.log('API response status:', response.status);

      if (!response.ok) {
        const error = await response.json();
        console.error('API error:', error);
        toast.error(error.error || 'Failed to setup profile');
        return;
      }

      const result = await response.json();
      console.log('Profile setup result:', result);
      
      toast.success('Profile setup complete! Redirecting to dashboard...');
      
      // Force redirect to dashboard
      console.log('Redirecting to dashboard...');
      window.location.href = '/dashboard';
      
    } catch (error) {
      console.error('Profile setup error:', error);
      toast.error('An error occurred while setting up your profile');
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded || !isSignedIn || initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-600" />
            {profileForm.rank ? 'Edit Your Profile' : 'Complete Your Profile'}
          </CardTitle>
          <CardDescription>
            {profileForm.rank 
              ? 'Update your CET details and preferences' 
              : 'Welcome! Please provide your CET details to get personalized college recommendations'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Rank */}
            <div className="space-y-2">
              <Label htmlFor="rank">CET Rank</Label>
              <Input
                id="rank"
                type="number"
                placeholder="Enter your CET rank"
                value={profileForm.rank}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, rank: e.target.value })
                }
                required
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label>Category</Label>
              <select
                className="w-full border rounded-md p-2"
                value={profileForm.category}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, category: e.target.value })
                }
                required
              >
                <option value="">Select category</option>
                {[
                  '1G', '1K', '1R', '2AG', '2AK', '2AR', '2BG', '2BK', '2BR',
                  '3AG', '3AK', '3AR', '3BG', '3BK', '3BR', 'GM', 'GMK', 'GMP',
                  'GMR', 'NRI', 'OPN', 'OTH', 'SCG', 'SCK', 'SCR', 'STG', 'STK', 'STR',
                ].map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Preferred Branches */}
            <div className="space-y-3">
              <Label>Preferred Branches (select at least one)</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {branches.map((branch) => (
                  <div
                    key={branch}
                    className="flex items-center space-x-2 bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition"
                  >
                    <Checkbox
                      id={branch}
                      checked={profileForm.preferredBranch.includes(branch)}
                      onCheckedChange={() => {
                        setProfileForm((prev) => {
                          const selected = prev.preferredBranch.includes(branch)
                            ? prev.preferredBranch.filter((b) => b !== branch)
                            : [...prev.preferredBranch, branch];
                          return { ...prev, preferredBranch: selected };
                        });
                      }}
                    />
                    <label
                      htmlFor={branch}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {branch}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                type="submit" 
                className="flex-1" 
                disabled={loading || profileForm.preferredBranch.length === 0}
              >
                {loading 
                  ? 'Saving...' 
                  : profileForm.rank 
                    ? 'Update Profile' 
                    : 'Complete Setup & Continue'
                }
              </Button>
              
              {profileForm.rank && (
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/dashboard')}
                  disabled={loading}
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
