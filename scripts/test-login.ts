import connectDB from "../lib/mongodb";
import Student from "../lib/models/Student";

async function testLogin() {
  await connectDB();

  console.log('🔐 Testing Login\n');

  // Test with the username from the screenshot
  const username = "vivek desai";
  
  console.log(`Looking for username: "${username}"`);
  
  // Try exact match
  let user = await Student.findOne({ username: username });
  console.log(`Exact match: ${user ? '✅ Found' : '❌ Not found'}`);
  
  // Try case-insensitive match
  user = await Student.findOne({ username: { $regex: new RegExp(`^${username}$`, 'i') } });
  console.log(`Case-insensitive match: ${user ? '✅ Found' : '❌ Not found'}`);
  
  if (user) {
    console.log(`\nFound user:`);
    console.log(`  Username in DB: "${user.username}"`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Profile Complete: ${user.profileComplete}`);
  }
  
  // Show all usernames
  console.log('\n📋 All usernames in database:');
  const allUsers = await Student.find({}).lean();
  allUsers.forEach((u: any) => {
    console.log(`  - "${u.username}"`);
  });

  process.exit(0);
}

testLogin();
