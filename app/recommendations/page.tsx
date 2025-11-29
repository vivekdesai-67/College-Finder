'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import CollegeCard from '@/components/CollegeCard';
import { TrendingUp, BookOpen, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { calculateBoomFlag, Branch } from '@/lib/recommendation';
import { ICollege } from '@/types/college';

interface CollegeWithBoom extends ICollege {
  branchesWithBoom: Array<{
    branch: Branch;
    boomPercent: number;
  }>;
}

// Normalize branch names and common aliases to improve matching
const normalizeBranch = (name: string) => {
  const n = String(name || '').trim().toLowerCase()
    .replace(/\s+/g, ' ') // normalize whitespace
    .replace(/[()]/g, '') // remove parentheses
    .replace(/&/g, 'and'); // normalize & to and
  
  const map: Record<string, string> = {
    'cs': 'computer science and engineering',
    'cse': 'computer science and engineering',
    'computer science': 'computer science and engineering',
    'computer science and engineering': 'computer science and engineering',
    'computer science and engineering cse': 'computer science and engineering',
    'ise': 'information science and engineering',
    'it': 'information technology',
    'ece': 'electronics and communication engineering',
    'electronics and communication engineering': 'electronics and communication engineering',
    'electronics and communication engineering ece': 'electronics and communication engineering',
    'eee': 'electrical and electronics engineering',
    'electrical and electronics engineering': 'electrical and electronics engineering',
    'electrical and electronics engineering eee': 'electrical and electronics engineering',
    'civil': 'civil engineering',
    'civil engineering': 'civil engineering',
    'mech': 'mechanical engineering',
    'mechanical': 'mechanical engineering',
    'mechanical engineering': 'mechanical engineering',
    'ai': 'artificial intelligence',
    'aiandds': 'artificial intelligence and data science',
    'aiandml': 'artificial intelligence and machine learning',
    'aiml': 'artificial intelligence and machine learning',
    'artificial intelligence': 'artificial intelligence',
    'artificial intelligence and machine learning': 'artificial intelligence and machine learning',
    'artificial intelligence and machine learning aiml': 'artificial intelligence and machine learning',
  };
  return map[n] || n;
};

// Check if a branch name matches any preferred aliases (strict or substring)
const matchesPreferred = (branchName: string, preferred: string[]) => {
  const bn = String(branchName || '').toLowerCase();
  const normalizedBn = normalizeBranch(bn);

  for (const p of preferred) {
    const np = normalizeBranch(p);
    
    // Exact match on normalized names
    if (normalizedBn === np) return true;
    
    // Check if either contains the other (for partial matches)
    if (normalizedBn.includes(np) || np.includes(normalizedBn)) return true;
    
    // Special handling for common abbreviations
    if (np.includes('computer science') && (bn.includes('cse') || bn.includes('computer science'))) return true;
    if (np.includes('electronics and communication') && (bn.includes('ece') || bn.includes('electronics'))) return true;
    if (np.includes('electrical and electronics') && (bn.includes('eee') || bn.includes('electrical'))) return true;
    if (np.includes('artificial intelligence') && (bn.includes('ai') || bn.includes('artificial intelligence'))) return true;
    if (np.includes('civil') && bn.includes('civil')) return true;
    if (np.includes('mechanical') && bn.includes('mechanical')) return true;
  }
  
  return false;
};

export default function RecommendationsPage() {
  const router = useRouter();
  const [colleges, setColleges] = useState<CollegeWithBoom[]>([]);
  const [loading, setLoading] = useState(false);
  const [wishlistSet, setWishlistSet] = useState<Set<string>>(new Set());
  const [profileComplete, setProfileComplete] = useState<boolean | null>(null);
  const [preferredBranches, setPreferredBranches] = useState<string[]>([]);
  const [userCategory, setUserCategory] = useState<string | null>(null);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [profileForm, setProfileForm] = useState({
    rank: '',
    category: '',
    preferredBranch: [] as string[],
  });

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
      const prefArray: string[] = Array.isArray(profile.preferredBranch)
        ? profile.preferredBranch
        : profile.preferredBranch
        ? [profile.preferredBranch]
        : [];
      setPreferredBranches(prefArray);
      if (profile.category) setUserCategory(profile.category);
      if (typeof profile.rank === 'number') setUserRank(profile.rank);
      const isComplete = !!(profile.rank && profile.category && prefArray.length > 0);
      setProfileComplete(isComplete);
      
      // Initialize profile form with current values
      setProfileForm({
        rank: profile.rank?.toString() || '',
        category: profile.category || '',
        preferredBranch: prefArray,
      });

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
      let recommendations = data.recommendations || [];
      
      console.log('Raw recommendations from API:', recommendations.length);
      console.log('User preferred branches:', prefArray);
      if (recommendations.length > 0) {
        console.log('Sample branch names from API:', recommendations.slice(0, 3).map((r: any) => r.branch?.name));
      }

      // Only keep recommendations whose branch matches user's preferred branches
      if (prefArray.length > 0) {
        const beforeFilter = recommendations.length;
        recommendations = recommendations.filter((rec: any) => {
          const matches = matchesPreferred(rec?.branch?.name || '', prefArray);
          if (!matches && beforeFilter < 5) {
            console.log('Branch not matched:', rec?.branch?.name, 'against', prefArray);
          }
          return matches;
        });
        console.log('After preferred branch filter:', recommendations.length);
      }

      // Enforce rank threshold: only show colleges where adjustedCutoff >= userRank
      if (typeof profile.rank === 'number') {
        recommendations = recommendations.filter((rec: any) =>
          typeof rec.adjustedCutoff === 'number' ? profile.rank <= rec.adjustedCutoff : true
        );
        console.log('After rank filter:', recommendations.length);
      }

      // Process recommendations and calculate boom
      // Recommendations already have college and branch matched
      const selectedCategory: string | undefined = profile.category;
      const collegesWithBoom: CollegeWithBoom[] = recommendations.map((rec: any) => {
        const college = rec.college;
        const recommendedBranch = rec.branch;
        
        // Only show the recommended branch, not all branches
        const source = recommendedBranch?.cutoff instanceof Map 
          ? Object.fromEntries(recommendedBranch.cutoff as any) 
          : recommendedBranch?.cutoff || {};
        
        const singleCat: any = {};
        if (selectedCategory && source[selectedCategory] != null) {
          singleCat[selectedCategory] = source[selectedCategory];
        }
        
        // Create array with only the recommended branch
        const branchesForCard = [{
          ...recommendedBranch,
          cutoff: singleCat
        }];
        
        const branchesSource = college.branchesOffered || [];
        const branchesWithBoom = branchesSource.map((branch: any) => {
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
            isRecommended: true,
          };
        });

        // Find the recommended branch's boom
        const recommendedBranchBoom = branchesWithBoom.find(
          (b: any) => b.branch.name === recommendedBranch.name
        )?.boomPercent || 0;

        return {
          ...college,
          // Pass only preferred branches and selected category cutoff for display
          branchesOffered: branchesForCard,
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
    // Auto fetch recommendations on mount
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
          const prefArray: string[] = Array.isArray(profile.preferredBranch)
            ? profile.preferredBranch
            : profile.preferredBranch
            ? [profile.preferredBranch]
            : [];
          setPreferredBranches(prefArray);
          if (profile.category) setUserCategory(profile.category);
          if (typeof profile.rank === 'number') setUserRank(profile.rank);
          
          // Initialize profile form with current values
          setProfileForm({
            rank: profile.rank?.toString() || '',
            category: profile.category || '',
            preferredBranch: prefArray,
          });
        })
        .catch((err) => console.error('Wishlist fetch error:', err));
    }
  }, []);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to update profile');
      return;
    }

    try {
      const res = await fetch('/api/student/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileForm),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || 'Failed to update profile');
        return;
      }

      const updated = await res.json();
      const prefArray: string[] = Array.isArray(updated.preferredBranch)
        ? updated.preferredBranch
        : updated.preferredBranch
        ? [updated.preferredBranch]
        : [];
      
      setPreferredBranches(prefArray);
      if (updated.category) setUserCategory(updated.category);
      if (typeof updated.rank === 'number') setUserRank(updated.rank);
      
      const isComplete = !!(updated.rank && updated.category && prefArray.length > 0);
      setProfileComplete(isComplete);
      setShowEditForm(false);

      if (isComplete) {
        toast.success('Profile updated successfully!');
        // Refresh recommendations
        await fetchRecommendations();
      } else {
        toast.error('Profile still incomplete!');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error updating profile');
    }
  };

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

      {/* Edit Profile Form */}
      {showEditForm && (
        <Card className="shadow-lg rounded-xl border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-blue-600" />
              Edit Your Profile
            </CardTitle>
            <CardDescription>
              Update your CET details to get better personalized college recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileSubmit} className="space-y-6">
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
                <Label>Preferred Branches</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    "Computer Science & Engineering",
                    "Information Science & Engineering",
                    "Electronics & Communication Engineering",
                    "Mechanical Engineering",
                    "Civil Engineering",
                    "Artificial Intelligence & Machine Learning",
                    "Electrical & Electronics Engineering",
                  ].map((branch) => (
                    <div
                      key={branch}
                      className="flex items-center space-x-2 bg-white p-3 rounded-lg hover:bg-gray-50 transition border border-gray-200"
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

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  Save Profile
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEditForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Context: Show selected Category and Preferred Branches */}
      {profileComplete && !showEditForm && (
        <div className="flex flex-wrap items-center gap-2 -mt-4 justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {userCategory && (
              <Badge className="bg-blue-50 text-blue-700 border border-blue-200">Category: {userCategory}</Badge>
            )}
            {typeof userRank === 'number' && (
              <Badge className="bg-green-50 text-green-700 border border-green-200">Rank: {userRank}</Badge>
            )}
            {preferredBranches && preferredBranches.length > 0 && (
              <Badge variant="outline" className="border-emerald-300 text-emerald-700">
                {preferredBranches.join(', ')}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => fetchRecommendations()} disabled={loading}>
              {loading ? 'Refreshing…' : 'Get by Rank'}
            </Button>
            <Button onClick={() => setShowEditForm(true)}>Edit Profile</Button>
          </div>
        </div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch auto-rows-fr">
            {colleges.map((college: any) => {
              // Use the recommended branch from the recommendation API
              const recommendedBranchBoom = college.recommendedBoomPercent;
              const recommendedBranch = college.recommendedBranch;

              return (
                <div key={college._id} className="relative h-full">
                  <div className="h-full min-h-[520px] flex flex-col">
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

                  {/* Branch list hidden as per requirement to not display all branches */}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <Card className="shadow-lg rounded-xl text-center py-12">
            <CardContent>
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Matching Colleges</h3>
              <p className="text-gray-600 mb-4">
                No colleges matched your category and preferred branches. Try updating your profile preferences.
              </p>
              <div className="flex gap-2 justify-center">
                <Button variant="outline" onClick={() => fetchRecommendations()}>Refresh</Button>
                <Button onClick={() => setShowEditForm(true)}>Edit Profile</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

