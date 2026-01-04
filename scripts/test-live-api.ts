/**
 * Test the live predictions API
 */

async function testLiveAPI() {
  try {
    // Test without any filters first
    console.log('🔍 Test 1: No filters');
    let response = await fetch('http://localhost:3000/api/predictions');
    let data = await response.json();
    console.log(`   Total predictions: ${data.predictions?.length || 0}`);
    console.log(`   Total colleges: ${data.totalColleges}`);
    
    // Test with rank and category
    console.log('\n🔍 Test 2: With rank=1 and category=1K');
    response = await fetch('http://localhost:3000/api/predictions?rank=1&category=1K');
    data = await response.json();
    console.log(`   Total predictions: ${data.predictions?.length || 0}`);
    console.log(`   Total colleges: ${data.totalColleges}`);
    
    if (data.predictions && data.predictions.length > 0) {
      console.log('\n   First 5 predictions:');
      data.predictions.slice(0, 5).forEach((pred: any, idx: number) => {
        console.log(`   ${idx + 1}. ${pred.college} - ${pred.branch}`);
      });
    }
    
    // Test with branch filter
    console.log('\n🔍 Test 3: With rank=1, category=1K, branches=Computer Science');
    response = await fetch('http://localhost:3000/api/predictions?rank=1&category=1K&branches=Computer%20Science');
    data = await response.json();
    console.log(`   Total predictions: ${data.predictions?.length || 0}`);
    console.log(`   Total colleges: ${data.totalColleges}`);
    
    if (data.predictions && data.predictions.length > 0) {
      console.log('\n   All predictions:');
      data.predictions.forEach((pred: any, idx: number) => {
        console.log(`   ${idx + 1}. ${pred.college} - ${pred.branch} (${pred.category})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testLiveAPI();
