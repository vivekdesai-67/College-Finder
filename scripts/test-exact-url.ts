/**
 * Test the exact URL from the console logs
 */

async function testExactURL() {
  try {
    // This is the EXACT URL from your console logs
    const url = 'http://localhost:3000/api/predictions?rank=1&category=1K&branches=Computer+Science+%26+Engineering';
    
    console.log('🔍 Testing exact URL from console:\n');
    console.log(url);
    console.log('\n' + '='.repeat(70) + '\n');
    
    const response = await fetch(url);
    const data = await response.json();
    
    console.log(`✅ API Response:`);
    console.log(`   Total Predictions: ${data.predictions?.length || 0}`);
    console.log(`   Total Colleges: ${data.totalColleges}`);
    
    if (data.predictions && data.predictions.length > 0) {
      console.log(`\n📋 All Predictions:`);
      data.predictions.forEach((pred: any, idx: number) => {
        console.log(`   ${idx + 1}. ${pred.college}`);
        console.log(`      Branch: ${pred.branch}`);
        console.log(`      Category: ${pred.category}`);
        console.log('');
      });
    } else {
      console.log('\n⚠️  No predictions returned!');
    }
    
    // Now test with just "Computer Science" (without & Engineering)
    console.log('\n' + '='.repeat(70));
    console.log('\n🔍 Testing with "Computer Science" only:\n');
    
    const url2 = 'http://localhost:3000/api/predictions?rank=1&category=1K&branches=Computer+Science';
    console.log(url2);
    console.log('\n' + '='.repeat(70) + '\n');
    
    const response2 = await fetch(url2);
    const data2 = await response2.json();
    
    console.log(`✅ API Response:`);
    console.log(`   Total Predictions: ${data2.predictions?.length || 0}`);
    console.log(`   Total Colleges: ${data2.totalColleges}`);
    
    if (data2.predictions && data2.predictions.length > 0) {
      console.log(`\n📋 First 10 Predictions:`);
      data2.predictions.slice(0, 10).forEach((pred: any, idx: number) => {
        console.log(`   ${idx + 1}. ${pred.college} - ${pred.branch}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testExactURL();
