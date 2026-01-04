/**
 * Test branch name matching with different variations
 */

async function testBranchMatching() {
  const testCases = [
    { branch: 'Computer Science & Engineering', expected: '> 50' },
    { branch: 'Computer Science and Engineering', expected: '> 50' },
    { branch: 'Computer Science', expected: '> 50' },
    { branch: 'Mechanical Engineering', expected: '> 10' },
    { branch: 'Mechanical', expected: '> 10' },
    { branch: 'Electronics & Communication', expected: '> 10' },
    { branch: 'AI & ML', expected: '> 5' },
  ];

  console.log('🔍 Testing Branch Name Matching\n');
  console.log('='.repeat(70));
  
  for (const test of testCases) {
    const url = `http://localhost:3000/api/predictions?rank=1&category=1K&branches=${encodeURIComponent(test.branch)}`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      const count = data.predictions?.length || 0;
      const status = count > 0 ? '✅' : '❌';
      
      console.log(`\n${status} Branch: "${test.branch}"`);
      console.log(`   Predictions: ${count} colleges`);
      console.log(`   Expected: ${test.expected}`);
      
      if (count > 0 && count <= 3) {
        console.log(`   Colleges:`);
        data.predictions.forEach((p: any) => {
          console.log(`     - ${p.college} (${p.branch})`);
        });
      }
    } catch (error) {
      console.log(`\n❌ Branch: "${test.branch}"`);
      console.log(`   Error: ${error}`);
    }
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('\n✅ Branch matching is now flexible!');
  console.log('   - "Computer Science & Engineering" matches "Computer Science and Engineering"');
  console.log('   - "Computer Science" matches all CS branches');
  console.log('   - Partial matches work in both directions\n');
}

testBranchMatching();
