"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare, Star, Send, CheckCircle } from "lucide-react";

export default function FeedbackPage() {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Auth handled by middleware
    // User data will come from Clerk
  }, [router]);

  const categories = [
    { value: "ui", label: "🎨 User Interface", color: "from-blue-500 to-cyan-500" },
    { value: "features", label: "✨ Features", color: "from-purple-500 to-pink-500" },
    { value: "predictions", label: "🔮 Predictions", color: "from-green-500 to-emerald-500" },
    { value: "recommendations", label: "🎯 Recommendations", color: "from-orange-500 to-red-500" },
    { value: "performance", label: "⚡ Performance", color: "from-yellow-500 to-amber-500" },
    { value: "other", label: "💬 Other", color: "from-indigo-500 to-purple-500" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rating,
          category,
          message,
        }),
      });

      if (response.ok) {
        setSubmitted(true);
        setTimeout(() => {
          router.push("/dashboard");
        }, 3000);
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100 flex items-center justify-center">
        <style jsx>{`
          @keyframes success-bounce {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }
          @keyframes confetti {
            0% { transform: translateY(0) rotate(0deg); opacity: 1; }
            100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
          }
          .animate-success-bounce {
            animation: success-bounce 0.6s ease-in-out;
          }
        `}</style>
        <div className="bg-white rounded-3xl shadow-2xl p-16 text-center max-w-lg animate-success-bounce relative overflow-hidden">
          {/* Confetti Effect */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `-10px`,
                  backgroundColor: ['#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b'][Math.floor(Math.random() * 5)],
                  animation: `confetti ${2 + Math.random() * 2}s linear ${Math.random() * 0.5}s infinite`
                }}
              />
            ))}
          </div>
          
          <div className="relative z-10">
            <div className="w-28 h-28 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl animate-bounce">
              <CheckCircle className="w-16 h-16 text-white" strokeWidth={3} />
            </div>
            <h2 className="text-4xl font-extrabold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">
              Thank You! 🎉
            </h2>
            <p className="text-xl text-gray-700 mb-6 leading-relaxed">
              Your feedback has been submitted successfully. We appreciate your valuable input!
            </p>
            <div className="flex items-center justify-center gap-2 text-gray-500 animate-pulse">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
              <p className="ml-2">Redirecting to dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-100">
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 30px rgba(236, 72, 153, 0.5); }
          50% { box-shadow: 0 0 60px rgba(139, 92, 246, 0.8); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
      `}</style>
      
      <div className="container mx-auto px-4 py-8">
        {/* Enhanced Header */}
        <div className="relative bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 rounded-3xl shadow-2xl p-8 md:p-12 overflow-hidden mb-8 animate-pulse-glow">
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
                <span className="text-7xl drop-shadow-2xl">💬</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4 drop-shadow-lg">
                Share Your Feedback
              </h1>
              <p className="text-xl md:text-2xl text-white/95 max-w-3xl mx-auto leading-relaxed drop-shadow-md">
                Help us improve CollegeFinder by sharing your <span className="font-bold text-yellow-300">thoughts and suggestions</span>
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm text-white font-medium animate-pulse">
                  🎯 Your Voice Matters
                </span>
                <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm text-white font-medium animate-pulse" style={{animationDelay: '0.5s'}}>
                  ⚡ Quick & Easy
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Feedback Form */}
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="bg-gradient-to-br from-white to-purple-50 rounded-3xl shadow-2xl p-8 md:p-12 space-y-10 border-2 border-purple-100">
            {/* Enhanced Rating Section */}
            <div className="text-center">
              <label className="block text-3xl font-extrabold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-6">
                How would you rate your experience?
              </label>
              <div className="flex justify-center gap-4 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="transition-all duration-300 hover:scale-125 hover:-translate-y-2 focus:outline-none"
                  >
                    <Star
                      className={`w-16 h-16 transition-all duration-300 ${
                        star <= (hoverRating || rating)
                          ? "fill-yellow-400 text-yellow-400 drop-shadow-lg animate-pulse"
                          : "text-gray-300 hover:text-gray-400"
                      }`}
                      strokeWidth={2}
                    />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <div className="inline-block px-6 py-3 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-2xl shadow-lg animate-fadeIn">
                  <p className="text-2xl font-bold text-gray-800">
                    {rating === 5 && "⭐ Excellent!"}
                    {rating === 4 && "😊 Great!"}
                    {rating === 3 && "🙂 Good"}
                    {rating === 2 && "😐 Fair"}
                    {rating === 1 && "😞 Needs Improvement"}
                  </p>
                </div>
              )}
            </div>

            {/* Enhanced Category Selection */}
            <div>
              <label className="block text-3xl font-extrabold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-6 text-center">
                What would you like to give feedback about?
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                {categories.map((cat, idx) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setCategory(cat.value)}
                    className={`p-6 rounded-2xl border-2 transition-all duration-300 transform hover:scale-110 hover:-translate-y-1 animate-fadeIn ${
                      category === cat.value
                        ? `bg-gradient-to-r ${cat.color} text-white border-transparent shadow-2xl scale-105 ring-4 ring-purple-200`
                        : "border-gray-200 hover:border-purple-300 hover:shadow-xl bg-white"
                    }`}
                    style={{animationDelay: `${idx * 0.1}s`}}
                  >
                    <span className="text-lg font-bold block">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Enhanced Message */}
            <div>
              <label className="block text-2xl font-extrabold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-4">
                Tell us more (optional)
              </label>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="💭 Share your thoughts, suggestions, or report any issues..."
                  rows={6}
                  className="relative w-full px-6 py-4 border-2 border-purple-200 rounded-2xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200 focus:outline-none resize-none text-lg transition-all duration-300 bg-white shadow-inner"
                />
              </div>
            </div>

            {/* Enhanced Submit Button */}
            <button
              type="submit"
              disabled={!rating || !category || loading}
              className={`w-full py-5 rounded-2xl font-extrabold text-xl transition-all duration-300 flex items-center justify-center gap-3 transform ${
                !rating || !category || loading
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 text-white hover:from-pink-700 hover:via-purple-700 hover:to-indigo-700 shadow-2xl hover:shadow-purple-500/50 hover:scale-105 animate-pulse-glow"
              }`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send className="w-6 h-6" />
                  <span>Submit Feedback</span>
                  <span className="text-2xl">🚀</span>
                </>
              )}
            </button>
          </form>

          {/* Enhanced Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
            <div className="bg-gradient-to-br from-white to-pink-50 rounded-2xl shadow-xl p-8 text-center hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-pink-100 animate-fadeIn">
              <div className="text-6xl mb-4 animate-bounce">🎯</div>
              <h3 className="font-extrabold text-xl bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-3">
                Your Voice Matters
              </h3>
              <p className="text-gray-600 leading-relaxed">Every feedback helps us improve and serve you better</p>
            </div>
            <div className="bg-gradient-to-br from-white to-purple-50 rounded-2xl shadow-xl p-8 text-center hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-purple-100 animate-fadeIn" style={{animationDelay: '0.1s'}}>
              <div className="text-6xl mb-4 animate-bounce" style={{animationDelay: '0.2s'}}>⚡</div>
              <h3 className="font-extrabold text-xl bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-3">
                Quick Response
              </h3>
              <p className="text-gray-600 leading-relaxed">We review all feedback promptly and take action</p>
            </div>
            <div className="bg-gradient-to-br from-white to-indigo-50 rounded-2xl shadow-xl p-8 text-center hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-indigo-100 animate-fadeIn" style={{animationDelay: '0.2s'}}>
              <div className="text-6xl mb-4 animate-bounce" style={{animationDelay: '0.4s'}}>🔒</div>
              <h3 className="font-extrabold text-xl bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent mb-3">
                Privacy Protected
              </h3>
              <p className="text-gray-600 leading-relaxed">Your feedback is secure and confidential</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
