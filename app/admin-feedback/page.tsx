"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Star, MessageSquare, TrendingUp, Filter, Download } from "lucide-react";

interface Feedback {
  _id: string;
  userId: string;
  username: string;
  rating: number;
  category: string;
  message: string;
  createdAt: string;
}

export default function AdminFeedbackPage() {
  const router = useRouter();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterRating, setFilterRating] = useState("all");

  useEffect(() => {
    // Auth handled by middleware
    fetchFeedbacks();
  }, [router]);

  const fetchFeedbacks = async () => {
    try {
      const response = await fetch("/api/feedback");

      if (response.ok) {
        const data = await response.json();
        setFeedbacks(data.feedbacks || []);
      }
    } catch (error) {
      console.error("Error fetching feedbacks:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: { [key: string]: string } = {
      ui: "🎨 User Interface",
      features: "✨ Features",
      predictions: "🔮 Predictions",
      recommendations: "🎯 Recommendations",
      performance: "⚡ Performance",
      other: "💬 Other",
    };
    return labels[category] || category;
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      ui: "from-blue-500 to-cyan-500",
      features: "from-purple-500 to-pink-500",
      predictions: "from-green-500 to-emerald-500",
      recommendations: "from-orange-500 to-red-500",
      performance: "from-yellow-500 to-amber-500",
      other: "from-indigo-500 to-purple-500",
    };
    return colors[category] || "from-gray-500 to-gray-600";
  };

  const filteredFeedbacks = feedbacks.filter((feedback) => {
    if (filterCategory !== "all" && feedback.category !== filterCategory) return false;
    if (filterRating !== "all" && feedback.rating !== parseInt(filterRating)) return false;
    return true;
  });

  const stats = {
    total: feedbacks.length,
    avgRating: feedbacks.length > 0
      ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1)
      : "0",
    excellent: feedbacks.filter((f) => f.rating === 5).length,
    needsImprovement: feedbacks.filter((f) => f.rating <= 2).length,
  };

  const categoryStats = feedbacks.reduce((acc, f) => {
    acc[f.category] = (acc[f.category] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading feedback...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl shadow-2xl p-8 md:p-12 overflow-hidden">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-pink-300 opacity-10 rounded-full blur-3xl"></div>

          <div className="relative z-10">
            <button
              onClick={() => router.push("/admin-dashboard")}
              className="mb-6 flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white rounded-2xl transition-all duration-300 hover:scale-110 shadow-xl font-semibold"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Admin Dashboard
            </button>

            <div className="text-center">
              <div className="inline-block mb-4">
                <span className="text-7xl drop-shadow-2xl">💬</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4 drop-shadow-lg">
                Student Feedback
              </h1>
              <p className="text-xl md:text-2xl text-white/95 max-w-3xl mx-auto">
                Monitor and analyze student feedback to improve CollegeFinder
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-xl p-6 border-2 border-blue-100 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-2">
              <span className="text-4xl">📊</span>
              <MessageSquare className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-sm text-gray-600 font-medium">Total Feedback</p>
            <p className="text-4xl font-extrabold text-blue-600">{stats.total}</p>
          </div>

          <div className="bg-gradient-to-br from-white to-yellow-50 rounded-2xl shadow-xl p-6 border-2 border-yellow-100 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-2">
              <span className="text-4xl">⭐</span>
              <Star className="w-8 h-8 text-yellow-600" />
            </div>
            <p className="text-sm text-gray-600 font-medium">Average Rating</p>
            <p className="text-4xl font-extrabold text-yellow-600">{stats.avgRating}</p>
          </div>

          <div className="bg-gradient-to-br from-white to-green-50 rounded-2xl shadow-xl p-6 border-2 border-green-100 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-2">
              <span className="text-4xl">🎉</span>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-sm text-gray-600 font-medium">Excellent (5★)</p>
            <p className="text-4xl font-extrabold text-green-600">{stats.excellent}</p>
          </div>

          <div className="bg-gradient-to-br from-white to-red-50 rounded-2xl shadow-xl p-6 border-2 border-red-100 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-2">
              <span className="text-4xl">⚠️</span>
              <Filter className="w-8 h-8 text-red-600" />
            </div>
            <p className="text-sm text-gray-600 font-medium">Needs Attention</p>
            <p className="text-4xl font-extrabold text-red-600">{stats.needsImprovement}</p>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span className="text-3xl">📈</span>
            Feedback by Category
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(categoryStats).map(([category, count]) => (
              <div
                key={category}
                className={`p-4 rounded-xl bg-gradient-to-r ${getCategoryColor(category)} text-white text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110`}
              >
                <p className="text-3xl font-extrabold">{count}</p>
                <p className="text-sm font-medium mt-1">{getCategoryLabel(category)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-indigo-600" />
              <span className="font-bold text-gray-800">Filters:</span>
            </div>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border-2 border-indigo-200 rounded-xl focus:border-indigo-500 focus:outline-none font-medium"
            >
              <option value="all">All Categories</option>
              <option value="ui">🎨 User Interface</option>
              <option value="features">✨ Features</option>
              <option value="predictions">🔮 Predictions</option>
              <option value="recommendations">🎯 Recommendations</option>
              <option value="performance">⚡ Performance</option>
              <option value="other">💬 Other</option>
            </select>

            <select
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value)}
              className="px-4 py-2 border-2 border-indigo-200 rounded-xl focus:border-indigo-500 focus:outline-none font-medium"
            >
              <option value="all">All Ratings</option>
              <option value="5">⭐⭐⭐⭐⭐ (5 Stars)</option>
              <option value="4">⭐⭐⭐⭐ (4 Stars)</option>
              <option value="3">⭐⭐⭐ (3 Stars)</option>
              <option value="2">⭐⭐ (2 Stars)</option>
              <option value="1">⭐ (1 Star)</option>
            </select>

            <div className="ml-auto">
              <span className="text-sm text-gray-600 font-medium">
                Showing {filteredFeedbacks.length} of {feedbacks.length} feedback
              </span>
            </div>
          </div>
        </div>

        {/* Feedback List */}
        <div className="space-y-4">
          {filteredFeedbacks.length > 0 ? (
            filteredFeedbacks.map((feedback, idx) => (
              <div
                key={feedback._id}
                className="bg-white rounded-2xl shadow-xl p-6 md:p-8 hover:shadow-2xl transition-all duration-300 border-l-4 border-indigo-500 animate-fadeIn"
                style={{animationDelay: `${idx * 0.05}s`}}
              >
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                      {feedback.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-lg text-gray-900">{feedback.username}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(feedback.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-6 h-6 ${
                            i < feedback.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span
                      className={`px-4 py-2 rounded-xl text-sm font-bold text-white shadow-md bg-gradient-to-r ${getCategoryColor(
                        feedback.category
                      )}`}
                    >
                      {getCategoryLabel(feedback.category)}
                    </span>
                  </div>
                </div>

                {feedback.message && (
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border-l-4 border-indigo-500">
                    <p className="text-gray-800 leading-relaxed">{feedback.message}</p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">No Feedback Found</h3>
              <p className="text-gray-600">Try adjusting your filters or check back later</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
