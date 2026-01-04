/**
 * Simulate API call with correct profile
 */

async function simulateAPI() {
  try {
    // Simulate the exact profile you mentioned
    const profile = {
      rank: 1,
      category: '1K',
      preferredBranch: ['Computer Science']
    };

    const params = new URLSearchParams({
      rank: profile.rank.toString(),
      category: profile.category,
    });
    
    if (profile.preferredBranch && profile.preferredBranch.length > 0) {
      params.append("branches", profile.preferredBranch.join(","));
    }
    
    const url = `http://localhost:3000/api/predictions?${params.toString()}`;
    
    console.log(`🔍 Testing URL: ${url}\n`);
    
    const response = await fetch(url);
    const data = await response.json();
    
    console.log(`✅ Results:`);
    console.log(`   Total Predictions: ${data.predictions?.length || 0}`);
    console.log(`   Total Colleges: ${data.totalColleges}`);
    console.log(`   Student Profile:`, data.studentProfile);
    
    if (data.predictions && data.predictions.length > 0) {
      console.log(`\n📋 First 10 colleges:`);
      data.predictions.slice(0, 10).forEach((pred: any, idx: number) => {
        console.log(`   ${idx + 1}. ${pred.college}`);
        console.log(`      Branch: ${pred.branch}`);
        console.log(`      2026 Cutoff: ${pred.predictedCutoff2026}`);
        console.log(`      Admission Chance: ${pred.admissionChance}`);
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

simulateAPI();
