import connectDB from "../lib/mongodb";
import Student from "../lib/models/Student";
import bcrypt from "bcryptjs";

async function resetPassword() {
  await connectDB();

  const username = "Vivek Desai";
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
  console.log(`   Current category: ${user.category}`);

  // Hash the new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  
  // Fix invalid category if needed
  if (user.category === 'general' || !user.category) {
    user.category = 'GM'; // General Merit
    console.log(`   Fixed category to: GM`);
  }
  
  await user.save();

  console.log(`\n✅ Password reset successfully!`);
  console.log(`\nNew credentials:`);
  console.log(`   Username: ${user.username}`);
  console.log(`   Password: ${newPassword}`);
  console.log(`   Category: ${user.category}`);
  console.log(`\nYou can now login with these credentials.`);

  process.exit(0);
}

resetPassword();
