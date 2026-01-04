/**
 * Test the complete flow from profile to predictions
 */

import connectDB from "../lib/mongodb";
import Student from "../lib/models/Student";

async function testFlow() {
  try {
    console.log('🔍 Testing Profile → Predictions Flow\n');
    console.log('='.repeat(70));
    
    await connectDB();
    
    // Get all students
    const students = await Student.find({}).lean();
    
    console.log(`\n📋 Current Student Profiles:\n`);
    
    for (const student of students) {
      const studentAny = student as any;
      console.log(`${student.email}:`);
      console.log(`  Rank: ${studentAny.rank}`);
      console.log(`  Category: ${studentAny.category}`);
      console.log(`  Preferred Branches: ${JSON.stringify(studentAny.preferredBranch)}`);
      
      // Simulate what the predictions API would receive
      const branches = Array.isArray(studentAny.preferredBranch) 
        ? studentAny.preferredBranch 
        : [studentAny.preferredBranch];
      
      const url = `http://localhost:3000/api/predictions?rank=${studentAny.rank}&category=${studentAny.category}&branches=${encodeURIComponent(branches.join(','))}`;
      
      console.log(`  API URL: ${url}`);
      
      try {
        const response = await fetch(url);
        const data = await response.json();
        
        console.log(`  ✅ Predictions: ${data.predictions?.length || 0} colleges`);
        
        if (data.predictions && data.predictions.length > 0) {
          console.log(`  📊 Sample colleges:`);
          data.predictions.slice(0, 3).forEach((pred: any, idx: number) => {
            console.log(`     ${idx + 1}. ${pred.college} - ${pred.branch}`);
          });
        }
      } catch (error) {
        console.log(`  ❌ API Error: ${error}`);
      }
      
      console.log('');
    }
    
    console.log('='.repeat(70));
    console.log('\n✅ Flow Test Complete\n');
    
    console.log('📝 Summary:');
    console.log('  - Profile data is read from database');
    console.log('  - Rank, Category, and Branches are sent to API');
    console.log('  - API filters predictions based on these values');
    console.log('  - Frontend displays the filtered results');
    console.log('\n💡 To test with your profile:');
    console.log('  1. Update your profile in the app');
    console.log('  2. Go to predictions page');
    console.log('  3. Check browser console (F12) for logs');
    console.log('  4. You should see predictions matching your profile\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testFlow();
