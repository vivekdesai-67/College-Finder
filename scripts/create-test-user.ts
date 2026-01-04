import connectDB from "../lib/mongodb";
import Student from "../lib/models/Student";

async function createTestUser() {
  await connectDB();

  const username = "testuser";
  const password = "123456";

  console.log('👤 Creating test user...\n');

  // Check if user already exists
  const existing = await Student.findOne({ username });
  if (existing) {
    console.log('⚠️  User already exists. Deleting...');
    await Student.deleteOne({ username });
  }

  // Create new user
  const user = await Student.create({
    username,
    password, // Will be hashed by the pre-save hook
    email: "test@example.com",
    rank: 1,
    category: "1K",
    preferredBranch: ["Computer Science & Engineering"],
    address: "Test Address",
    phone: "1234567890",
    profileComplete: true
  });

  console.log('✅ Test user created successfully!\n');
  console.log('Login credentials:');
  console.log(`   Username: ${username}`);
  console.log(`   Password: ${password}`);
  console.log(`   Category: 1K`);
  console.log(`   Rank: 1`);
  console.log(`\nYou can now login at: http://localhost:3000/login`);

  process.exit(0);
}

createTestUser();
