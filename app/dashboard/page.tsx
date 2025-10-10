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
//     'Artificial Intelligence and Machine Learning',
//     'Information Technology',
//     'Electronics and Communication Engineering',
//     'Mechanical Engineering',
//     'Civil Engineering',
//     'Electrical Engineering',
//     'Electronics and Telecommunication Engineering'
//   ];

//   // const fetchRecommendations = async (token: string) => {
//   //   try {
//   //     const response = await fetch('/api/recommendations', {
//   //       headers: { Authorization: `Bearer ${token}` }
//   //     });
//   //     if (response.ok) {
//   //       const data = await response.json();
//   //       setRecommendations(data.recommendations || []);
//   //       setTrendingBranches(data.trendingBranches || []);
//   //     }
//   //   } catch (error) {
//   //     console.error('Recommendations fetch error:', error);
//   //   }
//   // };
//   const fetchRecommendations = async (token: string) => {
//     try {
//       const response = await fetch('/api/recommendations', {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       if (response.ok) {
//         const data = await response.json();

//         // ✅ Deduplicate recommendations by college._id
//         const uniqueRecs = Array.from(
//           new Map(
//             (data.recommendations || []).map((rec: any) => [rec.college._id, rec])
//           ).values()
//         );

//         setRecommendations(uniqueRecs);
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

//       if (!response.ok) throw new Error('Failed to fetch profile');

//       const profileData = await response.json();
//       setProfile(profileData);

//       // Populate wishlistSet
//       if (profileData.wishlist && Array.isArray(profileData.wishlist)) {
//         setWishlistSet(new Set(profileData.wishlist.map((c: any) => c._id || c.id)));
//       }

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
//         headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
//         body: JSON.stringify(profileForm)
//       });

//       if (!response.ok) {
//         const error = await response.json();
//         toast.error(error.error || 'Failed to update profile');
//         return;
//       }

//       const updatedProfile = await response.json();
//       setProfile(updatedProfile);

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

//     // Optimistic UI update
//     setWishlistSet(prev => {
//       const newSet = new Set(prev);
//       if (newSet.has(collegeId)) newSet.delete(collegeId);
//       else newSet.add(collegeId);
//       return newSet;
//     });

//     try {
//       const response = await fetch('/api/student/wishlist', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
//         body: JSON.stringify({ collegeId })
//       });

//       if (response.ok) {
//         const data = await response.json();
//         toast.success(data.message || 'Wishlist updated');
//       }
//     } catch (error) {
//       toast.error('Failed to update wishlist');
//       // Revert optimistic update
//       setWishlistSet(prev => {
//         const newSet = new Set(prev);
//         if (newSet.has(collegeId)) newSet.delete(collegeId);
//         else newSet.add(collegeId);
//         return newSet;
//       });
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
//                     <SelectItem value="1G">1G</SelectItem>
//                     <SelectItem value="1K">1K</SelectItem>
//                     <SelectItem value="1R">1R</SelectItem>
//                     <SelectItem value="2AG">2AG</SelectItem>
//                     <SelectItem value="2AK">2AK</SelectItem>
//                     <SelectItem value="2AR">2AR</SelectItem>
//                     <SelectItem value="2BG">2BG</SelectItem>
//                     <SelectItem value="2BK">2BK</SelectItem>
//                     <SelectItem value="2BR">2BR</SelectItem>
//                     <SelectItem value="3AG">3AG</SelectItem>
//                     <SelectItem value="3AK">3AK</SelectItem>
//                     <SelectItem value="3AR">3AR</SelectItem>
//                     <SelectItem value="3BG">3BG</SelectItem>
//                     <SelectItem value="3BK">3BK</SelectItem>
//                     <SelectItem value="3BR">3BR</SelectItem>
//                     <SelectItem value="GM">GM</SelectItem>
//                     <SelectItem value="GMK">GMK</SelectItem>
//                     <SelectItem value="GMP">GMP</SelectItem>
//                     <SelectItem value="GMR">GMR</SelectItem>
//                     <SelectItem value="NRI">NRI</SelectItem>
//                     <SelectItem value="OPN">OPN</SelectItem>
//                     <SelectItem value="OTH">OTH</SelectItem>
//                     <SelectItem value="SCG">SCG</SelectItem>
//                     <SelectItem value="SCK">SCK</SelectItem>
//                     <SelectItem value="SCR">SCR</SelectItem>
//                     <SelectItem value="STG">STG</SelectItem>
//                     <SelectItem value="STK">STK</SelectItem>
//                     <SelectItem value="STR">STR</SelectItem>
//                   </SelectContent>  </Select>
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="preferredBranch">Preferred Branch</Label>
//                 <Select
//                   value={profileForm.preferredBranch} // this should now be an array
//                   onValueChange={(value) => {
//                     // toggle selection for multi-select
//                     const current = profileForm.preferredBranch || [];
//                     if (current.includes(value)) {
//                       // remove if already selected
//                       setProfileForm({
//                         ...profileForm,
//                         preferredBranch: current.filter(v => v !== value)
//                       });
//                     } else {
//                       // add if not selected
//                       setProfileForm({
//                         ...profileForm,
//                         preferredBranch: [...current, value]
//                       });
//                     }
//                   }}
//                   multiple // enable multiple selection
//                 >
//                   <SelectTrigger>
//                     <SelectValue
//                       placeholder="Select your preferred branch"
//                       // optional: join selected values for display
//                       value={profileForm.preferredBranch?.join(', ')}
//                     />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {branches.map(branch => (
//                       <SelectItem key={branch} value={branch}>
//                         {branch}
//                       </SelectItem>
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

//   return (
//     <div className="container mx-auto px-4 py-8 space-y-8">
//       {/* Welcome Header */}
//       <div className="mb-8">
//         <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
//           Welcome back, <span className="text-blue-600">{user?.username}</span>!
//         </h1>
//         <p className="text-gray-600 text-lg">
//           Here are your personalized college recommendations based on your profile.
//         </p>
//       </div>

//       {/* Profile Card */}
//       {profile && (
//         <Card className="mb-8 shadow-lg hover:shadow-2xl transition rounded-xl">
//           <CardHeader>
//             <CardTitle className="flex items-center space-x-2 text-blue-700">
//               <Target className="h-5 w-5" />
//               <span>Your Profile</span>
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//               <div className="text-center p-4 bg-gradient-to-r from-blue-100 to-blue-200 rounded-lg shadow-inner">
//                 <div className="text-2xl font-bold text-blue-600">{profile.rank}</div>
//                 <div className="text-sm text-gray-600">CET Rank</div>
//               </div>
//               <div className="text-center p-4 bg-gradient-to-r from-green-100 to-green-200 rounded-lg shadow-inner">
//                 <div className="text-lg font-semibold text-green-700 uppercase">{profile.category}</div>
//                 <div className="text-sm text-gray-600">Category</div>
//               </div>
//               <div className="text-center p-4 bg-gradient-to-r from-purple-100 to-purple-200 rounded-lg shadow-inner">
//                 <div className="text-sm font-medium text-purple-700">{profile.preferredBranch}</div>
//                 <div className="text-sm text-gray-600">Preferred Branch</div>
//               </div>
//             </div>
//             <div className="mt-4 text-center">
//               <Button
//                 variant="outline"
//                 size="sm"
//                 className="flex items-center justify-center gap-2"
//                 onClick={() => setShowProfileForm(true)}
//               >
//                 <Settings className="h-4 w-4" /> Update Profile
//               </Button>
//             </div>
//           </CardContent>
//         </Card>
//       )}

//       {/* Trending Branches */}
//       {trendingBranches.length > 0 && (
//         <Card className="mb-8 shadow-lg hover:shadow-2xl transition rounded-xl">
//           <CardHeader>
//             <CardTitle className="flex items-center space-x-2 text-orange-600">
//               <TrendingUp className="h-5 w-5" />
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
//                   variant="filled"
//                   className="flex items-center gap-1 px-3 py-2 text-sm bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 border border-orange-200 shadow-sm hover:shadow-md transition"
//                 >
//                   <TrendingUp className="h-3 w-3" />
//                   {branch.name}
//                   <span className="ml-1 text-xs font-semibold">
//                     ({Math.round(branch.avgBoomFlag * 100)}% growth)
//                   </span>
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
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {recommendations.slice(0, 9).map((rec, index) => (
//               <CollegeCard
//                 key={`${rec.college._id}-${index}`}
//                 college={rec.college}
//                 eligibilityScore={rec.eligibilityScore}
//                 recommendedBranch={rec.branch.name}
//                 onWishlistToggle={() => handleWishlistToggle(rec.college._id)}
//                 isInWishlist={wishlistSet.has(rec.college._id)}
//               />
//             ))}
//           </div>
//         ) : (
//           <Card className="shadow-lg rounded-xl">
//             <CardContent className="text-center py-12">
//               <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
//               <h3 className="text-lg font-semibold text-gray-900 mb-2">No Recommendations Yet</h3>
//               <p className="text-gray-600 mb-4">
//                 Complete your profile to get personalized college recommendations.
//               </p>
//               <Button variant="gradient" onClick={() => setShowProfileForm(true)}>
//                 Complete Profile
//               </Button>
//             </CardContent>
//           </Card>
//         )}
//       </div>

//       {recommendations.length > 9 && (
//         <div className="text-center">
//           <Button variant="outline" className="px-6 py-2" onClick={() => router.push('/explore')}>
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
import { Badge } from '@/components/ui/badge';
import CollegeCard from '@/components/CollegeCard';
import { TrendingUp, Target, BookOpen, Settings, Check, ChevronsUpDown } from 'lucide-react';
import { toast } from 'sonner';
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import {
  Command,
  CommandInput,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [trendingBranches, setTrendingBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [wishlistSet, setWishlistSet] = useState<Set<string>>(new Set());
  const router = useRouter();

  const [profileForm, setProfileForm] = useState({
    rank: '',
    category: '',
    preferredBranch: [] as string[],
  });

  // const branches = [
  //   'Computer Science Engineering',
  //   'Artificial Intelligence and Machine Learning',
  //   'Information Technology',
  //   'Electronics and Communication Engineering',
  //   'Mechanical Engineering',
  //   'Civil Engineering',
  //   'Electrical Engineering',
  //   'Electronics and Telecommunication Engineering',
  // ];
  const branches = [
    'Computer Science Engineering',
    'Artificial Intelligence and Machine Learning',
    'Information Technology',
    'Electronics and Communication Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Electrical Engineering',
    'Electronics and Telecommunication Engineering',
    'Biomedical Engineering',
    'Chemical Engineering',
    'Aerospace Engineering',
    'Industrial and Production Engineering',
    'Automobile Engineering',
    'Robotics and Automation',
    'Data Science',
    'Cyber Security',
    'Nanotechnology',
    'Environmental Engineering',
    'Artificial Intelligence and Data Analytics',
    'Instrumentation Engineering',
    'Biotechnology Engineering',
    'Petroleum Engineering',
    'Software Engineering',
    'Materials Science Engineering',
    'Mechatronics Engineering'
  ];

  const fetchRecommendations = async (token: string) => {
    try {
      const res = await fetch('/api/recommendations', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const uniqueRecs = Array.from(
          new Map(
            (data.recommendations || []).map((rec: any) => [rec.college._id, rec])
          ).values()
        );
        setRecommendations(uniqueRecs);
        setTrendingBranches(data.trendingBranches || []);
      }
    } catch (err) {
      console.error('Recommendations fetch error:', err);
    }
  };

  const fetchProfile = async (token: string) => {
    try {
      setLoading(true);
      const res = await fetch('/api/student/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch profile');
      const data = await res.json();
      setProfile(data);

      if (data.wishlist && Array.isArray(data.wishlist)) {
        setWishlistSet(new Set(data.wishlist.map((c: any) => c._id || c.id)));
      }

      const isComplete = !!(data.rank && data.category && data.preferredBranch);
      setShowProfileForm(!isComplete);

      if (!isComplete) {
        setProfileForm({
          rank: data.rank?.toString() || '',
          category: data.category || '',
          preferredBranch:
            typeof data.preferredBranch === 'string'
              ? [data.preferredBranch]
              : data.preferredBranch || [],
        });
      } else {
        fetchRecommendations(token);
      }
    } catch (err) {
      console.error('Profile fetch error:', err);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!token || !userData) return router.push('/login');

    const userObj = JSON.parse(userData);
    if (userObj.role !== 'student') return router.push('/admin');

    setUser(userObj);
    fetchProfile(token);
  }, []);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return;

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
      setProfile(updated);

      const isComplete = !!(updated.rank && updated.category && updated.preferredBranch);
      setShowProfileForm(!isComplete);

      if (isComplete) {
        toast.success('Profile updated successfully!');
        fetchRecommendations(token);
      } else toast.error('Profile still incomplete!');
    } catch (err) {
      console.error(err);
      toast.error('Error updating profile');
    }
  };

  const handleWishlistToggle = async (collegeId: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setWishlistSet((prev) => {
      const set = new Set(prev);
      set.has(collegeId) ? set.delete(collegeId) : set.add(collegeId);
      return set;
    });

    try {
      const res = await fetch('/api/student/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ collegeId }),
      });
      if (res.ok) toast.success('Wishlist updated');
    } catch {
      toast.error('Failed to update wishlist');
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );

  if (showProfileForm)
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-blue-600" />
              Complete Your Profile
            </CardTitle>
            <CardDescription>
              Provide your CET details to get personalized college recommendations
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

              {/* Multi-Select Branch */}
              {/* <div className="space-y-2">
                <Label>Preferred Branches</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                    >
                      {profileForm.preferredBranch.length > 0
                        ? profileForm.preferredBranch.join(', ')
                        : 'Select branches'}
                      <ChevronsUpDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search branch..." />
                      <CommandEmpty>No branch found.</CommandEmpty>
                      <CommandGroup>
                        {branches.map((branch) => {
                          const selected = profileForm.preferredBranch.includes(branch);
                          return (
                            <CommandItem
                              key={branch}
                              onSelect={() => {
                                const newSelection = selected
                                  ? profileForm.preferredBranch.filter((b) => b !== branch)
                                  : [...profileForm.preferredBranch, branch];
                                setProfileForm({
                                  ...profileForm,
                                  preferredBranch: newSelection,
                                });
                              }}
                            >
                              <Check
                                className={cn(
                                  'mr-2 h-4 w-4',
                                  selected ? 'opacity-100' : 'opacity-0'
                                )}
                              />
                              {branch}
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                <div className="flex flex-wrap gap-2 mt-2">
                  {profileForm.preferredBranch.map((branch) => (
                    <Badge key={branch} variant="secondary">
                      {branch}
                    </Badge>
                  ))}
                </div>
              </div> */}
              <div className="space-y-3">
                <Label>Preferred Branches</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    "Computer Science",
                    "Information Science",
                    "Electronics & Communication",
                    "Mechanical",
                    "Civil",
                    "AI & Data Science",
                    "Electrical & Electronics",
                  ].map((branch) => (
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
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {branch}
                      </label>
                    </div>
                  ))}
                </div>
              </div>


              <Button type="submit" className="w-full">
                Save Profile & Get Recommendations
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );

  // MAIN DASHBOARD VIEW
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          Welcome back, <span className="text-blue-600">{user?.username}</span>!
        </h1>
        <p className="text-gray-600 text-lg">
          Here are your personalized college recommendations based on your profile.
        </p>
      </div>

      {/* Profile Card */}
      {profile && (
        <Card className="shadow-lg rounded-xl hover:shadow-2xl transition">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <Target className="h-5 w-5" /> Your Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-100 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-700">{profile.rank}</div>
                <div className="text-sm text-gray-600">CET Rank</div>
              </div>
              <div className="p-4 bg-green-100 rounded-lg text-center">
                <div className="text-lg font-semibold text-green-700">{profile.category}</div>
                <div className="text-sm text-gray-600">Category</div>
              </div>
              <div className="p-4 bg-purple-100 rounded-lg text-center">
                <div className="text-sm font-medium text-purple-700">
                  {Array.isArray(profile.preferredBranch)
                    ? profile.preferredBranch.join(', ')
                    : profile.preferredBranch}
                </div>
                <div className="text-sm text-gray-600">Preferred Branch</div>
              </div>
            </div>
            <div className="mt-4 text-center">
              <Button variant="outline" onClick={() => setShowProfileForm(true)}>
                <Settings className="h-4 w-4 mr-1" /> Edit Profile
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trending Branches */}
      {trendingBranches.length > 0 && (
        <Card className="shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-600">
              <TrendingUp className="h-5 w-5" /> Trending Branches
            </CardTitle>
            <CardDescription>
              Most popular engineering branches based on demand
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {trendingBranches.map((b, i) => (
                <Badge key={i} className="px-3 py-1 text-sm bg-orange-100 text-orange-800">
                  <TrendingUp className="h-3 w-3 mr-1" /> {b.name} ({Math.round(b.avgBoomFlag * 100)}%)
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      <div>
        <div className="flex items-center gap-2 mb-6">
          <BookOpen className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Your College Recommendations</h2>
        </div>

        {recommendations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.slice(0, 9).map((rec, i) => (
              <CollegeCard
                key={`${rec.college._id}-${i}`}
                college={rec.college}
                eligibilityScore={rec.eligibilityScore}
                recommendedBranch={rec.branch.name}
                onWishlistToggle={() => handleWishlistToggle(rec.college._id)}
                isInWishlist={wishlistSet.has(rec.college._id)}
              />
            ))}
          </div>
        ) : (
          <Card className="shadow-lg rounded-xl text-center py-12">
            <CardContent>
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Recommendations Yet
              </h3>
              <p className="text-gray-600 mb-4">
                Complete your profile to get personalized recommendations.
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
