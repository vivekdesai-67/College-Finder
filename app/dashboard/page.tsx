

// 'use client';

// import { useEffect, useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Badge } from '@/components/ui/badge';
// import CollegeCard from '@/components/CollegeCard';
// import { TrendingUp, Target, BookOpen, Settings } from 'lucide-react';
// import { toast } from 'sonner';
// import College from '@/lib/models/College';

// export default function DashboardPage() {
//   const [user, setUser] = useState<any>(null);
//   const [profile, setProfile] = useState<any>(null);
//   const [recommendations, setRecommendations] = useState<any[]>([]);
//   const [trendingBranches, setTrendingBranches] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [profileForm, setProfileForm] = useState({
//     rank: '',
//     category: '',
//     preferredBranch: ''
//   });
//   const [showProfileForm, setShowProfileForm] = useState(false);
//   const [wishlistSet, setWishlistSet] = useState<Set<string>>(new Set());
//   const router = useRouter();

//   const branches = [
//     'Computer Science Engineering',
//     'Information Technology',
//     'Electronics and Communication Engineering',
//     'Mechanical Engineering',
//     'Civil Engineering',
//     'Electrical Engineering',
//     'Electronics and Telecommunication Engineering'
//   ];

//   const fetchRecommendations = async (token: string) => {
//     try {
//       const response = await fetch('/api/recommendations', {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       if (response.ok) {
//         const data = await response.json();
//         setRecommendations(data.recommendations || []);
//         setTrendingBranches(data.trendingBranches || []);
//       }
//     } catch (error) {
//       console.error('Recommendations fetch error:', error);
//     }
//   };

//   const fetchProfile = async (token: string) => {
//     try {
//       setLoading(true);
//       const response = await fetch('/api/student/profile', {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       console.log(response);

//       if (!response.ok) throw new Error('Failed to fetch profile');

//       const profileData = await response.json();
//       setProfile(profileData);

//       // Populate wishlistSet from profileData.wishlist if available
//       if (profileData.wishlist && Array.isArray(profileData.wishlist)) {
//         setWishlistSet(new Set(profileData.wishlist.map((college: any) => college.id || college._id)));
//       } else {
//         setWishlistSet(new Set());
//       }

//       // Show profile form only if incomplete
//       const isComplete = !!(profileData.rank && profileData.category && profileData.preferredBranch);
//       setShowProfileForm(!isComplete);

//       if (!isComplete) {
//         setProfileForm({
//           rank: profileData.rank?.toString() || '',
//           category: profileData.category || '',
//           preferredBranch: profileData.preferredBranch || ''
//         });
//       } else {
//         fetchRecommendations(token);
//       }

//     } catch (error) {
//       console.error('Profile fetch error:', error);
//       toast.error('Failed to load profile');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     const userData = localStorage.getItem('user');

//     if (!token || !userData) {
//       router.push('/login');
//       return;
//     }

//     const userObj = JSON.parse(userData);
//     if (userObj.role !== 'student') {
//       router.push('/admin');
//       return;
//     }

//     setUser(userObj);
//     fetchProfile(token);
//   }, []);

//   const handleProfileSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     const token = localStorage.getItem('token');
//     if (!token) return;

//     try {
//       const response = await fetch('/api/student/profile', {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${token}`
//         },
//         body: JSON.stringify(profileForm)
//       });

//       if (!response.ok) {
//         const error = await response.json();
//         toast.error(error.error || 'Failed to update profile');
//         return;
//       }

//       const updatedProfile = await response.json();
//       setProfile(updatedProfile);

//       // Check if profile is now complete
//       const isComplete = !!(updatedProfile.rank && updatedProfile.category && updatedProfile.preferredBranch);
//       setShowProfileForm(!isComplete);

//       if (isComplete) {
//         toast.success('Profile updated successfully!');
//         fetchRecommendations(token);
//       } else {
//         toast.error('Profile still incomplete!');
//       }

//     } catch (error) {
//       console.error(error);
//       toast.error('An error occurred while updating profile');
//     }
//   };

//   const handleWishlistToggle = async (collegeId: string) => {
//     const token = localStorage.getItem('token');
//     if (!token) return;

//     try {
//       const response = await fetch('/api/student/wishlist', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${token}`
//         },
//         body: JSON.stringify({ collegeId })
//       });

//       if (response.ok) {
//         const data = await response.json();
//         toast.success(data.message);
//       }
//     } catch (error) {
//       toast.error('Failed to update wishlist');
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
//           <p className="text-gray-600">Loading your dashboard...</p>
//         </div>
//       </div>
//     );
//   }

//   // Profile form
//   if (showProfileForm) {
//     return (
//       <div className="container mx-auto px-4 py-8 max-w-2xl">
//         <Card>
//           <CardHeader>
//             <CardTitle className="flex items-center space-x-2">
//               <Settings className="h-5 w-5 text-blue-600" />
//               <span>Complete Your Profile</span>
//             </CardTitle>
//             <CardDescription>
//               Please provide your CET details to get personalized college recommendations
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             <form onSubmit={handleProfileSubmit} className="space-y-6">
//               <div className="space-y-2">
//                 <Label htmlFor="rank">CET Rank</Label>
//                 <Input
//                   id="rank"
//                   type="number"
//                   placeholder="Enter your CET rank"
//                   value={profileForm.rank}
//                   onChange={(e) => setProfileForm({ ...profileForm, rank: e.target.value })}
//                   required
//                 />
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="category">Category</Label>
//                 <Select
//                   value={profileForm.category}
//                   onValueChange={(value) => setProfileForm({ ...profileForm, category: value })}
//                 >
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select your category" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="general">General</SelectItem>
//                     <SelectItem value="obc">OBC</SelectItem>
//                     <SelectItem value="sc">SC</SelectItem>
//                     <SelectItem value="st">ST</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="preferredBranch">Preferred Branch</Label>
//                 <Select
//                   value={profileForm.preferredBranch}
//                   onValueChange={(value) => setProfileForm({ ...profileForm, preferredBranch: value })}
//                 >
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select your preferred branch" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {branches.map(branch => (
//                       <SelectItem key={branch} value={branch}>{branch}</SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>

//               <Button type="submit" className="w-full">
//                 Save Profile & Get Recommendations
//               </Button>
//             </form>
//           </CardContent>
//         </Card>
//       </div>
//     );
//   }

//   // Main dashboard
//   return (
//     <div className="container mx-auto px-4 py-8">
//       <h1 className="text-3xl font-bold text-gray-900 mb-2">
//         Welcome back, {user?.username}!
//       </h1>
//       <p className="text-gray-600 mb-8">
//         Here are your personalized college recommendations based on your profile.
//       </p>

//       {/* Profile Summary */}
//       {profile && (
//         <Card className="mb-8">
//           <CardHeader>
//             <CardTitle className="flex items-center space-x-2">
//               <Target className="h-5 w-5 text-blue-600" />
//               <span>Your Profile</span>
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//               <div className="text-center p-4 bg-blue-50 rounded-lg">
//                 <div className="text-2xl font-bold text-blue-600">{profile.rank}</div>
//                 <div className="text-sm text-gray-600">CET Rank</div>
//               </div>
//               <div className="text-center p-4 bg-green-50 rounded-lg">
//                 <div className="text-lg font-semibold text-green-600 uppercase">{profile.category}</div>
//                 <div className="text-sm text-gray-600">Category</div>
//               </div>
//               <div className="text-center p-4 bg-purple-50 rounded-lg">
//                 <div className="text-sm font-medium text-purple-600">{profile.preferredBranch}</div>
//                 <div className="text-sm text-gray-600">Preferred Branch</div>
//               </div>
//             </div>
//             <div className="mt-4 text-center">
//               <Button
//                 variant="outline"
//                 size="sm"
//                 onClick={() => setShowProfileForm(true)}
//               >
//                 <Settings className="h-4 w-4 mr-2" />
//                 Update Profile
//               </Button>
//             </div>
//           </CardContent>
//         </Card>
//       )}

//       {/* Trending Branches */}
//       {trendingBranches.length > 0 && (
//         <Card className="mb-8">
//           <CardHeader>
//             <CardTitle className="flex items-center space-x-2">
//               <TrendingUp className="h-5 w-5 text-orange-600" />
//               <span>Trending Branches</span>
//             </CardTitle>
//             <CardDescription>
//               Most popular engineering branches based on industry demand
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             <div className="flex flex-wrap gap-3">
//               {trendingBranches.map((branch, index) => (
//                 <Badge
//                   key={index}
//                   variant="secondary"
//                   className="px-3 py-2 text-sm bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 border-orange-200"
//                 >
//                   <TrendingUp className="h-3 w-3 mr-1" />
//                   {branch.name}
//                   <span className="ml-1 text-xs">({Math.round(branch.avgBoomFlag * 100)}% growth)</span>
//                 </Badge>
//               ))}
//             </div>
//           </CardContent>
//         </Card>
//       )}

//       {/* College Recommendations */}
//       <div className="mb-8">
//         <div className="flex items-center space-x-2 mb-6">
//           <BookOpen className="h-6 w-6 text-blue-600" />
//           <h2 className="text-2xl font-bold text-gray-900">Your College Recommendations</h2>
//         </div>
//         {recommendations.length > 0 ? (
//           recommendations.slice(0, 9).map((rec, index) => (
//             <CollegeCard
//               key={`${rec.college._id}-${index}`}
//               college={rec.college}
//               eligibilityScore={rec.eligibilityScore}
//               recommendedBranch={rec.branch.name}
//               onWishlistToggle={handleWishlistToggle}
//               isInWishlist={wishlistSet.has(rec.college._id || rec.college.id)}
//             />
//           ))
//         ) : (
//           <Card>
//             <CardContent className="text-center py-12">
//               <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
//               <h3 className="text-lg font-semibold text-gray-900 mb-2">No Recommendations Yet</h3>
//               <p className="text-gray-600 mb-4">
//                 Complete your profile to get personalized college recommendations.
//               </p>
//               <Button onClick={() => setShowProfileForm(true)}>
//                 Complete Profile
//               </Button>
//             </CardContent>
//           </Card>
//         )}
//       </div>

//       {recommendations.length > 9 && (
//         <div className="text-center">
//           <Button variant="outline" onClick={() => router.push('/explore')}>
//             View All Recommendations
//           </Button>
//         </div>
//       )}
//     </div>
//   );
// }
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import CollegeCard from '@/components/CollegeCard';
import { TrendingUp, Target, BookOpen, Settings } from 'lucide-react';
import { toast } from 'sonner';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [trendingBranches, setTrendingBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileForm, setProfileForm] = useState({
    rank: '',
    category: '',
    preferredBranch: ''
  });
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [wishlistSet, setWishlistSet] = useState<Set<string>>(new Set());
  const router = useRouter();

  const branches = [
    'Computer Science Engineering',
    'Information Technology',
    'Electronics and Communication Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Electrical Engineering',
    'Electronics and Telecommunication Engineering'
  ];

  const fetchRecommendations = async (token: string) => {
    try {
      const response = await fetch('/api/recommendations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setRecommendations(data.recommendations || []);
        setTrendingBranches(data.trendingBranches || []);
      }
    } catch (error) {
      console.error('Recommendations fetch error:', error);
    }
  };

  const fetchProfile = async (token: string) => {
    try {
      setLoading(true);
      const response = await fetch('/api/student/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to fetch profile');

      const profileData = await response.json();
      setProfile(profileData);

      // Populate wishlistSet
      if (profileData.wishlist && Array.isArray(profileData.wishlist)) {
        setWishlistSet(new Set(profileData.wishlist.map((c: any) => c._id || c.id)));
      }

      const isComplete = !!(profileData.rank && profileData.category && profileData.preferredBranch);
      setShowProfileForm(!isComplete);

      if (!isComplete) {
        setProfileForm({
          rank: profileData.rank?.toString() || '',
          category: profileData.category || '',
          preferredBranch: profileData.preferredBranch || ''
        });
      } else {
        fetchRecommendations(token);
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    const userObj = JSON.parse(userData);
    if (userObj.role !== 'student') {
      router.push('/admin');
      return;
    }

    setUser(userObj);
    fetchProfile(token);
  }, []);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch('/api/student/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(profileForm)
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || 'Failed to update profile');
        return;
      }

      const updatedProfile = await response.json();
      setProfile(updatedProfile);

      const isComplete = !!(updatedProfile.rank && updatedProfile.category && updatedProfile.preferredBranch);
      setShowProfileForm(!isComplete);

      if (isComplete) {
        toast.success('Profile updated successfully!');
        fetchRecommendations(token);
      } else {
        toast.error('Profile still incomplete!');
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while updating profile');
    }
  };

  const handleWishlistToggle = async (collegeId: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Optimistic UI update
    setWishlistSet(prev => {
      const newSet = new Set(prev);
      if (newSet.has(collegeId)) newSet.delete(collegeId);
      else newSet.add(collegeId);
      return newSet;
    });

    try {
      const response = await fetch('/api/student/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ collegeId })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message || 'Wishlist updated');
      }
    } catch (error) {
      toast.error('Failed to update wishlist');
      // Revert optimistic update
      setWishlistSet(prev => {
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
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (showProfileForm) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5 text-blue-600" />
              <span>Complete Your Profile</span>
            </CardTitle>
            <CardDescription>
              Please provide your CET details to get personalized college recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="rank">CET Rank</Label>
                <Input
                  id="rank"
                  type="number"
                  placeholder="Enter your CET rank"
                  value={profileForm.rank}
                  onChange={(e) => setProfileForm({ ...profileForm, rank: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={profileForm.category}
                  onValueChange={(value) => setProfileForm({ ...profileForm, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="obc">OBC</SelectItem>
                    <SelectItem value="sc">SC</SelectItem>
                    <SelectItem value="st">ST</SelectItem>
                    <SelectItem value="st">2A</SelectItem>
                    <SelectItem value="st">2B</SelectItem>
                    <SelectItem value="st">3A</SelectItem>
                    <SelectItem value="st">3B</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="preferredBranch">Preferred Branch</Label>
                <Select
                  value={profileForm.preferredBranch}
                  onValueChange={(value) => setProfileForm({ ...profileForm, preferredBranch: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your preferred branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map(branch => (
                      <SelectItem key={branch} value={branch}>{branch}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full">
                Save Profile & Get Recommendations
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user?.username}!</h1>
      <p className="text-gray-600 mb-8">
        Here are your personalized college recommendations based on your profile.
      </p>

      {profile && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-blue-600" />
              <span>Your Profile</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{profile.rank}</div>
                <div className="text-sm text-gray-600">CET Rank</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-lg font-semibold text-green-600 uppercase">{profile.category}</div>
                <div className="text-sm text-gray-600">Category</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-sm font-medium text-purple-600">{profile.preferredBranch}</div>
                <div className="text-sm text-gray-600">Preferred Branch</div>
              </div>
            </div>
            <div className="mt-4 text-center">
              <Button variant="outline" size="sm" onClick={() => setShowProfileForm(true)}>
                <Settings className="h-4 w-4 mr-2" />
                Update Profile
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {trendingBranches.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-orange-600" />
              <span>Trending Branches</span>
            </CardTitle>
            <CardDescription>
              Most popular engineering branches based on industry demand
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {trendingBranches.map((branch, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="px-3 py-2 text-sm bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 border-orange-200 flex items-center"
                >
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {branch.name}
                  <span className="ml-1 text-xs">({Math.round(branch.avgBoomFlag * 100)}% growth)</span>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mb-8">
        <div className="flex items-center space-x-2 mb-6">
          <BookOpen className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Your College Recommendations</h2>
        </div>

        {recommendations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.slice(0, 9).map((rec, index) => (
              <CollegeCard
                key={`${rec.college._id}-${index}`}
                college={rec.college}
                eligibilityScore={rec.eligibilityScore}
                recommendedBranch={rec.branch.name}
                onWishlistToggle={() => handleWishlistToggle(rec.college._id)}
                isInWishlist={wishlistSet.has(rec.college._id)}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Recommendations Yet</h3>
              <p className="text-gray-600 mb-4">
                Complete your profile to get personalized college recommendations.
              </p>
              <Button onClick={() => setShowProfileForm(true)}>Complete Profile</Button>
            </CardContent>
          </Card>
        )}
      </div>

      {recommendations.length > 9 && (
        <div className="text-center">
          <Button variant="outline" onClick={() => router.push('/explore')}>
            View All Recommendations
          </Button>
        </div>
      )}
    </div>
  );
}
