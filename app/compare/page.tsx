"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Plus, TrendingUp, DollarSign, Award, MapPin } from "lucide-react";

interface College {
  _id: string;
  name: string;
  location: string;
  type: string;
  fees: number;
  infraRating: number;
  branchesOffered: Array<{
    name: string;
    cutoff: { [category: string]: number };
    placementRate?: number;
    avgSalary?: number;
    maxSalary?: number;
  }>;
  accreditation?: string;
  established?: number;
  image?: string;
}

export default function ComparePage() {
  const router = useRouter();
  const [colleges, setColleges] = useState<College[]>([]);
  const [selectedColleges, setSelectedColleges] = useState<College[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [showSearch, setShowSearch] = useState(true);

  useEffect(() => {
    // Auth handled by middleware
    fetchColleges();
  }, [router]);

  const fetchColleges = async () => {
    try {
      const response = await fetch("/api/colleges");
      if (response.ok) {
        const data = await response.json();
        setColleges(data);
      }
    } catch (error) {
      console.error("Error fetching colleges:", error);
    } finally {
      setLoading(false);
    }
  };

  const addCollege = (college: College) => {
    if (selectedColleges.length < 3 && !selectedColleges.find(c => c._id === college._id)) {
      setSelectedColleges([...selectedColleges, college]);
      setSearchQuery("");
    }
  };

  const removeCollege = (collegeId: string) => {
    setSelectedColleges(selectedColleges.filter(c => c._id !== collegeId));
  };

  const filteredColleges = colleges.filter(college =>
    college.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    college.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getAveragePlacement = (college: College) => {
    const rates = college.branchesOffered.map(b => b.placementRate || 0);
    return rates.length > 0 ? (rates.reduce((sum, r) => sum + r, 0) / rates.length * 100).toFixed(0) : "N/A";
  };

  const getAverageSalary = (college: College) => {
    const salaries = college.branchesOffered.map(b => b.avgSalary || 0);
    return salaries.length > 0 ? (salaries.reduce((sum, s) => sum + s, 0) / salaries.length / 100000).toFixed(1) : "N/A";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading colleges...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 animate-gradient-shift">
      <style jsx>{`
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(99, 102, 241, 0.5); }
          50% { box-shadow: 0 0 40px rgba(139, 92, 246, 0.8); }
        }
        .animate-gradient-shift {
          background-size: 200% 200%;
          animation: gradient-shift 15s ease infinite;
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
      `}</style>
      
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header with Enhanced Design */}
        <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl shadow-2xl p-8 md:p-12 overflow-hidden animate-pulse-glow">
          {/* Animated Background Elements */}
          <div className="absolute top-0 left-0 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute top-1/2 right-0 w-64 h-64 bg-yellow-300 opacity-10 rounded-full blur-3xl animate-float" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-pink-300 opacity-10 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
          
          <div className="relative z-10">
            <button
              onClick={() => router.push('/dashboard')}
              className="mb-6 flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white rounded-2xl transition-all duration-300 hover:scale-110 hover:rotate-1 shadow-xl font-semibold group"
            >
              <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </button>

            <div className="text-center">
              <div className="inline-block mb-4 animate-bounce">
                <span className="text-7xl drop-shadow-2xl">⚖️</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4 drop-shadow-lg animate-fadeIn">
                College Comparison
              </h1>
              <p className="text-xl md:text-2xl text-white/95 max-w-3xl mx-auto leading-relaxed drop-shadow-md">
                Compare up to 3 colleges side-by-side to make the <span className="font-bold text-yellow-300">best decision</span>
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm text-white font-medium animate-pulse">
                  📊 Side-by-Side Analysis
                </span>
                <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm text-white font-medium animate-pulse" style={{animationDelay: '0.5s'}}>
                  ⭐ Smart Comparison
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Search Section */}
        {showSearch && selectedColleges.length < 3 && (
          <div className="bg-gradient-to-br from-white to-indigo-50 rounded-3xl shadow-2xl p-8 border-2 border-indigo-100 hover:shadow-indigo-200 transition-all duration-500 hover:scale-[1.02]">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg animate-pulse">
                <Search className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Search Colleges
              </h2>
            </div>
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
              <input
                type="text"
                placeholder="🔍 Search by college name or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="relative w-full px-6 py-4 border-2 border-indigo-200 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200 focus:outline-none text-lg transition-all duration-300 bg-white shadow-inner"
              />
              {searchQuery && (
                <div className="absolute z-10 w-full mt-3 bg-white rounded-2xl shadow-2xl max-h-96 overflow-y-auto border-2 border-indigo-100 animate-fadeIn">
                  {filteredColleges.slice(0, 10).map((college, idx) => (
                    <button
                      key={college._id}
                      onClick={() => addCollege(college)}
                      disabled={selectedColleges.find(c => c._id === college._id) !== undefined}
                      className={`w-full px-6 py-4 text-left transition-all duration-300 border-b border-gray-100 last:border-0 ${
                        selectedColleges.find(c => c._id === college._id)
                          ? 'bg-gray-100 cursor-not-allowed opacity-50'
                          : 'hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:scale-[1.02] hover:shadow-md'
                      }`}
                      style={{animationDelay: `${idx * 0.05}s`}}
                    >
                      <p className="font-bold text-gray-900 flex items-center gap-2">
                        <span className="text-2xl">🎓</span>
                        {college.name}
                      </p>
                      <p className="text-sm text-gray-600 ml-8">📍 {college.location} • 🏢 {college.type}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-700">
                Selected: <span className="text-indigo-600 text-lg">{selectedColleges.length}</span>/3 colleges
              </p>
              <div className="flex gap-2">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      i < selectedColleges.length
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 scale-110 shadow-lg'
                        : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Selected Colleges Pills */}
        {selectedColleges.length > 0 && (
          <div className="flex flex-wrap gap-4 animate-fadeIn">
            {selectedColleges.map((college, idx) => (
              <div
                key={college._id}
                className="group flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-110 animate-slideIn"
                style={{animationDelay: `${idx * 0.1}s`}}
              >
                <span className="text-2xl">🎓</span>
                <span className="max-w-xs truncate">{college.name}</span>
                <button
                  onClick={() => removeCollege(college._id)}
                  className="ml-2 hover:bg-white/20 rounded-full p-1.5 transition-all duration-300 hover:rotate-90 hover:scale-125"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Enhanced Comparison Table */}
        {selectedColleges.length > 0 ? (
          <div className="bg-gradient-to-br from-white to-purple-50 rounded-3xl shadow-2xl overflow-hidden border-2 border-purple-100 animate-fadeIn">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white">
                  <tr>
                    <th className="px-8 py-6 text-left font-extrabold text-lg sticky left-0 bg-gradient-to-r from-indigo-600 to-purple-600">
                      <span className="flex items-center gap-2">
                        <span className="text-2xl">📋</span>
                        Feature
                      </span>
                    </th>
                    {selectedColleges.map((college, idx) => (
                      <th key={college._id} className="px-8 py-6 text-left font-extrabold text-lg animate-slideIn" style={{animationDelay: `${idx * 0.1}s`}}>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">🎓</span>
                          <span className="line-clamp-2">{college.name}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-100">
                  {/* Location */}
                  <tr className="hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-300 group">
                    <td className="px-8 py-5 font-bold text-gray-800 sticky left-0 bg-white group-hover:bg-gradient-to-r group-hover:from-indigo-50 group-hover:to-purple-50">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-md group-hover:scale-110 transition-transform">
                          <MapPin className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-lg">Location</span>
                      </div>
                    </td>
                    {selectedColleges.map((college) => (
                      <td key={college._id} className="px-8 py-5 font-semibold text-gray-700">
                        <span className="flex items-center gap-2">
                          <span className="text-xl">📍</span>
                          {college.location}
                        </span>
                      </td>
                    ))}
                  </tr>

                  {/* Type */}
                  <tr className="hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-300 group">
                    <td className="px-8 py-5 font-bold text-gray-800 sticky left-0 bg-white group-hover:bg-gradient-to-r group-hover:from-indigo-50 group-hover:to-purple-50">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-md group-hover:scale-110 transition-transform">
                          <span className="text-xl">🏢</span>
                        </div>
                        <span className="text-lg">Type</span>
                      </div>
                    </td>
                    {selectedColleges.map((college) => (
                      <td key={college._id} className="px-8 py-5">
                        <span className={`px-4 py-2 rounded-xl text-sm font-bold shadow-md transition-all duration-300 hover:scale-110 inline-block ${
                          college.type === 'Government' ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' :
                          college.type === 'Autonomous' ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white' :
                          'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                        }`}>
                          {college.type}
                        </span>
                      </td>
                    ))}
                  </tr>

                  {/* Fees */}
                  <tr className="hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-300 group">
                    <td className="px-8 py-5 font-bold text-gray-800 sticky left-0 bg-white group-hover:bg-gradient-to-r group-hover:from-indigo-50 group-hover:to-purple-50">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl shadow-md group-hover:scale-110 transition-transform">
                          <DollarSign className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-lg">Annual Fees</span>
                      </div>
                    </td>
                    {selectedColleges.map((college) => (
                      <td key={college._id} className="px-8 py-5">
                        <span className="text-2xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                          ₹{college.fees.toLocaleString()}
                        </span>
                      </td>
                    ))}
                  </tr>

                  {/* Infrastructure */}
                  <tr className="hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-300 group">
                    <td className="px-8 py-5 font-bold text-gray-800 sticky left-0 bg-white group-hover:bg-gradient-to-r group-hover:from-indigo-50 group-hover:to-purple-50">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl shadow-md group-hover:scale-110 transition-transform">
                          <Award className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-lg">Infrastructure</span>
                      </div>
                    </td>
                    {selectedColleges.map((college) => (
                      <td key={college._id} className="px-8 py-5">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <span 
                              key={i} 
                              className={`text-3xl transition-all duration-300 hover:scale-125 ${
                                i < (college.infraRating || 0) ? "text-yellow-400 drop-shadow-lg" : "text-gray-300"
                              }`}
                            >
                              ⭐
                            </span>
                          ))}
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Placement Rate */}
                  <tr className="hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-300 group">
                    <td className="px-8 py-5 font-bold text-gray-800 sticky left-0 bg-white group-hover:bg-gradient-to-r group-hover:from-indigo-50 group-hover:to-purple-50">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shadow-md group-hover:scale-110 transition-transform">
                          <TrendingUp className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-lg">Placement Rate</span>
                      </div>
                    </td>
                    {selectedColleges.map((college) => (
                      <td key={college._id} className="px-8 py-5">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl">
                          <span className="text-2xl font-extrabold text-green-700">{getAveragePlacement(college)}%</span>
                          <span className="text-green-600">📈</span>
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Salary */}
                  <tr className="hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-300 group">
                    <td className="px-8 py-5 font-bold text-gray-800 sticky left-0 bg-white group-hover:bg-gradient-to-r group-hover:from-indigo-50 group-hover:to-purple-50">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl shadow-md group-hover:scale-110 transition-transform">
                          <span className="text-xl">💰</span>
                        </div>
                        <span className="text-lg">Avg Salary</span>
                      </div>
                    </td>
                    {selectedColleges.map((college) => (
                      <td key={college._id} className="px-8 py-5">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl">
                          <span className="text-2xl font-extrabold text-purple-700">₹{getAverageSalary(college)} LPA</span>
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Branches */}
                  <tr className="hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-300 group">
                    <td className="px-8 py-5 font-bold text-gray-800 sticky left-0 bg-white group-hover:bg-gradient-to-r group-hover:from-indigo-50 group-hover:to-purple-50">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl shadow-md group-hover:scale-110 transition-transform">
                          <span className="text-xl">🎯</span>
                        </div>
                        <span className="text-lg">Branches</span>
                      </div>
                    </td>
                    {selectedColleges.map((college) => (
                      <td key={college._id} className="px-8 py-5">
                        <span className="px-5 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl text-sm font-bold shadow-lg hover:scale-110 transition-transform inline-block">
                          {college.branchesOffered.length} Branches
                        </span>
                      </td>
                    ))}
                  </tr>

                  {/* Accreditation */}
                  <tr className="hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-300 group">
                    <td className="px-8 py-5 font-bold text-gray-800 sticky left-0 bg-white group-hover:bg-gradient-to-r group-hover:from-indigo-50 group-hover:to-purple-50">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl shadow-md group-hover:scale-110 transition-transform">
                          <span className="text-xl">🏆</span>
                        </div>
                        <span className="text-lg">Accreditation</span>
                      </div>
                    </td>
                    {selectedColleges.map((college) => (
                      <td key={college._id} className="px-8 py-5 font-semibold text-gray-700">
                        {college.accreditation || "N/A"}
                      </td>
                    ))}
                  </tr>

                  {/* Established */}
                  <tr className="hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-300 group">
                    <td className="px-8 py-5 font-bold text-gray-800 sticky left-0 bg-white group-hover:bg-gradient-to-r group-hover:from-indigo-50 group-hover:to-purple-50">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl shadow-md group-hover:scale-110 transition-transform">
                          <span className="text-xl">📅</span>
                        </div>
                        <span className="text-lg">Established</span>
                      </div>
                    </td>
                    {selectedColleges.map((college) => (
                      <td key={college._id} className="px-8 py-5 font-semibold text-gray-700">
                        {college.established || "N/A"}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-white to-purple-50 rounded-3xl shadow-2xl p-16 text-center border-2 border-dashed border-purple-300 animate-fadeIn">
            <div className="text-8xl mb-6 animate-bounce">🔍</div>
            <h3 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
              No Colleges Selected
            </h3>
            <p className="text-xl text-gray-600 mb-8">Search and select colleges above to start comparing</p>
            <div className="flex justify-center gap-4">
              <div className="px-6 py-3 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-xl text-indigo-700 font-semibold">
                Step 1: Search 🔍
              </div>
              <div className="px-6 py-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl text-purple-700 font-semibold">
                Step 2: Select 🎓
              </div>
              <div className="px-6 py-3 bg-gradient-to-r from-pink-100 to-rose-100 rounded-xl text-pink-700 font-semibold">
                Step 3: Compare ⚖️
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
