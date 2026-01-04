import connectDB from "../lib/mongodb";
import Student from "../lib/models/Student";

async function resetPassword() {
  await connectDB();

  const username = "Vivek";
  const newPassword = "123456";

  console.log(`🔐 Resetting password for: ${username}\n`);

  const user = await Student.findOne({ 
    username: { $regex: new RegExp(`^${username}$`, 'i') } 
  });

  if (!user) {
    console.log('❌ User not found!');
    process.exit(1);
  }

  console.log(`✅ Found user: ${user.username}`);
  console.log(`   Email: ${user.email}`);
  console.log(`   Category: ${user.category}`);
  console.log(`   Rank: ${user.rank}`);
  console.log(`   Preferred Branches:`, user.preferredBranch);

  // Update password and fix branches
  user.password = newPassword; // Will be hashed by pre-save hook
  
  // Fix branch names to match database
  user.preferredBranch = [
    "CS Computers",
    "EC Electronics",
    "AI Artificial",
    "ME Mechanical",
    "IE Info.Science"
  ];

  await user.save();

  console.log(`\n✅ Password reset and branches fixed!`);
  console.log(`\nNew credentials:`);
  console.log(`   Username: ${user.username}`);
  console.log(`   Password: ${newPassword}`);
  console.log(`   Preferred Branches:`, user.preferredBranch);

  process.exit(0);
}

resetPassword();
