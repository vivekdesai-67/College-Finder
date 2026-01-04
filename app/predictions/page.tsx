"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface HistoricalCutoff {
  year: number;
  rank: number;
  round: string;
}

interface EnhancedPrediction {
  college: string;
  collegeCode: string;
  branch: string;
  category: string;
  predictedCutoff2025: number;
  predictedCutoff2026: number;
  confidence: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  historicalData: HistoricalCutoff[];
  changePercentage: number;
  admissionChance: 'high' | 'medium' | 'low';
}

interface PredictionsResponse {
  currentYear: number;
  predictedYear: number;
  studentProfile: {
    rank: number;
    category: string;
    preferredBranches?: string[];
  } | null;
  totalColleges: number;
  predictions: EnhancedPrediction[];
  trendingSummary: {
    topBoomingBranches: string[];
    topDecliningBranches: string[];
    averageCutoffChange: number;
  };
  historicalStats: {
    totalColleges: number;
    totalBranches: number;
    yearsCovered: number[];
    avgCutoffByYear: Record<number, number>;
  };
  metadata: {
    dataYears: number[];
    predictionYears: number[];
    lastUpdated: string;
  };
}

// List of engineering branches to filter
const ENGINEERING_BRANCHES = [
  "Computer Science",
  "Computer Science Engineering",
  "Computer Science & Engineering",
  "Information Technology",
  "Information Science",
  "Information Science & Engineering",
  "Artificial Intelligence",
  "AI & ML",
  "Artificial Intelligence and Machine Learning",
  "Machine Learning",
  "Data Science",
  "Electronics",
  "Electronics and Communication",
  "Electronics & Communication Engineering",
  "Electrical",
  "Electrical Engineering",
  "Electrical & Electronics Engineering",
  "Mechanical",
  "Mechanical Engineering",
  "Civil",
  "Civil Engineering",
  "Chemical",
  "Chemical Engineering",
  "Biotechnology",
  "Biomedical",
  "Biomedical Engineering",
  "Aerospace",
  "Aerospace Engineering",
  "Automobile",
  "Automobile Engineering",
  "Industrial",
  "Industrial Engineering",
  "Instrumentation",
  "Robotics",
  "Cyber Security",
  "Software Engineering",
];

// Helper function to check if a branch is an engineering branch
const isEngineeringBranch = (branchName: string): boolean => {
  const lowerBranchName = branchName.toLowerCase();
  return ENGINEERING_BRANCHES.some(engBranch => 
    lowerBranchName.includes(engBranch.toLowerCase())
  );
};

export default function PredictionsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [predictionsData, setPredictionsData] = useState<PredictionsResponse | null>(null);
  const [studentProfile, setStudentProfile] = useState<any>(null);

  useEffect(() => {
    // Auth handled by middleware
    // Fetch student profile
    fetchStudentProfile();
  }, [router]);

  const fetchStudentProfile = async () => {
    try {
      const response = await fetch("/api/student/profile");

      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }

      const data = await response.json();
      console.log('👤 Student Profile Fetched:', data);
      console.log('   Rank:', data.rank);
      console.log('   Category:', data.category);
      console.log('   Preferred Branch:', data.preferredBranch);
      
      setStudentProfile(data);

      // Fetch predictions with student profile
      fetchPredictions(data);
    } catch (err) {
      console.error("Error fetching profile:", err);
      // Fetch predictions without profile
      fetchPredictions(null);
    }
  };

  const fetchPredictions = async (profile: any) => {
    try {
      setLoading(true);
      
      console.log('🔄 fetchPredictions called with profile:', profile);
      
      // Build query params if profile exists
      let url = "/api/predictions";
      if (profile && profile.rank && profile.category) {
        const params = new URLSearchParams({
          rank: profile.rank.toString(),
          category: profile.category,
        });
        
        // Handle both preferredBranch (array) and preferredBranches
        const branches = profile.preferredBranch || profile.preferredBranches || [];
        console.log('🌿 Branches from profile:', branches);
        
        if (branches && branches.length > 0) {
          // Flatten nested arrays if needed
          const flatBranches = Array.isArray(branches[0]) && Array.isArray(branches[0][0])
            ? branches.flat(2)
            : Array.isArray(branches[0])
            ? branches.flat()
            : branches;
          
          console.log('🌿 Flattened branches:', flatBranches);
          params.append("branches", flatBranches.join(","));
        }
        
        url += `?${params.toString()}`;
      } else {
        console.log('⚠️  No profile or incomplete profile data');
      }

      console.log(`🔍 Fetching predictions from: ${url}`);

      const response = await fetch(url, {
        cache: 'no-store', // Disable caching
      });

      if (!response.ok) {
        throw new Error("Failed to fetch predictions");
      }

      const data = await response.json();
      
      // TEMPORARILY DISABLED: Filter predictions to show only engineering branches
      // if (data.predictions) {
      //   const filteredPredictions = data.predictions.filter((pred: EnhancedPrediction) => 
      //     isEngineeringBranch(pred.branch)
      //   );
      //   
      //   data.predictions = filteredPredictions;
      //   data.totalColleges = filteredPredictions.length;
      // }
      
      console.log(`📊 API returned ${data.predictions?.length || 0} predictions`);
      console.log(`📊 Total colleges: ${data.totalColleges}`);
      console.log(`📊 Student Profile:`, data.studentProfile);
      
      if (data.predictions && data.predictions.length > 0) {
        console.log(`📊 First 3 predictions:`, data.predictions.slice(0, 3).map((p: any) => ({
          college: p.college,
          branch: p.branch,
          category: p.category
        })));
      }
      
      setPredictionsData(data);
    } catch (err) {
      console.error("Error fetching predictions:", err);
      setError("Failed to load predictions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading predictions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header with Back Button */}
        <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 rounded-3xl shadow-2xl p-8 md:p-12 overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-300 opacity-20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
          
          <div className="relative z-10">
            {/* Back Button */}
            <button
              onClick={() => router.push('/dashboard')}
              className="mb-6 flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-xl transition-all duration-300 hover:scale-105 shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </button>

            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 animate-fadeIn">
                🎯 Tech Boom Predictions {predictionsData?.predictedYear}
              </h1>
              <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
                AI-powered ML predictions using 2022-2024 data to forecast 2026 engineering branch competitiveness
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm text-white font-medium">
                  📊 Time Series Analysis
                </span>
                <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm text-white font-medium">
                  🤖 Machine Learning
                </span>
                <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm text-white font-medium">
                  📈 Trend Forecasting
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Student Profile Summary */}
        {predictionsData?.studentProfile && (
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 hover:shadow-2xl transition-shadow duration-300">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span className="text-3xl">👤</span>
              Your Profile
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl text-center shadow-md hover:shadow-lg transition-shadow">
                <p className="text-sm text-blue-700 font-medium mb-2">CET Rank</p>
                <p className="text-3xl font-extrabold text-blue-900">
                  {predictionsData.studentProfile.rank.toLocaleString()}
                </p>
              </div>
              <div className="p-6 bg-gradient-to-br from-green-100 to-green-200 rounded-xl text-center shadow-md hover:shadow-lg transition-shadow">
                <p className="text-sm text-green-700 font-medium mb-2">Category</p>
                <p className="text-3xl font-extrabold text-green-900 uppercase">
                  {predictionsData.studentProfile.category}
                </p>
              </div>
              <div className="p-6 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl text-center shadow-md hover:shadow-lg transition-shadow">
                <p className="text-sm text-purple-700 font-medium mb-2">Preferred Branches</p>
                <p className="text-lg font-bold text-purple-900">
                  {(() => {
                    const branches = predictionsData.studentProfile.preferredBranches;
                    if (!branches || branches.length === 0) return "All Engineering";
                    // Handle nested arrays
                    const flatBranches = Array.isArray(branches[0]) 
                      ? branches.flat(2).filter((b: any) => typeof b === 'string')
                      : branches;
                    return flatBranches.join(", ");
                  })()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Trending Summary */}
        {predictionsData?.trendingSummary && (
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 hover:shadow-2xl transition-shadow duration-300">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span className="text-3xl">📊</span>
              Market Trends Overview
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Top Booming */}
              <div className="p-6 bg-gradient-to-br from-red-50 to-orange-100 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
                <h3 className="text-lg font-bold text-red-700 mb-4 flex items-center gap-2">
                  🔥 Top Booming Branches
                </h3>
                <ul className="space-y-2">
                  {predictionsData.trendingSummary.topBoomingBranches.map((branch, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-gray-800 font-medium">
                      <span className="flex items-center justify-center w-6 h-6 bg-red-600 text-white rounded-full text-xs font-bold">
                        {idx + 1}
                      </span>
                      {branch}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Top Declining */}
              <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-100 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
                <h3 className="text-lg font-bold text-blue-700 mb-4 flex items-center gap-2">
                  🔵 Declining Branches
                </h3>
                <ul className="space-y-2">
                  {predictionsData.trendingSummary.topDecliningBranches.map((branch, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-gray-800 font-medium">
                      <span className="flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded-full text-xs font-bold">
                        {idx + 1}
                      </span>
                      {branch}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Average Change */}
              <div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-100 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
                <h3 className="text-lg font-bold text-indigo-700 mb-4 flex items-center gap-2">
                  📈 Market Trend
                </h3>
                <div className="text-center">
                  <p className="text-5xl font-extrabold text-indigo-900 mb-2">
                    {predictionsData.trendingSummary.averageCutoffChange.toFixed(1)}%
                  </p>
                  <p className={`text-sm font-semibold px-4 py-2 rounded-full inline-block ${
                    predictionsData.trendingSummary.averageCutoffChange < 0
                      ? "bg-red-100 text-red-700"
                      : "bg-green-100 text-green-700"
                  }`}>
                    {predictionsData.trendingSummary.averageCutoffChange < 0
                      ? "⬇️ More Competitive"
                      : "⬆️ Less Competitive"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Historical Stats Overview */}
        {predictionsData?.historicalStats && (
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span className="text-3xl">📚</span>
              Historical Data Coverage
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl text-center">
                <p className="text-sm text-blue-700 font-medium mb-1">Years Analyzed</p>
                <p className="text-3xl font-extrabold text-blue-900">
                  {predictionsData.historicalStats.yearsCovered.length}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  {predictionsData.historicalStats.yearsCovered.join(', ')}
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl text-center">
                <p className="text-sm text-green-700 font-medium mb-1">Total Colleges</p>
                <p className="text-3xl font-extrabold text-green-900">
                  {predictionsData.historicalStats.totalColleges}
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl text-center">
                <p className="text-sm text-purple-700 font-medium mb-1">Branches Tracked</p>
                <p className="text-3xl font-extrabold text-purple-900">
                  {predictionsData.historicalStats.totalBranches}
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl text-center">
                <p className="text-sm text-orange-700 font-medium mb-1">Prediction Years</p>
                <p className="text-3xl font-extrabold text-orange-900">
                  {predictionsData.metadata.predictionYears.join(', ')}
                </p>
              </div>
            </div>
            
            {/* Average Cutoff Trend by Year */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6">
              <h3 className="text-lg font-bold text-indigo-900 mb-4">📈 Average Cutoff Trend</h3>
              <div className="flex items-end justify-between gap-2 h-32">
                {Object.entries(predictionsData.historicalStats.avgCutoffByYear).map(([year, avgRank]) => {
                  const maxRank = Math.max(...Object.values(predictionsData.historicalStats.avgCutoffByYear));
                  const height = (avgRank / maxRank) * 100;
                  return (
                    <div key={year} className="flex-1 flex flex-col items-center gap-2">
                      <div className="text-xs font-bold text-indigo-900">{avgRank.toLocaleString()}</div>
                      <div 
                        className="w-full bg-gradient-to-t from-indigo-600 to-purple-500 rounded-t-lg transition-all duration-500 hover:from-indigo-700 hover:to-purple-600"
                        style={{ height: `${height}%` }}
                      ></div>
                      <div className="text-sm font-bold text-gray-700">{year}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Predictions List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <span className="text-4xl">🏛️</span>
              College Predictions
              <span className="px-4 py-1 bg-indigo-100 text-indigo-700 rounded-full text-lg font-semibold">
                {predictionsData?.totalColleges || 0}
              </span>
            </h2>
          </div>
          
          {predictionsData?.predictions && predictionsData.predictions.length > 0 ? (
            <div className="space-y-6">
              {(() => {
                console.log(`🎨 Rendering ${predictionsData.predictions.length} predictions (showing first 20)`);
                return predictionsData.predictions.slice(0, 20).map((prediction, idx) => (
                <div key={idx} className="bg-white rounded-2xl shadow-xl p-6 md:p-8 hover:shadow-2xl transition-all duration-300 border-l-4 border-indigo-500">
                  {/* College Header */}
                  <div className="mb-6">
                    <h3 className="text-2xl font-extrabold text-gray-900 mb-3 flex items-center gap-2">
                      <span className="text-3xl">🎓</span>
                      {prediction.college}
                    </h3>
                    <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-3">
                      <span className="flex items-center gap-1 px-3 py-1 bg-blue-50 rounded-full font-medium">
                        📚 {prediction.branch}
                      </span>
                      <span className="flex items-center gap-1 px-3 py-1 bg-green-50 rounded-full font-medium">
                        🏷️ Category: {prediction.category}
                      </span>
                      <span className={`flex items-center gap-1 px-3 py-1 rounded-full font-bold ${
                        prediction.admissionChance === 'high' ? 'bg-green-100 text-green-700' :
                        prediction.admissionChance === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {prediction.admissionChance === 'high' ? '✅' : prediction.admissionChance === 'medium' ? '⚠️' : '❌'}
                        {prediction.admissionChance.toUpperCase()} Chance
                      </span>
                    </div>
                    
                    {/* Trend Indicator */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl ${
                        prediction.trend === 'increasing' ? 'bg-red-100' :
                        prediction.trend === 'decreasing' ? 'bg-green-100' :
                        'bg-blue-100'
                      }`}>
                        <span className="text-2xl">
                          {prediction.trend === 'increasing' ? '📈' : prediction.trend === 'decreasing' ? '📉' : '➡️'}
                        </span>
                        <div>
                          <p className="text-xs font-medium text-gray-600">Trend</p>
                          <p className={`text-sm font-bold ${
                            prediction.trend === 'increasing' ? 'text-red-700' :
                            prediction.trend === 'decreasing' ? 'text-green-700' :
                            'text-blue-700'
                          }`}>
                            {prediction.trend.toUpperCase()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-xl">
                        <span className="text-2xl">🎯</span>
                        <div>
                          <p className="text-xs font-medium text-gray-600">Confidence</p>
                          <p className="text-sm font-bold text-purple-700">{prediction.confidence}%</p>
                        </div>
                      </div>
                      
                      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl ${
                        prediction.changePercentage < 0 ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        <span className="text-2xl">{prediction.changePercentage < 0 ? '⬇️' : '⬆️'}</span>
                        <div>
                          <p className="text-xs font-medium text-gray-600">Change</p>
                          <p className={`text-sm font-bold ${
                            prediction.changePercentage < 0 ? 'text-green-700' : 'text-red-700'
                          }`}>
                            {Math.abs(prediction.changePercentage).toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Historical Data Timeline */}
                  {prediction.historicalData && prediction.historicalData.length > 0 && (
                    <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
                      <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="text-2xl">📊</span>
                        Historical Cutoff Ranks (2022-2026)
                      </h4>
                      <div className="flex items-end justify-between gap-3 h-40">
                        {prediction.historicalData.map((data, dataIdx) => {
                          const maxRank = Math.max(...prediction.historicalData.map(d => d.rank), prediction.predictedCutoff2025, prediction.predictedCutoff2026);
                          const height = (data.rank / maxRank) * 100;
                          return (
                            <div key={dataIdx} className="flex-1 flex flex-col items-center gap-2">
                              <div className="text-xs font-bold text-indigo-900">{data.rank.toLocaleString()}</div>
                              <div 
                                className="w-full bg-gradient-to-t from-blue-600 to-indigo-500 rounded-t-lg transition-all duration-500 hover:from-blue-700 hover:to-indigo-600"
                                style={{ height: `${height}%` }}
                              ></div>
                              <div className="text-sm font-bold text-gray-700">{data.year}</div>
                            </div>
                          );
                        })}
                        
                        {/* 2025 Prediction */}
                        <div className="flex-1 flex flex-col items-center gap-2">
                          <div className="text-xs font-bold text-purple-900">{prediction.predictedCutoff2025.toLocaleString()}</div>
                          <div 
                            className="w-full bg-gradient-to-t from-purple-600 to-pink-500 rounded-t-lg transition-all duration-500 hover:from-purple-700 hover:to-pink-600 opacity-80"
                            style={{ height: `${(prediction.predictedCutoff2025 / Math.max(...prediction.historicalData.map(d => d.rank), prediction.predictedCutoff2025, prediction.predictedCutoff2026)) * 100}%` }}
                          ></div>
                          <div className="text-sm font-bold text-purple-700">2025*</div>
                        </div>
                        
                        {/* 2026 Prediction */}
                        <div className="flex-1 flex flex-col items-center gap-2">
                          <div className="text-xs font-bold text-pink-900">{prediction.predictedCutoff2026.toLocaleString()}</div>
                          <div 
                            className="w-full bg-gradient-to-t from-pink-600 to-rose-500 rounded-t-lg transition-all duration-500 hover:from-pink-700 hover:to-rose-600 opacity-80"
                            style={{ height: `${(prediction.predictedCutoff2026 / Math.max(...prediction.historicalData.map(d => d.rank), prediction.predictedCutoff2025, prediction.predictedCutoff2026)) * 100}%` }}
                          ></div>
                          <div className="text-sm font-bold text-pink-700">2026*</div>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 mt-4 text-center">* Predicted values based on ML analysis using 2022-2024 data</p>
                    </div>
                  )}
                  
                  {/* Prediction Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl p-5 shadow-md">
                      <h5 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                        📅 2025 Prediction
                      </h5>
                      <p className="text-4xl font-extrabold text-blue-900 mb-2">
                        {prediction.predictedCutoff2025.toLocaleString()}
                      </p>
                      <p className="text-sm text-blue-700">Expected cutoff rank</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl p-5 shadow-md">
                      <h5 className="font-bold text-purple-900 mb-3 flex items-center gap-2">
                        🔮 2026 Prediction
                      </h5>
                      <p className="text-4xl font-extrabold text-purple-900 mb-2">
                        {prediction.predictedCutoff2026.toLocaleString()}
                      </p>
                      <p className="text-sm text-purple-700">Forecasted cutoff rank</p>
                    </div>
                  </div>

                </div>
              ));
              })()}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">No Predictions Available</h3>
              <p className="text-gray-600 mb-6">Complete your profile to see personalized predictions</p>
              <button
                onClick={() => router.push('/dashboard')}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Go to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
