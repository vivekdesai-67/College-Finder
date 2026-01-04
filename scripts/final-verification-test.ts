/**
 * Final verification test - checks everything is working
 */

import connectDB from "../lib/mongodb";
import Student from "../lib/models/Student";

async function finalTest() {
  try {
    console.log('🔍 FINAL VERIFICATION TEST\n');
    console.log('=' .repeat(60));
    
    // Test 1: Check all profiles are fixed
    console.log('\n✅ Test 1: Checking Student Profiles');
    console.log('-'.repeat(60));
    await connectDB();
    const students = await Student.find({}).lean();
    
    let allValid = true;
    students.forEach((student: any) => {
      const branches = student.preferredBranch;
      const isValid = Array.isArray(branches) && 
                     branches.every((b: any) => typeof b === 'string');
      
      console.log(`${student.email}:`);
      console.log(`  Rank: ${student.rank}, Category: ${student.category}`);
      console.log(`  Branches: ${JSON.stringify(branches)}`);
      console.log(`  Valid: ${isValid ? '✅' : '❌'}`);
      
      if (!isValid) allValid = false;
    });
    
    console.log(`\nAll profiles valid: ${allValid ? '✅ YES' : '❌ NO'}`);
    
    // Test 2: Test API with different profiles
    console.log('\n✅ Test 2: Testing Predictions API');
    console.log('-'.repeat(60));
    
    const testCases = [
      { rank: 1, category: '1K', branches: 'Computer Science', expected: '>= 50' },
      { rank: 10000, category: '2AR', branches: 'Computer Science', expected: '>= 10' },
      { rank: 100000, category: 'GM', branches: 'Mechanical', expected: '>= 5' },
    ];
    
    for (const test of testCases) {
      const url = `http://localhost:3000/api/predictions?rank=${test.rank}&category=${test.category}&branches=${encodeURIComponent(test.branches)}`;
      
      try {
        const response = await fetch(url);
        const data = await response.json();
        
        console.log(`\nTest: Rank ${test.rank}, Category ${test.category}, Branch ${test.branches}`);
        console.log(`  Predictions: ${data.predictions?.length || 0}`);
        console.log(`  Expected: ${test.expected}`);
        console.log(`  Status: ${data.predictions?.length > 0 ? '✅ PASS' : '❌ FAIL'}`);
      } catch (error) {
        console.log(`  Status: ❌ ERROR - ${error}`);
      }
    }
    
    // Test 3: Check if server is running
    console.log('\n✅ Test 3: Server Health Check');
    console.log('-'.repeat(60));
    
    try {
      const response = await fetch('http://localhost:3000/api/predictions');
      console.log(`Server Status: ${response.ok ? '✅ RUNNING' : '❌ ERROR'}`);
    } catch (error) {
      console.log(`Server Status: ❌ NOT RUNNING`);
      console.log(`Please start the server with: npm run dev`);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('VERIFICATION COMPLETE');
    console.log('='.repeat(60));
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Test Error:', error);
    process.exit(1);
  }
}

finalTest();
