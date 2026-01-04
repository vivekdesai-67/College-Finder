'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import CollegeCard from '@/components/CollegeCard';
import { TrendingUp, Target, BookOpen, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { Checkbox } from "@/components/ui/checkbox";

export default function DashboardPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn, user } = useUser();
  const [profile, setProfile] = useState<any>(null);
  const [colleges, setColleges] = useState<any[]>([]);
  const [trendingBranches, setTrendingBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [wishlistSet, setWishlistSet] = useState<Set<string>>(new Set());
  const [profileForm, setProfileForm] = useState({
    rank: '',
    category: '',
    preferredBranch: [] as string[],
  });

  const fetchColleges = async () => {
    try {
      // Fetch colleges directly without boom calculation
      const res = await fetch('/api/colleges');
      if (res.ok) {
        const data = await res.json();
        setColleges(data || []);
      }
    } catch (err) {
      console.error('Colleges fetch error:', err);
    }
  };

  const fetchTrendingBranches = async () => {
    try {
      const res = await fetch('/api/recommendations');
      if (res.ok) {
        const data = await res.json();
        setTrendingBranches(data.trendingBranches || []);
      }
    } catch (err) {
      console.error('Trending branches fetch error:', err);
    }
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/student/profile');
      
      if (res.status === 404) {
        // Student profile doesn't exist yet - show dashboard with setup button
        setProfile(null);
        setShowProfileForm(false); // Don't show form immediately
        fetchColleges(); // Still fetch colleges to show
        return;
      }

      if (!res.ok) throw new Error('Failed to fetch profile');

      const data = await res.json();
      setProfile(data);

      if (data.wishlist && Array.isArray(data.wishlist)) {
        setWishlistSet(new Set(data.wishlist.map((c: any) => c._id || c.id)));
      }

      const isComplete = !!(data.rank && data.category && data.preferredBranch);
      setShowProfileForm(false); // Always show dashboard first

      if (isComplete) {
        fetchTrendingBranches();
      } else {
        // Profile exists but incomplete - populate form data for when user clicks setup
        setProfileForm({
          rank: data.rank?.toString() || '',
          category: data.category || '',
          preferredBranch:
            typeof data.preferredBranch === 'string'
              ? [data.preferredBranch]
              : data.preferredBranch || [],
        });
      }

      // Always fetch colleges
      fetchColleges();
    } catch (err) {
      console.error('Profile fetch error:', err);
      // Don't show error toast for 404 - it's expected for new users
      setProfile(null);
      setShowProfileForm(false); // Show dashboard first
      fetchColleges();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
      return;
    }

    if (isSignedIn) {
      fetchProfile();
    }
  }, [isLoaded, isSignedIn, router]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch('/api/student/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...profileForm,
          assignRole: true // Request role assignment
        }),
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
        toast.success('Profile updated successfully! Welcome to your dashboard!');
        fetchTrendingBranches();
        // Reload the page to refresh Clerk session with new role
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        toast.error('Profile still incomplete!');
      }

      // Always fetch colleges
      fetchColleges();
    } catch (err) {
      console.error(err);
      toast.error('Error updating profile');
    }
  };

  const handleWishlistToggle = async (collegeId: string) => {
    setWishlistSet((prev) => {
      const set = new Set(prev);
      set.has(collegeId) ? set.delete(collegeId) : set.add(collegeId);
      return set;
    });

    try {
      const res = await fetch('/api/student/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collegeId }),
      });
      if (res.ok) toast.success('Wishlist updated');
    } catch {
      toast.error('Failed to update wishlist');
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
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
  }

  // DASHBOARD VIEW WITH ENGINEERING EXPLORER
  return (
    <div className="container mx-auto px-4 py-8 space-y-10">
      {/* Welcome Section */}
      <div className="relative bg-gradient-to-r from-blue-50 via-indigo-100 to-purple-50 p-6 md:p-10 rounded-2xl shadow-xl overflow-hidden">
        {/* Decorative gradient circles */}
        <div className="absolute top-0 left-0 w-40 h-40 bg-blue-400 opacity-20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-52 h-52 bg-purple-400 opacity-20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-700 bg-clip-text text-transparent mb-4 animate-fadeIn">
            Welcome back, <span className="text-pink-600">{user?.firstName || user?.username || 'Student'}</span>! 🎓
          </h1>
          <p className="text-gray-700 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-6">
            {profile ? (
              <>Here are your <span className="font-semibold text-indigo-600">personalized college recommendations </span>
              and trending engineering branches designed to match your goals and CET rank.</>
            ) : (
              <>Welcome to your <span className="font-semibold text-indigo-600">College Finder dashboard</span>! 
              Explore colleges and engineering branches, then setup your profile to get personalized recommendations.</>
            )}
          </p>
          
          <div className="mt-8 flex flex-col md:flex-row justify-center gap-6">
            <button 
              onClick={() => router.push('/recommendations')}
              className="px-6 py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-indigo-700 hover:to-blue-600 shadow-lg transform hover:scale-105 transition"
            >
              🎯 View Top Colleges
            </button>
            <button 
              onClick={() => router.push('/predictions')}
              className="px-6 py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-green-500 to-emerald-600 hover:from-emerald-600 hover:to-green-500 shadow-lg transform hover:scale-105 transition"
            >
              🔮 View 2026 Predictions
            </button>
            {profile ? (
              <button 
                onClick={() => setShowProfileForm(true)}
                className="px-6 py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-orange-500 to-red-600 hover:from-red-600 hover:to-orange-500 shadow-lg transform hover:scale-105 transition"
              >
                ⚙️ Edit Profile
              </button>
            ) : (
              <button 
                onClick={() => setShowProfileForm(true)}
                className="px-6 py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-purple-500 to-pink-600 hover:from-pink-600 hover:to-purple-500 shadow-lg transform hover:scale-105 transition animate-pulse"
              >
                🚀 Setup Your Profile
              </button>
            )}
            <button className="px-6 py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-pink-500 to-purple-600 hover:from-purple-600 hover:to-pink-500 shadow-lg transform hover:scale-105 transition">
              🌱 Explore Engineering Branches
            </button>
          </div>
        </div>
      </div>

      {/* Engineering Exploration Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 rounded-3xl p-10 shadow-2xl overflow-hidden">
        {/* Decorative background shapes */}
        <div className="absolute -top-10 -left-10 w-64 h-64 bg-blue-200 opacity-30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-300 opacity-20 rounded-full blur-3xl"></div>

        {/* Section Header */}
        <div className="relative z-10 text-center space-y-4">
          <h2 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-700 animate-fadeIn">
            🌟 Explore Engineering in Depth
          </h2>
          <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Discover how each branch of engineering builds our world — from AI-driven technologies to sustainable cities.
            <br />Find which path resonates with <span className="font-semibold text-indigo-700">your curiosity and dreams</span>.
          </p>
        </div>

        {/* Overview Section */}
        <div className="relative z-10 mt-10 bg-white/80 backdrop-blur-md rounded-2xl p-8 shadow-inner border border-indigo-100">
          <h3 className="text-3xl font-semibold text-indigo-700 mb-3">🔍 What is Engineering?</h3>
          <p className="text-gray-700 leading-relaxed">
            Engineering is the <span className="font-semibold text-indigo-600">bridge between imagination and reality</span>.
            It combines science, mathematics, and innovation to design solutions that power progress — from self-driving cars to
            renewable energy, from skyscrapers to smart devices.
            <br /><br />
            Choosing an engineering branch means choosing how you want to change the world — whether through
            <span className="text-blue-600 font-medium"> code, machines, structures, circuits, or intelligence.</span>
          </p>
        </div>

        {/* Branch Grid */}
        <div className="relative z-10 mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              name: "💻 Computer Science & Engineering",
              color: "from-blue-500 to-indigo-600",
              desc: "Software • Algorithms • Data • AI",
              details: "CSE builds the digital world. You'll master coding, data structures, AI, and cloud technologies. Careers include Software Developer, Data Scientist, Cybersecurity Analyst, or AI Engineer.",
              future: "With the rise of AI, Blockchain, and Cloud Computing, CSE remains the most in-demand branch globally."
            },
            {
              name: "⚙️ Mechanical Engineering",
              color: "from-yellow-400 to-orange-500",
              desc: "Machines • Design • Robotics • Thermal Systems",
              details: "Mechanical engineers design, manufacture, and optimize machines. It's a blend of physics, design, and innovation.",
              future: "Emerging fields include Electric Vehicles, Industrial Automation, Robotics, and Aerospace Engineering."
            },
            {
              name: "🏗️ Civil Engineering",
              color: "from-teal-500 to-cyan-600",
              desc: "Structures • Smart Cities • Sustainability",
              details: "Civil engineers shape our surroundings — bridges, highways, skyscrapers, and water systems. They ensure safety and sustainability.",
              future: "Growing demand in Smart Cities, Green Construction, and Infrastructure Development worldwide."
            },
            {
              name: "⚡ Electrical Engineering",
              color: "from-red-500 to-rose-600",
              desc: "Power • Control Systems • Renewable Energy",
              details: "EE powers the modern world — from smart grids to EV charging networks. You'll work on circuits, energy systems, and automation.",
              future: "Huge growth in Smart Energy, IoT Devices, and Electric Mobility ecosystems."
            },
            {
              name: "📡 Electronics & Communication Engineering",
              color: "from-pink-500 to-purple-600",
              desc: "Communication • Circuits • Embedded Systems",
              details: "ECE merges hardware and software to make smart devices communicate. Learn about microprocessors, antennas, and VLSI design.",
              future: "Key to IoT, 5G, Wearables, and Satellite Communication technologies."
            },
            {
              name: "🤖 Artificial Intelligence & Machine Learning",
              color: "from-indigo-500 to-violet-600",
              desc: "Neural Networks • Smart Systems • Data Science",
              details: "AI/ML engineers teach machines to think, predict, and decide. Learn Python, Deep Learning, NLP, and Generative AI models.",
              future: "AI powers everything — healthcare, finance, automation, and even education. One of the fastest-growing tech domains."
            },
            {
              name: "🧪 Chemical Engineering",
              color: "from-green-400 to-lime-500",
              desc: "Energy • Pharma • Materials • Process Design",
              details: "Focuses on converting raw materials into valuable products — fuels, medicines, polymers, and food.",
              future: "High demand in Renewable Fuels, Nanotech, and Green Manufacturing industries."
            },
            {
              name: "🌍 Environmental Engineering",
              color: "from-emerald-400 to-teal-500",
              desc: "Sustainability • Waste Management • Climate Tech",
              details: "Protecting the planet through sustainable design and technology. Learn water purification, pollution control, and renewable systems.",
              future: "Crucial in combating global warming and building a cleaner, eco-friendly future."
            },
            {
              name: "🛰️ Aerospace Engineering",
              color: "from-blue-400 to-sky-600",
              desc: "Aerodynamics • Flight Mechanics • Space Systems",
              details: "Designs aircraft, drones, and spacecraft — combining mechanics, electronics, and physics.",
              future: "Growing opportunities in Drone Tech, Defense, and Commercial Space Exploration (ISRO, SpaceX, etc.)."
            },
          ].map((branch, i) => (
            <div
              key={i}
              className={`p-6 rounded-2xl shadow-lg bg-gradient-to-r ${branch.color} text-white transform hover:scale-105 transition-all duration-300 hover:shadow-2xl`}
            >
              <h3 className="text-xl font-bold mb-2">{branch.name}</h3>
              <p className="text-sm opacity-90 mb-2 italic">{branch.desc}</p>
              <p className="text-sm leading-snug mb-2">{branch.details}</p>
              <p className="text-xs mt-1 opacity-80 font-semibold">🌟 Future Scope: {branch.future}</p>
            </div>
          ))}
        </div>

        {/* Future Tech Section */}
        <div className="relative z-10 mt-16 text-center space-y-6">
          <h3 className="text-3xl font-bold text-indigo-700">🚀 Emerging Technologies Shaping Engineering</h3>
          <p className="text-gray-700 max-w-2xl mx-auto">
            The world of engineering is evolving faster than ever — here are some exciting domains that are redefining the future:
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              "Artificial Intelligence",
              "Electric Vehicles",
              "Internet of Things (IoT)",
              "5G & Communication Tech",
              "Renewable Energy",
              "Cybersecurity",
              "Robotics & Automation",
              "Cloud Computing",
              "Augmented & Virtual Reality",
              "Space Exploration",
              "Quantum Computing",
            ].map((trend, i) => (
              <span
                key={i}
                className="px-4 py-2 rounded-full text-sm bg-gradient-to-r from-indigo-100 to-blue-100 text-indigo-700 font-medium shadow hover:shadow-md hover:scale-105 transition"
              >
                {trend}
              </span>
            ))}
          </div>
        </div>
      </section>

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
            <CardDescription>Most popular engineering branches based on demand</CardDescription>
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

      {/* Colleges List */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">All Colleges</h2>
          </div>
          <Button 
            variant="outline" 
            onClick={() => router.push('/recommendations')}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            Based on Your Profile
          </Button>
        </div>

        {colleges.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
            {colleges.slice(0, 9).map((college) => (
              <div key={college._id} className="flex flex-col gap-3">
                {/* College Card */}
                <div className="flex-1">
                  <CollegeCard
                    college={{
                      ...college,
                      branchesOffered: [] // Don't show branches in the card itself
                    }}
                    onWishlistToggle={() => handleWishlistToggle(college._id)}
                    isInWishlist={wishlistSet.has(college._id)}
                  />
                </div>
                
                {/* Show Branches Button - placed outside the card like in explore page */}
                <Button
                  onClick={() => router.push(`/college/${college._id}`)}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all hover:from-purple-600 hover:to-pink-700"
                  size="sm"
                >
                  🔽 Show Branches ({college.branchesOffered?.length || 0})
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <Card className="shadow-lg rounded-xl text-center py-12">
            <CardContent>
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Colleges Found</h3>
              <p className="text-gray-600 mb-4">Check back later for college listings.</p>
              <Button onClick={() => fetchColleges()}>Refresh</Button>
            </CardContent>
          </Card>
        )}
      </div>

      {colleges.length > 9 && (
        <div className="text-center">
          <Button variant="outline" onClick={() => router.push('/explore')}>
            View All Colleges
          </Button>
        </div>
      )}
    </div>
  );
}