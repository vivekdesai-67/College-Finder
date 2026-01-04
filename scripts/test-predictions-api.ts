/**
 * Test the predictions API directly
 */

async function testAPI() {
  try {
    const url = 'http://localhost:3000/api/predictions?rank=1&category=1K&branches=Computer Science';
    
    console.log(`🔍 Testing API: ${url}\n`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`❌ API Error: ${response.status} ${response.statusText}`);
      process.exit(1);
    }
    
    const data = await response.json();
    
    console.log(`✅ API Response:`);
    console.log(`   Total Colleges: ${data.totalColleges}`);
    console.log(`   Predictions Count: ${data.predictions?.length || 0}`);
    
    if (data.predictions && data.predictions.length > 0) {
      console.log(`\n📋 First 5 Predictions:`);
      data.predictions.slice(0, 5).forEach((pred: any, idx: number) => {
        console.log(`\n   ${idx + 1}. ${pred.college}`);
        console.log(`      Branch: ${pred.branch}`);
        console.log(`      Category: ${pred.category}`);
        console.log(`      Admission Chance: ${pred.admissionChance}`);
        console.log(`      2026 Predicted Cutoff: ${pred.predictedCutoff2026}`);
      });
    } else {
      console.log(`\n⚠️  No predictions returned!`);
    }
    
    console.log(`\n📊 Student Profile:`);
    console.log(JSON.stringify(data.studentProfile, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testAPI();
