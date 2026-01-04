import connectDB from "../lib/mongodb";
import Student from "../lib/models/Student";

async function fixTestUserBranches() {
  await connectDB();

  console.log('🔧 Fixing test user branches...\n');

  const user = await Student.findOne({ username: "testuser" });
  
  if (!user) {
    console.log('❌ Test user not found!');
    process.exit(1);
  }

  console.log('Current preferred branches:');
  console.log(user.preferredBranch);

  // Update to match actual database branch names
  user.preferredBranch = [
    "CS Computers",
    "AI Artificial",
    "IE Info.Science",
    "EC Electronics",
    "ME Mechanical",
    "EE Electrical"
  ];

  await user.save();

  console.log('\n✅ Updated preferred branches to:');
  console.log(user.preferredBranch);

  console.log('\n✅ Test user branches fixed!');
  console.log('\nNow try the recommendations page again.');
  console.log('You should see colleges with boom analysis!');

  process.exit(0);
}

fixTestUserBranches();
