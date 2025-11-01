'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import CollegeCard from '@/components/CollegeCard';
import { TrendingUp, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { calculateBoomFlag, Branch } from '@/lib/recommendation';
import { ICollege } from '@/types/college';

interface CollegeWithBoom extends ICollege {
  branchesWithBoom: Array<{
    branch: Branch;
    boomPercent: number;
  }>;
}

export default function RecommendationsPage() {
  const router = useRouter();
  const [colleges, setColleges] = useState<CollegeWithBoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [wishlistSet, setWishlistSet] = useState<Set<string>>(new Set());
  const [profileComplete, setProfileComplete] = useState<boolean | null>(null);

  // Fetch personalized recommendations based on profile
  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to view recommendations');
        router.push('/login');
        return;
      }

      // First check if profile is complete
      const profileRes = await fetch('/api/student/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!profileRes.ok) {
        setProfileComplete(false);
        setLoading(false);
        return;
      }

      const profile = await profileRes.json();
      const isComplete = !!(profile.rank && profile.category && profile.preferredBranch);
      setProfileComplete(isComplete);

      if (!isComplete) {
        setLoading(false);
        return;
      }

      // Fetch personalized recommendations
      const res = await fetch('/api/recommendations', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        if (res.status === 400) {
          setProfileComplete(false);
        }
        throw new Error('Failed to fetch recommendations');
      }

      const data = await res.json();
      const recommendations = data.recommendations || [];

      // Process recommendations and calculate boom
      // Recommendations already have college and branch matched
      const collegesWithBoom: CollegeWithBoom[] = recommendations.map((rec: any) => {
        const college = rec.college;
        const recommendedBranch = rec.branch;
        
        // Calculate boom for all branches in the college, but highlight the recommended one
        const branchesWithBoom = college.branchesOffered.map((branch: any) => {
          // Convert ICollege branch cutoff to Branch type cutoff
          // Handle MongoDB Map type, regular object, or ICutoff structure
          const cutoffDict: { [category: string]: number } = {};
          if (branch.cutoff) {
            try {
              // Handle MongoDB Map (when serialized, Maps become objects with entries)
              if (branch.cutoff instanceof Map) {
                branch.cutoff.forEach((value: number, key: string) => {
                  if (typeof value === 'number') {
                    cutoffDict[key] = value;
                  }
                });
              } else if (typeof branch.cutoff === 'object' && !Array.isArray(branch.cutoff)) {
                // Handle plain object (MongoDB Map serialized to object)
                // MongoDB Maps when serialized become { key: value } objects
                Object.entries(branch.cutoff).forEach(([key, value]) => {
                  // Skip MongoDB internal keys and nested structures
                  if (key !== '_id' && key !== '__v' && key !== 'values' && typeof value === 'number') {
                    cutoffDict[key] = value;
                  } else if (key === 'values' && typeof value === 'object') {
                    // Handle nested values object (from old schema format)
                    Object.entries(value as any).forEach(([k, v]) => {
                      if (typeof v === 'number') {
                        cutoffDict[k] = v;
                      }
                    });
                  }
                });
              }
            } catch (error) {
              console.error('Error parsing cutoff for branch:', branch.name, error);
            }
          }

          // Normalize placementRate - ensure it's between 0 and 1
          let placementRate = branch.placementRate || 0;
          if (placementRate > 1) placementRate = placementRate / 100; // Convert percentage to decimal

          // Normalize admissionTrend - ensure it's between 0 and 1
          let admissionTrend = branch.admissionTrend || 0;
          if (admissionTrend > 1) admissionTrend = admissionTrend / 100;

          // Normalize industryGrowth - ensure it's between 0 and 1
          let industryGrowth = branch.industryGrowth || 0;
          if (industryGrowth > 1) industryGrowth = industryGrowth / 100;

          // Convert ICollege branch to Branch type for boom calculation
          const branchForBoom: Branch = {
            name: branch.name,
            cutoff: cutoffDict,
            placementRate: placementRate,
            avgSalary: branch.avgSalary || 0,
            maxSalary: branch.maxSalary || 1000000,
            admissionTrend: admissionTrend,
            industryGrowth: industryGrowth,
            isBooming: branch.isBooming || false,
          };

          // Calculate boom flag
          const boomFlag = calculateBoomFlag(branchForBoom);
          const boomPercent = Math.round(boomFlag * 100);

          // Debug logging (can be removed later)
          if (boomPercent === 0 && (branch.placementRate || branch.avgSalary)) {
            console.log('Boom calculation debug:', {
              branchName: branch.name,
              placementRate: branch.placementRate,
              normalizedPlacementRate: placementRate,
              avgSalary: branch.avgSalary,
              maxSalary: branch.maxSalary,
              admissionTrend: branch.admissionTrend,
              normalizedAdmissionTrend: admissionTrend,
              industryGrowth: branch.industryGrowth,
              normalizedIndustryGrowth: industryGrowth,
              boomFlag,
              boomPercent,
            });
          }

          return {
            branch: branchForBoom,
            boomPercent,
            isRecommended: branch.name === recommendedBranch.name,
          };
        });

        // Find the recommended branch's boom
        const recommendedBranchBoom = branchesWithBoom.find(
          (b: any) => b.branch.name === recommendedBranch.name
        )?.boomPercent || 0;

        return {
          ...college,
          branchesWithBoom,
          recommendedBranch: recommendedBranch.name,
          eligibilityScore: rec.eligibilityScore,
          recommendedBoomPercent: recommendedBranchBoom,
        };
      });

      setColleges(collegesWithBoom);
    } catch (err) {
      console.error('Error fetching colleges:', err);
      toast.error('Failed to load colleges');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
    
    // Fetch wishlist
    const token = localStorage.getItem('token');
    if (token) {
      fetch('/api/student/profile', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((profile) => {
          if (profile.wishlist && Array.isArray(profile.wishlist)) {
            setWishlistSet(new Set(profile.wishlist.map((c: any) => c._id || c.id)));
          }
        })
        .catch((err) => console.error('Wishlist fetch error:', err));
    }
  }, []);

  const handleWishlistToggle = async (collegeId: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to manage wishlist');
      return;
    }

    // Optimistic update
    setWishlistSet((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(collegeId)) newSet.delete(collegeId);
      else newSet.add(collegeId);
      return newSet;
    });

    try {
      const res = await fetch('/api/student/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ collegeId }),
      });
      if (res.ok) {
        toast.success('Wishlist updated');
      }
    } catch {
      toast.error('Failed to update wishlist');
      // Revert optimistic update
      setWishlistSet((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(collegeId)) newSet.delete(collegeId);
        else newSet.add(collegeId);
        return newSet;
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading recommendations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <BookOpen className="h-8 w-8 text-blue-600" />
          Personalized College Recommendations
        </h1>
        <p className="text-gray-600 text-lg">
          Colleges matched to your profile with calculated boom percentages for each branch based on placement rates, salaries, trends, and industry growth.
        </p>
      </div>

      {/* Profile Incomplete Message */}
      {profileComplete === false && (
        <Card className="shadow-lg rounded-xl border-orange-200 bg-orange-50">
          <CardContent className="py-8 text-center">
            <BookOpen className="h-12 w-12 text-orange-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Profile Incomplete</h3>
            <p className="text-gray-600 mb-4">
              Please complete your profile (CET Rank, Category, and Preferred Branches) to get personalized recommendations.
            </p>
            <Button 
              onClick={() => router.push('/dashboard')}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Complete Profile
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Colleges Grid with Boom */}
      <div>
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="h-6 w-6 text-green-600" />
          <h2 className="text-2xl font-bold text-gray-900">
            Colleges with Boom Analysis ({colleges.length})
          </h2>
        </div>

        {profileComplete && colleges.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {colleges.map((college: any) => {
              // Use the recommended branch from the recommendation API
              const recommendedBranchBoom = college.recommendedBoomPercent;
              const recommendedBranch = college.recommendedBranch;

              return (
                <div key={college._id} className="relative">
                  <CollegeCard
                    college={college}
                    eligibilityScore={college.eligibilityScore}
                    recommendedBranch={recommendedBranch}
                    onWishlistToggle={() => handleWishlistToggle(college._id)}
                    isInWishlist={wishlistSet.has(college._id)}
                  />
                  
                  {/* Boom Badge Overlay - shows recommended branch boom */}
                  {recommendedBranchBoom !== undefined && (
                    <div className="absolute top-2 right-2 z-10">
                      <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1 shadow-lg">
                        🔥 {recommendedBranchBoom}% Boom
                      </Badge>
                    </div>
                  )}

                  {/* Show boom for all branches */}
                  {college.branchesWithBoom && college.branchesWithBoom.length > 0 && (
                    <Card className="mt-2 p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
                      <div className="text-xs font-semibold text-gray-700 mb-2">Branch Boom Analysis:</div>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {college.branchesWithBoom.map((item: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-center text-xs">
                            <span className={`text-gray-600 ${item.isRecommended ? 'font-bold text-blue-700' : ''}`}>
                              {item.branch.name}
                              {item.isRecommended && ' ⭐'}
                            </span>
                            <Badge
                              variant="outline"
                              className={`${
                                item.boomPercent >= 70
                                  ? 'bg-green-100 text-green-800 border-green-300'
                                  : item.boomPercent >= 40
                                  ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                                  : 'bg-gray-100 text-gray-800 border-gray-300'
                              } ${item.isRecommended ? 'ring-2 ring-blue-400' : ''}`}
                            >
                              {item.boomPercent}%
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <Card className="shadow-lg rounded-xl text-center py-12">
            <CardContent>
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Colleges Found</h3>
              <p className="text-gray-600 mb-4">
                Check back later for college listings.
              </p>
              <Button variant="outline" onClick={() => fetchRecommendations()}>
                Refresh
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

